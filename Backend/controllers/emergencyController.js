const Order = require('../models/Order');
const Drone = require('../models/Drone');
const User = require('../models/User');
const EmergencyService = require('../services/emergencyService');

// Mark order as emergency priority
exports.markOrderAsEmergency = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason, emergencyContact } = req.body;
    const adminUserId = req.user.id;

    // Verify admin permissions
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({ 
        success: false, 
        error: 'Only admin/staff can mark orders as emergency' 
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Check if order is already completed or cancelled
    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot mark completed/cancelled order as emergency' 
      });
    }

    // Update emergency details
    order.emergencyDetails = {
      reason,
      requestedBy: adminUserId,
      approvedBy: adminUserId,
      approvedAt: new Date(),
      emergencyContact
    };

    if (emergencyContact) {
      order.emergencyTracking.emergencyContacts.push({
        name: emergencyContact.name,
        phone: emergencyContact.phone
      });
    }

    await order.save();

    // Assign emergency drone and handle workflow
    const result = await EmergencyService.assignEmergencyOrder(orderId, adminUserId);

    // Emit real-time updates
    const io = req.app.get('io');
    if (io) {
      io.emit('emergency-order-created', {
        orderId,
        assignedDrone: result.assignedDrone.droneId,
        estimatedTime: result.estimatedTime,
        pausedOrders: result.pausedOrders.length
      });

      // Start monitoring
      setInterval(() => {
        EmergencyService.monitorEmergencyOrder(orderId, io);
      }, 30000); // Monitor every 30 seconds
    }

    res.json({
      success: true,
      data: result,
      message: 'Order marked as emergency and drone assigned successfully'
    });
  } catch (error) {
    console.error('Error marking order as emergency:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all emergency orders
exports.getEmergencyOrders = async (req, res) => {
  try {
    const { status, active } = req.query;
    
    let query = { isEmergency: true };
    
    if (status) {
      query.status = status;
    }
    
    if (active === 'true') {
      query.status = { $in: ['processing', 'in-transit'] };
    }

    const emergencyOrders = await Order.find(query)
      .populate('droneId', 'droneId model status batteryLevel location')
      .populate('customerId', 'name email phone')
      .populate('emergencyDetails.approvedBy', 'name')
      .sort({ 'emergencyDetails.approvedAt': -1 });

    res.json({ success: true, data: emergencyOrders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get emergency order tracking details
exports.getEmergencyOrderTracking = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId)
      .populate('droneId', 'droneId model status batteryLevel location performance')
      .populate('customerId', 'name phone');

    if (!order || !order.isEmergency) {
      return res.status(404).json({ 
        success: false, 
        error: 'Emergency order not found' 
      });
    }

    const drone = order.droneId;
    const trackingData = {
      order: {
        id: order._id,
        orderId: order.orderId,
        status: order.status,
        priority: order.priority,
        estimatedDelivery: order.estimatedDelivery,
        trackingHistory: order.trackingHistory
      },
      drone: {
        id: drone._id,
        droneId: drone.droneId,
        model: drone.model,
        status: drone.status,
        batteryLevel: drone.batteryLevel,
        location: drone.location,
        reliability: drone.performance.reliability
      },
      route: order.routeOptimization,
      emergencyContacts: order.emergencyTracking.emergencyContacts,
      liveTracking: order.emergencyTracking.isLiveTracking
    };

    res.json({ success: true, data: trackingData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Force emergency failover
exports.forceEmergencyFailover = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    // Verify admin permissions
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Only admin can force emergency failover' 
      });
    }

    const order = await Order.findById(orderId).populate('droneId');
    if (!order || !order.isEmergency) {
      return res.status(404).json({ 
        success: false, 
        error: 'Emergency order not found' 
      });
    }

    const io = req.app.get('io');
    const result = await EmergencyService.handleEmergencyFailover(
      order, 
      reason || 'admin_forced', 
      io
    );

    if (result.success) {
      res.json({
        success: true,
        data: result.backupDrone,
        message: 'Emergency failover completed successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: 'Failover failed - manual intervention required'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get available emergency drones
exports.getEmergencyCapableDrones = async (req, res) => {
  try {
    const { minBattery = 30, maxDistance, minPayload } = req.query;
    
    let query = {
      emergencyCapable: true,
      status: { $in: ['available', 'emergency_standby'] },
      batteryLevel: { $gte: parseInt(minBattery) }
    };

    if (minPayload) {
      query.maxPayload = { $gte: parseFloat(minPayload) };
    }

    const drones = await Drone.find(query)
      .select('droneId model status batteryLevel location maxPayload maxRange performance')
      .sort({ batteryLevel: -1, 'performance.reliability': -1 });

    // Calculate readiness score for each drone
    const dronesWithScores = drones.map(drone => {
      const batteryScore = drone.batteryLevel / 100 * 40;
      const reliabilityScore = drone.performance.reliability / 100 * 30;
      const payloadScore = drone.maxPayload / 10 * 20; // Normalize payload
      const rangeScore = drone.maxRange / 100 * 10; // Normalize range

      return {
        ...drone.toObject(),
        readinessScore: batteryScore + reliabilityScore + payloadScore + rangeScore,
        isOptimal: drone.batteryLevel >= 80 && drone.performance.reliability >= 90
      };
    });

    res.json({ success: true, data: dronesWithScores });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update emergency order status
exports.updateEmergencyOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, location, notes } = req.body;

    const order = await Order.findById(orderId);
    if (!order || !order.isEmergency) {
      return res.status(404).json({ 
        success: false, 
        error: 'Emergency order not found' 
      });
    }

    // Add to tracking history
    order.trackingHistory.push({
      status,
      location,
      notes,
      timestamp: new Date()
    });

    order.status = status;
    order.emergencyTracking.lastLocationUpdate = new Date();

    if (status === 'delivered') {
      order.actualDeliveryTime = new Date();
      order.emergencyTracking.isLiveTracking = false;
      
      // Update drone status back to available
      if (order.droneId) {
        const drone = await Drone.findById(order.droneId);
        if (drone) {
          drone.status = 'available';
          drone.emergencyAssignment = undefined;
          await drone.save();
        }
      }
    }

    await order.save();

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`emergency-order-${orderId}`).emit('emergency-status-updated', {
        orderId,
        status,
        location,
        timestamp: new Date()
      });

      // Notify emergency contacts if delivered
      if (status === 'delivered') {
        await EmergencyService.notifyEmergencyContacts(
          order, 
          'Your emergency delivery has been completed successfully.', 
          io
        );
      }
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get emergency dashboard statistics
exports.getEmergencyStats = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const stats = await Promise.all([
      // Active emergency orders
      Order.countDocuments({ 
        isEmergency: true, 
        status: { $in: ['processing', 'in-transit'] } 
      }),
      
      // Today's emergency orders
      Order.countDocuments({ 
        isEmergency: true, 
        'emergencyDetails.approvedAt': { $gte: today } 
      }),
      
      // Emergency capable drones
      Drone.countDocuments({ 
        emergencyCapable: true, 
        status: { $in: ['available', 'emergency_standby'] },
        batteryLevel: { $gte: 30 }
      }),
      
      // Average emergency response time (last 30 days)
      Order.aggregate([
        {
          $match: {
            isEmergency: true,
            status: 'delivered',
            'emergencyDetails.approvedAt': { 
              $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
            }
          }
        },
        {
          $project: {
            responseTime: {
              $subtract: ['$actualDeliveryTime', '$emergencyDetails.approvedAt']
            }
          }
        },
        {
          $group: {
            _id: null,
            avgResponseTime: { $avg: '$responseTime' }
          }
        }
      ])
    ]);

    const [activeEmergencies, todayEmergencies, availableDrones, responseTimeResult] = stats;
    const avgResponseTime = responseTimeResult[0]?.avgResponseTime || 0;

    res.json({
      success: true,
      data: {
        activeEmergencies,
        todayEmergencies,
        availableDrones,
        avgResponseTimeMinutes: Math.round(avgResponseTime / (1000 * 60)),
        systemStatus: availableDrones > 0 ? 'operational' : 'limited'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = exports;
