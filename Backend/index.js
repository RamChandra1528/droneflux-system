require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');

// Import emergency services
const EmergencyService = require('./services/emergencyService');
const LiveTrackingService = require('./services/liveTrackingService');
// const NotificationService = require('./services/notificationService'); // Removed

const app = express();
const server = http.createServer(app);

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CORS_ORIGINS?.split(',') || process.env.FRONTEND_URL
    : process.env.FRONTEND_URL || "http://localhost:8081",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.CORS_ORIGINS?.split(',') || process.env.FRONTEND_URL
      : process.env.FRONTEND_URL || "http://localhost:8081",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Session middleware - only for non-serverless environments
if (process.env.VERCEL !== '1') {
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27017/droneflux',
      touchAfter: 24 * 3600 // lazy session update
    }),
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
  }));
}

// Passport middleware - only for non-serverless environments
if (process.env.VERCEL !== '1') {
  app.use(passport.initialize());
  app.use(passport.session());
}

// Database connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/droneflux')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Initialize emergency services
let liveTrackingService;

// Make io available to routes
app.set('io', io);

// Initialize services after io is created and attach to app
liveTrackingService = new LiveTrackingService(io);
app.set('liveTrackingService', liveTrackingService);

app.get('/', (req, res)=>{
  res.send('API is running...');
})

// Routes - MUST be loaded after services are attached to the app
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/drones', require('./routes/drones'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/emergency', require('./routes/emergency'));
app.use('/api/simulation', require('./routes/simulation'));
// app.use('/api/notifications', require('./routes/notificationRoutes')); // Removed notification system

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join tracking room for specific order
  socket.on('join-tracking', (orderId) => {
    socket.join(`order-${orderId}`);
    console.log(`Client ${socket.id} joined tracking room for order ${orderId}`);
  });

  // Join drone tracking room
  socket.on('join-drone-tracking', (droneId) => {
    socket.join(`drone-${droneId}`);
    console.log(`Client ${socket.id} joined drone tracking room ${droneId}`);
  });

  // Join emergency tracking room
  socket.on('join-emergency-tracking', (orderId) => {
    socket.join(`emergency-order-${orderId}`);
    console.log(`Client ${socket.id} joined emergency tracking room for order ${orderId}`);
  });

  // Handle order status updates
  socket.on('order-status-update', (data) => {
    io.to(`order-${data.orderId}`).emit('order-updated', data);
  });

  // Handle drone location updates
  socket.on('drone-location-update', (data) => {
    io.to(`drone-${data.droneId}`).emit('drone-location-updated', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});


// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Graceful shutdown logic for local development
const gracefulShutdown = () => {
  console.log('Shutting down gracefully');
  if (liveTrackingService) {
    liveTrackingService.cleanup();
  }
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// For local development, start the server.
// On Vercel, the server object is exported and Vercel handles the listening.
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the server instance for Vercel.
module.exports = server;


