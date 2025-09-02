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