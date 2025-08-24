const Assignment = require('../models/Assignment');
const Drone = require('../models/Drone');
const Order = require('../models/Order');

// Get all assignments with filtering
exports.getAssignments = async (req, res) => {
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
    
    res.json({ success: true, data: assignments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get assignment by ID
exports.getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('operator', 'name email')
      .populate('drone', 'droneId model status batteryLevel location')
      .populate('orders', 'orderId status priority pickupLocation deliveryLocation');
    
    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }
    
    // Check if operator can only view their own assignments
    if (req.user.role === 'operator' && assignment.operator._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    
    res.json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create new assignment
exports.createAssignment = async (req, res) => {
  try {
    const assignment = new Assignment(req.body);
    await assignment.save();
    
    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('operator', 'name email')
      .populate('drone', 'droneId model status')
      .populate('orders', 'orderId status priority');
    
    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('assignment-created', {
        assignmentId: assignment._id,
        data: populatedAssignment
      });
    }
    
    res.status(201).json({ success: true, data: populatedAssignment });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Update assignment
exports.updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id);
    
    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }
    
    // Check if operator can only update their own assignments
    if (req.user.role === 'operator' && assignment.operator.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    
    const updatedAssignment = await Assignment.findByIdAndUpdate(
      id, 
      req.body, 
      { new: true }
    ).populate('operator', 'name email')
     .populate('drone', 'droneId model status')
     .populate('orders', 'orderId status priority');
    
    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('assignment-updated', {
        assignmentId: id,
        data: updatedAssignment
      });
    }
    
    res.json({ success: true, data: updatedAssignment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update assignment status
exports.updateAssignmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const assignment = await Assignment.findById(id);
    
    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }
    
    // Check permissions
    if (req.user.role === 'operator' && assignment.operator.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Access denied' });
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
    
    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('assignment-status-updated', {
        assignmentId: id,
        status,
        data: updatedAssignment
      });
    }
    
    res.json({ success: true, data: updatedAssignment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete assignment (admin only)
exports.deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const assignment = await Assignment.findByIdAndDelete(id);
    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }
    
    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('assignment-deleted', {
        assignmentId: id
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Assignment deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get operator assignments
exports.getOperatorAssignments = async (req, res) => {
  try {
    const { operatorId } = req.params;
    
    // Check if user can view these assignments
    if (req.user.role === 'operator' && req.user.id !== operatorId) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    
    const assignments = await Assignment.find({ operator: operatorId })
      .populate('drone', 'droneId model status')
      .populate('orders', 'orderId status priority')
      .sort({ scheduledDate: -1 });
    
    res.json({ success: true, data: assignments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get assignment statistics
exports.getAssignmentStats = async (req, res) => {
  try {
    const stats = await Assignment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const totalAssignments = await Assignment.countDocuments();
    const todayAssignments = await Assignment.countDocuments({
      scheduledDate: { $gte: new Date().setHours(0, 0, 0, 0) }
    });
    
    res.json({
      success: true,
      data: {
        totalAssignments,
        todayAssignments,
        statusBreakdown: stats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
