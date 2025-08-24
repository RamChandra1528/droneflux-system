import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { 
  ShoppingCart, Truck, CreditCard, MapPin, Clock, Zap,
  Package, Shield, ArrowLeft, ArrowRight, CheckCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { cartService, orderService } from "@/services/orderService";

interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    images: Array<{ url: string; alt: string; isPrimary: boolean }>;
  };
  quantity: number;
  price: number;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

interface PaymentMethod {
  type: "credit_card" | "paypal" | "apple_pay" | "google_pay";
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardholderName?: string;
}

export default function Checkout() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    phone: ""
  });
  const [billingAddress, setBillingAddress] = useState<ShippingAddress>({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    phone: ""
  });
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({
    type: "credit_card"
  });
  const [deliveryPreferences, setDeliveryPreferences] = useState({
    preferredTime: "anytime",
    specialInstructions: "",
    contactPerson: "",
    contactPhone: ""
  });
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [loading, setLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(true);

  // Fetch cart from API
  useEffect(() => {
    const fetchCart = async () => {
      if (!user || isLoading || !localStorage.getItem('droneflux-token')) return;
      
      try {
        setCartLoading(true);
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
        toast({
          title: "Error",
          description: "Failed to load cart. Please try again.",
          variant: "destructive",
        });
      } finally {
        setCartLoading(false);
      }
    };

    fetchCart();
  }, [user, isLoading, toast]);

  const shippingMethods = [
    {
      id: "standard",
      name: "Standard Delivery",
      description: "3-5 business days",
      price: 0,
      icon: Package
    },
    {
      id: "express",
      name: "Express Delivery",
      description: "1-2 business days",
      price: 12.99,
      icon: Truck
    },
    {
      id: "same_day",
      name: "Same Day Delivery",
      description: "Within 24 hours",
      price: 24.99,
      icon: Zap
    },
    {
      id: "drone_delivery",
      name: "Drone Delivery",
      description: "Within 2 hours",
      price: 19.99,
      icon: Zap
    }
  ];

  const deliveryTimeSlots = [
    { id: "morning", label: "Morning (8 AM - 12 PM)", icon: Clock },
    { id: "afternoon", label: "Afternoon (12 PM - 4 PM)", icon: Clock },
    { id: "evening", label: "Evening (4 PM - 8 PM)", icon: Clock },
    { id: "anytime", label: "Anytime", icon: Clock }
  ];

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getShippingCost = () => {
    const method = shippingMethods.find(m => m.id === shippingMethod);
    return method ? method.price : 0;
  };

  const getTax = () => {
    return getSubtotal() * 0.08; // 8% tax
  };

  const getTotal = () => {
    return getSubtotal() + getShippingCost() + getTax();
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
    if (useSameAddress) {
      setBillingAddress(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleBillingAddressChange = (field: keyof ShippingAddress, value: string) => {
    setBillingAddress(prev => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to place an order.",
        variant: "destructive",
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "Empty cart",
        description: "Please add items to your cart before placing an order.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Prepare checkout data
      const checkoutData = {
        shippingAddress: {
          address: `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}`,
          coordinates: {
            latitude: 40.758896, // Default coordinates, could be geocoded from address
            longitude: -73.985130
          }
        },
        paymentMethod: paymentMethod.type,
        notes: `Shipping method: ${shippingMethods.find(m => m.id === shippingMethod)?.name}. ${deliveryPreferences.specialInstructions}`
      };

      // Process checkout through cart service
      const response = await cartService.proceedToCheckout(checkoutData);
      
      if (response.success) {
        // Clear cart after successful order
        try {
          await cartService.clearCart();
        } catch (error) {
          console.error('Failed to clear cart:', error);
        }

        toast({
          title: "Order placed successfully!",
          description: `Your order #${response.data.order._id} has been confirmed and is being processed.`,
        });
        
        // Navigate to orders page
        navigate('/orders');
      } else {
        throw new Error(response.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('Failed to place order:', error);
      toast({
        title: "Order failed",
        description: "Failed to place your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}>
            {step < currentStep ? <CheckCircle className="h-4 w-4" /> : step}
          </div>
          {step < 4 && (
            <div className={`w-16 h-0.5 mx-2 ${
              step < currentStep ? "bg-primary" : "bg-muted"
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderShippingStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">First Name</label>
          <Input
            value={shippingAddress.firstName}
            onChange={(e) => handleAddressChange("firstName", e.target.value)}
            placeholder="John"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Last Name</label>
          <Input
            value={shippingAddress.lastName}
            onChange={(e) => handleAddressChange("lastName", e.target.value)}
            placeholder="Doe"
          />
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium">Address</label>
        <Input
          value={shippingAddress.address}
          onChange={(e) => handleAddressChange("address", e.target.value)}
          placeholder="123 Main St"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">City</label>
          <Input
            value={shippingAddress.city}
            onChange={(e) => handleAddressChange("city", e.target.value)}
            placeholder="New York"
          />
        </div>
        <div>
          <label className="text-sm font-medium">State</label>
          <Input
            value={shippingAddress.state}
            onChange={(e) => handleAddressChange("state", e.target.value)}
            placeholder="NY"
          />
        </div>
        <div>
          <label className="text-sm font-medium">ZIP Code</label>
          <Input
            value={shippingAddress.zipCode}
            onChange={(e) => handleAddressChange("zipCode", e.target.value)}
            placeholder="10001"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Country</label>
          <Select value={shippingAddress.country} onValueChange={(value) => handleAddressChange("country", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="United States">United States</SelectItem>
              <SelectItem value="Canada">Canada</SelectItem>
              <SelectItem value="United Kingdom">United Kingdom</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Phone</label>
          <Input
            value={shippingAddress.phone}
            onChange={(e) => handleAddressChange("phone", e.target.value)}
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Shipping Method</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shippingMethods.map((method) => {
            const Icon = method.icon;
            return (
              <div
                key={method.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  shippingMethod === method.id ? "border-primary bg-primary/5" : "hover:border-muted-foreground/20"
                }`}
                onClick={() => setShippingMethod(method.id)}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <div className="font-medium">{method.name}</div>
                    <div className="text-sm text-muted-foreground">{method.description}</div>
                  </div>
                  <div className="font-semibold">
                    {method.price === 0 ? "Free" : `$${method.price.toFixed(2)}`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Delivery Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Preferred Time</label>
            <Select value={deliveryPreferences.preferredTime} onValueChange={(value) => setDeliveryPreferences(prev => ({ ...prev, preferredTime: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {deliveryTimeSlots.map(slot => {
                  const Icon = slot.icon;
                  return (
                    <SelectItem key={slot.id} value={slot.id}>
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        <span>{slot.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Contact Person</label>
            <Input
              value={deliveryPreferences.contactPerson}
              onChange={(e) => setDeliveryPreferences(prev => ({ ...prev, contactPerson: e.target.value }))}
              placeholder="Alternative contact person"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Special Instructions</label>
          <Textarea
            value={deliveryPreferences.specialInstructions}
            onChange={(e) => setDeliveryPreferences(prev => ({ ...prev, specialInstructions: e.target.value }))}
            placeholder="Any special delivery instructions..."
            rows={3}
          />
        </div>
      </div>
    </div>
  );

  const renderBillingStep = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="same-address"
          checked={useSameAddress}
          onCheckedChange={(checked) => setUseSameAddress(checked as boolean)}
        />
        <label htmlFor="same-address" className="text-sm font-medium">
          Use same address for billing
        </label>
      </div>

      {!useSameAddress && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Billing Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">First Name</label>
              <Input
                value={billingAddress.firstName}
                onChange={(e) => handleBillingAddressChange("firstName", e.target.value)}
                placeholder="John"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Last Name</label>
              <Input
                value={billingAddress.lastName}
                onChange={(e) => handleBillingAddressChange("lastName", e.target.value)}
                placeholder="Doe"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Address</label>
            <Input
              value={billingAddress.address}
              onChange={(e) => handleBillingAddressChange("address", e.target.value)}
              placeholder="123 Main St"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">City</label>
              <Input
                value={billingAddress.city}
                onChange={(e) => handleBillingAddressChange("city", e.target.value)}
                placeholder="New York"
              />
            </div>
            <div>
              <label className="text-sm font-medium">State</label>
              <Input
                value={billingAddress.state}
                onChange={(e) => handleBillingAddressChange("state", e.target.value)}
                placeholder="NY"
              />
            </div>
            <div>
              <label className="text-sm font-medium">ZIP Code</label>
              <Input
                value={billingAddress.zipCode}
                onChange={(e) => handleBillingAddressChange("zipCode", e.target.value)}
                placeholder="10001"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Payment Method</h3>
        <Tabs value={paymentMethod.type} onValueChange={(value) => setPaymentMethod(prev => ({ ...prev, type: value as any }))}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="credit_card">Credit Card</TabsTrigger>
            <TabsTrigger value="paypal">PayPal</TabsTrigger>
            <TabsTrigger value="apple_pay">Apple Pay</TabsTrigger>
            <TabsTrigger value="google_pay">Google Pay</TabsTrigger>
          </TabsList>
          
          <TabsContent value="credit_card" className="space-y-4">
            <div>
              <label className="text-sm font-medium">Card Number</label>
              <Input
                value={paymentMethod.cardNumber || ""}
                onChange={(e) => setPaymentMethod(prev => ({ ...prev, cardNumber: e.target.value }))}
                placeholder="1234 5678 9012 3456"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Expiry Date</label>
                <Input
                  value={paymentMethod.expiryDate || ""}
                  onChange={(e) => setPaymentMethod(prev => ({ ...prev, expiryDate: e.target.value }))}
                  placeholder="MM/YY"
                />
              </div>
              <div>
                <label className="text-sm font-medium">CVV</label>
                <Input
                  value={paymentMethod.cvv || ""}
                  onChange={(e) => setPaymentMethod(prev => ({ ...prev, cvv: e.target.value }))}
                  placeholder="123"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Cardholder Name</label>
                <Input
                  value={paymentMethod.cardholderName || ""}
                  onChange={(e) => setPaymentMethod(prev => ({ ...prev, cardholderName: e.target.value }))}
                  placeholder="John Doe"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="paypal" className="text-center py-8">
            <div className="text-muted-foreground">
              You will be redirected to PayPal to complete your payment.
            </div>
          </TabsContent>
          
          <TabsContent value="apple_pay" className="text-center py-8">
            <div className="text-muted-foreground">
              Apple Pay will be available at checkout.
            </div>
          </TabsContent>
          
          <TabsContent value="google_pay" className="text-center py-8">
            <div className="text-muted-foreground">
              Google Pay will be available at checkout.
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Order Summary</h3>
          {cartLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : cart.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-3">
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
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Order Details</h3>
          {cartLoading ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>--</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>--</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>--</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>--</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${getSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>{getShippingCost() === 0 ? "Free" : `$${getShippingCost().toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>${getTax().toFixed(2)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>${getTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="font-medium">Shipping Address</h4>
            <div className="text-sm text-muted-foreground">
              <div>{shippingAddress.firstName} {shippingAddress.lastName}</div>
              <div>{shippingAddress.address}</div>
              <div>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</div>
              <div>{shippingAddress.country}</div>
              <div>{shippingAddress.phone}</div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Shipping Method</h4>
            <div className="text-sm text-muted-foreground">
              {shippingMethods.find(m => m.id === shippingMethod)?.name}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderShippingStep();
      case 2:
        return renderBillingStep();
      case 3:
        return renderPaymentStep();
      case 4:
        return renderReviewStep();
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Shipping Information";
      case 2:
        return "Billing Information";
      case 3:
        return "Payment Method";
      case 4:
        return "Review & Place Order";
      default:
        return "";
    }
  };

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
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/store")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Store
          </Button>
        </div>

        <div>
          <h2 className="text-3xl font-bold tracking-tight">Checkout</h2>
          <p className="text-muted-foreground mt-1">
            Complete your order and choose delivery options
          </p>
        </div>

        {renderStepIndicator()}

        <Card>
          <CardHeader>
            <CardTitle>{getStepTitle()}</CardTitle>
            <CardDescription>
              Step {currentStep} of 4
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderCurrentStep()}

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentStep < 4 ? (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handlePlaceOrder} disabled={loading}>
                  {loading ? "Processing..." : "Place Order"}
                  <CheckCircle className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
