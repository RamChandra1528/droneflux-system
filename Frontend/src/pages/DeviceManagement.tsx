import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Trash2, PlusCircle } from 'lucide-react';

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

const DeviceManagement = () => {
  const { toast } = useToast();
  const { user, getToken } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [newDeviceId, setNewDeviceId] = useState('');
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceDescription, setNewDeviceDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingDevice, setAddingDevice] = useState(false);

  const fetchDevices = async () => {
    setLoading(true);
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
      const data = await response.json();
      setDevices(data);
    } catch (error) {
      console.error('Error fetching devices:', error);
      toast({
        title: 'Error',
        description: 'Failed to load devices.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDevice = async () => {
    if (!newDeviceId.trim() || !newDeviceName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Device ID and Name are required.',
        variant: 'destructive',
      });
      return;
    }

    setAddingDevice(true);
    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/devices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          deviceId: newDeviceId,
          name: newDeviceName,
          description: newDeviceDescription,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to add device');
      }

      toast({
        title: 'Success',
        description: 'Device added successfully.',
      });
      setNewDeviceId('');
      setNewDeviceName('');
      setNewDeviceDescription('');
      fetchDevices(); // Refresh the list
    } catch (error: any) {
      console.error('Error adding device:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add device.',
        variant: 'destructive',
      });
    } finally {
      setAddingDevice(false);
    }
  };

  const handleDeleteDevice = async (id: string) => {
    if (!confirm('Are you sure you want to delete this device?')) {
      return;
    }

    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/devices/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to delete device');
      }

      toast({
        title: 'Success',
        description: 'Device deleted successfully.',
      });
      fetchDevices(); // Refresh the list
    } catch (error: any) {
      console.error('Error deleting device:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete device.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchDevices();
    }
  }, [user]);

  if (user?.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Access Denied: Only administrators can manage devices.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Device Management</h2>
          <p className="text-muted-foreground mt-1">
            Add, view, and remove tracking devices.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add New Device</CardTitle>
            <CardDescription>Register a new device to be tracked.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Device ID (e.g., DEVICE-001)"
                value={newDeviceId}
                onChange={(e) => setNewDeviceId(e.target.value)}
                disabled={addingDevice}
              />
              <Input
                placeholder="Device Name (e.g., Cellphone A)"
                value={newDeviceName}
                onChange={(e) => setNewDeviceName(e.target.value)}
                disabled={addingDevice}
              />
              <Input
                placeholder="Description (Optional)"
                value={newDeviceDescription}
                onChange={(e) => setNewDeviceDescription(e.target.value)}
                disabled={addingDevice}
              />
            </div>
            <Button onClick={handleAddDevice} className="mt-4" disabled={addingDevice}>
              <PlusCircle className="mr-2 h-4 w-4" /> {addingDevice ? 'Adding...' : 'Add Device'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registered Devices</CardTitle>
            <CardDescription>List of all devices currently registered in the system.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading devices...</p>
            ) : devices.length === 0 ? (
              <p>No devices registered yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Device ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Location</TableHead>
                      <TableHead>Battery</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {devices.map((device) => (
                      <TableRow key={device._id}>
                        <TableCell className="font-medium">{device.deviceId}</TableCell>
                        <TableCell>{device.name}</TableCell>
                        <TableCell>{device.status}</TableCell>
                        <TableCell>
                          {device.lastKnownLocation ? 
                            `${device.lastKnownLocation.latitude.toFixed(4)}, ${device.lastKnownLocation.longitude.toFixed(4)}` : 
                            'N/A'
                          }
                        </TableCell>
                        <TableCell>
                          {device.lastKnownBattery !== undefined ? `${device.lastKnownBattery}%` : 'N/A'}
                        </TableCell>
                        <TableCell>{new Date(device.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDeleteDevice(device._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DeviceManagement;
