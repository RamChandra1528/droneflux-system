const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  productName: { type: String, required: true },
  customerName: { type: String, required: true },
  customerAddress: { type: String, required: true },
  customerContact: { type: String, required: true },
  orderStatus: {
    type: String,
    enum: ['pending', 'approved', 'in-transit', 'delivered', 'cancelled'],
    default: 'pending',
  },
  assignedDrone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drone',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Order', orderSchema);