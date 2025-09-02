const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: String,
  brand: String,
  sku: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  comparePrice: Number,
  cost: Number,
  images: [{
    url: String,
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  variants: [{
    name: String,
    options: [String],
    price: Number
  }],
  attributes: [{
    name: String,
    value: String
  }],
  specifications: [{
    name: String,
    value: String
  }],
  weight: { type: Number, required: true }, // in kg
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  stock: {
    quantity: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    trackInventory: { type: Boolean, default: true }
  },
  shipping: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    requiresSpecialHandling: { type: Boolean, default: false },
    specialInstructions: String
  },
  tags: [String],
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft', 'archived'],
    default: 'active'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'password_protected'],
    default: 'public'
  },
  seo: {
    title: String,
    description: String,
    keywords: [String],
    canonicalUrl: String
  },
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
    reviews: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: { type: Number, required: true, min: 1, max: 5 },
      review: String,
      images: [String],
      helpful: { type: Number, default: 0 },
      createdAt: { type: Date, default: Date.now }
    }]
  },
  sales: {
    totalSold: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    lastSold: Date
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for better performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'stock.quantity': 1 });

// Pre-save middleware
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Set primary image if none exists
  if (this.images.length > 0 && !this.images.some(img => img.isPrimary)) {
    this.images[0].isPrimary = true;
  }
  
  next();
});

// Virtual for in-stock status
productSchema.virtual('inStock').get(function() {
  return this.stock.quantity > 0;
});

// Virtual for low stock status
productSchema.virtual('lowStock').get(function() {
  return this.stock.quantity <= this.stock.lowStockThreshold && this.stock.quantity > 0;
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.comparePrice && this.comparePrice > this.price) {
    return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
  }
  return 0;
});

// Method to update stock
productSchema.methods.updateStock = function(quantity, operation = 'decrease') {
  if (operation === 'decrease') {
    this.stock.quantity = Math.max(0, this.stock.quantity - quantity);
  } else if (operation === 'increase') {
    this.stock.quantity += quantity;
  }
  
  // Update last sold date
  if (operation === 'decrease' && quantity > 0) {
    this.lastSold = new Date();
    this.sales.totalSold += quantity;
    this.sales.revenue += this.price * quantity;
  }
  
  return this.save();
};

// Method to add review
productSchema.methods.addReview = function(userId, rating, review, images = []) {
  this.ratings.reviews.push({
    userId,
    rating,
    review,
    images
  });
  
  // Recalculate average rating
  const totalRating = this.ratings.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.ratings.average = totalRating / this.ratings.reviews.length;
  this.ratings.count = this.ratings.reviews.length;
  
  return this.save();
};

// Static method to get products by category
productSchema.statics.getByCategory = function(category, limit = 20) {
  return this.find({ 
    category, 
    status: 'active',
    'stock.quantity': { $gt: 0 }
  })
  .limit(limit)
  .sort({ 'sales.totalSold': -1, createdAt: -1 });
};

// Static method to search products
productSchema.statics.search = function(query, options = {}) {
  const {
    category,
    minPrice,
    maxPrice,
    inStock,
    sortBy = 'relevance',
    limit = 20,
    page = 1
  } = options;
  
  let searchQuery = { status: 'active' };
  
  // Text search
  if (query) {
    searchQuery.$text = { $search: query };
  }
  
  // Category filter
  if (category) {
    searchQuery.category = category;
  }
  
  // Price filter
  if (minPrice || maxPrice) {
    searchQuery.price = {};
    if (minPrice) searchQuery.price.$gte = minPrice;
    if (maxPrice) searchQuery.price.$lte = maxPrice;
  }
  
  // Stock filter
  if (inStock) {
    searchQuery['stock.quantity'] = { $gt: 0 };
  }
  
  // Sorting
  let sort = {};
  switch (sortBy) {
    case 'price_low':
      sort = { price: 1 };
      break;
    case 'price_high':
      sort = { price: -1 };
      break;
    case 'newest':
      sort = { createdAt: -1 };
      break;
    case 'popular':
      sort = { 'sales.totalSold': -1 };
      break;
    case 'rating':
      sort = { 'ratings.average': -1 };
      break;
    default:
      if (query) {
        sort = { score: { $meta: 'textScore' } };
      } else {
        sort = { createdAt: -1 };
      }
  }
  
  return this.find(searchQuery)
    .sort(sort)
    .limit(limit)
    .skip((page - 1) * limit)
    .populate('ratings.reviews.userId', 'name avatar');
};

module.exports = mongoose.model('Product', productSchema);
