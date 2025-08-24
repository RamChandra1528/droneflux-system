const Order = require('../models/Order');
const Drone = require('../models/Drone');
const User = require('../models/User');
const Assignment = require('../models/Assignment');

// Get all orders with filtering and pagination
exports.getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, customerId, search } = req.query;
    
    let query = {};
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Filter by customer
    if (customerId) {
      query.customerId = customerId;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { 'pickupLocation.address': { $regex: search, $options: 'i' } },
        { 'deliveryLocation.address': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get total count for pagination
    const totalDocs = await Order.countDocuments(query);
    
    // Get orders with pagination
    const orders = await Order.find(query)
      .populate('customerId', 'name email')
      .populate('droneId', 'name model status')
      .populate('operatorId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const totalPages = Math.ceil(totalDocs / parseInt(limit));
    const hasNext = parseInt(page) < totalPages;
    const hasPrev = parseInt(page) > 1;
    
    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        totalPages,
        totalDocs,
        hasNext,
        hasPrev
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get order by ID with full details
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate('droneId', 'name model status batteryLevel location')
      .populate('operatorId', 'name email phone')
      .populate('trackingHistory.location');
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const {
      customerId,
      customerName,
      status,
      items,
      totalWeight,
      pickupLocation,
      deliveryLocation,
      price,
      paymentStatus,
      paymentMethod,
      estimatedDelivery
    } = req.body;
    
    // Validate required fields
    if (!customerId || !customerName || !items || !totalWeight || !pickupLocation || !deliveryLocation || !price || !estimatedDelivery) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }
    
    // Create order
    const order = new Order({
      customerId,
      customerName,
      status: status || 'pending',
      items,
      totalWeight,
      pickupLocation,
      deliveryLocation,
      price,
      paymentStatus: paymentStatus || 'pending',
      paymentMethod,
      estimatedDelivery
    });
    
    await order.save();
    
    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`customer-${customerId}`).emit('new-order', order);
    }
    
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, notes, location } = req.body;
    const { id } = req.params;
    
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    // Add to tracking history
    order.trackingHistory.push({
      status,
      notes,
      location,
      timestamp: new Date()
    });
    
    order.status = status;
    order.updatedAt = new Date();
    
    // Update actual delivery time if delivered
    if (status === 'delivered') {
      order.actualDeliveryTime = new Date();
    }
    
    await order.save();
    
    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`order-${id}`).emit('order-updated', {
        orderId: id,
        status,
        trackingHistory: order.trackingHistory
      });
    }
    
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Assign drone to order
exports.assignDrone = async (req, res) => {
  try {
    const { droneId, operatorId, estimatedDeliveryTime } = req.body;
    const { id } = req.params;
    
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    // Check if drone is available
    const drone = await Drone.findById(droneId);
    if (!drone || drone.status !== 'available') {
      return res.status(400).json({ 
        success: false, 
        error: 'Drone not available' 
      });
    }
    
    // Update order
    order.droneId = droneId;
    order.operatorId = operatorId;
    order.estimatedDelivery = estimatedDeliveryTime;
    order.status = 'processing';
    order.updatedAt = new Date();
    
    // Update drone status
    drone.status = 'in-transit';
    await drone.save();
    
    await order.save();
    
    // Create assignment
    const assignment = new Assignment({
      operator: operatorId,
      drone: droneId,
      orders: [id],
      status: 'active',
      scheduledDate: new Date(),
      startTime: new Date(),
      route: [{
        order: id,
        sequence: 1,
        estimatedTime: estimatedDeliveryTime,
        location: order.pickupLocation
      }]
    });
    
    await assignment.save();
    
    // Emit real-time updates
    const io = req.app.get('io');
    if (io) {
      io.to(`order-${id}`).emit('order-updated', {
        orderId: id,
        status: 'assigned',
        assignedDrone: drone,
        estimatedDeliveryTime
      });
      
      io.to(`drone-${droneId}`).emit('drone-assigned', {
        droneId,
        orderId: id,
        status: 'in-transit'
      });
    }
    
    res.json({ 
      success: true, 
      data: { order, assignment },
      message: 'Drone assigned successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get order tracking information
exports.getOrderTracking = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id)
      .populate('droneId', 'name model status location batteryLevel')
      .populate('operatorId', 'name phone')
      .select('_id status trackingHistory droneId operatorId estimatedDelivery');
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get orders by customer
exports.getCustomerOrders = async (req, res) => {
  try {
    // Get customer ID from the authenticated user
    const customerId = req.user._id;
    const { page = 1, limit = 20, status } = req.query;
    
    let query = { customerId: customerId };
    if (status) {
      query.status = status;
    }
    
    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get total count for pagination
    const totalDocs = await Order.countDocuments(query);
    
    // Get orders with pagination
    const orders = await Order.find(query)
      .populate('droneId', 'name model status')
      .populate('operatorId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const totalPages = Math.ceil(totalDocs / parseInt(limit));
    
    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        totalPages,
        totalDocs
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    // Check if order can be cancelled
    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Order cannot be cancelled' 
      });
    }
    
    // Update order status
    order.status = 'cancelled';
    order.trackingHistory.push({
      status: 'cancelled',
      notes: reason || 'Order cancelled by customer',
      timestamp: new Date()
    });
    
    // If drone was assigned, make it available again
    if (order.droneId) {
      const drone = await Drone.findById(order.droneId);
      if (drone) {
        drone.status = 'available';
        await drone.save();
      }
    }
    
    await order.save();
    
    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`order-${id}`).emit('order-updated', {
        orderId: id,
        status: 'cancelled',
        reason
      });
    }
    
    res.json({ 
      success: true, 
      data: order,
      message: 'Order cancelled successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update order
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    // Check permissions
    if (req.user.role === 'customer' && order.customer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    
    const updatedOrder = await Order.findByIdAndUpdate(
      id, 
      req.body, 
      { new: true }
    ).populate('customer', 'name email')
     .populate('assignedDrone', 'droneId model status')
     .populate('assignedOperator', 'name email');
    
    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`order-${id}`).emit('order-updated', {
        orderId: id,
        data: updatedOrder
      });
    }
    
    res.json({ 
      success: true, 
      data: updatedOrder 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete order (admin only)
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`order-${id}`).emit('order-deleted', {
        orderId: id
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Order deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get order statistics
exports.getOrderStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$deliveryFee' }
        }
      }
    ]);
    
    const totalOrders = await Order.countDocuments();
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
    });
    
    res.json({
      success: true,
      data: {
        totalOrders,
        todayOrders,
        statusBreakdown: stats,
        totalRevenue: stats.reduce((sum, stat) => sum + stat.totalValue, 0)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
