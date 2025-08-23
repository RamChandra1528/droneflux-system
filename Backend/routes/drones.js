const express = require('express');
const router = express.Router();
const Drone = require('../models/Drone');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');

// Get all drones
router.get('/', authenticateToken, async (req, res) => {
  try {
    const drones = await Drone.find().populate('assignedOperator', 'name email');
    res.json(drones);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch drones' });
  }
});

// Get drone by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const drone = await Drone.findById(req.params.id).populate('assignedOperator', 'name email');
    if (!drone) {
      return res.status(404).json({ error: 'Drone not found' });
    }
    res.json(drone);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch drone' });
  }
});

// Create new drone (admin only)
router.post('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const drone = new Drone(req.body);
    await drone.save();
    res.status(201).json(drone);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create drone' });
  }
});

// Update drone
router.put('/:id', authenticateToken, requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const drone = await Drone.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!drone) {
      return res.status(404).json({ error: 'Drone not found' });
    }
    res.json(drone);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update drone' });
  }
});

// Delete drone (admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const drone = await Drone.findByIdAndDelete(req.params.id);
    if (!drone) {
      return res.status(404).json({ error: 'Drone not found' });
    }
    res.json({ message: 'Drone deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete drone' });
  }
});

// Update drone status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const drone = await Drone.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );
    if (!drone) {
      return res.status(404).json({ error: 'Drone not found' });
    }
    res.json(drone);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update drone status' });
  }
});

module.exports = router;
