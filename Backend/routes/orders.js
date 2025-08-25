const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');

// Get all orders
router.get('/', authenticateToken, orderController.getOrders);

// Get customer orders
router.get('/customer/orders', authenticateToken, orderController.getCustomerOrders);

// Get order by ID
router.get('/:id', authenticateToken, orderController.getOrderById);

// Create new order
router.post('/', authenticateToken, orderController.createOrder);

// Update order
router.put('/:id', authenticateToken, orderController.updateOrder);

// Update order status
router.patch('/:id/status', authenticateToken, orderController.updateOrderStatus);

// Assign drone and operator to order
router.patch('/:id/assign', authenticateToken, requireRole(['admin', 'operator']), orderController.assignDrone);

// Get order tracking information
router.get('/:id/tracking', authenticateToken, orderController.getOrderTracking);

// Cancel order
router.patch('/:id/cancel', authenticateToken, orderController.cancelOrder);

// Delete order (admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), orderController.deleteOrder);

// Get order statistics
router.get('/stats/overview', authenticateToken, orderController.getOrderStats);

module.exports = router;
