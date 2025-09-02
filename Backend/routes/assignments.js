const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');

// Get all assignments
router.get('/', authenticateToken, assignmentController.getAssignments);

// Get assignment by ID
router.get('/:id', authenticateToken, assignmentController.getAssignmentById);

// Create new assignment
router.post('/', authenticateToken, requireRole(['admin', 'operator']), assignmentController.createAssignment);

// Update assignment
router.put('/:id', authenticateToken, requireRole(['admin', 'operator']), assignmentController.updateAssignment);

// Update assignment status
router.patch('/:id/status', authenticateToken, assignmentController.updateAssignmentStatus);

// Get operator assignments
router.get('/operator/:operatorId', authenticateToken, assignmentController.getOperatorAssignments);

// Get assignment statistics
router.get('/stats/overview', authenticateToken, assignmentController.getAssignmentStats);

// Delete assignment (admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), assignmentController.deleteAssignment);

module.exports = router;
