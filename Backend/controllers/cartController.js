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

// Proceed to checkout
exports.proceedToCheckout = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shippingAddress, paymentMethod, notes } = req.body;
    
    // Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cart is empty' 
      });
    }
    
    // Validate cart items and stock
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (!product) {
        return res.status(400).json({ 
          success: false, 
          error: `Product ${item.product.name} no longer exists` 
        });
      }
      
      if (product.stock.quantity < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          error: `Insufficient stock for ${product.name}` 
        });
      }
    }
    
    // Calculate total price manually
    const subtotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Create order from cart
    const Order = require('../models/Order');
    
    const orderData = {
      customerId: userId,
      customerName: req.user.name || 'Customer',
      status: 'pending',
      items: cart.items.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        weight: item.product.weight || 1 // Default weight if not specified
      })),
      totalWeight: cart.items.reduce((total, item) => total + ((item.product.weight || 1) * item.quantity), 0),
      price: subtotal,
      paymentStatus: 'pending',
      paymentMethod: paymentMethod || 'card',
      pickupLocation: {
        address: 'Warehouse - 123 Main St, City, State 12345',
        lat: 40.7128,
        lng: -74.0060
      },
      deliveryLocation: {
        address: shippingAddress?.address || 'Customer Address',
        lat: shippingAddress?.coordinates?.latitude || 40.7589,
        lng: shippingAddress?.coordinates?.longitude || -73.9851
      },
      estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    };
    
    console.log('Creating order with data:', JSON.stringify(orderData, null, 2));
    
    const order = new Order(orderData);
    console.log('Order created, attempting to save...');
    
    const savedOrder = await order.save();
    console.log('Order saved successfully:', savedOrder._id);
    
    // Update product stock
    for (const item of cart.items) {
      console.log(`Updating stock for product ${item.product._id}`);
      await Product.findByIdAndUpdate(
        item.product._id,
        { $inc: { 'stock.quantity': -item.quantity, 'sales.totalSold': item.quantity } }
      );
    }
    
    // Clear cart after successful order creation
    console.log('Clearing cart...');
    cart.items = [];
    await cart.save();
    console.log('Cart cleared successfully');
    
    res.json({ 
      success: true, 
      data: { 
        order: savedOrder,
        orderId: savedOrder.orderId,
        message: `Order placed successfully! Order ID: ${savedOrder.orderId}` 
      }
    });
  } catch (error) {
    console.error('Error in proceedToCheckout:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, error: error.message });
  }
};
