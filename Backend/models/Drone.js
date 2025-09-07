const mongoose = require('mongoose');

const droneSchema = new mongoose.Schema({
  droneId: { type: String, required: true, unique: true },
  model: { type: String, required: true },
  status: {
    type: String,
    enum: ['available', 'in_flight', 'maintenance', 'charging', 'offline', 'emergency_assigned', 'emergency_standby', 'low_battery', 'critical_battery'],
    default: 'available'
  },
  batteryLevel: { type: Number, min: 0, max: 100, default: 100 },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  maxPayload: { type: Number, required: true }, // in kg
  maxRange: { type: Number, required: true }, // in km
  assignedOperator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastMaintenance: { type: Date, default: Date.now },
  flightHours: { type: Number, default: 0 },
  emergencyCapable: { type: Boolean, default: true },
  emergencyAssignment: {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    assignedAt: Date,
    priority: { type: String, enum: ['normal', 'high', 'emergency'] }
  },
  batteryThresholds: {
    emergency: { type: Number, default: 30 }, // Minimum battery for emergency missions
    critical: { type: Number, default: 15 }, // Critical battery level
    return: { type: Number, default: 25 } // Battery level to return to base
  },
  performance: {
    averageSpeed: { type: Number, default: 0 },
    reliability: { type: Number, default: 100 }, // Percentage
    lastFailure: Date,
    maintenanceScore: { type: Number, default: 100 }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

droneSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Drone', droneSchema);