const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');

// Mark order as emergency (Admin/Staff only)
router.post('/orders/:orderId/emergency', 
  authenticateToken, 
  requireRole(['admin', 'staff']), 
  emergencyController.markOrderAsEmergency
);

// Get all emergency orders
router.get('/orders', 
  authenticateToken, 
  requireRole(['admin', 'staff', 'operator']), 
  emergencyController.getEmergencyOrders
);

// Get emergency order tracking
router.get('/orders/:orderId/tracking', 
  authenticateToken, 
  emergencyController.getEmergencyOrderTracking
);

// Force emergency failover (Admin only)
router.post('/orders/:orderId/failover', 
  authenticateToken, 
  requireRole(['admin']), 
  emergencyController.forceEmergencyFailover
);

// Get emergency capable drones
router.get('/drones/available', 
  authenticateToken, 
  requireRole(['admin', 'staff', 'operator']), 
  emergencyController.getEmergencyCapableDrones
);

// Update emergency order status
router.patch('/orders/:orderId/status', 
  authenticateToken, 
  requireRole(['admin', 'staff', 'operator']), 
  emergencyController.updateEmergencyOrderStatus
);

// Get emergency dashboard statistics
router.get('/stats', 
  authenticateToken, 
  requireRole(['admin', 'staff']), 
  emergencyController.getEmergencyStats
);

module.exports = router;
