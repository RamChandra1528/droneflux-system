import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, Filter, ShoppingCart, Heart, Star, StarHalf, 
  Package, Truck, Zap, Clock, MapPin, Plus, Minus
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { productService, cartService } from "@/services/orderService";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: Array<{ url: string; alt: string; isPrimary: boolean }>;
  category: string;
  brand: string;
  stock: { quantity: number; lowStockThreshold: number };
  ratings: { average: number; count: number };
  tags: string[];
  createdAt?: string; // Added for newest sort
}

interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
  price: number;
}

export default function Store() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState("relevance");
  const [showCart, setShowCart] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productService.getProducts();
        setProducts(response.data || []);
        setFilteredProducts(response.data || []);
        
        // Extract unique categories and brands
        const uniqueCategories = [...new Set(response.data?.map((p: any) => p.category).filter(Boolean) || [])] as string[];
        const uniqueBrands = [...new Set(response.data?.map((p: any) => p.brand).filter(Boolean) || [])] as string[];
        setCategories(uniqueCategories);
        setBrands(uniqueBrands);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        toast({
          title: "Error",
          description: "Failed to load products. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [toast]);

  // Fetch user's cart from API
  useEffect(() => {
    const fetchCart = async () => {
      if (!user || isLoading || !localStorage.getItem('droneflux-token')) return;
      
      try {
        const response = await cartService.getCart();
        if (response.data && response.data.items) {
          // Transform cart items to match our interface
          const cartItems: CartItem[] = response.data.items.map((item: any) => ({
            _id: item._id,
            product: item.product,
            quantity: item.quantity,
            price: item.price
          }));
          setCart(cartItems);
        }
      } catch (error) {
        console.error('Failed to fetch cart:', error);
        // Don't show error toast for cart fetch, just log it
      }
    };

    fetchCart();
  }, [user, isLoading]);

  // Filter products based on search, category, and price
  useEffect(() => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by price range
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.ratings.average - a.ratings.average);
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
        break;
      default:
        // relevance - keep original order
        break;
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, priceRange, sortBy]);

  const addToCart = async (product: Product) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to add items to your cart.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Add to backend cart
      await cartService.addToCart(product._id, 1);
      
      // Update local cart state
      const existingItem = cart.find(item => item.product._id === product._id);
      if (existingItem) {
        setCart(cart.map(item =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        setCart([...cart, { _id: Date.now().toString(), product, quantity: 1, price: product.price }]);
      }

      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateCartItemQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      // Remove item
      try {
        await cartService.removeFromCart(itemId);
        setCart(cart.filter(item => item._id !== itemId));
      } catch (error) {
        console.error('Failed to remove item:', error);
      }
    } else {
      // Update quantity
      try {
        await cartService.updateCartItem(itemId, quantity);
        setCart(cart.map(item =>
          item._id === itemId ? { ...item, quantity } : item
        ));
      } catch (error) {
        console.error('Failed to update quantity:', error);
      }
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      setCart([]);
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart.",
      });
    } catch (error) {
      console.error('Failed to clear cart:', error);
      toast({
        title: "Error",
        description: "Failed to clear cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleProceedToCheckout = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to proceed to checkout.",
        variant: "destructive",
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "Empty cart",
        description: "Add some items to your cart before checkout.",
        variant: "destructive",
      });
      return;
    }

    try {
      // For now, navigate to checkout page
      // In the future, this could call cartService.proceedToCheckout()
      window.location.href = '/checkout';
      
      toast({
        title: "Redirecting to checkout",
        description: "Taking you to the checkout page...",
      });
    } catch (error) {
      console.error('Failed to proceed to checkout:', error);
      toast({
        title: "Error",
        description: "Failed to proceed to checkout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
  };

  const renderProductCard = (product: Product) => (
    <Card key={product._id} className="group hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
          <img
            src={product.images.find(img => img.isPrimary)?.url || "/placeholder.svg"}
            alt={product.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
          />
          {product.comparePrice && product.comparePrice > product.price && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white">
              {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
            </Badge>
          )}
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => addToCart(product)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {product.category}
            </Badge>
            <div className="flex items-center space-x-1">
              {renderStars(product.ratings.average)}
              <span className="text-xs text-muted-foreground ml-1">
                ({product.ratings.count})
              </span>
            </div>
          </div>
          <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
          <CardDescription className="line-clamp-2">
            {product.description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.comparePrice.toFixed(2)}
              </span>
            )}
          </div>
          <Badge 
            variant={product.stock.quantity > product.stock.lowStockThreshold ? "default" : "destructive"}
            className="text-xs"
          >
            {product.stock.quantity > product.stock.lowStockThreshold ? "In Stock" : "Low Stock"}
          </Badge>
        </div>
        <Button 
          className="w-full" 
          onClick={() => addToCart(product)}
          disabled={product.stock.quantity === 0}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.stock.quantity === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Show loading spinner while authentication is being determined
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Store</h2>
            <p className="text-muted-foreground mt-1">
              Browse our products and add them to your cart for drone delivery
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCart(!showCart)}
              className="relative"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Cart
              {getCartItemCount() > 0 && (
                <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">
                  {getCartItemCount()}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category === "all" ? "All Categories" : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price Range</label>
                  <div className="px-2">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={1000}
                      min={0}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Sort */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "grid" | "list")}>
                  <TabsList>
                    <TabsTrigger value="grid">Grid View</TabsTrigger>
                    <TabsTrigger value="list">List View</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="text-sm text-muted-foreground">
                {filteredProducts.length} products found
              </div>
            </div>

            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => renderProductCard(product))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map(product => (
                  <Card key={product._id} className="group hover:shadow-lg transition-all duration-200">
                    <div className="flex space-x-4 p-6">
                      <div className="relative w-24 h-24 overflow-hidden rounded-lg bg-muted flex-shrink-0">
                        <img
                          src={product.images.find(img => img.isPrimary)?.url || "/placeholder.svg"}
                          alt={product.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{product.name}</h3>
                            <p className="text-muted-foreground text-sm line-clamp-2">
                              {product.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">${product.price.toFixed(2)}</div>
                            {product.comparePrice && product.comparePrice > product.price && (
                              <div className="text-sm text-muted-foreground line-through">
                                ${product.comparePrice.toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              {renderStars(product.ratings.average)}
                              <span className="text-sm text-muted-foreground ml-1">
                                ({product.ratings.count})
                              </span>
                            </div>
                            <Badge variant="outline">{product.category}</Badge>
                            <Badge 
                              variant={product.stock.quantity > product.stock.lowStockThreshold ? "default" : "destructive"}
                            >
                              {product.stock.quantity > product.stock.lowStockThreshold ? "In Stock" : "Low Stock"}
                            </Badge>
                          </div>
                          <Button onClick={() => addToCart(product)} disabled={product.stock.quantity === 0}>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No products found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or search terms.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Shopping Cart Sidebar */}
        {showCart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
            <div className="w-full max-w-md bg-background h-full overflow-y-auto">
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Shopping Cart</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowCart(false)}>
                    ×
                  </Button>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h4 className="text-lg font-medium mb-2">Your cart is empty</h4>
                    <p className="text-muted-foreground">
                      Add some products to get started.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {cart.map(item => (
                        <div key={item._id} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <div className="w-16 h-16 overflow-hidden rounded-lg bg-muted flex-shrink-0">
                            <img
                              src={item.product.images.find(img => img.isPrimary)?.url || "/placeholder.svg"}
                              alt={item.product.name}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{item.product.name}</h4>
                            <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateCartItemQuantity(item._id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateCartItemQuantity(item._id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4 space-y-4">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total:</span>
                        <span>${getCartTotal().toFixed(2)}</span>
                      </div>
                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={handleProceedToCheckout}
                        disabled={cart.length === 0}
                      >
                        <Truck className="h-4 w-4 mr-2" />
                        Proceed to Checkout
                      </Button>
                      <Button variant="outline" className="w-full" onClick={clearCart}>
                        Clear Cart
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
