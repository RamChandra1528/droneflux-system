const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  selectedOptions: [{
    name: String,
    value: String
  }],
  price: {
    type: Number,
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [cartItemSchema],
  appliedCoupons: [{
    code: String,
    discount: Number,
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  }],
  shippingAddress: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    latitude: Number,
    longitude: Number
  },
  billingAddress: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  shippingMethod: {
    type: String,
    enum: ['standard', 'express', 'same_day', 'drone_delivery'],
    default: 'standard'
  },
  deliveryPreferences: {
    preferredTime: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'anytime'],
      default: 'anytime'
    },
    specialInstructions: String,
    contactPerson: String,
    contactPhone: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }
  }
});

// Indexes
cartSchema.index({ user: 1 });
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-save middleware
cartSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for total items count
cartSchema.virtual('totalItems').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Virtual for subtotal (before discounts and shipping)
cartSchema.virtual('subtotal').get(function() {
  return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
});

// Virtual for total discount
cartSchema.virtual('totalDiscount').get(function() {
  return this.appliedCoupons.reduce((sum, coupon) => {
    if (coupon.type === 'percentage') {
      return sum + (this.subtotal * coupon.discount / 100);
    } else {
      return sum + coupon.discount;
    }
  }, 0);
});

// Virtual for shipping cost
cartSchema.virtual('shippingCost').get(function() {
  const subtotal = this.subtotal;
  
  switch (this.shippingMethod) {
    case 'standard':
      return subtotal > 50 ? 0 : 5.99;
    case 'express':
      return 12.99;
    case 'same_day':
      return 24.99;
    case 'drone_delivery':
      return 19.99;
    default:
      return 0;
  }
});

// Virtual for total amount
cartSchema.virtual('total').get(function() {
  return this.subtotal - this.totalDiscount + this.shippingCost;
});

// Method to add item to cart
cartSchema.methods.addItem = function(productId, quantity, options = {}, price) {
  const existingItem = this.items.find(item => 
    item.product.toString() === productId.toString() &&
    JSON.stringify(item.selectedOptions.sort()) === JSON.stringify(options.sort())
  );
  
  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.updatedAt = new Date();
  } else {
    this.items.push({
      product: productId,
      quantity,
      selectedOptions: options,
      price,
      addedAt: new Date()
    });
  }
  
  return this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = function(itemId, quantity) {
  const item = this.items.id(itemId);
  if (item) {
    if (quantity <= 0) {
      this.items.pull(itemId);
    } else {
      item.quantity = quantity;
      item.updatedAt = new Date();
    }
    return this.save();
  }
  throw new Error('Item not found in cart');
};

// Method to remove item
cartSchema.methods.removeItem = function(itemId) {
  this.items.pull(itemId);
  return this.save();
};

// Method to clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  this.appliedCoupons = [];
  return this.save();
};

// Method to apply coupon
cartSchema.methods.applyCoupon = function(couponCode, discount, type) {
  // Remove existing coupon with same code
  this.appliedCoupons = this.appliedCoupons.filter(c => c.code !== couponCode);
  
  // Add new coupon
  this.appliedCoupons.push({
    code: couponCode,
    discount,
    type
  });
  
  return this.save();
};

// Method to remove coupon
cartSchema.methods.removeCoupon = function(couponCode) {
  this.appliedCoupons = this.appliedCoupons.filter(c => c.code !== couponCode);
  return this.save();
};

// Method to update shipping address
cartSchema.methods.updateShippingAddress = function(address) {
  this.shippingAddress = address;
  return this.save();
};

// Method to update shipping method
cartSchema.methods.updateShippingMethod = function(method) {
  this.shippingMethod = method;
  return this.save();
};

// Method to check if cart is empty
cartSchema.methods.isEmpty = function() {
  return this.items.length === 0;
};

// Method to get cart summary
cartSchema.methods.getSummary = function() {
  return {
    totalItems: this.totalItems,
    subtotal: this.subtotal,
    totalDiscount: this.totalDiscount,
    shippingCost: this.shippingCost,
    total: this.total,
    shippingMethod: this.shippingMethod,
    appliedCoupons: this.appliedCoupons.length
  };
};

// Static method to get cart by user
cartSchema.statics.getByUser = function(userId) {
  return this.findOne({ user: userId })
    .populate('items.product', 'name price images stock')
    .populate('user', 'name email');
};

// Static method to merge guest cart with user cart
cartSchema.statics.mergeCarts = async function(userId, guestCartItems) {
  let userCart = await this.findOne({ user: userId });
  
  if (!userCart) {
    userCart = new this({ user: userId });
  }
  
  // Merge guest cart items
  for (const guestItem of guestCartItems) {
    await userCart.addItem(
      guestItem.product,
      guestItem.quantity,
      guestItem.selectedOptions || {},
      guestItem.price
    );
  }
  
  return userCart;
};

module.exports = mongoose.model('Cart', cartSchema);
