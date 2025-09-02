const Order = require('../models/Order');
const Drone = require('../models/Drone');
const Assignment = require('../models/Assignment');
const User = require('../models/User');

// Get dashboard analytics
exports.getDashboardAnalytics = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Order statistics
    const totalOrders = await Order.countDocuments();
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const inTransitOrders = await Order.countDocuments({ status: 'in_transit' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

    // Revenue calculation
    const revenueResult = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, totalRevenue: { $sum: '$deliveryFee' } } }
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    const todayRevenueResult = await Order.aggregate([
      { 
        $match: { 
          status: 'delivered',
          actualDeliveryTime: { $gte: today, $lt: tomorrow }
        } 
      },
      { $group: { _id: null, todayRevenue: { $sum: '$deliveryFee' } } }
    ]);
    const todayRevenue = todayRevenueResult[0]?.todayRevenue || 0;

    // Drone statistics
    const totalDrones = await Drone.countDocuments();
    const availableDrones = await Drone.countDocuments({ status: 'available' });
    const inFlightDrones = await Drone.countDocuments({ status: 'in_flight' });
    const chargingDrones = await Drone.countDocuments({ status: 'charging' });
    const maintenanceDrones = await Drone.countDocuments({ status: 'maintenance' });

    // User statistics
    const totalUsers = await User.countDocuments();
    const customers = await User.countDocuments({ role: 'customer' });
    const operators = await User.countDocuments({ role: 'operator' });
    const staff = await User.countDocuments({ role: 'staff' });

    // Performance metrics
    const deliveredOrdersWithTime = await Order.find({
      status: 'delivered',
      actualDeliveryTime: { $exists: true },
      estimatedDeliveryTime: { $exists: true }
    });

    let onTimeDeliveries = 0;
    let totalDeliveryTime = 0;
    
    deliveredOrdersWithTime.forEach(order => {
      const estimated = new Date(order.estimatedDeliveryTime);
      const actual = new Date(order.actualDeliveryTime);
      const created = new Date(order.createdAt);
      
      if (actual <= estimated) onTimeDeliveries++;
      totalDeliveryTime += (actual - created) / (1000 * 60); // in minutes
    });

    const onTimeDeliveryRate = deliveredOrdersWithTime.length > 0 
      ? (onTimeDeliveries / deliveredOrdersWithTime.length) * 100 
      : 0;
    
    const avgDeliveryTime = deliveredOrdersWithTime.length > 0 
      ? totalDeliveryTime / deliveredOrdersWithTime.length 
      : 0;

    res.json({
      success: true,
      data: {
        orders: {
          total: totalOrders,
          today: todayOrders,
          pending: pendingOrders,
          inTransit: inTransitOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders
        },
        revenue: {
          total: totalRevenue,
          today: todayRevenue
        },
        drones: {
          total: totalDrones,
          available: availableDrones,
          inFlight: inFlightDrones,
          charging: chargingDrones,
          maintenance: maintenanceDrones
        },
        users: {
          total: totalUsers,
          customers,
          operators,
          staff
        },
        performance: {
          onTimeDeliveryRate: Math.round(onTimeDeliveryRate),
          avgDeliveryTime: Math.round(avgDeliveryTime),
          customerSatisfaction: 4.7, // This would come from a ratings system
          failedDeliveries: Math.round((cancelledOrders / totalOrders) * 100) || 0
        }
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get weekly order trends
exports.getWeeklyOrderTrends = async (req, res) => {
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyData = await Order.aggregate([
      { $match: { createdAt: { $gte: weekAgo } } },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          orders: { $sum: 1 },
          revenue: { $sum: '$deliveryFee' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = daysOfWeek.map((day, index) => {
      const dayData = weeklyData.find(d => d._id === index + 1);
      return {
        name: day,
        orders: dayData?.orders || 0,
        revenue: dayData?.revenue || 0
      };
    });

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get monthly revenue trends
exports.getMonthlyRevenueTrends = async (req, res) => {
  try {
    const yearAgo = new Date();
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);

    const monthlyData = await Order.aggregate([
      { 
        $match: { 
          status: 'delivered',
          actualDeliveryTime: { $gte: yearAgo }
        } 
      },
      {
        $group: {
          _id: { 
            year: { $year: '$actualDeliveryTime' },
            month: { $month: '$actualDeliveryTime' }
          },
          revenue: { $sum: '$deliveryFee' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const result = months.map((month, index) => {
      const monthData = monthlyData.find(d => d._id.month === index + 1);
      return {
        name: month,
        revenue: monthData?.revenue || 0
      };
    });

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get drone utilization
exports.getDroneUtilization = async (req, res) => {
  try {
    const drones = await Drone.find().select('droneId model status flightHours batteryLevel');
    
    const utilization = drones.map(drone => ({
      id: drone._id,
      droneId: drone.droneId,
      model: drone.model,
      status: drone.status,
      flightHours: drone.flightHours,
      batteryLevel: drone.batteryLevel,
      utilizationRate: Math.min((drone.flightHours / 200) * 100, 100) // Assuming 200 hours is max
    }));

    res.json({ success: true, data: utilization });
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

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get drone performance metrics
exports.getDronePerformance = async (req, res) => {
  try {
    const drones = await Drone.find().select('droneId model status flightHours batteryLevel lastMaintenance');
    
    const performance = drones.map(drone => ({
      id: drone._id,
      droneId: drone.droneId,
      model: drone.model,
      status: drone.status,
      flightHours: drone.flightHours,
      batteryLevel: drone.batteryLevel,
      lastMaintenance: drone.lastMaintenance,
      efficiency: Math.min((drone.flightHours / 200) * 100, 100)
    }));

    res.json({ success: true, data: performance });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
