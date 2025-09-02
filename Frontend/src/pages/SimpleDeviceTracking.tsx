import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LiveMap } from '@/components/ui/LiveMap';
import type { LatLngExpression } from 'leaflet';
import { Search } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const SimpleDeviceTracking = () => {
  const [deviceId, setDeviceId] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [trackedLocation, setTrackedLocation] = useState<LatLngExpression | null>(null);
  const [isTrackingActive, setIsTrackingActive] = useState(false);

  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('locationUpdate', (data: { droneId: string; location: { latitude: number; longitude: number }; battery?: number }) => {
      if (isTrackingActive && data.droneId === deviceId) {
        setTrackedLocation([data.location.latitude, data.location.longitude]);
        if (data.battery !== undefined) {
          setBatteryLevel(data.battery);
        }
      }
    });

    return () => {
      newSocket.close();
    };
  }, [deviceId, isTrackingActive]);

  const handleStartTracking = () => {
    if (deviceId.trim()) {
      setIsTrackingActive(true);
      // Optionally, emit an event to the backend to indicate that this client is now tracking this deviceId
      // socket?.emit('startTracking', { deviceId });
    }
  };

  const handleStopTracking = () => {
    setIsTrackingActive(false);
    setTrackedLocation(null);
    // Optionally, emit an event to the backend to indicate that this client stopped tracking
    // socket?.emit('stopTracking', { deviceId });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Device Tracking</h2>
          <p className="text-muted-foreground mt-1">
            Track the real-time location of a device by its ID
          </p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Track Device</CardTitle>
            <CardDescription>
              Enter the device ID to see its current location on the map
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Enter Device ID..."
                  className="pl-9"
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStartTracking()}
                  disabled={isTrackingActive}
                />
              </div>
              {!isTrackingActive ? (
                <Button onClick={handleStartTracking}>
                  Start Tracking
                </Button>
              ) : (
                <Button onClick={handleStopTracking} variant="destructive">
                  Stop Tracking
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device Location</CardTitle>
            <CardDescription>
              Real-time location of the tracked device
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isTrackingActive && batteryLevel !== null && (
              <div className="p-4 text-center text-lg font-medium">
                Battery: {batteryLevel}%
              </div>
            )}
            <div className="h-[500px] rounded-b-lg">
              {isTrackingActive && trackedLocation ? (
                <LiveMap center={trackedLocation} zoom={15} />
              ) : (
                <div className="flex items-center justify-center h-full bg-muted">
                  <p className="text-muted-foreground">
                    {isTrackingActive ? 'Waiting for location data...' : 'Enter a Device ID and click "Start Tracking"'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SimpleDeviceTracking;
