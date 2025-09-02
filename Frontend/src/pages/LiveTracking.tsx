import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  MapPin, Package, Truck, Clock, CheckCircle, AlertTriangle, 
  Zap, Battery, Navigation, Play, Pause, RefreshCw,
  Eye, EyeOff, Maximize2, Minimize2, Settings
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Drone {
  _id: string;
  name: string;
  model: string;
  status: string;
  batteryLevel: number;
  location: { latitude: number; longitude: number };
  altitude: number;
  heading: number;
  speed: number;
  currentAssignment?: {
    assignmentId: string;
    status: string;
  };
}

interface Order {
  _id: string;
  orderId: string;
  status: string;
  customer: { name: string; email: string };
  pickupLocation: { address: string; latitude: number; longitude: number };
  deliveryLocation: { address: string; latitude: number; longitude: number };
  assignedDrone?: Drone;
  estimatedDeliveryTime: string;
  trackingHistory: Array<{
    status: string;
    timestamp: string;
    location?: { latitude: number; longitude: number };
    notes?: string;
  }>;
}

export default function LiveTracking() {
  const { user } = useAuth();
  const { toast } = useToast();
  const mapRef = useRef<HTMLDivElement>(null);
  
  const [drones, setDrones] = useState<Drone[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedDrone, setSelectedDrone] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [trackingMode, setTrackingMode] = useState<"drones" | "orders">("drones");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [showSettings, setShowSettings] = useState(false);
  const [mapView, setMapView] = useState<"2D" | "3D">("2D");
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  const mockDrones: Drone[] = [
    {
      _id: "d1",
      name: "Falcon-X1",
      model: "DJI Mavic 3",
      status: "in-transit",
      batteryLevel: 78,
      location: { latitude: 40.712776, longitude: -74.005974 },
      altitude: 120,
      heading: 45,
      speed: 65,
      currentAssignment: { assignmentId: "ASG001", status: "active" }
    },
    {
      _id: "d2",
      name: "Swift-D2",
      model: "Skydio 2",
      status: "available",
      batteryLevel: 92,
      location: { latitude: 40.730610, longitude: -73.935242 },
      altitude: 0,
      heading: 0,
      speed: 0
    },
    {
      _id: "d3",
      name: "HeavyLift-H1",
      model: "FreeFly Alta X",
      status: "charging",
      batteryLevel: 23,
      location: { latitude: 40.758896, longitude: -73.985130 },
      altitude: 0,
      heading: 0,
      speed: 0
    }
  ];

  const mockOrders: Order[] = [
    {
      _id: "o1",
      orderId: "ORD001",
      status: "in_transit",
      customer: { name: "John Customer", email: "john@example.com" },
      pickupLocation: { address: "123 Broadway, New York, NY", latitude: 40.712776, longitude: -74.005974 },
      deliveryLocation: { address: "456 Park Ave, New York, NY", latitude: 40.758896, longitude: -73.985130 },
      assignedDrone: mockDrones[0],
      estimatedDeliveryTime: "2023-10-15T14:30:00Z",
      trackingHistory: [
        { status: "order_placed", timestamp: "2023-10-15T10:00:00Z" },
        { status: "assigned", timestamp: "2023-10-15T10:15:00Z" },
        { status: "picked_up", timestamp: "2023-10-15T10:30:00Z" },
        { status: "in_transit", timestamp: "2023-10-15T10:45:00Z" }
      ]
    },
    {
      _id: "o2",
      orderId: "ORD002",
      status: "assigned",
      customer: { name: "Sarah Smith", email: "sarah@example.com" },
      pickupLocation: { address: "789 5th Ave, New York, NY", latitude: 40.730610, longitude: -73.935242 },
      deliveryLocation: { address: "321 Madison Ave, New York, NY", latitude: 40.753182, longitude: -73.982253 },
      estimatedDeliveryTime: "2023-10-15T15:00:00Z",
      trackingHistory: [
        { status: "order_placed", timestamp: "2023-10-15T11:00:00Z" },
        { status: "assigned", timestamp: "2023-10-15T11:15:00Z" }
      ]
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDrones(mockDrones);
      setOrders(mockOrders);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh) {
      interval = setInterval(() => {
        refreshData();
      }, refreshInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval]);

  const refreshData = () => {
    // Simulate real-time updates
    setDrones(prevDrones => 
      prevDrones.map(drone => {
        if (drone.status === "in-transit") {
          // Simulate drone movement
          const newLat = drone.location.latitude + (Math.random() - 0.5) * 0.001;
          const newLng = drone.location.longitude + (Math.random() - 0.5) * 0.001;
          return {
            ...drone,
            location: { latitude: newLat, longitude: newLng },
            batteryLevel: Math.max(0, drone.batteryLevel - Math.random() * 2),
            altitude: drone.altitude + (Math.random() - 0.5) * 10
          };
        }
        return drone;
      })
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-500";
      case "in-transit": return "bg-blue-500";
      case "charging": return "bg-yellow-500";
      case "maintenance": return "bg-red-500";
      case "low_battery": return "bg-orange-500";
      default: return "bg-gray-500";
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-orange-500";
      case "assigned": return "bg-blue-500";
      case "picked_up": return "bg-indigo-500";
      case "in_transit": return "bg-purple-500";
      case "delivered": return "bg-green-500";
      case "cancelled": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 60) return "text-green-500";
    if (level > 30) return "text-yellow-500";
    return "text-red-500";
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Live Tracking</h2>
            <p className="text-muted-foreground mt-1">
              Real-time monitoring of drones and order deliveries
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? "bg-green-50 border-green-200" : ""}
            >
              {autoRefresh ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
              {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
            </Button>
            <Button variant="outline" size="sm" onClick={refreshData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <Card>
            <CardHeader>
              <CardTitle>Tracking Settings</CardTitle>
              <CardDescription>Configure real-time tracking preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Refresh Interval</label>
                  <Select value={refreshInterval.toString()} onValueChange={(value) => setRefreshInterval(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2000">2 seconds</SelectItem>
                      <SelectItem value="5000">5 seconds</SelectItem>
                      <SelectItem value="10000">10 seconds</SelectItem>
                      <SelectItem value="30000">30 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Map View</label>
                  <Select value={mapView} onValueChange={(value) => setMapView(value as "2D" | "3D")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2D">2D View</SelectItem>
                      <SelectItem value="3D">3D View</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Tracking Mode</label>
                  <Select value={trackingMode} onValueChange={(value) => setTrackingMode(value as "drones" | "orders")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="drones">Drones</SelectItem>
                      <SelectItem value="orders">Orders</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Tracking Map */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Live Map</CardTitle>
                    <CardDescription>
                      {trackingMode === "drones" ? "Real-time drone locations" : "Order delivery tracking"}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{mapView}</Badge>
                    <Button variant="outline" size="sm">
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div 
                  ref={mapRef}
                  className="h-[600px] bg-muted rounded-b-lg flex items-center justify-center"
                >
                  <div className="text-center">
                    <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Interactive Map</h3>
                    <p className="text-muted-foreground mb-4">
                      {trackingMode === "drones" 
                        ? `Tracking ${drones.filter(d => d.status === "in-transit").length} active drones`
                        : `Tracking ${orders.filter(o => ["assigned", "picked_up", "in_transit"].includes(o.status)).length} active orders`
                      }
                    </p>
                    <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                      {trackingMode === "drones" ? (
                        <>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span>Available</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span>In Transit</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <span>Charging</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span>Assigned</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                            <span>In Transit</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span>Delivered</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tracking Panel */}
          <div className="space-y-6">
            {/* Drone Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="h-4 w-4 mr-2" />
                  Drone Fleet
                </CardTitle>
                <CardDescription>
                  {drones.filter(d => d.status === "in-transit").length} active, {drones.filter(d => d.status === "available").length} available
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {drones.map(drone => (
                  <div
                    key={drone._id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedDrone === drone._id ? "border-primary bg-primary/5" : "hover:border-muted-foreground/20"
                    }`}
                    onClick={() => setSelectedDrone(selectedDrone === drone._id ? null : drone._id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(drone.status)}`}></div>
                        <span className="font-medium text-sm">{drone.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {drone.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>Battery</span>
                        <span className={`font-medium ${getBatteryColor(drone.batteryLevel)}`}>
                          {drone.batteryLevel}%
                        </span>
                      </div>
                      {drone.status === "in-transit" && (
                        <>
                          <div className="flex items-center justify-between">
                            <span>Altitude</span>
                            <span>{drone.altitude}m</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Speed</span>
                            <span>{drone.speed} km/h</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Order Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Active Orders
                </CardTitle>
                <CardDescription>
                  {orders.filter(o => ["assigned", "picked_up", "in_transit"].includes(o.status)).length} in progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {orders.filter(o => ["assigned", "picked_up", "in_transit"].includes(o.status)).map(order => (
                  <div
                    key={order._id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedOrder === order._id ? "border-primary bg-primary/5" : "hover:border-muted-foreground/20"
                    }`}
                    onClick={() => setSelectedOrder(selectedOrder === order._id ? null : order._id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">#{order.orderId}</span>
                      <Badge variant="outline" className="text-xs">
                        {order.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="truncate">{order.customer.name}</div>
                      <div className="flex items-center justify-between">
                        <span>ETA</span>
                        <span>{formatTime(order.estimatedDeliveryTime)}</span>
                      </div>
                      {order.assignedDrone && (
                        <div className="flex items-center justify-between">
                          <span>Drone</span>
                          <span className="font-medium">{order.assignedDrone.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Zap className="h-4 w-4 mr-2" />
                  Emergency Landing
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Navigation className="h-4 w-4 mr-2" />
                  Recalculate Routes
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Clock className="h-4 w-4 mr-2" />
                  Update ETAs
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Detailed Tracking Information */}
        {(selectedDrone || selectedOrder) && (
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDrone ? "Drone Details" : "Order Details"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDrone && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Current Status</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <Badge variant="outline">{drones.find(d => d._id === selectedDrone)?.status}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Battery:</span>
                        <span className={getBatteryColor(drones.find(d => d._id === selectedDrone)?.batteryLevel || 0)}>
                          {drones.find(d => d._id === selectedDrone)?.batteryLevel}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Altitude:</span>
                        <span>{drones.find(d => d._id === selectedDrone)?.altitude}m</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Speed:</span>
                        <span>{drones.find(d => d._id === selectedDrone)?.speed} km/h</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Location</h4>
                    <div className="space-y-2 text-sm">
                      <div>Lat: {drones.find(d => d._id === selectedDrone)?.location.latitude.toFixed(6)}</div>
                      <div>Lng: {drones.find(d => d._id === selectedDrone)?.location.longitude.toFixed(6)}</div>
                      <div>Heading: {drones.find(d => d._id === selectedDrone)?.heading}°</div>
                    </div>
                  </div>
                </div>
              )}

              {selectedOrder && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Order Information</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Order ID:</span>
                        <span className="font-medium">#{orders.find(o => o._id === selectedOrder)?.orderId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Customer:</span>
                        <span>{orders.find(o => o._id === selectedOrder)?.customer.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <Badge variant="outline">
                          {orders.find(o => o._id === selectedOrder)?.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>ETA:</span>
                        <span>{formatTime(orders.find(o => o._id === selectedOrder)?.estimatedDeliveryTime || "")}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Tracking History</h4>
                    <div className="space-y-2">
                      {orders.find(o => o._id === selectedOrder)?.trackingHistory.map((event, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <div className={`w-2 h-2 rounded-full ${getOrderStatusColor(event.status)}`}></div>
                          <span className="capitalize">{event.status.replace("_", " ")}</span>
                          <span className="text-muted-foreground text-xs">
                            {formatTime(event.timestamp)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
