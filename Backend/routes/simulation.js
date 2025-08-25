const express = require('express');
const router = express.Router();
const simulationController = require('../controllers/simulationController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/authMiddleware');

// All simulation routes require authentication
router.use(authenticateToken);

// Simulation control routes (admin/staff only)
router.post('/start', requireRole(['admin', 'staff']), simulationController.startSimulation);
router.post('/stop', requireRole(['admin', 'staff']), simulationController.stopSimulation);
router.get('/status', simulationController.getSimulationStatus);
router.get('/analytics', simulationController.getSimulationAnalytics);

// Drone management routes (admin/staff only)
router.post('/drones/:droneId/add', requireRole(['admin', 'staff']), simulationController.addDroneToSimulation);
router.delete('/drones/:droneId/remove', requireRole(['admin', 'staff']), simulationController.removeDroneFromSimulation);
router.patch('/drones/:droneId/emergency', requireRole(['admin', 'staff']), simulationController.setEmergencyMode);

// Telemetry routes (accessible to operators for monitoring)
router.get('/telemetry', requireRole(['admin', 'staff', 'operator']), simulationController.getAllTelemetry);
router.get('/telemetry/:droneId', requireRole(['admin', 'staff', 'operator']), simulationController.getDroneTelemetry);

module.exports = router;
