const Order = require('../models/Order');
const Drone = require('../models/Drone');
const RouteOptimizationService = require('./routeOptimizationService');

class LiveTrackingService {
  constructor(io) {
    this.io = io;
    this.activeTracking = new Map(); // Store active tracking sessions
    this.trackingIntervals = new Map(); // Store interval IDs
  }

  // Start live tracking for an emergency order
  async startEmergencyTracking(orderId) {
    try {
      const order = await Order.findById(orderId).populate('droneId');
      if (!order || !order.isEmergency) {
        throw new Error('Emergency order not found');
      }

      // Mark tracking as active
      order.emergencyTracking.isLiveTracking = true;
      order.emergencyTracking.trackingStarted = new Date();
      await order.save();

      // Store tracking session
      this.activeTracking.set(orderId, {
        orderId,
        droneId: order.droneId._id,
        startTime: new Date(),
        lastUpdate: new Date(),
        updateCount: 0
      });

      // Start real-time updates every 10 seconds
      const intervalId = setInterval(async () => {
        await this.updateEmergencyTracking(orderId);
      }, 10000);

      this.trackingIntervals.set(orderId, intervalId);

      console.log(`Started live tracking for emergency order ${orderId}`);
      
      // Emit tracking started event
      this.io.emit('emergency-tracking-started', {
        orderId,
        droneId: order.droneId._id,
        timestamp: new Date()
      });

      return { success: true, message: 'Live tracking started' };
    } catch (error) {
      console.error('Error starting emergency tracking:', error);
      throw error;
    }
  }

  // Update emergency tracking data
  async updateEmergencyTracking(orderId) {
    try {
      const trackingSession = this.activeTracking.get(orderId);
      if (!trackingSession) return;

      const order = await Order.findById(orderId).populate('droneId');
      if (!order || !order.droneId) {
        await this.stopEmergencyTracking(orderId);
        return;
      }

      const drone = order.droneId;
      
      // Calculate current progress
      const progress = this.calculateDeliveryProgress(order, drone);
      
      // Check for route adjustments needed
      const routeAdjustment = await this.checkRouteAdjustments(order, drone);
      
      // Prepare tracking update
      const trackingUpdate = {
        orderId,
        droneId: drone._id,
        timestamp: new Date(),
        location: {
          lat: drone.location.latitude,
          lng: drone.location.longitude,
          altitude: drone.altitude || 50
        },
        batteryLevel: drone.batteryLevel,
        speed: drone.speed || 0,
        heading: drone.heading || 0,
        status: order.status,
        progress: progress,
        estimatedArrival: order.estimatedDelivery,
        routeAdjustment: routeAdjustment
      };

      // Update tracking session
      trackingSession.lastUpdate = new Date();
      trackingSession.updateCount++;

      // Emit real-time update
      this.io.to(`emergency-order-${orderId}`).emit('emergency-tracking-update', trackingUpdate);
      
      // Also emit to admin dashboard
      this.io.emit('emergency-dashboard-update', {
        orderId,
        batteryLevel: drone.batteryLevel,
        progress: progress.percentage,
        status: order.status,
        timestamp: new Date()
      });

      // Check for critical conditions
      await this.checkCriticalConditions(order, drone, trackingUpdate);

      // Update order's last location update
      order.emergencyTracking.lastLocationUpdate = new Date();
      await order.save();

    } catch (error) {
      console.error(`Error updating emergency tracking for order ${orderId}:`, error);
    }
  }

  // Calculate delivery progress
  calculateDeliveryProgress(order, drone) {
    const route = order.routeOptimization?.optimizedRoute || [];
    if (route.length === 0) {
      return { percentage: 0, currentWaypoint: 'unknown', nextWaypoint: 'unknown' };
    }

    const droneLocation = { lat: drone.location.latitude, lng: drone.location.longitude };
    
    // Find closest waypoint
    let closestWaypointIndex = 0;
    let minDistance = Infinity;
    
    route.forEach((waypoint, index) => {
      const distance = RouteOptimizationService.calculateDistance(
        droneLocation.lat, droneLocation.lng,
        waypoint.lat, waypoint.lng
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestWaypointIndex = index;
      }
    });

    const percentage = Math.min(100, (closestWaypointIndex / (route.length - 1)) * 100);
    const currentWaypoint = route[closestWaypointIndex]?.waypoint || 'unknown';
    const nextWaypoint = route[closestWaypointIndex + 1]?.waypoint || 'destination';

    return {
      percentage: Math.round(percentage),
      currentWaypoint,
      nextWaypoint,
      distanceToNext: minDistance,
      totalWaypoints: route.length,
      completedWaypoints: closestWaypointIndex
    };
  }

  // Check if route adjustments are needed
  async checkRouteAdjustments(order, drone) {
    const currentLocation = { lat: drone.location.latitude, lng: drone.location.longitude };
    const targetLocation = order.deliveryLocation;
    
    const conditions = {
      batteryLevel: drone.batteryLevel,
      emergencyMode: true
    };

    // Check if battery is getting low
    if (drone.batteryLevel < drone.batteryThresholds.emergency) {
      const adjustment = await RouteOptimizationService.adjustRouteRealTime(
        order.routeOptimization?.optimizedRoute,
        currentLocation,
        targetLocation,
        conditions
      );

      if (adjustment.adjustmentsMade.length > 0) {
        // Update order with new route
        order.routeOptimization.optimizedRoute = adjustment.adjustedRoute.waypoints;
        await order.save();

        return {
          needed: true,
          reason: 'low_battery',
          adjustments: adjustment.adjustmentsMade,
          newRoute: adjustment.adjustedRoute
        };
      }
    }

    return { needed: false };
  }

