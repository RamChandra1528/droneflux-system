const Device = require('../models/Device');

// Add a new device
exports.addDevice = async (req, res) => {
  try {
    const { deviceId, name, description } = req.body;

    // Check if deviceId already exists
    let device = await Device.findOne({ deviceId });
    if (device) {
      return res.status(400).json({ msg: 'Device with this ID already exists' });
    }

    device = new Device({
      deviceId,
      name,
      description,
    });

    await device.save();
    res.status(201).json(device);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get all devices
exports.getDevices = async (req, res) => {
  try {
    const devices = await Device.find();
    res.json(devices);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get a single device by ID
exports.getDeviceById = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ msg: 'Device not found' });
    }
    res.json(device);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Device not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Update device information
exports.updateDevice = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    let device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ msg: 'Device not found' });
    }

    device.name = name || device.name;
    device.description = description || device.description;
    device.status = status || device.status;

    await device.save();
    res.json(device);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Delete a device
exports.deleteDevice = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ msg: 'Device not found' });
    }

    await device.deleteOne();
    res.json({ msg: 'Device removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
