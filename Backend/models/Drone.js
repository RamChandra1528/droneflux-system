const mongoose = require('mongoose');

const droneSchema = new mongoose.Schema({
  droneId: { type: String, required: true, unique: true },
  model: { type: String, required: true },
  status: {
    type: String,
    enum: ['idle', 'in-transit', 'charging', 'maintenance'],
    default: 'idle',
  },
  currentLocation: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  batteryLevel: { type: Number, required: true },
  healthStatus: {
    type: String,
    enum: ['good', 'warning', 'critical'],
    default: 'good',
  },
});

module.exports = mongoose.model('Drone', droneSchema);