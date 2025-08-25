import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  AlertTriangle, 
  Battery, 
  MapPin, 
  Clock, 
  Zap, 
  Phone, 
  Shield,
  Activity,
  Truck,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import EmergencyOrderRequestModal from './EmergencyOrderRequestModal';

interface EmergencyOrder {
  _id: string;
  orderId: string;
  customerId: {
    name: string;
    phone: string;
  };
  status: string;
  priority: string;
  isEmergency: boolean;
  droneId: {
    droneId: string;
    model: string;
    batteryLevel: number;
    location: {
      latitude: number;
      longitude: number;
    };
    status: string;
  };
  emergencyDetails: {
    reason: string;
    approvedBy: {
      name: string;
    };
    approvedAt: string;
    emergencyContact?: {
      name: string;
      phone: string;
    };
  };
  estimatedDelivery: string;
  trackingHistory: Array<{
    status: string;
    notes: string;
    timestamp: string;
  }>;
}

interface EmergencyStats {
  activeEmergencies: number;
  todayEmergencies: number;
  availableDrones: number;
  avgResponseTimeMinutes: number;
  systemStatus: string;
}

interface CriticalAlert {
  type: string;
  severity: string;
  message: string;
  orderId: string;
  droneId: string;
  timestamp: string;
}

const EmergencyManagement: React.FC = () => {
  const [emergencyOrders, setEmergencyOrders] = useState<EmergencyOrder[]>([]);
  const [emergencyStats, setEmergencyStats] = useState<EmergencyStats | null>(null);
  const [criticalAlerts, setCriticalAlerts] = useState<CriticalAlert[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<EmergencyOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [selectedOrderForEmergency, setSelectedOrderForEmergency] = useState<string | null>(null);
  
  const socket = useSocket();
  const { user } = useAuth();
  const isCustomer = user?.role === 'customer';
  const isAdminOrOperator = user?.role === 'admin' || user?.role === 'operator';

  useEffect(() => {
    fetchEmergencyData();
    
    if (socket) {
      // Listen for real-time emergency updates
      socket.on('emergency-order-created', handleEmergencyOrderCreated);
      socket.on('emergency-critical-alert', handleCriticalAlert);
      socket.on('emergency-dashboard-update', handleDashboardUpdate);
      socket.on('emergency-tracking-update', handleTrackingUpdate);
      
      return () => {
        socket.off('emergency-order-created');
        socket.off('emergency-critical-alert');
        socket.off('emergency-dashboard-update');
        socket.off('emergency-tracking-update');
      };
    }
  }, [socket]);

  const fetchEmergencyData = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('droneflux-token');
      
      if (isCustomer) {
        // For customers, fetch their emergency orders from customer orders endpoint
        const ordersResponse = await fetch('/api/orders/customer/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const ordersData = await ordersResponse.json();
        
        if (ordersData.success) {
          // Filter only emergency orders for customers
          const emergencyOrders = ordersData.data.filter((order: any) => order.isEmergency);
          setEmergencyOrders(emergencyOrders);
        }
      } else {
        // For admin/operator, fetch all emergency orders and stats
        const [ordersResponse, statsResponse] = await Promise.all([
          fetch('/api/emergency/orders', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch('/api/emergency/stats', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const ordersData = await ordersResponse.json();
        const statsData = await statsResponse.json();

        if (ordersData.success) {
          setEmergencyOrders(ordersData.data);
        }
        
        if (statsData.success) {
          setEmergencyStats(statsData.data);
        }
      }
    } catch (error) {
      console.error('Error fetching emergency data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyOrderCreated = (data: any) => {
    fetchEmergencyData(); // Refresh data
  };

  const handleCriticalAlert = (alert: any) => {
    setCriticalAlerts(prev => [alert, ...prev.slice(0, 9)]); // Keep last 10 alerts
  };

  const handleDashboardUpdate = (data: any) => {
    // Update specific order data
    setEmergencyOrders(prev => 
      prev.map(order => 
        order._id === data.orderId 
          ? { ...order, droneId: { ...order.droneId, batteryLevel: data.batteryLevel } }
          : order
      )
    );
  };

  const handleTrackingUpdate = (data: any) => {
    // Update tracking information for the order
    setEmergencyOrders(prev =>
      prev.map(order =>
        order._id === data.orderId
          ? {
              ...order,
              droneId: {
                ...order.droneId,
                location: data.location,
                batteryLevel: data.batteryLevel
              }
            }
          : order
      )
    );
  };

  const markOrderAsEmergency = async (orderId: string, reason: string, emergencyContact?: any) => {
    try {
      const response = await fetch(`/api/emergency/orders/${orderId}/emergency`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reason, emergencyContact })
      });

      const data = await response.json();
      if (data.success) {
        fetchEmergencyData();
      }
    } catch (error) {
      console.error('Error marking order as emergency:', error);
    }
  };

  const forceFailover = async (orderId: string, reason: string) => {
    try {
      const response = await fetch(`/api/emergency/orders/${orderId}/failover`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reason })
      });

      const data = await response.json();
      if (data.success) {
        fetchEmergencyData();
      }
    } catch (error) {
      console.error('Error forcing failover:', error);
    }
  };

  const handleEmergencyRequest = async (data: any) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('droneflux-token');
      
      if (selectedOrderForEmergency) {
        // Mark existing order as emergency
        const response = await fetch(`/api/emergency/orders/${selectedOrderForEmergency}/emergency`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            reason: data.reason,
            urgencyLevel: data.urgencyLevel,
            emergencyContact: data.emergencyContact,
            additionalNotes: data.additionalNotes
          })
        });

        const result = await response.json();
        if (result.success) {
          fetchEmergencyData();
          alert('Order has been marked as emergency priority!');
        } else {
          alert('Failed to mark order as emergency: ' + result.error);
        }
      } else {
        // Create new emergency order (would need to be implemented)
        alert('Emergency order creation feature coming soon!');
      }
    } catch (error) {
      console.error('Error processing emergency request:', error);
      alert('Failed to process emergency request');
    }
  };

  const openEmergencyModal = (orderId?: string) => {
    setSelectedOrderForEmergency(orderId || null);
    setShowEmergencyModal(true);
  };

  const closeEmergencyModal = () => {
    setShowEmergencyModal(false);
    setSelectedOrderForEmergency(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      default: return 'bg-blue-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600';
      case 'in-transit': return 'text-blue-600';
      case 'processing': return 'text-yellow-600';
      case 'cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getBatteryColor = (level: number) => {
    if (level <= 15) return 'text-red-500';
    if (level <= 30) return 'text-orange-500';
    return 'text-green-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Customer view - simplified emergency orders display
  if (isCustomer) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight">My Emergency Orders</h2>
          <p className="text-muted-foreground">
            Track your emergency priority deliveries and get real-time updates.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : emergencyOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Emergency Orders</h3>
              <p className="text-gray-600">You don't have any emergency orders at the moment.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Your Emergency Orders</h3>
              <Button 
                onClick={() => openEmergencyModal()}
                className="bg-red-600 hover:bg-red-700"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Request Emergency Delivery
              </Button>
            </div>
            
            <div className="grid gap-4">
              {emergencyOrders.map((order) => (
                <Card key={order._id} className="border-l-4 border-l-red-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg text-red-600">🚨 Emergency Order</CardTitle>
                        <CardDescription>
                          Order ID: {order.orderId} | Status: {order.status}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-red-500 text-white">
                          Emergency Priority
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Emergency Details</h4>
                        <div className="space-y-1 text-sm">
                          <p>Reason: {order.emergencyDetails?.reason || 'High Priority'}</p>
                          <p>Approved: {order.emergencyDetails?.approvedAt ? new Date(order.emergencyDetails.approvedAt).toLocaleString() : 'N/A'}</p>
                          <p>Expected Delivery: {new Date(order.estimatedDelivery).toLocaleString()}</p>
                        </div>
                      </div>
                      
                      {order.droneId && (
                        <div>
                          <h4 className="font-medium mb-2">Delivery Drone</h4>
                          <div className="space-y-1 text-sm">
                            <p>Drone ID: {order.droneId.droneId}</p>
                            <p>Model: {order.droneId.model}</p>
                            <div className="flex items-center space-x-1">
                              <Battery className={`h-4 w-4 ${getBatteryColor(order.droneId.batteryLevel)}`} />
                              <span className={getBatteryColor(order.droneId.batteryLevel)}>
                                Battery: {order.droneId.batteryLevel}%
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <MapPin className="h-4 w-4 mr-1" />
                        Track Live
                      </Button>
                      {order.emergencyDetails?.emergencyContact && (
                        <Button size="sm" variant="outline">
                          <Phone className="h-4 w-4 mr-1" />
                          Emergency Contact
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Emergency Request Modal */}
        <EmergencyOrderRequestModal
          isOpen={showEmergencyModal}
          onClose={closeEmergencyModal}
          onSubmit={handleEmergencyRequest}
          orderId={selectedOrderForEmergency || undefined}
          isExistingOrder={!!selectedOrderForEmergency}
        />

        {/* Live Tracking for Selected Order */}
        {selectedOrder && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Live Tracking - {selectedOrder.orderId}</CardTitle>
              <CardDescription>
                Real-time tracking for your emergency order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Current Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Order Status:</span>
                      <Badge className={getStatusColor(selectedOrder.status)}>
                        {selectedOrder.status}
                      </Badge>
                    </div>
                    {selectedOrder.droneId && (
                      <>
                        <div className="flex items-center justify-between">
                          <span>Drone Battery:</span>
                          <div className="flex items-center space-x-1">
                            <Battery className={`h-4 w-4 ${getBatteryColor(selectedOrder.droneId.batteryLevel)}`} />
                            <span className={getBatteryColor(selectedOrder.droneId.batteryLevel)}>
                              {selectedOrder.droneId.batteryLevel}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>ETA:</span>
                          <span>{new Date(selectedOrder.estimatedDelivery).toLocaleTimeString()}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {selectedOrder.droneId?.location && (
                  <div>
                    <h4 className="font-medium mb-3">Current Location</h4>
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <p className="text-sm">
                        Lat: {selectedOrder.droneId.location.latitude.toFixed(6)}
                      </p>
                      <p className="text-sm">
                        Lng: {selectedOrder.droneId.location.longitude.toFixed(6)}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Last updated: {new Date().toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Admin/Operator view - full emergency management dashboard
  return (
    <div className="space-y-6">
      {/* Emergency Stats Overview */}
      {emergencyStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Emergencies</p>
                  <p className="text-2xl font-bold text-red-600">{emergencyStats.activeEmergencies}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                  <p className="text-2xl font-bold">{emergencyStats.avgResponseTimeMinutes}m</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Truck className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Drones</p>
                  <p className="text-2xl font-bold text-green-600">{emergencyStats.availableDrones}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Shield className={`h-5 w-5 ${emergencyStats.systemStatus === 'operational' ? 'text-green-500' : 'text-orange-500'}`} />
                <div>
                  <p className="text-sm font-medium text-gray-600">System Status</p>
                  <p className={`text-lg font-bold capitalize ${emergencyStats.systemStatus === 'operational' ? 'text-green-600' : 'text-orange-600'}`}>
                    {emergencyStats.systemStatus}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-semibold text-red-800">Critical Alerts</p>
              {criticalAlerts.slice(0, 3).map((alert, index) => (
                <div key={index} className="text-sm text-red-700">
                  <span className="font-medium">{alert.type}:</span> {alert.message}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="active">Active Emergencies</TabsTrigger>
          <TabsTrigger value="tracking">Live Tracking</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Emergency Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span>Active Emergency Orders</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {emergencyOrders.filter(order => ['processing', 'in-transit'].includes(order.status)).map((order) => (
                    <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{order.orderId}</p>
                        <p className="text-sm text-gray-600">{order.customerId.name}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getPriorityColor(order.priority)}>
                            {order.priority}
                          </Badge>
                          <span className={`text-sm ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          <Battery className={`h-4 w-4 ${getBatteryColor(order.droneId.batteryLevel)}`} />
                          <span className={`text-sm ${getBatteryColor(order.droneId.batteryLevel)}`}>
                            {order.droneId.batteryLevel}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{order.droneId.droneId}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Emergency Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Emergency Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={() => {/* Handle emergency drone recall */}}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Emergency Drone Recall
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {/* Handle system status check */}}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  System Status Check
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {/* Handle ground staff alert */}}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Alert All Ground Staff
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4">
            {emergencyOrders.filter(order => ['processing', 'in-transit'].includes(order.status)).map((order) => (
              <Card key={order._id} className="border-l-4 border-l-red-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{order.orderId}</CardTitle>
                      <CardDescription>
                        Customer: {order.customerId.name} | Phone: {order.customerId.phone}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(order.priority)}>
                        {order.priority}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Drone Information</h4>
                      <div className="space-y-1 text-sm">
                        <p>ID: {order.droneId.droneId}</p>
                        <p>Model: {order.droneId.model}</p>
                        <div className="flex items-center space-x-1">
                          <Battery className={`h-4 w-4 ${getBatteryColor(order.droneId.batteryLevel)}`} />
                          <span className={getBatteryColor(order.droneId.batteryLevel)}>
                            {order.droneId.batteryLevel}%
                          </span>
                        </div>
                        <p>Status: {order.droneId.status}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Emergency Details</h4>
                      <div className="space-y-1 text-sm">
                        <p>Reason: {order.emergencyDetails.reason}</p>
                        <p>Approved by: {order.emergencyDetails.approvedBy.name}</p>
                        <p>Time: {new Date(order.emergencyDetails.approvedAt).toLocaleString()}</p>
                        {order.emergencyDetails.emergencyContact && (
                          <p>Contact: {order.emergencyDetails.emergencyContact.name}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Actions</h4>
                      <div className="space-y-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <MapPin className="h-4 w-4 mr-1" />
                          Track Live
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => forceFailover(order._id, 'admin_initiated')}
                        >
                          <Zap className="h-4 w-4 mr-1" />
                          Force Failover
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tracking">
          {selectedOrder ? (
            <Card>
              <CardHeader>
                <CardTitle>Live Tracking - {selectedOrder.orderId}</CardTitle>
                <CardDescription>
                  Real-time tracking for emergency order
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Current Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Order Status:</span>
                        <Badge className={getStatusColor(selectedOrder.status)}>
                          {selectedOrder.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Drone Battery:</span>
                        <div className="flex items-center space-x-1">
                          <Battery className={`h-4 w-4 ${getBatteryColor(selectedOrder.droneId.batteryLevel)}`} />
                          <span className={getBatteryColor(selectedOrder.droneId.batteryLevel)}>
                            {selectedOrder.droneId.batteryLevel}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>ETA:</span>
                        <span>{new Date(selectedOrder.estimatedDelivery).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Location</h4>
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <p className="text-sm">
                        Lat: {selectedOrder.droneId.location.latitude.toFixed(6)}
                      </p>
                      <p className="text-sm">
                        Lng: {selectedOrder.droneId.location.longitude.toFixed(6)}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Last updated: {new Date().toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Tracking History</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedOrder.trackingHistory.map((entry, index) => (
                      <div key={index} className="flex items-start space-x-3 p-2 bg-gray-50 rounded">
                        <div className="flex-shrink-0 mt-1">
                          {entry.status === 'delivered' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : entry.status.includes('emergency') ? (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <Activity className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{entry.status}</p>
                          <p className="text-xs text-gray-600">{entry.notes}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(entry.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select an emergency order to view live tracking</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Order History</CardTitle>
              <CardDescription>
                Complete history of all emergency orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {emergencyOrders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{order.orderId}</p>
                      <p className="text-sm text-gray-600">{order.customerId.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.emergencyDetails.approvedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={getPriorityColor(order.priority)}>
                        {order.priority}
                      </Badge>
                      <p className={`text-sm mt-1 ${getStatusColor(order.status)}`}>
                        {order.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmergencyManagement;
