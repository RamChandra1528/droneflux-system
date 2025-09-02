const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Local Strategy
passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return done(null, false, { message: 'Invalid credentials' });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'https://droneflux-system-dbd9.vercel.app/api/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user exists with Google ID
    let user = await User.findOne({ googleId: profile.id });

    if (user) {
      return done(null, user); // User found, return them
    }

    // If not, check if user exists with the email from Google
    user = await User.findOne({ email: profile.emails[0].value });

    if (user) {
      // User exists with email, but not linked to Google. Link them.
      user.googleId = profile.id;
      user.name = user.name || profile.displayName; // Update name if it was empty
      await user.save();
      return done(null, user);
    }

    // No user found with googleId or email, create a new user.
    user = await User.create({
      googleId: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
    });
    return done(null, user);

  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
