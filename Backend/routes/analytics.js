const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');

// Get dashboard analytics
router.get('/dashboard', authenticateToken, analyticsController.getDashboardAnalytics);

// Get weekly order trends
router.get('/orders/weekly', authenticateToken, analyticsController.getWeeklyOrderTrends);

// Get monthly revenue trends
router.get('/revenue/monthly', authenticateToken, analyticsController.getMonthlyRevenueTrends);

// Get drone utilization
router.get('/drones/utilization', authenticateToken, requireRole(['admin', 'operator']), analyticsController.getDroneUtilization);

// Get order statistics
router.get('/orders/stats', authenticateToken, analyticsController.getOrderStats);

// Get drone performance metrics
router.get('/drones/performance', authenticateToken, requireRole(['admin', 'operator']), analyticsController.getDronePerformance);

module.exports = router;
