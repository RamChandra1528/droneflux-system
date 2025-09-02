const mqtt = require('mqtt');
const { v4: uuidv4 } = require('uuid');
const Drone = require('../models/Drone');
const Assignment = require('../models/Assignment');
const Telemetry = require('../models/Telemetry');

class DroneSimulationService {
  constructor(io = null) {
    this.mqttClient = null;
    this.io = io; // WebSocket instance for real-time updates
    this.simulations = new Map(); // droneId -> simulation state
    this.isRunning = false;
    this.updateInterval = 2000; // 2 seconds
    this.intervalId = null;
    
    // Geofence boundaries (example for a city area)
    this.geofence = {
      center: { lat: 40.7128, lng: -74.0060 }, // NYC coordinates
      radius: 50000 // 50km radius in meters
    };
    
    this.initializeMQTT();
  }

  initializeMQTT() {
    // Skip MQTT initialization for now - use WebSocket instead
    console.log('📡 Using WebSocket for telemetry instead of MQTT');
    this.mqttClient = null;
  }

  async startSimulation() {
    if (this.isRunning) return;
    
    console.log('🚁 Starting drone simulation...');
    this.isRunning = true;
    
    // Load active drones from database
    await this.loadActiveDrones();
    
    // Start simulation loop
    this.intervalId = setInterval(() => {
      this.updateAllDrones();
    }, this.updateInterval);
  }

  async stopSimulation() {
    if (!this.isRunning) return;
    
    console.log('⏹️ Stopping drone simulation...');
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    // Land all drones safely
    for (const [droneId, simulation] of this.simulations) {
      simulation.status = 'landing';
      await this.updateDroneInDatabase(droneId, simulation);
    }
  }

  async loadActiveDrones() {
    try {
      const activeDrones = await Drone.find({ 
        status: { $in: ['available', 'busy', 'maintenance'] } 
      });
      
      for (const drone of activeDrones) {
        await this.initializeDroneSimulation(drone);
      }
      
      console.log(`📊 Initialized simulation for ${activeDrones.length} drones`);
    } catch (error) {
      console.error('Error loading active drones:', error);
    }
  }

  async initializeDroneSimulation(drone) {
    const simulation = {
      droneId: drone._id.toString(),
      model: drone.model,
      position: {
        latitude: drone.location?.latitude || (40.7128 + (Math.random() - 0.5) * 0.1),
        longitude: drone.location?.longitude || (-74.0060 + (Math.random() - 0.5) * 0.1),
        altitude: 0
      },
      destination: null,
      velocity: {
        speed: 0,
        heading: Math.random() * 360,
        verticalSpeed: 0
      },
      battery: {
        level: Math.random() * 40 + 60, // 60-100%
        voltage: 12.0 + Math.random() * 2,
        temperature: 20 + Math.random() * 10
      },
      status: 'idle',
      emergencyMode: false,
      orderId: null,
      lastUpdate: Date.now(),
      flightPath: [],
      alerts: []
    };

    // Check for active assignments
    const assignment = await Assignment.findOne({ 
      droneId: drone._id, 
      status: { $in: ['assigned', 'in_progress'] } 
    });

    if (assignment) {
      simulation.orderId = assignment._id.toString();
      simulation.status = 'flying';
      simulation.emergencyMode = assignment.priority === 'emergency';
      
      // Set destination based on assignment
      if (assignment.deliveryLocation) {
        simulation.destination = {
          latitude: assignment.deliveryLocation.latitude,
          longitude: assignment.deliveryLocation.longitude
        };
      }
    }

    this.simulations.set(drone._id.toString(), simulation);
  }

  async updateAllDrones() {
    const promises = [];
    
    for (const [droneId, simulation] of this.simulations) {
      promises.push(this.updateDroneSimulation(droneId, simulation));
    }
    
    await Promise.all(promises);
  }

