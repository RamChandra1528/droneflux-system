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

module.exports = router;
