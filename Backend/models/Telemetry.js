const mongoose = require('mongoose');

const telemetrySchema = new mongoose.Schema({
  droneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drone',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  position: {
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    },
    altitude: {
      type: Number,
      required: true,
      default: 0
    }
  },
  velocity: {
    speed: {
      type: Number,
      default: 0
    },
    heading: {
      type: Number,
      min: 0,
      max: 360,
      default: 0
    },
    verticalSpeed: {
      type: Number,
      default: 0
    }
  },
  battery: {
    level: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    voltage: {
      type: Number,
      default: 12.0
    },
    temperature: {
      type: Number,
      default: 25
    }
  },
  sensors: {
    gps: {
      accuracy: {
        type: Number,
        default: 3.0
      },
      satellites: {
        type: Number,
        default: 8
      }
    },
    weather: {
      windSpeed: {
        type: Number,
        default: 0
      },
      windDirection: {
        type: Number,
        default: 0
      },
      temperature: {
        type: Number,
        default: 20
      },
      humidity: {
        type: Number,
        default: 50
      }
    }
  },
  status: {
    type: String,
    enum: ['idle', 'takeoff', 'flying', 'delivering', 'returning', 'landing', 'emergency', 'maintenance'],
    default: 'idle'
  },
  emergencyMode: {
    type: Boolean,
    default: false
  },
  geofenceStatus: {
    type: String,
    enum: ['inside', 'warning', 'violation'],
    default: 'inside'
  },
  alerts: [{
    type: {
      type: String,
      enum: ['battery_low', 'weather_warning', 'geofence_violation', 'obstacle_detected', 'system_failure']
    },
    message: String,
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'info'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  collection: 'telemetry'
});

// Index for efficient queries
telemetrySchema.index({ droneId: 1, timestamp: -1 });
telemetrySchema.index({ orderId: 1 });
telemetrySchema.index({ timestamp: -1 });

module.exports = mongoose.model('Telemetry', telemetrySchema);
