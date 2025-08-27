const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { email, password, name, userType } = req.body; // Accept userType
    const user = await User.create({ email, password, name, role: userType || "customer" });
    const { password: pw, ...userData } = user.toObject();
    res.status(201).json({ message: 'User registered', user: userData });
  } catch (err) {
    res.status(400).json({ error: "Registration failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, userType } = req.body; // Accept userType
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    // Check userType matches the user's role
    if (userType && user.role !== userType) {
      return res.status(403).json({ error: 'User type does not match' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const { password: pw, ...userData } = user.toObject();
    res.json({ token, user: userData });
  } catch (err) {
    res.status(400).json({ error: "Login failed" });
  }
};

exports.logout = (req, res) => {
  req.logout(function(err) {
    if (err) { return res.status(500).json({ error: 'Logout failed' }); }
    req.session.destroy(() => {
      res.clearCookie('connect.sid'); // Optional: clear session cookie
      res.json({ message: 'Logged out successfully' });
    });
  });
};

exports.googleCallback = (req, res) => {
  // User is attached to req.user by Passport
  const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  // Encode user info as a URI component
  const user = encodeURIComponent(JSON.stringify({
    _id: req.user._id,
    email: req.user.email,
    name: req.user.name,
    role: req.user.role || "admin" // add role if you use it
  }));
  const redirectUrl = `${process.env.FRONTEND_URL}/auth/success?token=${token}&user=${user}`;
  console.log('Redirecting to:', redirectUrl);
  // Redirect to frontend route with token and user info
  res.redirect(redirectUrl);
};

