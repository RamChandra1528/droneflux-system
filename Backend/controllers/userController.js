const User = require('../models/User');

// Get all users (admin only)
exports.getUsers = async (req, res) => {
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
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Users can view their own profile, admins can view any profile
    if (req.user.role !== 'admin' && id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Users can update their own profile, admins can update any profile
    if (req.user.role !== 'admin' && id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    
    // Don't allow role changes unless admin
    if (req.user.role !== 'admin' && req.body.role) {
      delete req.body.role;
    }
    
    // Don't allow password updates through this endpoint
    delete req.body.password;
    
    const user = await User.findByIdAndUpdate(
      id, 
      req.body, 
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get operators (for assignment purposes)
exports.getOperators = async (req, res) => {
  try {
    const operators = await User.find({ role: 'operator' }).select('name email');
    res.json({ success: true, data: operators });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    // Don't allow role changes through profile update
    delete req.body.role;
    
    // Don't allow password updates through this endpoint
    delete req.body.password;
    
    const user = await User.findByIdAndUpdate(
      req.user.id, 
      req.body, 
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get users by role
exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    
    // Only admins can get users by role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    
    const users = await User.find({ role }).select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get user statistics
exports.getUserStats = async (req, res) => {
  try {
    // Only admins can get user statistics
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    
    const totalUsers = await User.countDocuments();
    const customers = await User.countDocuments({ role: 'customer' });
    const operators = await User.countDocuments({ role: 'operator' });
    const staff = await User.countDocuments({ role: 'staff' });
    const admins = await User.countDocuments({ role: 'admin' });
    
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        totalUsers,
        customers,
        operators,
        staff,
        admins,
        roleBreakdown: stats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Update user with profile picture data
    user.profilePicture = {
      data: req.file.buffer,
      contentType: req.file.mimetype,
      filename: req.file.originalname,
      uploadDate: new Date()
    };

    await user.save();

    res.json({ 
      success: true, 
      message: 'Profile picture uploaded successfully',
      data: {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
        uploadDate: user.profilePicture.uploadDate
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get profile picture
exports.getProfilePicture = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID format' });
    }
    
    const user = await User.findById(id);

    if (!user || !user.profilePicture || !user.profilePicture.data) {
      return res.status(404).json({ success: false, error: 'Profile picture not found' });
    }

    res.set('Content-Type', user.profilePicture.contentType);
    res.set('Content-Disposition', `inline; filename="${user.profilePicture.filename}"`);
    res.send(user.profilePicture.data);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete profile picture
exports.deleteProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.profilePicture = undefined;
    await user.save();

    res.json({ 
      success: true, 
      message: 'Profile picture deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