  async updateDroneSimulation(droneId, simulation) {
    try {
      // Update position based on status and destination
      this.updatePosition(simulation);
      
      // Update battery (drain over time)
      this.updateBattery(simulation);
      
      // Check for failures and alerts
      this.checkForFailures(simulation);
      
      // Validate geofence
      this.checkGeofence(simulation);
      
      // Update status based on mission progress
      await this.updateMissionStatus(simulation);
      
      // Save telemetry to database
      await this.saveTelemetry(simulation);
      
      // Publish MQTT telemetry
      this.publishTelemetry(simulation);
      
      // Update drone location in database
      await this.updateDroneInDatabase(droneId, simulation);
      
    } catch (error) {
      console.error(`Error updating drone ${droneId}:`, error);
    }
  }

  updatePosition(simulation) {
    const now = Date.now();
    const deltaTime = (now - simulation.lastUpdate) / 1000; // seconds
    simulation.lastUpdate = now;

    switch (simulation.status) {
      case 'takeoff':
        simulation.position.altitude += 2 * deltaTime; // 2 m/s climb rate
        simulation.velocity.verticalSpeed = 2;
        if (simulation.position.altitude >= 50) {
          simulation.status = 'flying';
          simulation.position.altitude = 50;
          simulation.velocity.verticalSpeed = 0;
        }
        break;

      case 'flying':
        if (simulation.destination) {
          this.moveTowardsDestination(simulation, deltaTime);
        } else {
          // Random patrol movement
          this.randomPatrol(simulation, deltaTime);
        }
        break;

      case 'landing':
        simulation.position.altitude -= 1.5 * deltaTime; // 1.5 m/s descent
        simulation.velocity.verticalSpeed = -1.5;
        if (simulation.position.altitude <= 0) {
          simulation.position.altitude = 0;
          simulation.status = 'idle';
          simulation.velocity.speed = 0;
          simulation.velocity.verticalSpeed = 0;
        }
        break;

      case 'emergency':
        // Emergency landing
        simulation.position.altitude -= 3 * deltaTime; // Faster descent
        simulation.velocity.verticalSpeed = -3;
        if (simulation.position.altitude <= 0) {
          simulation.position.altitude = 0;
          simulation.status = 'idle';
          simulation.velocity.speed = 0;
        }
        break;
    }

    // Add to flight path
    simulation.flightPath.push({
      latitude: simulation.position.latitude,
      longitude: simulation.position.longitude,
      altitude: simulation.position.altitude,
      timestamp: now
    });

    // Keep only last 100 points
    if (simulation.flightPath.length > 100) {
      simulation.flightPath = simulation.flightPath.slice(-100);
    }
  }

  moveTowardsDestination(simulation, deltaTime) {
    const { latitude: lat1, longitude: lng1 } = simulation.position;
    const { latitude: lat2, longitude: lng2 } = simulation.destination;
    
    // Calculate distance and bearing
    const distance = this.calculateDistance(lat1, lng1, lat2, lng2);
    const bearing = this.calculateBearing(lat1, lng1, lat2, lng2);
    
    // Set speed based on emergency mode
    const maxSpeed = simulation.emergencyMode ? 25 : 15; // m/s
    const currentSpeed = Math.min(maxSpeed, distance / deltaTime);
    
    simulation.velocity.speed = currentSpeed;
    simulation.velocity.heading = bearing;
    
    if (distance < 10) { // Within 10 meters
      simulation.status = 'delivering';
      simulation.velocity.speed = 0;
      return;
    }
    
    // Move towards destination
    const moveDistance = currentSpeed * deltaTime;
    const newPosition = this.movePosition(lat1, lng1, bearing, moveDistance);
    
    simulation.position.latitude = newPosition.latitude;
    simulation.position.longitude = newPosition.longitude;
  }

  randomPatrol(simulation, deltaTime) {
    // Random patrol movement for idle drones
    const speed = 5; // 5 m/s patrol speed
    simulation.velocity.speed = speed;
    
    // Change direction occasionally
    if (Math.random() < 0.1) {
      simulation.velocity.heading = Math.random() * 360;
    }
    
    const moveDistance = speed * deltaTime;
    const newPosition = this.movePosition(
      simulation.position.latitude,
      simulation.position.longitude,
      simulation.velocity.heading,
      moveDistance
    );
    
    simulation.position.latitude = newPosition.latitude;
    simulation.position.longitude = newPosition.longitude;
  }

