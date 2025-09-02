import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const { cart, removeFromCart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const orderData = {
      orderId: new Date().getTime().toString(),
      productName: cart.map((item) => item.name).join(", "),
      customerName: user.name,
      customerAddress: "123 Main St, Anytown, USA", // Replace with actual address from user profile
      customerContact: user.email, // Replace with actual contact from user profile
      user: user._id,
    };

    try {
      const token = localStorage.getItem("droneflux-ecommerce-token");
      console.log("Token being sent:", token);
      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        clearCart();
        navigate("/confirmation"); // Redirect to an order confirmation page
      } else {
        // Handle error
        console.error("Failed to create order");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Shopping Cart</CardTitle>
        </CardHeader>
        <CardContent>
          {cart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <div>
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-4 border-b">
                  <div>
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      ${item.sale_price || item.price} x {item.quantity}
                    </p>
                  </div>
                  <Button variant="destructive" onClick={() => removeFromCart(item.id)}>
                    Remove
                  </Button>
                </div>
              ))}
              <div className="flex items-center justify-between mt-4">
                <p className="text-lg font-bold">Total: ${getCartTotal().toFixed(2)}</p>
                <Button onClick={handleCheckout}>Checkout</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
