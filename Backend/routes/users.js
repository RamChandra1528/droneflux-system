const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');

// Get all users (admin only)
router.get('/', authenticateToken, requireRole(['admin']), userController.getUsers);

// Get user profile
router.get('/profile', authenticateToken, userController.getProfile);

// Get user by ID
router.get('/:id', authenticateToken, userController.getUserById);

// Update user profile
router.put('/profile', authenticateToken, userController.updateProfile);

// Update user
router.put('/:id', authenticateToken, userController.updateUser);

// Delete user (admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), userController.deleteUser);

// Get operators (for assignment purposes)
router.get('/role/operators', authenticateToken, requireRole(['admin', 'operator']), userController.getOperators);

// Get users by role (admin only)
router.get('/role/:role', authenticateToken, requireRole(['admin']), userController.getUsersByRole);

// Get user statistics (admin only)
router.get('/stats/overview', authenticateToken, requireRole(['admin']), userController.getUserStats);

// Profile picture routes
router.post('/profile/picture', authenticateToken, upload.single('profilePicture'), userController.uploadProfilePicture);
router.get('/profile/picture/:id', userController.getProfilePicture);
router.delete('/profile/picture', authenticateToken, userController.deleteProfilePicture);

module.exports = router;
