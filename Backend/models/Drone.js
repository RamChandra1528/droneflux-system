const mongoose = require('mongoose');

const droneSchema = new mongoose.Schema({
  droneId: { type: String, required: true, unique: true },
  model: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['available', 'in_flight', 'maintenance', 'charging', 'offline'], 
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
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

droneSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Drone', droneSchema);
