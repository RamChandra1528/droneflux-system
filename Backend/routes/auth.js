const express = require('express');
const passport = require('../config/passport');
// const authController = require('../controllers/authController');
const router = express.Router();
const { register, login, googleCallback, logout } = require('../controllers/authController');

// Register
router.post('/register', register);
// Login
router.post('/login', login);
//Logout
router.post('/logout', logout);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login', failureMessage: true }), googleCallback);

module.exports = router;
