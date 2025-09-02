import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';
import { BatteryCharging, MapPin } from 'lucide-react';

// Default Leaflet marker icons
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface DeviceLocationData {
  deviceId: string;
  name: string;
  location: { latitude: number; longitude: number };
  battery?: number;
}

interface Device {
  _id: string;
  deviceId: string;
  name: string;
  description?: string;
  lastKnownLocation?: { latitude: number; longitude: number };
  lastKnownBattery?: number;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: string;
}

// Component to update map view when center changes
const ChangeView = ({ center, zoom }: { center: L.LatLngExpression; zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const LiveDeviceMap = () => {
  const { user, getToken } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [liveLocations, setLiveLocations] = useState<Map<string, DeviceLocationData>>(new Map());
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch all registered devices on component mount
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const token = await getToken();
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/devices`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch devices');
        }
        const data: Device[] = await response.json();
        setDevices(data);

        // Initialize live locations with last known locations
        const initialLiveLocations = new Map<string, DeviceLocationData>();
        data.forEach(device => {
          if (device.lastKnownLocation) {
            initialLiveLocations.set(device.deviceId, {
              deviceId: device.deviceId,
              name: device.name,
              location: device.lastKnownLocation,
              battery: device.lastKnownBattery,
            });
          }
        });
        setLiveLocations(initialLiveLocations);
      } catch (error) {
        console.error('Error fetching devices for map:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin') {
      fetchDevices();
    }
  }, [user]);

  // Setup WebSocket connection for real-time updates
  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('locationUpdate', (data: DeviceLocationData) => {
      setLiveLocations(prevLocations => {
        const newMap = new Map(prevLocations);
        newMap.set(data.deviceId, data);
        return newMap;
      });
    });

    return () => {
      newSocket.close();
    };
  }, []);

  if (user?.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Access Denied: Only administrators can view live device map.</p>
        </div>
      </DashboardLayout>
    );
  }

  const initialCenter: L.LatLngExpression = [0, 0]; // Default center if no devices
  const mapCenter = liveLocations.size > 0 
    ? Array.from(liveLocations.values())[0].location 
    : initialCenter;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Live Device Map</h2>
          <p className="text-muted-foreground mt-1">
            Real-time tracking of all active devices.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Devices Location</CardTitle>
            <CardDescription>
              View the live positions and battery status of all registered devices.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[600px] rounded-b-lg">
              {loading ? (
                <div className="flex items-center justify-center h-full bg-muted">
                  <p className="text-muted-foreground">Loading devices...</p>
                </div>
              ) : liveLocations.size === 0 ? (
                <div className="flex items-center justify-center h-full bg-muted">
                  <p className="text-muted-foreground">No active devices to display.</p>
                </div>
              ) : (
                <MapContainer 
                  center={[mapCenter.latitude, mapCenter.longitude]} 
                  zoom={2} 
                  style={{ height: "100%", width: "100%" }}
                >
                  <ChangeView center={[mapCenter.latitude, mapCenter.longitude]} zoom={2} />
                  <TileLayer
                    attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {Array.from(liveLocations.values()).map(device => (
                    <Marker 
                      key={device.deviceId} 
                      position={[device.location.latitude, device.location.longitude]}
                    >
                      <Popup>
                        <div className="font-bold">{device.name} ({device.deviceId})</div>
                        <div><MapPin className="inline-block h-4 w-4 mr-1" />Lat: {device.location.latitude.toFixed(4)}, Lng: {device.location.longitude.toFixed(4)}</div>
                        {device.battery !== undefined && (
                          <div><BatteryCharging className="inline-block h-4 w-4 mr-1" />Battery: {device.battery}%</div>
                        )}
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default LiveDeviceMap;