  updateBattery(simulation) {
    const drainRate = simulation.emergencyMode ? 0.8 : 0.5; // %/minute
    const deltaMinutes = (Date.now() - simulation.lastUpdate) / 60000;
    
    simulation.battery.level = Math.max(0, simulation.battery.level - (drainRate * deltaMinutes));
    simulation.battery.voltage = 12.0 + (simulation.battery.level / 100) * 2;
    simulation.battery.temperature = 20 + Math.random() * 15;
  }

  checkForFailures(simulation) {
    simulation.alerts = simulation.alerts.filter(alert => 
      Date.now() - alert.timestamp < 300000 // Keep alerts for 5 minutes
    );

    // Battery low warning
    if (simulation.battery.level < 20 && !simulation.alerts.some(a => a.type === 'battery_low')) {
      simulation.alerts.push({
        type: 'battery_low',
        message: `Battery level critical: ${simulation.battery.level.toFixed(1)}%`,
        severity: 'critical',
        timestamp: Date.now()
      });
    }

    // Random system failures (1% chance per update)
    if (Math.random() < 0.01) {
      const failures = ['weather_warning', 'obstacle_detected', 'system_failure'];
      const failure = failures[Math.floor(Math.random() * failures.length)];
      
      simulation.alerts.push({
        type: failure,
        message: this.getFailureMessage(failure),
        severity: 'warning',
        timestamp: Date.now()
      });
    }

    // Emergency landing for critical battery
    if (simulation.battery.level < 10 && simulation.status !== 'emergency') {
      simulation.status = 'emergency';
      simulation.emergencyMode = true;
    }
  }

  checkGeofence(simulation) {
    const distance = this.calculateDistance(
      simulation.position.latitude,
      simulation.position.longitude,
      this.geofence.center.lat,
      this.geofence.center.lng
    );

    if (distance > this.geofence.radius) {
      simulation.geofenceStatus = 'violation';
      if (!simulation.alerts.some(a => a.type === 'geofence_violation')) {
        simulation.alerts.push({
          type: 'geofence_violation',
          message: 'Drone has left authorized flight zone',
          severity: 'critical',
          timestamp: Date.now()
        });
      }
    } else if (distance > this.geofence.radius * 0.9) {
      simulation.geofenceStatus = 'warning';
    } else {
      simulation.geofenceStatus = 'inside';
    }
  }

  async updateMissionStatus(simulation) {
    if (simulation.status === 'delivering' && simulation.orderId) {
      // Simulate delivery completion after 30 seconds
      setTimeout(async () => {
        try {
          await Assignment.findByIdAndUpdate(simulation.orderId, {
            status: 'completed',
            completedAt: new Date()
          });
          
          simulation.status = 'returning';
          simulation.destination = {
            latitude: 40.7128, // Return to base
            longitude: -74.0060
          };
        } catch (error) {
          console.error('Error updating assignment:', error);
        }
      }, 30000);
    }
  }

  async saveTelemetry(simulation) {
    try {
      const telemetry = new Telemetry({
        droneId: simulation.droneId,
        orderId: simulation.orderId,
        position: simulation.position,
        velocity: simulation.velocity,
        battery: simulation.battery,
        sensors: {
          gps: {
            accuracy: 2.0 + Math.random() * 2,
            satellites: 8 + Math.floor(Math.random() * 4)
          },
          weather: {
            windSpeed: Math.random() * 10,
            windDirection: Math.random() * 360,
            temperature: 15 + Math.random() * 20,
            humidity: 30 + Math.random() * 40
          }
        },
        status: simulation.status,
        emergencyMode: simulation.emergencyMode,
        geofenceStatus: simulation.geofenceStatus,
        alerts: simulation.alerts
      });

      await telemetry.save();
    } catch (error) {
      console.error('Error saving telemetry:', error);
    }
  }

