import { Order } from '@/lib/data';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL ? `${import.meta.env.VITE_BACKEND_URL}/api` : 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('droneflux-token');
};

// API request helper
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication failed. Please log in again.');
    }
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// Public API request helper (no auth required)
const publicApiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// Order service functions
export const orderService = {
  // Get all orders (filtered by user role)
  async getOrders(params?: { status?: string; priority?: string; customer?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.customer) queryParams.append('customer', params.customer);
    
    const endpoint = `/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest(endpoint);
  },

  // Get order by ID
  async getOrderById(orderId: string) {
    return apiRequest(`/orders/${orderId}`);
  },

  // Create new order
  async createOrder(orderData: Partial<Order>) {
    return apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  // Update order
  async updateOrder(orderId: string, updateData: Partial<Order>) {
    return apiRequest(`/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: string, notes?: string) {
    return apiRequest(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  },

  // Assign drone to order
  async assignDrone(orderId: string, droneId: string, operatorId: string) {
    return apiRequest(`/orders/${orderId}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ droneId, operatorId }),
    });
  },

  // Get order tracking information
  async getOrderTracking(orderId: string) {
    return apiRequest(`/orders/${orderId}/tracking`);
  },

  // Get customer orders
  async getCustomerOrders() {
    return apiRequest('/orders/customer/orders');
  },

  // Cancel order
  async cancelOrder(orderId: string, reason?: string) {
    return apiRequest(`/orders/${orderId}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  },

  // Delete order (admin only)
  async deleteOrder(orderId: string) {
    return apiRequest(`/orders/${orderId}`, {
      method: 'DELETE',
    });
  },

  // Get order statistics
  async getOrderStats() {
    return apiRequest('/orders/stats/overview');
  },
};

// Cart service functions
export const cartService = {
  // Get user's cart
  async getCart() {
    return apiRequest('/cart');
  },

  // Add item to cart
  async addToCart(productId: string, quantity: number) {
    return apiRequest('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  },

  // Update cart item
  async updateCartItem(itemId: string, quantity: number) {
    return apiRequest(`/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },

  // Remove item from cart
  async removeFromCart(itemId: string) {
    return apiRequest(`/cart/items/${itemId}`, {
      method: 'DELETE',
    });
  },

  // Clear cart
  async clearCart() {
    return apiRequest('/cart/clear', {
      method: 'DELETE',
    });
  },

  // Apply coupon
  async applyCoupon(code: string) {
    return apiRequest('/cart/coupon', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },

  // Remove coupon
  async removeCoupon() {
    return apiRequest('/cart/coupon', {
      method: 'DELETE',
    });
  },

  // Update shipping details
  async updateShippingDetails(shippingDetails: any) {
    return apiRequest('/cart/shipping', {
      method: 'PUT',
      body: JSON.stringify(shippingDetails),
    });
  },

  // Get cart summary
  async getCartSummary() {
    return apiRequest('/cart/summary');
  },

  // Proceed to checkout
  async proceedToCheckout(checkoutData?: {
    shippingAddress?: any;
    paymentMethod?: string;
    notes?: string;
  }) {
    return apiRequest('/cart/checkout', {
      method: 'POST',
      body: JSON.stringify(checkoutData || {}),
    });
  },
};

// Product service functions
export const productService = {
  // Get all products
  async getProducts(params?: { 
    category?: string; 
    brand?: string; 
    minPrice?: number; 
    maxPrice?: number;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.brand) queryParams.append('brand', params.brand);
    if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString());
    if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const endpoint = `/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return publicApiRequest(endpoint);
  },

  // Get product by ID
  async getProductById(productId: string) {
    return publicApiRequest(`/products/${productId}`);
  },

  // Create product (admin only)
  async createProduct(productData: any) {
    return apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  // Update product (admin only)
  async updateProduct(productId: string, updateData: any) {
    return apiRequest(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  // Delete product (admin only)
  async deleteProduct(productId: string) {
    return apiRequest(`/products/${productId}`, {
      method: 'DELETE',
    });
  },

  // Get product categories
  async getCategories() {
    return publicApiRequest('/products/categories');
  },

  // Get product brands
  async getBrands() {
    return publicApiRequest('/products/brands');
  },

  // Add product review
  async addReview(productId: string, reviewData: any) {
    return apiRequest(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },
};
