const Order = require('../models/Order');
const Drone = require('../models/Drone');
const User = require('../models/User');

class EmergencyService {
  // Calculate distance between two coordinates using Haversine formula
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Find the best available drone for emergency assignment
  static async findOptimalEmergencyDrone(order) {
    const { pickupLocation, totalWeight, deliveryLocation } = order;
    
    // Calculate delivery distance
    const deliveryDistance = this.calculateDistance(
      pickupLocation.lat, pickupLocation.lng,
      deliveryLocation.lat, deliveryLocation.lng
    );

    // Find all emergency-capable drones
    const availableDrones = await Drone.find({
      emergencyCapable: true,
      status: { $in: ['available', 'emergency_standby'] },
      maxPayload: { $gte: totalWeight },
      batteryLevel: { $gte: 30 }, // Minimum 30% battery for emergency
      maxRange: { $gte: deliveryDistance * 1.5 } // 50% buffer for safety
    }).sort({ batteryLevel: -1, 'performance.reliability': -1 });

    if (availableDrones.length === 0) {
      throw new Error('No emergency-capable drones available');
    }

    // Score each drone based on multiple factors
    const scoredDrones = availableDrones.map(drone => {
      const distanceToPickup = this.calculateDistance(
        drone.location.latitude, drone.location.longitude,
        pickupLocation.lat, pickupLocation.lng
      );

      // Scoring algorithm (higher is better)
      const batteryScore = drone.batteryLevel / 100 * 40; // 40% weight
      const distanceScore = Math.max(0, (50 - distanceToPickup) / 50) * 30; // 30% weight
      const reliabilityScore = drone.performance.reliability / 100 * 20; // 20% weight
      const payloadScore = Math.min(1, drone.maxPayload / totalWeight) * 10; // 10% weight

      const totalScore = batteryScore + distanceScore + reliabilityScore + payloadScore;

      return {
        drone,
        score: totalScore,
        distanceToPickup,
        estimatedTime: distanceToPickup / (drone.performance.averageSpeed || 50) // Assume 50 km/h if no data
      };
    });

    // Sort by score (highest first)
    scoredDrones.sort((a, b) => b.score - a.score);
    
    return scoredDrones[0];
  }

  // Pause or re-route non-critical deliveries
  static async pauseNonCriticalDeliveries(excludeOrderId) {
    const nonCriticalOrders = await Order.find({
      _id: { $ne: excludeOrderId },
      status: { $in: ['processing', 'in-transit'] },
      priority: { $in: ['normal', 'high'] },
      isEmergency: false
    }).populate('droneId');

    const pausedOrders = [];
    
    for (const order of nonCriticalOrders) {
      if (order.droneId && order.droneId.status === 'in_flight') {
        // Add to tracking history
        order.trackingHistory.push({
          status: 'paused_for_emergency',
          notes: 'Delivery paused to prioritize emergency order',
          timestamp: new Date()
        });

        // Update order status
        order.status = 'processing';
        await order.save();

        // Update drone status to available for emergency reassignment
        order.droneId.status = 'available';
        await order.droneId.save();

        pausedOrders.push(order);
      }
    }

    return pausedOrders;
  }

  // Generate optimized route with safety considerations
  static async generateEmergencyRoute(pickupLocation, deliveryLocation, droneLocation) {
    // This is a simplified route optimization
    // In production, you'd integrate with mapping services like Google Maps API
    
    const waypoints = [
      { lat: droneLocation.latitude, lng: droneLocation.longitude, waypoint: 'drone_current' },
      { lat: pickupLocation.lat, lng: pickupLocation.lng, waypoint: 'pickup' },
      { lat: deliveryLocation.lat, lng: deliveryLocation.lng, waypoint: 'delivery' }
    ];

    // Calculate estimated times
    const totalDistance = this.calculateDistance(
      droneLocation.latitude, droneLocation.longitude, pickupLocation.lat, pickupLocation.lng
    ) + this.calculateDistance(
      pickupLocation.lat, pickupLocation.lng, deliveryLocation.lat, deliveryLocation.lng
    );

    const estimatedTime = totalDistance / 50 * 60; // Assume 50 km/h, convert to minutes

    return {
      optimizedRoute: waypoints.map((point, index) => ({
        ...point,
        estimatedTime: new Date(Date.now() + (estimatedTime / waypoints.length * (index + 1)) * 60000)
      })),
      totalDistance,
      estimatedTime,
      safetyScore: 95 // High safety score for emergency routes
    };
  }

  // Assign emergency order with full workflow
  static async assignEmergencyOrder(orderId, adminUserId) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Mark as emergency
    order.isEmergency = true;
    order.priority = 'emergency';
    order.emergencyDetails.approvedBy = adminUserId;
    order.emergencyDetails.approvedAt = new Date();