  publishTelemetry(simulation) {
    // Use WebSocket instead of MQTT for real-time updates
    if (this.io) {
      const payload = {
        droneId: simulation.droneId,
        timestamp: Date.now(),
        position: simulation.position,
        velocity: simulation.velocity,
        battery: simulation.battery,
        status: simulation.status,
        emergencyMode: simulation.emergencyMode,
        geofenceStatus: simulation.geofenceStatus,
        alerts: simulation.alerts,
        orderId: simulation.orderId
      };

      // Emit to all connected clients
      this.io.emit('drone-telemetry-update', payload);
      
      // Emit to specific drone tracking rooms
      this.io.to(`drone-${simulation.droneId}`).emit('drone-location-updated', payload);
    }
  }

  async updateDroneInDatabase(droneId, simulation) {
    try {
      await Drone.findByIdAndUpdate(droneId, {
        location: {
          latitude: simulation.position.latitude,
          longitude: simulation.position.longitude
        },
        batteryLevel: simulation.battery.level,
        status: this.mapSimulationStatusToDroneStatus(simulation.status),
        lastSeen: new Date()
      });
    } catch (error) {
      console.error('Error updating drone in database:', error);
    }
  }

  // Utility methods
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  calculateBearing(lat1, lng1, lat2, lng2) {
    const dLng = this.toRadians(lng2 - lng1);
    const y = Math.sin(dLng) * Math.cos(this.toRadians(lat2));
    const x = Math.cos(this.toRadians(lat1)) * Math.sin(this.toRadians(lat2)) -
              Math.sin(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * Math.cos(dLng);
    return (this.toDegrees(Math.atan2(y, x)) + 360) % 360;
  }

  movePosition(lat, lng, bearing, distance) {
    const R = 6371000; // Earth's radius in meters
    const bearingRad = this.toRadians(bearing);
    const latRad = this.toRadians(lat);
    const lngRad = this.toRadians(lng);
    
    const newLatRad = Math.asin(Math.sin(latRad) * Math.cos(distance/R) +
                               Math.cos(latRad) * Math.sin(distance/R) * Math.cos(bearingRad));
    const newLngRad = lngRad + Math.atan2(Math.sin(bearingRad) * Math.sin(distance/R) * Math.cos(latRad),
                                         Math.cos(distance/R) - Math.sin(latRad) * Math.sin(newLatRad));
    
    return {
      latitude: this.toDegrees(newLatRad),
      longitude: this.toDegrees(newLngRad)
    };
  }

  toRadians(degrees) {
    return degrees * Math.PI / 180;
  }

  toDegrees(radians) {
    return radians * 180 / Math.PI;
  }

  getFailureMessage(type) {
    const messages = {
      weather_warning: 'High wind conditions detected',
      obstacle_detected: 'Obstacle in flight path, adjusting route',
      system_failure: 'Minor system anomaly detected'
    };
    return messages[type] || 'Unknown system alert';
  }

  mapSimulationStatusToDroneStatus(simStatus) {
    const statusMap = {
      idle: 'available',
      takeoff: 'busy',
      flying: 'busy',
      delivering: 'busy',
      returning: 'busy',
      landing: 'busy',
      emergency: 'maintenance'
    };
    return statusMap[simStatus] || 'available';
  }

  // Public methods for external control
  async addDroneToSimulation(droneId) {
    const drone = await Drone.findById(droneId);
    if (drone) {
      await this.initializeDroneSimulation(drone);
    }
  }

  removeDroneFromSimulation(droneId) {
    this.simulations.delete(droneId);
  }

  getDroneSimulation(droneId) {
    return this.simulations.get(droneId);
  }

  getAllSimulations() {
    return Array.from(this.simulations.values());
  }

  setEmergencyMode(droneId, emergency = true) {
    const simulation = this.simulations.get(droneId);
    if (simulation) {
      simulation.emergencyMode = emergency;
    }
  }
}

module.exports = DroneSimulationService;