  // Check for critical conditions that require immediate attention
  async checkCriticalConditions(order, drone, trackingUpdate) {
    const criticalAlerts = [];

    // Critical battery level
    if (drone.batteryLevel <= drone.batteryThresholds.critical) {
      criticalAlerts.push({
        type: 'critical_battery',
        severity: 'critical',
        message: `Drone battery at ${drone.batteryLevel}% - immediate action required`,
        timestamp: new Date()
      });
    }

    // Drone offline/no signal
    const lastUpdate = new Date(drone.updatedAt);
    const timeSinceUpdate = Date.now() - lastUpdate.getTime();
    if (timeSinceUpdate > 60000) { // 1 minute without update
      criticalAlerts.push({
        type: 'communication_lost',
        severity: 'high',
        message: 'Lost communication with drone',
        timestamp: new Date()
      });
    }

    // Significant delay
    const expectedTime = new Date(order.estimatedDelivery);
    const currentTime = new Date();
    const delay = currentTime - expectedTime;
    if (delay > 15 * 60 * 1000) { // 15 minutes late
      criticalAlerts.push({
        type: 'delivery_delayed',
        severity: 'medium',
        message: `Delivery delayed by ${Math.round(delay / 60000)} minutes`,
        timestamp: new Date()
      });
    }

    // Emit critical alerts
    if (criticalAlerts.length > 0) {
      this.io.emit('emergency-critical-alert', {
        orderId: order._id,
        droneId: drone._id,
        alerts: criticalAlerts,
        trackingData: trackingUpdate
      });

      // Add to order tracking history
      order.trackingHistory.push({
        status: 'critical_alert',
        notes: criticalAlerts.map(alert => alert.message).join('; '),
        timestamp: new Date()
      });
      await order.save();
    }
  }

  // Stop live tracking for an order
  async stopEmergencyTracking(orderId) {
    try {
      // Clear interval
      const intervalId = this.trackingIntervals.get(orderId);
      if (intervalId) {
        clearInterval(intervalId);
        this.trackingIntervals.delete(orderId);
      }

      // Remove from active tracking
      this.activeTracking.delete(orderId);

      // Update order
      const order = await Order.findById(orderId);
      if (order) {
        order.emergencyTracking.isLiveTracking = false;
        await order.save();
      }

      // Emit tracking stopped event
      this.io.emit('emergency-tracking-stopped', {
        orderId,
        timestamp: new Date()
      });

      console.log(`Stopped live tracking for emergency order ${orderId}`);
      return { success: true, message: 'Live tracking stopped' };
    } catch (error) {
      console.error('Error stopping emergency tracking:', error);
      throw error;
    }
  }

  // Get current tracking status for an order
  getTrackingStatus(orderId) {
    const session = this.activeTracking.get(orderId);
    if (!session) {
      return { active: false };
    }

    return {
      active: true,
      startTime: session.startTime,
      lastUpdate: session.lastUpdate,
      updateCount: session.updateCount,
      duration: Date.now() - session.startTime.getTime()
    };
  }

  // Get all active emergency tracking sessions
  getAllActiveTracking() {
    const activeSessions = [];
    for (const [orderId, session] of this.activeTracking) {
      activeSessions.push({
        orderId,
        ...session,
        duration: Date.now() - session.startTime.getTime()
      });
    }
    return activeSessions;
  }

  // Simulate drone location updates (for testing)
  async simulateDroneMovement(droneId, route) {
    if (!route || route.length < 2) return;

    let currentWaypointIndex = 0;
    const updateInterval = setInterval(async () => {
      if (currentWaypointIndex >= route.length - 1) {
        clearInterval(updateInterval);
        return;
      }

      const currentWaypoint = route[currentWaypointIndex];
      const nextWaypoint = route[currentWaypointIndex + 1];

      // Interpolate position between waypoints
      const progress = Math.random() * 0.1; // Random progress
      const lat = currentWaypoint.lat + (nextWaypoint.lat - currentWaypoint.lat) * progress;
      const lng = currentWaypoint.lng + (nextWaypoint.lng - currentWaypoint.lng) * progress;

      // Update drone location
      await Drone.findByIdAndUpdate(droneId, {
        location: { latitude: lat, longitude: lng },
        updatedAt: new Date()
      });

      // Move to next waypoint occasionally
      if (Math.random() < 0.3) {
        currentWaypointIndex++;
      }
    }, 5000); // Update every 5 seconds
  }

  // Clean up on service shutdown
  cleanup() {
    // Clear all intervals
    for (const intervalId of this.trackingIntervals.values()) {
      clearInterval(intervalId);
    }
    this.trackingIntervals.clear();
    this.activeTracking.clear();
  }
}

module.exports = LiveTrackingService;
