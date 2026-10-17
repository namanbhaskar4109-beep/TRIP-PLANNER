import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { getAtlasStatus, connectToDatabase } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  loginRateLimiter,
  registerRateLimiter,
  passwordResetRateLimiter,
} from '../middleware/rateLimiter.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secure_jwt_token_secret_trip_planner_atlas_2025';

// Cookie configuration options
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

/**
 * Generate standard JWT token for user
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Helper to validate email format with RFC 5322 compatible regex
 */
function isValidEmail(email) {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return typeof email === 'string' && re.test(email.trim());
}

/**
 * GET /api/auth/atlas-status
 * Live check of MongoDB Atlas connection health & diagnostics
 */
router.get('/atlas-status', async (req, res) => {
  try {
    const status = await getAtlasStatus();
    res.json({
      success: true,
      data: status,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve MongoDB Atlas status',
      error: err.message,
    });
  }
});

/**
 * POST /api/auth/test-atlas
 * Test connecting to a specific MongoDB Atlas connection string
 */
router.post('/test-atlas', async (req, res) => {
  const { uri } = req.body;
  if (!uri) {
    return res.status(400).json({
      success: false,
      message: 'MongoDB Atlas URI is required.',
    });
  }

  const success = await connectToDatabase(uri);
  const status = await getAtlasStatus();

  if (success) {
    return res.json({
      success: true,
      message: 'Successfully connected to MongoDB Atlas cluster!',
      data: status,
    });
  } else {
    return res.status(400).json({
      success: false,
      message: status.error || 'Failed to connect to MongoDB Atlas cluster.',
      data: status,
    });
  }
});

/**
 * POST /api/auth/register
 * Create a new user account in MongoDB Atlas
 */
router.post('/register', registerRateLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validate fields
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid full name (at least 2 characters).',
      });
    }

    if (name.trim().length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Name cannot exceed 50 characters.',
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address (e.g. name@example.com).',
      });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    if (password.length > 128) {
      return res.status(400).json({
        success: false,
        message: 'Password cannot exceed 128 characters.',
      });
    }

    // 2. Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        isDbOffline: true,
        message: 'MongoDB Atlas is currently offline or connecting. Please check your backend connection.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 3. Prevent duplicate account registration
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in instead.',
      });
    }

    // 4. Create and save new user (password is securely hashed in pre-save hook)
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    await user.save();

    // 5. Generate JWT token and set secure HttpOnly cookie
    const token = generateToken(user);
    res.cookie('token', token, COOKIE_OPTIONS);

    res.status(201).json({
      success: true,
      message: 'Account created successfully in MongoDB Atlas!',
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    // Gracefully handle MongoDB duplicate key error (code 11000)
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in instead.',
      });
    }

    console.error('Error during registration:', err.message || err);
    res.status(500).json({
      success: false,
      message: 'Registration failed due to an internal server error.',
      error: process.env.NODE_ENV === 'production' ? undefined : err.message,
    });
  }
});

/**
 * POST /api/auth/login
 * Authenticate existing user against MongoDB Atlas with rate limiting & lockout
 */
router.post('/login', loginRateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        isDbOffline: true,
        message: 'MongoDB Atlas is currently offline or connecting. Please verify your Atlas connection URI in .env.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user with password field included
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No account found with this email. Please check your spelling or click "Create Account" to sign up.',
      });
    }

    // Check if account is temporarily locked due to excessive failed attempts
    if (user.isLocked) {
      const waitMinutes = Math.max(1, Math.ceil((user.lockUntil - Date.now()) / (60 * 1000)));
      return res.status(429).json({
        success: false,
        message: `Account is temporarily locked due to multiple failed login attempts. Please try again in ${waitMinutes} minute(s) or reset your password.`,
      });
    }

    // Verify password hash
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Increment login attempts and lock if threshold met
      await user.incLoginAttempts();
      const updatedUser = await User.findById(user._id);

      if (updatedUser && updatedUser.isLocked) {
        return res.status(429).json({
          success: false,
          message: 'Account locked due to 5 consecutive failed attempts. Please try again in 15 minutes or reset your password.',
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please try again or use "Forgot password?" to reset it.',
      });
    }

    // Successful login: reset login attempts counter & update lastLogin
    try {
      user.loginAttempts = 0;
      user.lockUntil = null;
      user.lastLogin = new Date();
      await user.save();
    } catch (saveErr) {
      console.warn('Non-blocking user update warning:', saveErr.message);
    }

    // Generate JWT token and set HttpOnly cookie
    const token = generateToken(user);
    res.cookie('token', token, COOKIE_OPTIONS);

    res.json({
      success: true,
      message: 'Signed in successfully!',
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error('Error during login:', err.message || err);
    res.status(500).json({
      success: false,
      message: 'Login failed due to an internal server error.',
      error: process.env.NODE_ENV === 'production' ? undefined : err.message,
    });
  }
});

/**
 * POST /api/auth/logout
 * Clear authentication session and HttpOnly cookie
 */
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  res.json({
    success: true,
    message: 'Signed out successfully.',
  });
});

/**
 * GET /api/auth/me
 * Retrieve currently logged-in user info using session cookie or Bearer token
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'MongoDB Atlas is currently offline.',
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found in database.',
      });
    }

    res.json({
      success: true,
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error('Error fetching user profile:', err.message || err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile.',
    });
  }
});

/**
 * POST /api/auth/forgot-password
 * Initiate password reset flow with secure token generation
 */
router.post('/forgot-password', passwordResetRateLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database is currently offline. Please try again later.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    const genericResponse = {
      success: true,
      message: 'If an account exists with that email address, password reset instructions have been generated.',
    };

    if (!user) {
      return res.json(genericResponse);
    }

    // Generate token and save expiration
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const isDev = process.env.NODE_ENV !== 'production';

    res.json({
      ...genericResponse,
      resetToken: isDev ? resetToken : undefined,
      instructions: isDev
        ? 'In development mode, copy the reset token above or click the reset link to choose a new password.'
        : undefined,
    });
  } catch (err) {
    console.error('Error in forgot-password:', err.message || err);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request.',
    });
  }
});

/**
 * POST /api/auth/reset-password
 * Set new password using verified reset token
 */
router.post('/reset-password', passwordResetRateLimiter, async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Reset token is required.',
      });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    if (password.length > 128) {
      return res.status(400).json({
        success: false,
        message: 'Password cannot exceed 128 characters.',
      });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database is currently offline.',
      });
    }

    // Hash incoming token to compare with DB stored hash
    const hashedToken = crypto.createHash('sha256').update(token.trim()).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid or has expired. Please request a new reset link.',
      });
    }

    // Update password and clear reset tokens and lockouts
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful! You can now sign in with your new password.',
    });
  } catch (err) {
    console.error('Error in reset-password:', err.message || err);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password.',
    });
  }
});

export default router;
