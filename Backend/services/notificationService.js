const User = require('../models/User');
const Order = require('../models/Order');

class NotificationService {
  constructor(io) {
    this.io = io;
    this.notificationQueue = [];
    this.processingQueue = false;
  }

  // Send emergency notification to ground staff
  async notifyGroundStaff(emergencyData) {
    const { orderId, type, severity, message, droneId, location } = emergencyData;

    try {
      // Get all ground staff and admins
      const groundStaff = await User.find({
        role: { $in: ['admin', 'staff', 'operator'] },
        isActive: true
      }).select('name email phone role notificationPreferences');

      const notifications = [];

      for (const staff of groundStaff) {
        const notification = {
          id: this.generateNotificationId(),
          recipientId: staff._id,
          recipientName: staff.name,
          recipientRole: staff.role,
          type: 'emergency_alert',
          severity,
          title: this.getNotificationTitle(type, severity),
          message,
          data: {
            orderId,
            droneId,
            location,
            emergencyType: type,
            timestamp: new Date()
          },
          channels: this.determineNotificationChannels(staff, severity),
          status: 'pending',
          createdAt: new Date()
        };

        notifications.push(notification);
        
        // Add to queue for processing
        this.notificationQueue.push(notification);
      }

      // Process notification queue
      this.processNotificationQueue();

      // Emit real-time notification to connected staff
      this.io.emit('emergency-staff-notification', {
        type,
        severity,
        message,
        orderId,
        droneId,
        location,
        timestamp: new Date(),
        requiresAcknowledgment: severity === 'critical'
      });

      return { success: true, notificationsSent: notifications.length };
    } catch (error) {
      console.error('Error notifying ground staff:', error);
      throw error;
    }
  }

  // Send customer emergency notifications
  async notifyCustomer(orderId, notificationType, customMessage = null) {
    try {
      const order = await Order.findById(orderId).populate('customerId');
      if (!order) {
        throw new Error('Order not found');
      }

      const customer = order.customerId;
      const message = customMessage || this.getCustomerMessage(notificationType, order);

      const notification = {
        id: this.generateNotificationId(),
        recipientId: customer._id,
        recipientName: customer.name,
        type: 'emergency_customer_update',
        title: 'Emergency Delivery Update',
        message,
        data: {
          orderId: order._id,
          orderNumber: order.orderId,
          notificationType,
          timestamp: new Date()
        },
        channels: ['app', 'email'], // Always notify customers via app and email
        status: 'pending',
        createdAt: new Date()
      };

      // Add to processing queue
      this.notificationQueue.push(notification);
      this.processNotificationQueue();

      // Emit real-time notification to customer
      this.io.to(`customer-${customer._id}`).emit('emergency-customer-notification', {
        orderId: order._id,
        message,
        type: notificationType,
        timestamp: new Date()
      });

      // Add to order tracking history
      order.trackingHistory.push({
        status: 'customer_notified',
        notes: `Customer notified: ${notificationType}`,
        timestamp: new Date()
      });
      await order.save();

      return { success: true, notification };
    } catch (error) {
      console.error('Error notifying customer:', error);
      throw error;
    }
  }

  // Process notification queue
  async processNotificationQueue() {
    if (this.processingQueue || this.notificationQueue.length === 0) {
      return;
    }

    this.processingQueue = true;

    while (this.notificationQueue.length > 0) {
      const notification = this.notificationQueue.shift();
      
      try {
        await this.sendNotification(notification);
        notification.status = 'sent';
        notification.sentAt = new Date();
      } catch (error) {
        console.error('Error sending notification:', error);
        notification.status = 'failed';
        notification.error = error.message;
        
        // Retry critical notifications
        if (notification.severity === 'critical' && !notification.retryCount) {
          notification.retryCount = 1;
          this.notificationQueue.push(notification);
        }
      }
    }

    this.processingQueue = false;
  }

  // Send individual notification through various channels
  async sendNotification(notification) {
    const { channels, recipientId, title, message, data } = notification;

    for (const channel of channels) {
      switch (channel) {
        case 'app':
          await this.sendAppNotification(recipientId, title, message, data);
          break;
        case 'email':
          await this.sendEmailNotification(recipientId, title, message, data);
          break;
        case 'sms':
          await this.sendSMSNotification(recipientId, message, data);
          break;
        case 'push':
          await this.sendPushNotification(recipientId, title, message, data);
          break;
      }
    }
  }

  // Send in-app notification
  async sendAppNotification(recipientId, title, message, data) {
    this.io.to(`user-${recipientId}`).emit('app-notification', {
      title,
      message,
      data,
      timestamp: new Date()
    });
  }

  // Send email notification (placeholder - integrate with email service)
  async sendEmailNotification(recipientId, title, message, data) {
    const user = await User.findById(recipientId);
    if (!user || !user.email) return;

    // In production, integrate with email service like SendGrid, AWS SES, etc.
    console.log(`EMAIL to ${user.email}: ${title} - ${message}`);
    
    // Simulate email sending
    return new Promise(resolve => setTimeout(resolve, 100));
  }

