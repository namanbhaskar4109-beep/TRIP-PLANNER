import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { getAtlasStatus, connectToDatabase } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secure_jwt_token_secret_trip_planner_atlas_2025';

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
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are all required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
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

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in instead.',
      });
    }

    // Create and save new user (password is hashed in pre-save hook)
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    await user.save();

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Account created successfully in MongoDB Atlas!',
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Registration failed due to a server error.',
    });
  }
});

/**
 * POST /api/auth/login
 * Authenticate existing user against MongoDB Atlas
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
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
        message: 'Invalid email or password. Please try again.',
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please try again.',
      });
    }

    // Update lastLogin
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Signed in successfully!',
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Login failed due to a server error.',
    });
  }
});

/**
 * GET /api/auth/me
 * Retrieve currently logged in user info
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected.',
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found in MongoDB Atlas.',
      });
    }

    res.json({
      success: true,
      user: user.toSafeObject(),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile.',
      error: err.message,
    });
  }
});

export default router;
