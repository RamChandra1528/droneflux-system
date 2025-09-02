import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const DeviceTracking = () => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [droneId, setDroneId] = useState('');
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000');
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    let watchId: number;

    if (isTracking && socket) {
      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const batteryInfo = await navigator.getBattery();
          const batteryPercentage = Math.round(batteryInfo.level * 100);
          socket.emit('updateLocation', { droneId, location: { latitude, longitude }, battery: batteryPercentage });
        },
        (error) => {
          console.error('Error getting location', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isTracking, socket, droneId]);

  const handleStartTracking = () => {
    if (droneId.trim()) {
      setIsTracking(true);
    }
  };

  const handleStopTracking = () => {
    setIsTracking(false);
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Device Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Enter Drone ID"
              value={droneId}
              onChange={(e) => setDroneId(e.target.value)}
              disabled={isTracking}
            />
            {!isTracking ? (
              <Button onClick={handleStartTracking} className="w-full">
                Start Tracking
              </Button>
            ) : (
              <Button onClick={handleStopTracking} className="w-full" variant="destructive">
                Stop Tracking
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeviceTracking;