  // Send SMS notification (placeholder - integrate with SMS service)
  async sendSMSNotification(recipientId, message, data) {
    const user = await User.findById(recipientId);
    if (!user || !user.phone) return;

    // In production, integrate with SMS service like Twilio, AWS SNS, etc.
    console.log(`SMS to ${user.phone}: ${message}`);
    
    // Simulate SMS sending
    return new Promise(resolve => setTimeout(resolve, 100));
  }

  // Send push notification (placeholder - integrate with push service)
  async sendPushNotification(recipientId, title, message, data) {
    // In production, integrate with push notification service like Firebase, OneSignal, etc.
    console.log(`PUSH to user ${recipientId}: ${title} - ${message}`);
    
    // Simulate push notification
    return new Promise(resolve => setTimeout(resolve, 100));
  }

  // Determine notification channels based on user preferences and severity
  determineNotificationChannels(user, severity) {
    const channels = ['app']; // Always send in-app notifications

    // Add email for medium and high severity
    if (severity === 'medium' || severity === 'high' || severity === 'critical') {
      channels.push('email');
    }

    // Add SMS for critical notifications
    if (severity === 'critical') {
      channels.push('sms');
    }

    // Check user preferences
    if (user.notificationPreferences) {
      if (user.notificationPreferences.email === false) {
        const emailIndex = channels.indexOf('email');
        if (emailIndex > -1) channels.splice(emailIndex, 1);
      }
      
      if (user.notificationPreferences.sms === false && severity !== 'critical') {
        const smsIndex = channels.indexOf('sms');
        if (smsIndex > -1) channels.splice(smsIndex, 1);
      }
    }

    return channels;
  }

  // Generate notification titles based on type and severity
  getNotificationTitle(type, severity) {
    const titles = {
      critical_battery: {
        critical: '🚨 CRITICAL: Drone Battery Emergency',
        high: '⚠️ HIGH: Drone Battery Low',
        medium: '⚡ Drone Battery Warning'
      },
      communication_lost: {
        critical: '🚨 CRITICAL: Drone Communication Lost',
        high: '📡 Drone Signal Lost',
        medium: '📶 Drone Connection Issue'
      },
      delivery_delayed: {
        high: '⏰ Emergency Delivery Delayed',
        medium: '🕐 Delivery Running Late'
      },
      drone_malfunction: {
        critical: '🚨 CRITICAL: Drone System Failure',
        high: '🔧 Drone Malfunction Detected'
      },
      weather_emergency: {
        high: '🌪️ Weather Emergency - Drone Affected',
        medium: '🌦️ Weather Alert - Route Adjustment'
      },
      no_backup_drone: {
        critical: '🚨 CRITICAL: No Backup Drone Available',
        high: '🚁 Limited Drone Availability'
      }
    };

    return titles[type]?.[severity] || `${severity.toUpperCase()}: Emergency Alert`;
  }

  // Generate customer messages
  getCustomerMessage(notificationType, order) {
    const messages = {
      emergency_assigned: `Your order ${order.orderId} has been marked as emergency priority and assigned to our fastest available drone. You'll receive live tracking updates.`,
      drone_changed: `Due to technical requirements, your emergency order ${order.orderId} has been assigned to a different drone. Delivery time remains unchanged.`,
      route_optimized: `We've optimized the delivery route for your emergency order ${order.orderId} to ensure the fastest and safest delivery.`,
      delayed: `Your emergency order ${order.orderId} is experiencing a slight delay due to unforeseen circumstances. Our team is working to minimize any impact.`,
      delivered: `Great news! Your emergency order ${order.orderId} has been successfully delivered. Thank you for choosing our emergency delivery service.`,
      failed: `We apologize, but there was an issue with your emergency order ${order.orderId}. Our customer service team will contact you shortly to resolve this.`
    };

    return messages[notificationType] || `Update regarding your emergency order ${order.orderId}.`;
  }

  // Generate unique notification ID
  generateNotificationId() {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Send escalation notifications for unacknowledged critical alerts
  async escalateUnacknowledgedAlert(alertId, originalRecipients) {
    try {
      // Get senior staff and managers
      const seniorStaff = await User.find({
        role: { $in: ['admin'] },
        isActive: true
      }).select('name email phone');

      const escalationMessage = `ESCALATION: Critical emergency alert ${alertId} has not been acknowledged by ground staff. Immediate attention required.`;

      for (const staff of seniorStaff) {
        await this.sendNotification({
          recipientId: staff._id,
          title: '🚨 ESCALATED EMERGENCY ALERT',
          message: escalationMessage,
          channels: ['app', 'email', 'sms'],
          severity: 'critical',
          data: { alertId, escalated: true }
        });
      }

      // Emit escalation event
      this.io.emit('emergency-escalation', {
        alertId,
        escalatedTo: seniorStaff.map(s => s.name),
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Error escalating alert:', error);
    }
  }

  // Get notification statistics
  getNotificationStats() {
    return {
      queueLength: this.notificationQueue.length,
      processing: this.processingQueue,
      totalSent: this.totalNotificationsSent || 0,
      totalFailed: this.totalNotificationsFailed || 0
    };
  }

  // Clean up notification service
  cleanup() {
    this.notificationQueue = [];
    this.processingQueue = false;
  }
}

module.exports = NotificationService;
