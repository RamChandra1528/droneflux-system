import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Activity, 
  Battery, 
  AlertTriangle, 
  Clock, 
  TrendingUp,
  Download
} from 'lucide-react';

interface TelemetryAnalytics {
  flightTimeStats: Array<{
    _id: string;
    totalFlightTime: number;
    avgSpeed: number;
    maxAltitude: number;
    minBattery: number;
  }>;
  alertStats: Array<{
    _id: string;
    count: number;
    severity: string;
  }>;
  geofenceViolations: number;
  timeRange: {
    start: string;
    end: string;
    hours: number;
  };
}

const TelemetryAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<TelemetryAnalytics | null>(null);
  const [timeRange, setTimeRange] = useState(24);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('droneflux-token');
      const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/simulation/analytics?hours=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const exportData = () => {
    if (!analytics) return;
    
    const dataStr = JSON.stringify(analytics, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `telemetry-analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getAlertColor = (type: string) => {
    const colors: { [key: string]: string } = {
      battery_low: '#ef4444',
      weather_warning: '#f59e0b',
      geofence_violation: '#dc2626',
      obstacle_detected: '#f97316',
      system_failure: '#7c3aed'
    };
    return colors[type] || '#6b7280';
  };

  const formatFlightTimeData = () => {
    if (!analytics?.flightTimeStats) return [];
    
    return analytics.flightTimeStats.map((stat, index) => ({
      drone: `Drone ${index + 1}`,
      flightTime: Math.round(stat.totalFlightTime * 2 / 60), // Convert to minutes
      avgSpeed: Math.round(stat.avgSpeed * 10) / 10,
      maxAltitude: Math.round(stat.maxAltitude),
      minBattery: Math.round(stat.minBattery)
    }));
  };

  const formatAlertData = () => {
    if (!analytics?.alertStats) return [];
    
    return analytics.alertStats.map(alert => ({
      name: alert._id.replace('_', ' ').toUpperCase(),
      value: alert.count,
      fill: getAlertColor(alert._id)
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Telemetry Analytics</h2>
          <p className="text-gray-600">
            Analysis for the last {timeRange} hours
          </p>
        </div>
        <div className="flex gap-2">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="px-3 py-2 border rounded-md"
          >
            <option value={1}>Last Hour</option>
            <option value={6}>Last 6 Hours</option>
            <option value={24}>Last 24 Hours</option>
            <option value={168}>Last Week</option>
          </select>
          <Button onClick={exportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">
                  {analytics?.flightTimeStats?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Active Drones</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold">
                  {analytics?.alertStats?.reduce((sum, alert) => sum + alert.count, 0) || 0}
                </div>
                <div className="text-sm text-gray-600">Total Alerts</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">
                  {analytics?.geofenceViolations || 0}
                </div>
                <div className="text-sm text-gray-600">Geofence Violations</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {Math.round((analytics?.flightTimeStats?.reduce((sum, stat) => sum + stat.totalFlightTime, 0) || 0) * 2 / 60)}
                </div>
                <div className="text-sm text-gray-600">Total Flight Minutes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Flight Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Flight Performance by Drone</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formatFlightTimeData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="drone" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="flightTime" fill="#3b82f6" name="Flight Time (min)" />
              <Bar dataKey="avgSpeed" fill="#10b981" name="Avg Speed (m/s)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Alert Distribution */}
      {analytics?.alertStats && analytics.alertStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Alert Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={formatAlertData()}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {formatAlertData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="space-y-3">
                <h4 className="font-semibold">Alert Details</h4>
                {analytics.alertStats.map((alert) => (
                  <div key={alert._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: getAlertColor(alert._id) }}
                      ></div>
                      <span className="capitalize">
                        {alert._id.replace('_', ' ')}
                      </span>
                    </div>
                    <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                      {alert.count}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Battery Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Battery Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={formatFlightTimeData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="drone" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="minBattery" fill="#ef4444" name="Min Battery %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Altitude Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Maximum Altitude Reached</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={formatFlightTimeData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="drone" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="maxAltitude" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                name="Max Altitude (m)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {!analytics && (
        <Card>
          <CardContent className="p-8 text-center">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No telemetry data available for the selected time range.</p>
            <p className="text-sm text-gray-500 mt-2">Start the drone simulation to begin collecting data.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TelemetryAnalytics;
