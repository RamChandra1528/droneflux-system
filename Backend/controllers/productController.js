const Product = require('../models/Product');
const Cart = require('../models/Cart');

// Get all products with filtering and pagination
exports.getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      subcategory,
      brand,
      minPrice,
      maxPrice,
      inStock,
      sortBy = 'relevance',
      search
    } = req.query;
    
    const options = {
      limit: parseInt(limit),
      page: parseInt(page),
      sortBy,
      category,
      subcategory,
      brand,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      inStock: inStock === 'true'
    };
    
    let products;
    let total;
    
    if (search) {
      // Use text search
      products = await Product.search(search, options);
      total = await Product.countDocuments({ 
        $text: { $search: search },
        status: 'active'
      });
    } else {
      // Use regular filtering
      let query = { status: 'active' };
      
      if (category) query.category = category;
      if (subcategory) query.subcategory = subcategory;
      if (brand) query.brand = brand;
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice);
      }
      if (inStock === 'true') {
        query['stock.quantity'] = { $gt: 0 };
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
          sort = { createdAt: -1 };
      }
      
      total = await Product.countDocuments(query);
      products = await Product.find(query)
        .sort(sort)
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .populate('ratings.reviews.userId', 'name avatar');
    }
    
    const totalPages = Math.ceil(total / parseInt(limit));
    
    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        totalPages,
        totalDocs: total,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get product by ID with full details
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('ratings.reviews.userId', 'name avatar')
      .populate('category');
    
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    
    // Increment view count (you might want to track this separately)
    // product.views = (product.views || 0) + 1;
    // await product.save();
    
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create new product
exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20, sortBy = 'popular' } = req.query;
    
    const products = await Product.getByCategory(category, parseInt(limit));
    
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Search products
exports.searchProducts = async (req, res) => {
  try {
    const { q, ...options } = req.query;
    
    if (!q) {
      return res.status(400).json({ success: false, error: 'Search query is required' });
    }
    
    const products = await Product.search(q, options);
    
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get product categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get product brands
exports.getBrands = async (req, res) => {
  try {
    const brands = await Product.aggregate([
      { $match: { status: 'active', brand: { $exists: true, $ne: '' } } },
      { $group: { _id: '$brand', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({ success: true, data: brands });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add product review
exports.addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review, images } = req.body;
    const userId = req.user.id; // Assuming user is authenticated
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    
    // Check if user already reviewed this product
    const existingReview = product.ratings.reviews.find(
      r => r.userId.toString() === userId
    );
    
    if (existingReview) {
      return res.status(400).json({ 
        success: false, 
        error: 'You have already reviewed this product' 
      });
    }
    
    await product.addReview(userId, rating, review, images);
    
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get related products
exports.getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 8 } = req.query;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    
    const relatedProducts = await Product.find({
      _id: { $ne: id },
      status: 'active',
      $or: [
        { category: product.category },
        { brand: product.brand },
        { tags: { $in: product.tags } }
      ]
    })
    .limit(parseInt(limit))
    .sort({ 'sales.totalSold': -1, 'ratings.average': -1 });
    
    res.json({ success: true, data: relatedProducts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get featured products
exports.getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 12 } = req.query;
    
    const featuredProducts = await Product.find({
      status: 'active',
      'stock.quantity': { $gt: 0 }
    })
    .sort({ 'sales.totalSold': -1, 'ratings.average': -1 })
    .limit(parseInt(limit));
    
    res.json({ success: true, data: featuredProducts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get new arrivals
exports.getNewArrivals = async (req, res) => {
  try {
    const { limit = 12 } = req.query;
    
    const newArrivals = await Product.find({
      status: 'active',
      'stock.quantity': { $gt: 0 }
    })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));
    
    res.json({ success: true, data: newArrivals });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get products on sale
exports.getProductsOnSale = async (req, res) => {
  try {
    const { limit = 12 } = req.query;
    
    const saleProducts = await Product.find({
      status: 'active',
      'stock.quantity': { $gt: 0 },
      comparePrice: { $exists: true, $gt: 0 }
    })
    .sort({ 'comparePrice': -1 })
    .limit(parseInt(limit));
    
    res.json({ success: true, data: saleProducts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
