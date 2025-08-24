const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user is authenticated
    
    let cart = await Cart.getByUser(userId);
    
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
      await cart.save();
    }
    
    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity, options } = req.body;
    
    // Validate product exists and has stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    
    if (product.stock.quantity < quantity) {
      return res.status(400).json({ 
        success: false, 
        error: 'Insufficient stock' 
      });
    }
    
    // Get or create cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }
    
    // Add item to cart
    await cart.addItem(productId, quantity, options || {}, product.price);
    
    // Populate product details
    await cart.populate('items.product', 'name price images stock');
    
    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;
    
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ success: false, error: 'Cart not found' });
    }
    
    // Validate quantity
    if (quantity < 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Quantity cannot be negative' 
      });
    }
    
    // Check stock if increasing quantity
    const item = cart.items.id(itemId);
    if (item && quantity > item.quantity) {
      const product = await Product.findById(item.product);
      if (product.stock.quantity < quantity) {
        return res.status(400).json({ 
          success: false, 
          error: 'Insufficient stock' 
        });
      }
    }
    
    await cart.updateItemQuantity(itemId, quantity);
    
    // Populate product details
    await cart.populate('items.product', 'name price images stock');
    
    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ success: false, error: 'Cart not found' });
    }
    
    await cart.removeItem(itemId);
    
    // Populate product details
    await cart.populate('items.product', 'name price images stock');
    
    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ success: false, error: 'Cart not found' });
    }
    
    await cart.clearCart();
    
    res.json({ success: true, message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Apply coupon to cart
exports.applyCoupon = async (req, res) => {
  try {
    const userId = req.user.id;
    const { code, discount, type } = req.body;
    
    // In a real application, you would validate the coupon code
    // against a coupons collection and get the discount details
    
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ success: false, error: 'Cart not found' });
    }
    
    await cart.applyCoupon(code, discount, type);
    
    // Populate product details
    await cart.populate('items.product', 'name price images stock');
    
    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Remove coupon from cart
exports.removeCoupon = async (req, res) => {
  try {
    const userId = req.user.id;
    const { code } = req.params;
    
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ success: false, error: 'Cart not found' });
    }
    
    await cart.removeCoupon(code);
    
    // Populate product details
    await cart.populate('items.product', 'name price images stock');
    
    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update shipping address
exports.updateShippingAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const shippingAddress = req.body;
    
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ success: false, error: 'Cart not found' });
    }
    
    await cart.updateShippingAddress(shippingAddress);
    
    // Populate product details
    await cart.populate('items.product', 'name price images stock');
    
    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update shipping method
exports.updateShippingMethod = async (req, res) => {
  try {
    const userId = req.user.id;
    const { method } = req.body;
    
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ success: false, error: 'Cart not found' });
    }
    
    await cart.updateShippingMethod(method);
    
    // Populate product details
    await cart.populate('items.product', 'name price images stock');
    
    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get cart summary
exports.getCartSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.json({ 
        success: true, 
        data: {
          totalItems: 0,
          subtotal: 0,
          totalDiscount: 0,
          shippingCost: 0,
          total: 0,
          shippingMethod: 'standard',
          appliedCoupons: 0
        }
      });
    }
    
    const summary = cart.getSummary();
    
    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Merge guest cart with user cart
exports.mergeGuestCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { guestCartItems } = req.body;
    
    if (!guestCartItems || !Array.isArray(guestCartItems)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Guest cart items are required' 
      });
    }
    
    const cart = await Cart.mergeCarts(userId, guestCartItems);
    
    // Populate product details
    await cart.populate('items.product', 'name price images stock');
    
    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Validate cart items (check stock, prices, etc.)
exports.validateCart = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ success: false, error: 'Cart not found' });
    }
    
    const validationResults = [];
    
    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        validationResults.push({
          itemId: item._id,
          productId: item.product,
          valid: false,
          error: 'Product not found'
        });
        continue;
      }
      
      // Check stock
      if (product.stock.quantity < item.quantity) {
        validationResults.push({
          itemId: item._id,
          productId: item.product,
          valid: false,
          error: 'Insufficient stock',
          available: product.stock.quantity,
          requested: item.quantity
        });
        continue;
      }
      
      // Check price
      if (product.price !== item.price) {
        validationResults.push({
          itemId: item._id,
          productId: item.product,
          valid: false,
          error: 'Price has changed',
          oldPrice: item.price,
          newPrice: product.price
        });
        continue;
      }
      
      validationResults.push({
        itemId: item._id,
        productId: item.product,
        valid: true
      });
    }
    
    const hasErrors = validationResults.some(result => !result.valid);
    
    res.json({
      success: true,
      data: {
        valid: !hasErrors,
        results: validationResults,
        cart: hasErrors ? null : cart
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
