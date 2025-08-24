const express = require('express');
const router = express.Router();
const droneController = require('../controllers/droneController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');

// Get all drones
router.get('/', authenticateToken, droneController.getDrones);

// Get available drones for assignment
router.get('/available', authenticateToken, droneController.getAvailableDrones);

// Get drone by ID
router.get('/:id', authenticateToken, droneController.getDroneById);

// Create new drone (admin only)
router.post('/', authenticateToken, requireRole(['admin']), droneController.createDrone);

// Update drone location
router.patch('/:id/location', authenticateToken, droneController.updateDroneLocation);

// Update drone status
router.patch('/:id/status', authenticateToken, droneController.updateDroneStatus);

// Update drone battery
router.patch('/:id/battery', authenticateToken, droneController.updateDroneBattery);

// Get drone performance metrics
router.get('/:id/performance', authenticateToken, droneController.getDronePerformance);

// Get drones for map display
router.get('/map/display', authenticateToken, droneController.getDronesForMap);

// Emergency landing
router.post('/:id/emergency-landing', authenticateToken, droneController.emergencyLanding);

module.exports = router;
