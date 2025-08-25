import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Square, 
  AlertTriangle, 
  Battery, 
  Navigation,
  Zap,
  MapPin
} from 'lucide-react';

interface DronePosition {
  droneId: string;
  model: string;
  position: {
    latitude: number;
    longitude: number;
    altitude: number;
  };
  velocity: {
    speed: number;
    heading: number;
    verticalSpeed: number;
  };
  battery: {
    level: number;
    voltage: number;
    temperature: number;
  };
  status: string;
  emergencyMode: boolean;
  orderId?: string;
  alerts: Array<{
    type: string;
    message: string;
    severity: string;
    timestamp: number;
  }>;
  geofenceStatus: string;
}

interface SimulationStatus {
  isRunning: boolean;
  activeDrones: number;
  emergencyDrones: number;
  lowBatteryDrones: number;
  simulations: DronePosition[];
}

const DroneSimulationMap: React.FC = () => {
  const [simulationStatus, setSimulationStatus] = useState<SimulationStatus | null>(null);
  const [selectedDrone, setSelectedDrone] = useState<DronePosition | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 });
  const [mapZoom, setMapZoom] = useState(12);
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch simulation status
  const fetchSimulationStatus = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('droneflux-token');
      const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/simulation/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSimulationStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching simulation status:', error);
    }
  };

  // Start simulation
  const startSimulation = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('droneflux-token');
      const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/simulation/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchSimulationStatus();
        startPolling();
      }
    } catch (error) {
      console.error('Error starting simulation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Stop simulation
  const stopSimulation = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('droneflux-token');
      const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/simulation/stop`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchSimulationStatus();
        stopPolling();
      }
    } catch (error) {
      console.error('Error stopping simulation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Start polling for updates
  const startPolling = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(fetchSimulationStatus, 3000);
  };

  // Stop polling
  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Set emergency mode for drone
  const setEmergencyMode = async (droneId: string, emergency: boolean) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('droneflux-token');
      const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/simulation/drones/${droneId}/emergency`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ emergency })
      });

      if (response.ok) {
        await fetchSimulationStatus();
      }
    } catch (error) {
      console.error('Error setting emergency mode:', error);
    }
  };

  useEffect(() => {
    fetchSimulationStatus();
    return () => stopPolling();
  }, []);

  useEffect(() => {
    if (simulationStatus?.isRunning) {
      startPolling();
    } else {
      stopPolling();
    }
  }, [simulationStatus?.isRunning]);

  const getStatusColor = (status: string) => {
    const colors = {
      idle: 'bg-gray-500',
      takeoff: 'bg-blue-500',
      flying: 'bg-green-500',
      delivering: 'bg-orange-500',
      returning: 'bg-purple-500',
      landing: 'bg-yellow-500',
      emergency: 'bg-red-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-green-600';
    if (level > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderSimpleMap = () => {
    if (!simulationStatus?.simulations.length) {
      return (
        <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No active drones to display</p>
          </div>
        </div>
      );
    }

    return (
      <div className="h-96 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-4 relative overflow-hidden">
        {/* Map Grid Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
            {Array.from({ length: 48 }).map((_, i) => (
              <div key={i} className="border border-gray-300"></div>
            ))}
          </div>
        </div>

        {/* Geofence Circle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                        w-80 h-80 border-2 border-dashed border-blue-400 rounded-full opacity-50"></div>

        {/* Drones */}
        {simulationStatus.simulations.map((drone, index) => {
          // Convert lat/lng to relative positions on the map
          const x = ((drone.position.longitude + 74.0060) * 1000) % 100;
          const y = ((drone.position.latitude - 40.7128) * 1000) % 100;
          
          return (
            <div
              key={drone.droneId}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer
                         transition-all duration-300 hover:scale-110 z-10`}
              style={{
                left: `${Math.max(10, Math.min(90, 50 + x * 0.4))}%`,
                top: `${Math.max(10, Math.min(90, 50 - y * 0.4))}%`
              }}
              onClick={() => setSelectedDrone(drone)}
            >
              {/* Drone Icon */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center
                             ${getStatusColor(drone.status)} text-white shadow-lg
                             ${drone.emergencyMode ? 'animate-pulse ring-4 ring-red-400' : ''}`}>
                <Navigation 
                  className="h-4 w-4" 
                  style={{ transform: `rotate(${drone.velocity.heading}deg)` }}
                />
              </div>
              
              {/* Drone Label */}
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 
                             bg-white px-2 py-1 rounded text-xs shadow-md whitespace-nowrap">
                {drone.model}
              </div>

              {/* Flight Path Trail */}
              <div className={`absolute w-1 h-1 rounded-full ${getStatusColor(drone.status)} 
                             opacity-60 -top-2 -left-2`}></div>
            </div>
          );
        })}

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-md">
          <h4 className="font-semibold text-sm mb-2">Status Legend</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Flying</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span>Delivering</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
              <span>Emergency</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Simulation Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Drone Simulation Control
            </CardTitle>
            <div className="flex gap-2">
              {!simulationStatus?.isRunning ? (
                <Button 
                  onClick={startSimulation} 
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Simulation
                </Button>
              ) : (
                <Button 
                  onClick={stopSimulation} 
                  disabled={isLoading}
                  variant="destructive"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop Simulation
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {simulationStatus && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {simulationStatus.activeDrones}
                </div>
                <div className="text-sm text-gray-600">Active Drones</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {simulationStatus.emergencyDrones}
                </div>
                <div className="text-sm text-gray-600">Emergency Mode</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {simulationStatus.lowBatteryDrones}
                </div>
                <div className="text-sm text-gray-600">Low Battery</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${simulationStatus.isRunning ? 'text-green-600' : 'text-gray-600'}`}>
                  {simulationStatus.isRunning ? 'RUNNING' : 'STOPPED'}
                </div>
                <div className="text-sm text-gray-600">Status</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Map */}
      <Card>
        <CardHeader>
          <CardTitle>Live Drone Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          {renderSimpleMap()}
        </CardContent>
      </Card>

      {/* Drone List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Drones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {simulationStatus?.simulations.map((drone) => (
              <div 
                key={drone.droneId}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md
                           ${selectedDrone?.droneId === drone.droneId ? 'border-blue-500 bg-blue-50' : ''}`}
                onClick={() => setSelectedDrone(drone)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(drone.status)}`}></div>
                    <div>
                      <div className="font-medium">{drone.model}</div>
                      <div className="text-sm text-gray-600">
                        {drone.position.latitude.toFixed(6)}, {drone.position.longitude.toFixed(6)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Battery className={`h-4 w-4 ${getBatteryColor(drone.battery.level)}`} />
                      <span className={`text-sm ${getBatteryColor(drone.battery.level)}`}>
                        {drone.battery.level.toFixed(1)}%
                      </span>
                    </div>
                    
                    <Badge variant={drone.emergencyMode ? "destructive" : "secondary"}>
                      {drone.status}
                    </Badge>
                    
                    {drone.emergencyMode && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                    
                    <Button
                      size="sm"
                      variant={drone.emergencyMode ? "destructive" : "outline"}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEmergencyMode(drone.droneId, !drone.emergencyMode);
                      }}
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      {drone.emergencyMode ? 'Disable' : 'Emergency'}
                    </Button>
                  </div>
                </div>
                
                {drone.alerts.length > 0 && (
                  <div className="mt-2 pt-2 border-t">
                    <div className="text-sm text-gray-600 mb-1">Active Alerts:</div>
                    <div className="flex flex-wrap gap-1">
                      {drone.alerts.map((alert, index) => (
                        <Badge 
                          key={index} 
                          variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {alert.message}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {!simulationStatus?.simulations.length && (
              <div className="text-center py-8 text-gray-500">
                No active drones in simulation
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected Drone Details */}
      {selectedDrone && (
        <Card>
          <CardHeader>
            <CardTitle>Drone Details - {selectedDrone.model}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Position */}
              <div>
                <h4 className="font-semibold mb-2">Position</h4>
                <div className="space-y-1 text-sm">
                  <div>Lat: {selectedDrone.position.latitude.toFixed(6)}</div>
                  <div>Lng: {selectedDrone.position.longitude.toFixed(6)}</div>
                  <div>Alt: {selectedDrone.position.altitude.toFixed(1)}m</div>
                </div>
              </div>
              
              {/* Velocity */}
              <div>
                <h4 className="font-semibold mb-2">Velocity</h4>
                <div className="space-y-1 text-sm">
                  <div>Speed: {selectedDrone.velocity.speed.toFixed(1)} m/s</div>
                  <div>Heading: {selectedDrone.velocity.heading.toFixed(0)}°</div>
                  <div>V-Speed: {selectedDrone.velocity.verticalSpeed.toFixed(1)} m/s</div>
                </div>
              </div>
              
              {/* Battery */}
              <div>
                <h4 className="font-semibold mb-2">Battery</h4>
                <div className="space-y-1 text-sm">
                  <div className={getBatteryColor(selectedDrone.battery.level)}>
                    Level: {selectedDrone.battery.level.toFixed(1)}%
                  </div>
                  <div>Voltage: {selectedDrone.battery.voltage.toFixed(1)}V</div>
                  <div>Temp: {selectedDrone.battery.temperature.toFixed(1)}°C</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DroneSimulationMap;
