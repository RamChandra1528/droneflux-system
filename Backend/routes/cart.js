const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// All cart routes require authentication
router.use(authenticateToken);

// Cart management
router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.put('/items/:itemId', cartController.updateCartItem);
router.delete('/items/:itemId', cartController.removeFromCart);
router.delete('/clear', cartController.clearCart);

// Coupons
router.post('/coupons', cartController.applyCoupon);
router.delete('/coupons/:code', cartController.removeCoupon);

// Shipping
router.put('/shipping-address', cartController.updateShippingAddress);
router.put('/shipping-method', cartController.updateShippingMethod);

// Cart information
router.get('/summary', cartController.getCartSummary);
router.post('/merge', cartController.mergeGuestCart);
router.get('/validate', cartController.validateCart);

module.exports = router;
