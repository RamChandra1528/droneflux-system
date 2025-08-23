const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');

// Get all orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, priority, customer } = req.query;
    let filter = {};
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (customer) filter.customer = customer;
    
    // If user is customer, only show their orders
    if (req.user.role === 'customer') {
      filter.customer = req.user.id;
    }
    
    const orders = await Order.find(filter)
      .populate('customer', 'name email')
      .populate('assignedDrone', 'droneId model status')
      .populate('assignedOperator', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get order by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('assignedDrone', 'droneId model status')
      .populate('assignedOperator', 'name email');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check if customer can only view their own orders
    if (req.user.role === 'customer' && order.customer._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Create new order
router.post('/', authenticateToken, async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      customer: req.user.role === 'customer' ? req.user.id : req.body.customer
    };
    
    const order = new Order(orderData);
    await order.save();
    
    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email');
    
    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create order' });
  }
});

// Update order
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check permissions
    if (req.user.role === 'customer' && order.customer.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    ).populate('customer', 'name email')
     .populate('assignedDrone', 'droneId model status')
     .populate('assignedOperator', 'name email');
    
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update order' });
  }
});

// Update order status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Add to tracking history
    order.trackingHistory.push({
      status,
      notes,
      timestamp: new Date()
    });
    
    order.status = status;
    if (status === 'delivered') {
      order.actualDeliveryTime = new Date();
    }
    
    await order.save();
    
    const updatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email')
      .populate('assignedDrone', 'droneId model status')
      .populate('assignedOperator', 'name email');
    
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update order status' });
  }
});

// Assign drone and operator to order
router.patch('/:id/assign', authenticateToken, requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const { droneId, operatorId } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        assignedDrone: droneId,
        assignedOperator: operatorId,
        status: 'assigned'
      },
      { new: true }
    ).populate('customer', 'name email')
     .populate('assignedDrone', 'droneId model status')
     .populate('assignedOperator', 'name email');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: 'Failed to assign order' });
  }
});

// Delete order (admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

module.exports = router;
