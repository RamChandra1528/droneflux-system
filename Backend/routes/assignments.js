const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');

// Get all assignments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, operator, date } = req.query;
    let filter = {};
    
    if (status) filter.status = status;
    if (operator) filter.operator = operator;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.scheduledDate = { $gte: startDate, $lt: endDate };
    }
    
    // If user is operator, only show their assignments
    if (req.user.role === 'operator') {
      filter.operator = req.user.id;
    }
    
    const assignments = await Assignment.find(filter)
      .populate('operator', 'name email')
      .populate('drone', 'droneId model status')
      .populate('orders', 'orderId status priority')
      .sort({ scheduledDate: -1 });
    
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// Get assignment by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('operator', 'name email')
      .populate('drone', 'droneId model status batteryLevel location')
      .populate('orders', 'orderId status priority pickupLocation deliveryLocation');
    
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    
    // Check if operator can only view their own assignments
    if (req.user.role === 'operator' && assignment.operator._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assignment' });
  }
});

// Create new assignment
router.post('/', authenticateToken, requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const assignment = new Assignment(req.body);
    await assignment.save();
    
    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('operator', 'name email')
      .populate('drone', 'droneId model status')
      .populate('orders', 'orderId status priority');
    
    res.status(201).json(populatedAssignment);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create assignment' });
  }
});

// Update assignment
router.put('/:id', authenticateToken, requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    
    // Check if operator can only update their own assignments
    if (req.user.role === 'operator' && assignment.operator.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const updatedAssignment = await Assignment.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    ).populate('operator', 'name email')
     .populate('drone', 'droneId model status')
     .populate('orders', 'orderId status priority');
    
    res.json(updatedAssignment);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update assignment' });
  }
});

// Update assignment status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    
    // Check permissions
    if (req.user.role === 'operator' && assignment.operator.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    assignment.status = status;
    if (status === 'active' && !assignment.startTime) {
      assignment.startTime = new Date();
    }
    if (status === 'completed' && !assignment.endTime) {
      assignment.endTime = new Date();
      if (assignment.startTime) {
        assignment.actualDuration = Math.round((assignment.endTime - assignment.startTime) / (1000 * 60));
      }
    }
    
    await assignment.save();
    
    const updatedAssignment = await Assignment.findById(assignment._id)
      .populate('operator', 'name email')
      .populate('drone', 'droneId model status')
      .populate('orders', 'orderId status priority');
    
    res.json(updatedAssignment);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update assignment status' });
  }
});

// Delete assignment (admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
});

module.exports = router;
