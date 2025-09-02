require('dotenv').config();
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('FRONTEND2_URL:', process.env.FRONTEND2_URL);
const express = require('express');
const session = require('express-session');
const passport = require('./config/passport');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const droneRoutes = require('./routes/drones');
const deviceRoutes = require('./routes/devices');
const cors = require('cors');
const http = require('http');
const initSocketServer = require('./websockets/socketServer');

const app = express();
const server = http.createServer(app);
const io = initSocketServer(server);

app.set('socketio', io);

connectDB();

app.use(express.json());
app.use(session({ secret: process.env.SESSION_SECRET || 'secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use(cors({
  origin: [process.env.FRONTEND_URL, process.env.FRONTEND2_URL, 'http://172.16.0.2:8080'], // or your frontend URL
  credentials: true
}));

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/drones', droneRoutes);
app.use('/api/devices', deviceRoutes);

app.get('/', (req, res) => res.send('API Running'));

const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => console.log(`Server started on port ${PORT}`));

module.exports = app;

