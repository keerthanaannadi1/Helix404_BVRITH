const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const ALLOWED_EMAIL_DOMAIN = '@bvrithyderabad.edu.in';
const DEFAULT_ADMIN_EMAIL = 'slesha@bvrithyderabad.edu.in';
const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS || DEFAULT_ADMIN_EMAIL)
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
);

const isAllowedCollegeEmail = (email = '') =>
  email.toLowerCase().endsWith(ALLOWED_EMAIL_DOMAIN);
const getRoleForEmail = (email = '') =>
  ADMIN_EMAILS.has(email.toLowerCase()) ? 'admin' : 'faculty';

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value.toLowerCase();
      
      // Validate email domain
      if (!isAllowedCollegeEmail(email)) {
        return done(null, false, { message: 'Only @bvrithyderabad.edu.in emails allowed' });
      }

      const role = getRoleForEmail(email);

      // Find or create user
      let user = await User.findOne({ where: { email } });
      
      if (!user) {
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: email,
          role
        });
      } else {
        const updates = {};
        if (user.googleId !== profile.id) updates.googleId = profile.id;
        if (user.role !== role) updates.role = role;
        if (Object.keys(updates).length > 0) {
          await user.update(updates);
        }
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

// Initiate Google OAuth
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`
  }),
  (req, res) => {
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: req.user.id, 
        email: req.user.email, 
        role: req.user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// Temporary domain-based login without Google OAuth redirect.
router.post('/domain-login', async (req, res) => {
  try {
    const rawEmail = req.body?.email;
    const rawName = req.body?.name;
    const email = rawEmail?.toLowerCase()?.trim();

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (!isAllowedCollegeEmail(email)) {
      return res.status(403).json({
        message: 'Only @bvrithyderabad.edu.in emails are allowed'
      });
    }

    const nameFromEmail = email.split('@')[0];
    const providedName = typeof rawName === 'string' ? rawName.trim() : '';
    const name = providedName || nameFromEmail;
    const role = getRoleForEmail(email);

    let user = await User.findOne({ where: { email } });

    if (!user) {
      user = await User.create({
        googleId: `manual:${email}`,
        name,
        email,
        role
      });
    } else if (user.role !== role) {
      await user.update({ role });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['googleId'] }
    });
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
