const express = require('express');
const router = express.Router();
const {
  createDrone,
  getDrones,
  getDroneById,
  updateDrone,
  deleteDrone,
  updateDroneLocation,
} = require('../controllers/droneController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Create a new drone (admin only)
router.post('/', authMiddleware, adminMiddleware, createDrone);

// Get all drones
router.get('/', authMiddleware, getDrones);

// Get a single drone by ID
router.get('/:id', authMiddleware, getDroneById);

// Update a drone (admin only)
router.put('/:id', authMiddleware, adminMiddleware, updateDrone);

// Delete a drone (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, deleteDrone);

// Update drone location
router.post('/:id/location', authMiddleware, updateDroneLocation);
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
