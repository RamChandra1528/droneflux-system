const FlightPath = require('../models/FlightPath');
const Device = require('../models/Device');

const onlineUsers = new Map();

const socketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join', (userId) => {
      onlineUsers.set(userId, socket.id);
      console.log(`User ${userId} joined with socket ID ${socket.id}`);
    });

    socket.on('updateLocation', async (data) => {
      const { droneId, location, battery } = data;
      console.log(`Received location update for device ${droneId}:`, location, `Battery: ${battery}%`);

      try {
        let device = await Device.findOne({ deviceId: droneId });

        if (device) {
          device.lastKnownLocation = location;
          device.lastKnownBattery = battery;
          device.status = 'active';
          await device.save();
          console.log(`Updated device ${droneId} location and battery.`);
        } else {
          console.warn(`Device with ID ${droneId} not found. Creating a new one.`);
          device = new Device({
            deviceId: droneId,
            name: `Device ${droneId}`,
            lastKnownLocation: location,
            lastKnownBattery: battery,
            status: 'active',
          });
          await device.save();
        }
        
        // Broadcast the location update to all connected clients
        io.emit('locationUpdate', { 
          deviceId: droneId, 
          location, 
          battery, 
          name: device.name 
        });
      } catch (error) {
        console.error('Error updating device location:', error);
      }
    });

    socket.on('disconnect', () => {
      for (let [userId, id] of onlineUsers.entries()) {
        if (id === socket.id) {
          onlineUsers.delete(userId);
          console.log(`User ${userId} disconnected`);
          break;
        }
      }
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketHandlers;
