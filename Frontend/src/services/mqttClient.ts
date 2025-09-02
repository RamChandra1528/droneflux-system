// MQTT Client Service for Real-time Telemetry
// Note: This is a placeholder implementation since MQTT over WebSocket requires additional setup
// In production, you would use mqtt.js with WebSocket transport or Server-Sent Events

interface TelemetryData {
  droneId: string;
  timestamp: number;
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
  geofenceStatus: string;
  alerts: Array<{
    type: string;
    message: string;
    severity: string;
    timestamp: number;
  }>;
  orderId?: string;
}

type TelemetryCallback = (data: TelemetryData) => void;

class MQTTClientService {
  private callbacks: Map<string, TelemetryCallback[]> = new Map();
  private isConnected = false;
  private reconnectInterval: NodeJS.Timeout | null = null;
  private eventSource: EventSource | null = null;

  constructor() {
    this.connect();
  }

  // Connect to MQTT broker via WebSocket or fallback to polling
  connect() {
    try {
      // Use polling for telemetry updates
      this.startPollingFallback();
      
    } catch (error) {
      console.error('MQTT connection failed, using polling fallback:', error);
      this.startPollingFallback();
    }
  }

  // Fallback to HTTP polling for telemetry updates
  private startPollingFallback() {
    this.isConnected = true;
    
    // Poll for telemetry updates every 3 seconds
    const pollTelemetry = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('droneflux-token');
        const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const response = await fetch(`${baseUrl}/api/simulation/telemetry?limit=50&hours=1`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result = await response.json();
          const telemetryData = result.data;
          
          // Emit telemetry updates to subscribers
          telemetryData.forEach((data: any) => {
            const telemetry: TelemetryData = {
              droneId: data.droneId._id || data.droneId,
              timestamp: new Date(data.timestamp).getTime(),
              position: data.position,
              velocity: data.velocity,
              battery: data.battery,
              status: data.status,
              emergencyMode: data.emergencyMode,
              geofenceStatus: data.geofenceStatus,
              alerts: data.alerts || [],
              orderId: data.orderId
            };
            
            this.emitTelemetry(telemetry);
          });
        }
      } catch (error) {
        console.error('Error polling telemetry:', error);
      }
    };

    // Initial poll
    pollTelemetry();
    
    // Set up polling interval
    this.reconnectInterval = setInterval(pollTelemetry, 3000);
  }

  // Subscribe to telemetry updates for a specific drone
  subscribe(droneId: string, callback: TelemetryCallback) {
    if (!this.callbacks.has(droneId)) {
      this.callbacks.set(droneId, []);
    }
    this.callbacks.get(droneId)!.push(callback);
  }

  // Subscribe to all telemetry updates
  subscribeAll(callback: TelemetryCallback) {
    this.subscribe('*', callback);
  }

  // Unsubscribe from telemetry updates
  unsubscribe(droneId: string, callback: TelemetryCallback) {
    const callbacks = this.callbacks.get(droneId);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Emit telemetry data to subscribers
  private emitTelemetry(data: TelemetryData) {
    // Emit to specific drone subscribers
    const droneCallbacks = this.callbacks.get(data.droneId);
    if (droneCallbacks) {
      droneCallbacks.forEach(callback => callback(data));
    }

    // Emit to all subscribers
    const allCallbacks = this.callbacks.get('*');
    if (allCallbacks) {
      allCallbacks.forEach(callback => callback(data));
    }
  }

  // Disconnect from MQTT broker
  disconnect() {
    this.isConnected = false;
    
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.callbacks.clear();
  }

  // Get connection status
  getConnectionStatus() {
    return this.isConnected;
  }

  // Publish telemetry (for testing purposes)
  publish(topic: string, data: any) {
    console.log(`Publishing to ${topic}:`, data);
    // In a real MQTT implementation, this would publish to the broker
  }
}

// Singleton instance
export const mqttClient = new MQTTClientService();

export default MQTTClientService;
