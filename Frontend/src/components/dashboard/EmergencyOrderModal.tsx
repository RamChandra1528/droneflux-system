import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { AlertTriangle, Clock, Battery, Truck, Phone, User } from 'lucide-react';

interface Order {
  _id: string;
  orderId: string;
  customerId: {
    name: string;
    phone: string;
    email: string;
  };
  status: string;
  priority: string;
  totalWeight: number;
  pickupLocation: {
    address: string;
    lat: number;
    lng: number;
  };
  deliveryLocation: {
    address: string;
    lat: number;
    lng: number;
  };
  estimatedDelivery: string;
  items: Array<{
    name: string;
    quantity: number;
    weight: number;
  }>;
}

interface AvailableDrone {
  _id: string;
  droneId: string;
  model: string;
  batteryLevel: number;
  maxPayload: number;
  maxRange: number;
  location: {
    latitude: number;
    longitude: number;
  };
  readinessScore: number;
  isOptimal: boolean;
}

interface EmergencyOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOrder: Order | null;
  onEmergencyCreated: () => void;
}

const EmergencyOrderModal: React.FC<EmergencyOrderModalProps> = ({
  isOpen,
  onClose,
  selectedOrder,
  onEmergencyCreated
}) => {
  const [formData, setFormData] = useState({
    reason: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });
  const [availableDrones, setAvailableDrones] = useState<AvailableDrone[]>([]);
  const [selectedDrone, setSelectedDrone] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Details, 2: Drone Selection, 3: Confirmation

  useEffect(() => {
    if (isOpen && selectedOrder) {
      fetchAvailableDrones();
      setFormData({
        reason: '',
        emergencyContact: {
          name: selectedOrder.customerId.name,
          phone: selectedOrder.customerId.phone,
          relationship: 'customer'
        }
      });
      setStep(1);
      setError('');
    }
  }, [isOpen, selectedOrder]);

  const fetchAvailableDrones = async () => {
    if (!selectedOrder) return;

    try {
      const response = await fetch(`/api/emergency/drones/available?minPayload=${selectedOrder.totalWeight}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setAvailableDrones(data.data);
        // Auto-select the best drone
        if (data.data.length > 0) {
          setSelectedDrone(data.data[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching available drones:', error);
      setError('Failed to fetch available drones');
    }
  };

  const handleSubmit = async () => {
    if (!selectedOrder) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/emergency/orders/${selectedOrder._id}/emergency`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          reason: formData.reason,
          emergencyContact: formData.emergencyContact
        })
      });

      const data = await response.json();
      
      if (data.success) {
        onEmergencyCreated();
        onClose();
      } else {
        setError(data.error || 'Failed to create emergency order');
      }
    } catch (error) {
      console.error('Error creating emergency order:', error);
      setError('Failed to create emergency order');
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getEstimatedTime = (drone: AvailableDrone) => {
    if (!selectedOrder) return 0;
    
    const distanceToPickup = calculateDistance(
      drone.location.latitude,
      drone.location.longitude,
      selectedOrder.pickupLocation.lat,
      selectedOrder.pickupLocation.lng
    );
    
    const deliveryDistance = calculateDistance(
      selectedOrder.pickupLocation.lat,
      selectedOrder.pickupLocation.lng,
      selectedOrder.deliveryLocation.lat,
      selectedOrder.deliveryLocation.lng
    );
    
    const totalDistance = distanceToPickup + deliveryDistance;
    return Math.round((totalDistance / 50) * 60); // Assume 50 km/h, convert to minutes
  };

  const getBatteryColor = (level: number) => {
    if (level <= 30) return 'text-red-500';
    if (level <= 50) return 'text-orange-500';
    return 'text-green-500';
  };

  const getReadinessColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (!selectedOrder) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span>Create Emergency Order</span>
          </DialogTitle>
          <DialogDescription>
            Convert order {selectedOrder.orderId} to emergency priority with immediate drone assignment
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {step === 1 && (
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Order Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Order ID:</strong> {selectedOrder.orderId}</p>
                  <p><strong>Customer:</strong> {selectedOrder.customerId.name}</p>
                  <p><strong>Phone:</strong> {selectedOrder.customerId.phone}</p>
                  <p><strong>Weight:</strong> {selectedOrder.totalWeight} kg</p>
                </div>
                <div>
                  <p><strong>Status:</strong> {selectedOrder.status}</p>
                  <p><strong>Items:</strong> {selectedOrder.items.length}</p>
                  <p><strong>Current ETA:</strong> {new Date(selectedOrder.estimatedDelivery).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Emergency Details Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="reason">Emergency Reason *</Label>
                <Select value={formData.reason} onValueChange={(value) => setFormData({...formData, reason: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select emergency reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medical_emergency">Medical Emergency</SelectItem>
                    <SelectItem value="critical_supplies">Critical Supplies</SelectItem>
                    <SelectItem value="disaster_response">Disaster Response</SelectItem>
                    <SelectItem value="time_sensitive">Time Sensitive Delivery</SelectItem>
                    <SelectItem value="customer_request">Customer Emergency Request</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="contactName">Emergency Contact Name</Label>
                  <Input
                    id="contactName"
                    value={formData.emergencyContact.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      emergencyContact: { ...formData.emergencyContact, name: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="contactPhone">Emergency Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    value={formData.emergencyContact.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      emergencyContact: { ...formData.emergencyContact, phone: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="relationship">Relationship</Label>
                  <Select 
                    value={formData.emergencyContact.relationship} 
                    onValueChange={(value) => setFormData({
                      ...formData,
                      emergencyContact: { ...formData.emergencyContact, relationship: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="family">Family Member</SelectItem>
                      <SelectItem value="caregiver">Caregiver</SelectItem>
                      <SelectItem value="organization">Organization</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button 
                onClick={() => setStep(2)} 
                disabled={!formData.reason}
                className="bg-red-600 hover:bg-red-700"
              >
                Next: Select Drone
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Available Emergency Drones</h3>
              <Badge variant="outline">{availableDrones.length} drones available</Badge>
            </div>

            {availableDrones.length === 0 ? (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <AlertDescription className="text-orange-700">
                  No emergency-capable drones available. The system will attempt to reassign from non-critical deliveries.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {availableDrones.map((drone) => (
                  <div
                    key={drone._id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedDrone === drone._id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedDrone(drone._id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Truck className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="font-medium">{drone.droneId}</p>
                            <p className="text-sm text-gray-600">{drone.model}</p>
                          </div>
                        </div>
                        {drone.isOptimal && (
                          <Badge className="bg-green-500">Optimal</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Battery className={`h-4 w-4 ${getBatteryColor(drone.batteryLevel)}`} />
                          <span className={getBatteryColor(drone.batteryLevel)}>
                            {drone.batteryLevel}%
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>{getEstimatedTime(drone)}m</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <div className={`w-3 h-3 rounded-full ${getReadinessColor(drone.readinessScore)}`}></div>
                          <span>{Math.round(drone.readinessScore)}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2 grid grid-cols-3 gap-4 text-xs text-gray-600">
                      <div>Max Payload: {drone.maxPayload} kg</div>
                      <div>Max Range: {drone.maxRange} km</div>
                      <div>Distance: {calculateDistance(
                        drone.location.latitude,
                        drone.location.longitude,
                        selectedOrder.pickupLocation.lat,
                        selectedOrder.pickupLocation.lng
                      ).toFixed(1)} km</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button 
                onClick={() => setStep(3)}
                className="bg-red-600 hover:bg-red-700"
                disabled={availableDrones.length > 0 && !selectedDrone}
              >
                Next: Confirm
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-700">
                <strong>Emergency Order Confirmation</strong><br />
                This action will immediately prioritize this order and may pause other non-critical deliveries.
              </AlertDescription>
            </Alert>

            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h3 className="font-semibold">Emergency Order Summary</h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Order:</strong> {selectedOrder.orderId}</p>
                  <p><strong>Customer:</strong> {selectedOrder.customerId.name}</p>
                  <p><strong>Reason:</strong> {formData.reason.replace('_', ' ').toUpperCase()}</p>
                </div>
                <div>
                  <p><strong>Emergency Contact:</strong> {formData.emergencyContact.name}</p>
                  <p><strong>Phone:</strong> {formData.emergencyContact.phone}</p>
                  {selectedDrone && availableDrones.length > 0 && (
                    <p><strong>Assigned Drone:</strong> {availableDrones.find(d => d._id === selectedDrone)?.droneId}</p>
                  )}
                </div>
              </div>

              {selectedDrone && availableDrones.length > 0 && (
                <div className="mt-4 p-3 bg-white rounded border">
                  <h4 className="font-medium mb-2">Selected Drone Details</h4>
                  {(() => {
                    const drone = availableDrones.find(d => d._id === selectedDrone);
                    if (!drone) return null;
                    
                    return (
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>Battery: {drone.batteryLevel}%</div>
                        <div>ETA: {getEstimatedTime(drone)} minutes</div>
                        <div>Readiness: {Math.round(drone.readinessScore)}%</div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button 
                onClick={handleSubmit}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                {loading ? 'Creating Emergency Order...' : 'Confirm Emergency Order'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EmergencyOrderModal;
