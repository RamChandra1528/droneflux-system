import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LiveMap } from "@/components/ui/LiveMap";
import { mockOrders, Order } from "@/lib/data";
import { Search, MapPin, Package, Clock, CheckCircle, Truck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { io, Socket } from "socket.io-client";
import type { LatLngExpression } from "leaflet";

export default function Tracking() {
  const { user } = useAuth();
  const [trackingId, setTrackingId] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [droneLocation, setDroneLocation] = useState<LatLngExpression | null>(null);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:5000");
    setSocket(newSocket);

    newSocket.on("locationUpdate", (data) => {
      if (selectedOrder && data.droneId === selectedOrder.droneId) {
        setDroneLocation([data.location.latitude, data.location.longitude]);
      }
    });

    return () => {
      newSocket.close();
    };
  }, [selectedOrder]);

  const availableOrders = user?.role === "customer" 
    ? mockOrders.filter(order => order.customerId === user.id)
    : mockOrders;
  
  const handleTrackOrder = () => {
    if (!trackingId.trim()) return;
    
    const foundOrder = availableOrders.find(
      order => order.id.toLowerCase() === trackingId.toLowerCase()
    );
    
    setSelectedOrder(foundOrder || null);
    if (foundOrder) {
      setDroneLocation(foundOrder.deliveryLocation.coordinates as LatLngExpression);
    }
  };

  const getStatusTimeline = (order: Order) => {
    const statuses = [
      { label: "Order Placed", icon: Package, completed: true, time: new Date(order.createdAt) },
      { 
        label: "Processing", 
        icon: Clock, 
        completed: ["processing", "in-transit", "delivered"].includes(order.status),
        time: new Date(new Date(order.createdAt).getTime() + 30 * 60000) // 30 minutes after creation
      },
      { 
        label: "In Transit", 
        icon: Truck, 
        completed: ["in-transit", "delivered"].includes(order.status),
        time: new Date(new Date(order.createdAt).getTime() + 60 * 60000) // 60 minutes after creation
      },
      { 
        label: "Delivered", 
        icon: CheckCircle, 
        completed: order.status === "delivered",
        time: order.status === "delivered" ? new Date(order.estimatedDelivery) : null
      }
    ];
    
    return statuses;
  };

  const formatTime = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: 'numeric',
      hour12: true
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Order Tracking</h2>
          <p className="text-muted-foreground mt-1">
            Track the real-time status and location of your deliveries
          </p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Track Your Order</CardTitle>
            <CardDescription>
              Enter your order ID to see its current status and location
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Enter order ID..."
                  className="pl-9"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTrackOrder()}
                />
              </div>
              <Button onClick={handleTrackOrder}>
                Track Order
              </Button>
            </div>
          </CardContent>
        </Card>

        {selectedOrder ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Order #{selectedOrder.id}</CardTitle>
                    <Badge 
                      variant="outline" 
                      className={`
                        capitalize
                        ${selectedOrder.status === "delivered" ? "bg-green-500/15 text-green-600 border-green-200" :
                          selectedOrder.status === "in-transit" ? "bg-indigo-500/15 text-indigo-600 border-indigo-200" :
                          selectedOrder.status === "processing" ? "bg-blue-500/15 text-blue-600 border-blue-200" :
                          selectedOrder.status === "pending" ? "bg-orange-500/15 text-orange-600 border-orange-200" :
                          "bg-red-500/15 text-red-600 border-red-200"}
                      `}
                    >
                      {selectedOrder.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    Order placed on {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Customer</div>
                        <div className="font-medium">{selectedOrder.customerName}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Items</div>
                        <div className="font-medium">
                          {selectedOrder.items.reduce((acc, item) => acc + item.quantity, 0)} items
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Weight</div>
                        <div className="font-medium">{selectedOrder.totalWeight} kg</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Price</div>
                        <div className="font-medium">${selectedOrder.price.toFixed(2)}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex gap-2 items-start">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <div className="text-muted-foreground text-sm">From</div>
                          <div className="font-medium">{selectedOrder.pickupLocation.address}</div>
                        </div>
                      </div>
                      <div className="flex gap-2 items-start">
                        <MapPin className="h-4 w-4 text-primary mt-0.5" />
                        <div>
                          <div className="text-muted-foreground text-sm">To</div>
                          <div className="font-medium">{selectedOrder.deliveryLocation.address}</div>
                        </div>
                      </div>
                    </div>

                    {selectedOrder.droneId && (
                      <div className="pt-2 border-t">
                        <div className="flex gap-2 items-center">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          <div className="font-medium">Delivery by Drone: {selectedOrder.droneName}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Delivery Progress</CardTitle>
                  <CardDescription>
                    Real-time status of your delivery
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="relative">
                      {getStatusTimeline(selectedOrder).map((status, index, arr) => (
                        <div key={index} className="flex mb-6 last:mb-0">
                          <div className="flex flex-col items-center mr-4">
                            <div className={`rounded-full p-2 ${
                              status.completed ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                            }`}>
                              <status.icon className="h-4 w-4" />
                            </div>
                            {index < arr.length - 1 && (
                              <div className={`h-full w-0.5 ${
                                status.completed && arr[index + 1].completed ? "bg-primary" : "bg-muted"
                              }`} />
                            )}
                          </div>
                          <div className="pt-0.5">
                            <p className="font-medium">{status.label}</p>
                            {status.time && (
                              <p className="text-sm text-muted-foreground">{formatTime(status.time)}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-sm text-muted-foreground">Estimated Delivery Time</div>
                        <div className="font-medium">
                          {formatTime(new Date(selectedOrder.estimatedDelivery))}
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ 
                            width: `${selectedOrder.status === "delivered" ? 100 : 
                                     selectedOrder.status === "in-transit" ? 75 :
                                     selectedOrder.status === "processing" ? 50 :
                                     selectedOrder.status === "pending" ? 25 : 0}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Map</CardTitle>
                <CardDescription>
                  Real-time location tracking of your delivery
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[400px] rounded-b-lg">
                  {droneLocation ? (
                    <LiveMap center={droneLocation} />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-muted">
                      <p className="text-muted-foreground">Waiting for location data...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="border-dashed bg-muted/50">
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">No Order Selected</h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                Enter an order ID above to track your delivery in real-time and see its current status
              </p>
              {user?.role === "customer" && availableOrders.length > 0 && (
                <div className="space-y-2 text-center">
                  <p className="text-sm font-medium">Your recent orders:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {availableOrders.slice(0, 3).map(order => (
                      <Button 
                        key={order.id} 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setTrackingId(order.id);
                          setSelectedOrder(order);
                          setDroneLocation(order.deliveryLocation.coordinates as LatLngExpression);
                        }}
                      >
                        Order #{order.id}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}