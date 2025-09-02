const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  googleId: String,
  name: String,
  email: { type: String, unique: true },
  password: { type: String, required: false },
  role: { type: String, enum: ["admin", "customer", "operator", "staff"], default: "customer" },
  profilePicture: {
    data: Buffer,
    contentType: String,
    filename: String,
    uploadDate: { type: Date, default: Date.now }
  },
  phone: String,
  address: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.pre('remove', async function(next) {
  // Clean up user data when user is removed
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
