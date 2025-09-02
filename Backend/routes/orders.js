const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Create a new order
router.post('/', authMiddleware, createOrder);

// Get all orders (admin only)
router.get('/', authMiddleware, adminMiddleware, getOrders);

// Get a single order by ID
router.get('/:id', authMiddleware, getOrderById);

// Update an order (admin only)
router.put('/:id', authMiddleware, adminMiddleware, updateOrder);

// Delete an order (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, deleteOrder);

module.exports = router;
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
