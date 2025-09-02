const Drone = require('../models/Drone');
const FlightPath = require('../models/FlightPath');

// Create a new drone
exports.createDrone = async (req, res) => {
  try {
    const drone = new Drone(req.body);
    await drone.save();
    res.status(201).json(drone);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all drones
exports.getDrones = async (req, res) => {
  try {
    const drones = await Drone.find();
    res.json(drones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single drone by ID
exports.getDroneById = async (req, res) => {
  try {
    const drone = await Drone.findById(req.params.id);
    if (!drone) {
      return res.status(404).json({ error: 'Drone not found' });
    }
    res.json(drone);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a drone
exports.updateDrone = async (req, res) => {
  try {
    const drone = await Drone.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!drone) {
      return res.status(404).json({ error: 'Drone not found' });
    }
    res.json(drone);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a drone
exports.deleteDrone = async (req, res) => {
  try {
    const drone = await Drone.findByIdAndDelete(req.params.id);
    if (!drone) {
      return res.status(404).json({ error: 'Drone not found' });
    }
    res.json({ message: 'Drone deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update drone location
exports.updateDroneLocation = async (req, res) => {
  const { id } = req.params;
  const { location } = req.body;

  try {
    const drone = await Drone.findById(id);
    if (!drone) {
      return res.status(404).json({ error: 'Drone not found' });
    }

    const flightPath = new FlightPath({
      droneId: id,
      location,
    });

    await flightPath.save();

    // Emit location update via WebSocket
    req.io.emit('locationUpdate', { droneId: id, location });

    res.status(200).json({ message: 'Location updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
