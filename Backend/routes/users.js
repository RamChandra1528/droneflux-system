const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');

// Get all users (admin only)
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { role, search } = req.query;
    let filter = {};
    
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(filter).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    // Users can view their own profile, admins can view any profile
    if (req.user.role !== 'admin' && req.params.id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    // Users can update their own profile, admins can update any profile
    if (req.user.role !== 'admin' && req.params.id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Don't allow role changes unless admin
    if (req.user.role !== 'admin' && req.body.role) {
      delete req.body.role;
    }
    
    // Don't allow password updates through this endpoint
    delete req.body.password;
    
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update user' });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get operators (for assignment purposes)
router.get('/role/operators', authenticateToken, requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const operators = await User.find({ role: 'operator' }).select('name email');
    res.json(operators);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch operators' });
  }
});

module.exports = router;
