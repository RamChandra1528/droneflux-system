const DroneSimulationService = require('../services/droneSimulation');
const Telemetry = require('../models/Telemetry');
const Drone = require('../models/Drone');

// Initialize simulation service (will be set with IO instance)
let simulationService = null;

// Initialize simulation service with WebSocket IO
const initializeSimulationService = (io) => {
  if (!simulationService) {
    simulationService = new DroneSimulationService(io);
    console.log('✅ Drone simulation service initialized with WebSocket');
  }
  return simulationService;
};

// Start simulation
exports.startSimulation = async (req, res) => {
  try {
    if (!simulationService) {
      const io = req.app.get('io');
      initializeSimulationService(io);
    }
    
    await simulationService.startSimulation();
    res.json({
      success: true,
      message: 'Drone simulation started successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error starting simulation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start simulation',
      error: error.message
    });
  }
};

// Stop simulation
exports.stopSimulation = async (req, res) => {
  try {
    if (!simulationService) {
      const io = req.app.get('io');
      initializeSimulationService(io);
    }
    
    await simulationService.stopSimulation();
    res.json({
      success: true,
      message: 'Drone simulation stopped successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error stopping simulation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to stop simulation',
      error: error.message
    });
  }
};

// Get simulation status
exports.getSimulationStatus = async (req, res) => {
  try {
    if (!simulationService) {
      const io = req.app.get('io');
      initializeSimulationService(io);
    }
    
    const simulations = simulationService.getAllSimulations();
    const activeDrones = simulations.length;
    const emergencyDrones = simulations.filter(s => s.emergencyMode).length;
    const lowBatteryDrones = simulations.filter(s => s.battery.level < 20).length;
    
    res.json({
      success: true,
      data: {
        isRunning: simulationService.isRunning,
        activeDrones,
        emergencyDrones,
        lowBatteryDrones,
        simulations: simulations.map(s => ({
          droneId: s.droneId,
          model: s.model,
          position: s.position,
          status: s.status,
          batteryLevel: s.battery.level,
          emergencyMode: s.emergencyMode,
          orderId: s.orderId
        }))
      }
    });
  } catch (error) {
    console.error('Error getting simulation status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get simulation status',
      error: error.message
    });
  }
};

// Get drone telemetry
exports.getDroneTelemetry = async (req, res) => {
  try {
    const { droneId } = req.params;
    const { limit = 100, hours = 24 } = req.query;
    
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const telemetry = await Telemetry.find({
      droneId,
      timestamp: { $gte: startTime }
    })
    .sort({ timestamp: -1 })
    .limit(parseInt(limit))
    .populate('droneId', 'model serialNumber')
    .populate('orderId', 'orderId deliveryLocation');
    
    res.json({
      success: true,
      data: telemetry
    });
  } catch (error) {
    console.error('Error getting drone telemetry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get drone telemetry',
      error: error.message
    });
  }
};

// Get all telemetry (for dashboard overview)
exports.getAllTelemetry = async (req, res) => {
  try {
    const { limit = 50, hours = 1 } = req.query;
    
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    // Get latest telemetry for each drone
    const telemetry = await Telemetry.aggregate([
      {
        $match: {
          timestamp: { $gte: startTime }
        }
      },
      {
        $sort: { droneId: 1, timestamp: -1 }
      },
      {
        $group: {
          _id: '$droneId',
          latestTelemetry: { $first: '$$ROOT' }
        }
      },
      {
        $replaceRoot: { newRoot: '$latestTelemetry' }
      },
      {
        $limit: parseInt(limit)
      }
    ]);
    
    await Telemetry.populate(telemetry, [
      { path: 'droneId', select: 'model serialNumber' },
      { path: 'orderId', select: 'orderId deliveryLocation' }
    ]);
    
    res.json({
      success: true,
      data: telemetry
    });
  } catch (error) {
    console.error('Error getting all telemetry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get telemetry data',
      error: error.message
    });
  }
};

// Set drone emergency mode
exports.setEmergencyMode = async (req, res) => {
  try {
    if (!simulationService) {
      const io = req.app.get('io');
      initializeSimulationService(io);
    }
    
    const { droneId } = req.params;
    const { emergency = true } = req.body;
    
    simulationService.setEmergencyMode(droneId, emergency);
    
    res.json({
      success: true,
      message: `Drone ${droneId} emergency mode ${emergency ? 'enabled' : 'disabled'}`,
      droneId,
      emergencyMode: emergency
    });
  } catch (error) {
    console.error('Error setting emergency mode:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set emergency mode',
      error: error.message
    });
  }
};

// Add drone to simulation
exports.addDroneToSimulation = async (req, res) => {
  try {
    if (!simulationService) {
      const io = req.app.get('io');
      initializeSimulationService(io);
    }
    
    const { droneId } = req.params;
    
    await simulationService.addDroneToSimulation(droneId);
    
    res.json({
      success: true,
      message: `Drone ${droneId} added to simulation`,
      droneId
    });
  } catch (error) {
    console.error('Error adding drone to simulation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add drone to simulation',
      error: error.message
    });
  }
};

// Remove drone from simulation
exports.removeDroneFromSimulation = async (req, res) => {
  try {
    if (!simulationService) {
      const io = req.app.get('io');
      initializeSimulationService(io);
    }
    
    const { droneId } = req.params;
    
    simulationService.removeDroneFromSimulation(droneId);
    
    res.json({
      success: true,
      message: `Drone ${droneId} removed from simulation`,
      droneId
    });
  } catch (error) {
    console.error('Error removing drone from simulation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove drone from simulation',
      error: error.message
    });
  }
};

// Get simulation analytics
exports.getSimulationAnalytics = async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    // Flight time analytics
    const flightTimeStats = await Telemetry.aggregate([
      {
        $match: {
          timestamp: { $gte: startTime },
          status: { $in: ['flying', 'delivering', 'returning'] }
        }
      },
      {
        $group: {
          _id: '$droneId',
          totalFlightTime: { $sum: 1 }, // Count of telemetry points (approx flight time)
          avgSpeed: { $avg: '$velocity.speed' },
          maxAltitude: { $max: '$position.altitude' },
          minBattery: { $min: '$battery.level' }
        }
      }
    ]);
    
    // Alert statistics
    const alertStats = await Telemetry.aggregate([
      {
        $match: {
          timestamp: { $gte: startTime },
          alerts: { $exists: true, $ne: [] }
        }
      },
      {
        $unwind: '$alerts'
      },
      {
        $group: {
          _id: '$alerts.type',
          count: { $sum: 1 },
          severity: { $first: '$alerts.severity' }
        }
      }
    ]);
    
    // Geofence violations
    const geofenceViolations = await Telemetry.countDocuments({
      timestamp: { $gte: startTime },
      geofenceStatus: 'violation'
    });
    
    res.json({
      success: true,
      data: {
        flightTimeStats,
        alertStats,
        geofenceViolations,
        timeRange: {
          start: startTime,
          end: new Date(),
          hours: parseInt(hours)
        }
      }
    });
  } catch (error) {
    console.error('Error getting simulation analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get simulation analytics',
      error: error.message
    });
  }
};

// Export simulation service for use in other modules
exports.simulationService = simulationService;
exports.initializeSimulationService = initializeSimulationService;
