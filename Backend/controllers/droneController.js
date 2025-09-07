const Drone = require('../models/Drone');
const Order = require('../models/Order');
const Assignment = require('../models/Assignment');

// Get all drones with filtering
exports.getDrones = async (req, res) => {
  try {
    const { status, available } = req.query;
    
    let query = {};
    if (status) {
      query.status = status;
    }
    if (available === 'true') {
      query.status = 'available';
    }
    
    const drones = await Drone.find(query)
      .populate('currentAssignment', 'assignmentId status')
      .sort({ name: 1 });
    
    res.json({ success: true, data: drones });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get drone by ID with full details
exports.getDroneById = async (req, res) => {
  try {
    const drone = await Drone.findById(req.params.id)
      .populate('currentAssignment')
      .populate('maintenanceHistory');
    
    if (!drone) {
      return res.status(404).json({ success: false, error: 'Drone not found' });
    }
    
    res.json({ success: true, data: drone });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create new drone
exports.createDrone = async (req, res) => {
  try {
    const {
      name,
      model,
      maxPayload,
      range,
      speed,
      initialLocation
    } = req.body;
    
    const drone = new Drone({
      name,
      model,
      maxPayload,
      range,
      speed,
      location: initialLocation || { latitude: 0, longitude: 0 },
      status: 'available',
      batteryLevel: 100
    });
    
    await drone.save();
    
    res.status(201).json({ success: true, data: drone });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update drone location in real-time
exports.updateDroneLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude, altitude, heading, speed } = req.body;
    
    const drone = await Drone.findById(id);
    if (!drone) {
      return res.status(404).json({ success: false, error: 'Drone not found' });
    }
    
    // Update location
    drone.location = { latitude, longitude };
    drone.altitude = altitude;
    drone.heading = heading;
    drone.speed = speed;
    drone.lastLocationUpdate = new Date();
    
    await drone.save();
    
    // Emit real-time location update
    const io = req.app.get('io');
    if (io) {
      io.to(`drone-${id}`).emit('drone-location-updated', {
        droneId: id,
        location: { latitude, longitude, altitude, heading, speed },
        timestamp: new Date()
      });
      
      // Also emit to any orders this drone is currently delivering
      const activeOrders = await Order.find({ 
        assignedDrone: id, 
        status: { $in: ['assigned', 'picked_up', 'in_transit'] } 
      });
      
      activeOrders.forEach(order => {
        io.to(`order-${order._id}`).emit('drone-location-updated', {
          droneId: id,
          orderId: order._id,
          location: { latitude, longitude, altitude, heading, speed },
          timestamp: new Date()
        });
      });
    }
    
    res.json({ success: true, data: drone });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update drone status
exports.updateDroneStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const drone = await Drone.findById(id);
    if (!drone) {
      return res.status(404).json({ success: false, error: 'Drone not found' });
    }
    
    const oldStatus = drone.status;
    drone.status = status;
    drone.lastStatusUpdate = new Date();
    
    // Add to status history
    drone.statusHistory.push({
      status,
      notes,
      timestamp: new Date()
    });
    
    await drone.save();
    
    // Emit real-time status update
    const io = req.app.get('io');
    if (io) {
      io.to(`drone-${id}`).emit('drone-status-updated', {
        droneId: id,
        status,
        previousStatus: oldStatus,
        timestamp: new Date()
      });
    }
    
    res.json({ success: true, data: drone });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update drone battery level
exports.updateDroneBattery = async (req, res) => {
  try {
    const { id } = req.params;
    const { batteryLevel, isCharging } = req.body;
    
    const drone = await Drone.findById(id);
    if (!drone) {
      return res.status(404).json({ success: false, error: 'Drone not found' });
    }
    
    drone.batteryLevel = batteryLevel;
    drone.isCharging = isCharging;
    drone.lastBatteryUpdate = new Date();
    
    // Auto-update status based on battery level
    if (batteryLevel < 20 && drone.status === 'in-transit') {
      drone.status = 'low_battery';
    } else if (batteryLevel < 10) {
      drone.status = 'critical_battery';
    }
    
    await drone.save();
    
    // Emit real-time battery update
    const io = req.app.get('io');
    if (io) {
      io.to(`drone-${id}`).emit('drone-battery-updated', {
        droneId: id,
        batteryLevel,
        isCharging,
        status: drone.status,
        timestamp: new Date()
      });
    }
    
    res.json({ success: true, data: drone });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get available drones for assignment
exports.getAvailableDrones = async (req, res) => {
  try {
    const { maxPayload, maxDistance } = req.query;
    
    let query = { status: 'available' };
    
    if (maxPayload) {
      query.maxPayload = { $gte: parseFloat(maxPayload) };
    }
    
    const drones = await Drone.find(query)
      .select('name model maxPayload range speed batteryLevel location')
      .sort({ batteryLevel: -1, maxPayload: -1 });
    
    // Filter by distance if specified
    let filteredDrones = drones;
    if (maxDistance) {
      // This would typically involve calculating distance from pickup location
      // For now, we'll return all available drones
    }
    
    res.json({ success: true, data: filteredDrones });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get drone performance metrics
exports.getDronePerformance = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const end = endDate ? new Date(endDate) : new Date();
    
    // Get assignments for this drone in the date range
    const assignments = await Assignment.find({
      drone: id,
      scheduledDate: { $gte: start, $lte: end }
    }).populate('orders');
    
    // Calculate metrics
    const totalDeliveries = assignments.reduce((sum, assignment) => sum + assignment.orders.length, 0);
    const completedDeliveries = assignments.filter(a => a.status === 'completed').length;
    const totalDistance = assignments.reduce((sum, assignment) => sum + (assignment.totalDistance || 0), 0);
    const avgDeliveryTime = assignments.length > 0 ? 
      assignments.reduce((sum, assignment) => sum + (assignment.actualDuration || 0), 0) / assignments.length : 0;
    
    res.json({
      success: true,
      data: {
        totalDeliveries,
        completedDeliveries,
        successRate: totalDeliveries > 0 ? (completedDeliveries / totalDeliveries) * 100 : 0,
        totalDistance,
        avgDeliveryTime,
        assignments: assignments.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all drones with current locations for map view
exports.getDronesForMap = async (req, res) => {
  try {
    const drones = await Drone.find({})
      .select('name status location batteryLevel currentAssignment')
      .populate('currentAssignment', 'status');
    
    res.json({ success: true, data: drones });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Emergency landing for drone
exports.emergencyLanding = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, location } = req.body;
    
    const drone = await Drone.findById(id);
    if (!drone) {
      return res.status(404).json({ success: false, error: 'Drone not found' });
    }
    
    drone.status = 'emergency_landing';
    drone.emergencyHistory.push({
      reason,
      location,
      timestamp: new Date()
    });
    
    await drone.save();
    
    // Emit emergency alert
    const io = req.app.get('io');
    if (io) {
      io.emit('drone-emergency', {
        droneId: id,
        droneName: drone.name,
        reason,
        location,
        timestamp: new Date()
      });
    }
    
    res.json({ 
      success: true, 
      data: drone,
      message: 'Emergency landing initiated' 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};