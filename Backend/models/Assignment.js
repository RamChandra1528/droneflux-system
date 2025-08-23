const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  assignmentId: { type: String, required: true, unique: true },
  operator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  drone: { type: mongoose.Schema.Types.ObjectId, ref: 'Drone', required: true },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  scheduledDate: { type: Date, required: true },
  startTime: Date,
  endTime: Date,
  route: [{
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    sequence: Number,
    estimatedTime: Date,
    actualTime: Date,
    location: {
      latitude: Number,
      longitude: Number
    }
  }],
  totalDistance: Number, // in km
  estimatedDuration: Number, // in minutes
  actualDuration: Number, // in minutes
  notes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

assignmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate unique assignment ID
assignmentSchema.pre('save', async function(next) {
  if (!this.assignmentId) {
    const count = await mongoose.model('Assignment').countDocuments();
    this.assignmentId = `ASG${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Assignment', assignmentSchema);
