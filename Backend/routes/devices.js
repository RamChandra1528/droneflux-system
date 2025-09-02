const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const auth = require('../middlewares/authMiddleware');
const admin = require('../middlewares/adminMiddleware');

// @route   POST api/devices
// @desc    Add new device
// @access  Private (Admin only)
router.post('/', [auth, admin], deviceController.addDevice);

// @route   GET api/devices
// @desc    Get all devices
// @access  Private (Admin only)
router.get('/', [auth, admin], deviceController.getDevices);

// @route   GET api/devices/:id
// @desc    Get device by ID
// @access  Private (Admin only)
router.get('/:id', [auth, admin], deviceController.getDeviceById);

// @route   PUT api/devices/:id
// @desc    Update device
// @access  Private (Admin only)
router.put('/:id', [auth, admin], deviceController.updateDevice);

// @route   DELETE api/devices/:id
// @desc    Delete device
// @access  Private (Admin only)
router.delete('/:id', [auth, admin], deviceController.deleteDevice);

module.exports = router;