    // Pause non-critical deliveries
    const pausedOrders = await this.pauseNonCriticalDeliveries(orderId);

    // Find optimal drone
    const optimalDroneResult = await this.findOptimalEmergencyDrone(order);
    const { drone, estimatedTime } = optimalDroneResult;

    // Generate optimized route
    const route = await this.generateEmergencyRoute(
      order.pickupLocation,
      order.deliveryLocation,
      drone.location
    );

    // Assign drone
    drone.status = 'emergency_assigned';
    drone.emergencyAssignment = {
      orderId: order._id,
      assignedAt: new Date(),
      priority: 'emergency'
    };
    await drone.save();

    // Update order
    order.droneId = drone._id;
    order.status = 'processing';
    order.routeOptimization = route;
    order.emergencyTracking.isLiveTracking = true;
    order.emergencyTracking.trackingStarted = new Date();
    order.estimatedDelivery = new Date(Date.now() + estimatedTime * 60000);

    // Add to tracking history
    order.trackingHistory.push({
      status: 'emergency_assigned',
      notes: `Emergency drone ${drone.droneId} assigned`,
      timestamp: new Date()
    });

    await order.save();

    return {
      order,
      assignedDrone: drone,
      pausedOrders,
      route,
      estimatedTime
    };
  }

  // Monitor emergency order progress
  static async monitorEmergencyOrder(orderId, io) {
    const order = await Order.findById(orderId).populate('droneId');
    if (!order || !order.isEmergency) {
      return;
    }

    const drone = order.droneId;
    
    // Check battery levels
    if (drone.batteryLevel < drone.batteryThresholds.critical) {
      await this.handleEmergencyFailover(order, 'critical_battery', io);
    }

    // Check if drone is off course or delayed
    const currentTime = new Date();
    const expectedTime = order.estimatedDelivery;
    const delay = currentTime - expectedTime;

    if (delay > 15 * 60 * 1000) { // 15 minutes delay
      await this.handleEmergencyFailover(order, 'delayed_delivery', io);
    }

    // Emit real-time updates
    io.to(`emergency-order-${orderId}`).emit('emergency-update', {
      orderId,
      droneLocation: drone.location,
      batteryLevel: drone.batteryLevel,
      status: order.status,
      estimatedDelivery: order.estimatedDelivery
    });
  }

  // Handle emergency failover scenarios
  static async handleEmergencyFailover(order, reason, io) {
    console.log(`Emergency failover triggered for order ${order._id}: ${reason}`);

    // Find backup drone
    try {
      const backupDroneResult = await this.findOptimalEmergencyDrone(order);
      const { drone: backupDrone } = backupDroneResult;

      // Update original drone
      const originalDrone = order.droneId;
      originalDrone.status = reason === 'critical_battery' ? 'critical_battery' : 'maintenance';
      originalDrone.emergencyAssignment = undefined;
      await originalDrone.save();

      // Assign backup drone
      backupDrone.status = 'emergency_assigned';
      backupDrone.emergencyAssignment = {
        orderId: order._id,
        assignedAt: new Date(),
        priority: 'emergency'
      };
      await backupDrone.save();

      // Update order
      order.droneId = backupDrone._id;
      order.trackingHistory.push({
        status: 'emergency_failover',
        notes: `Failover to backup drone ${backupDrone.droneId} due to ${reason}`,
        timestamp: new Date()
      });
      await order.save();

      // Notify ground staff and customer
      io.emit('emergency-failover', {
        orderId: order._id,
        reason,
        originalDrone: originalDrone.droneId,
        backupDrone: backupDrone.droneId,
        timestamp: new Date()
      });

      return { success: true, backupDrone };
    } catch (error) {
      // No backup available - notify ground staff for manual intervention
      io.emit('emergency-ground-support', {
        orderId: order._id,
        reason: 'no_backup_drone',
        originalReason: reason,
        requiresManualIntervention: true,
        timestamp: new Date()
      });

      return { success: false, error: error.message };
    }
  }

  // Notify emergency contacts
  static async notifyEmergencyContacts(order, message, io) {
    const contacts = order.emergencyTracking.emergencyContacts;
    
    for (const contact of contacts) {
      if (!contact.notified) {
        // In production, integrate with SMS/email service
        console.log(`Notifying ${contact.name} at ${contact.phone}: ${message}`);
        
        contact.notified = true;
        contact.notifiedAt = new Date();
        
        // Emit notification to admin dashboard
        io.emit('emergency-contact-notified', {
          orderId: order._id,
          contact: contact.name,
          phone: contact.phone,
          message,
          timestamp: new Date()
        });
      }
    }
    
    await order.save();
  }
}

module.exports = EmergencyService;
