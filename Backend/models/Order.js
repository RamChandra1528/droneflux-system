const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'processing', 'in-transit', 'delivered', 'cancelled'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },
  estimatedDelivery: { type: Date, required: true },
  actualDeliveryTime: Date,
  pickupLocation: {
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  deliveryLocation: {
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  items: [{
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    weight: { type: Number, required: true }
  }],
  totalWeight: { type: Number, required: true },
  droneId: { type: mongoose.Schema.Types.ObjectId, ref: 'Drone' },
  droneName: String,
  operatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  operatorName: String,
  deliveryStaffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deliveryStaffName: String,
  price: { type: Number, required: true },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentMethod: String,
  trackingHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    location: {
      lat: Number,
      lng: Number
    },
    notes: String
  }],
  updatedAt: { type: Date, default: Date.now }
});

orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate unique order ID for display purposes
orderSchema.pre('save', async function(next) {
  if (!this._id) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderId = `ORD${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
