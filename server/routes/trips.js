import express from 'express';
import mongoose from 'mongoose';
import { Trip } from '../models/Trip.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/trips
 * Get user's saved trips from MongoDB Atlas
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'MongoDB Atlas is offline. Please check connection settings.',
      });
    }

    // Strictly parameterized by authenticated user ID
    const trips = await Trip.find({ userId: req.user.id }).sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: trips,
    });
  } catch (err) {
    console.error('Error fetching trips:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve trips from MongoDB Atlas.',
    });
  }
});

/**
 * POST /api/trips/sync
 * Sync / upsert active trip and expenses to MongoDB Atlas
 */
router.post('/sync', authenticateToken, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'MongoDB Atlas is offline. Please check connection settings.',
      });
    }

    const { trip, expenses } = req.body;

    if (!trip || typeof trip !== 'object' || !trip.destination || typeof trip.destination !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Valid trip data with destination is required.',
      });
    }

    // Explicit field extraction - Prevent mass assignment
    const sanitizedTripData = {
      userId: req.user.id, // Enforce authenticated user ID
      destination: String(trip.destination).trim().substring(0, 100),
      startDate: String(trip.startDate || new Date().toISOString().split('T')[0]).substring(0, 30),
      endDate: String(trip.endDate || new Date().toISOString().split('T')[0]).substring(0, 30),
      travelers: Math.max(1, Math.min(50, Number(trip.travelers) || 1)),
      budget: Math.max(0, Number(trip.budget) || 1000),
      interests: Array.isArray(trip.interests) ? trip.interests.map((i) => String(i).substring(0, 50)) : [],
      selectedHotelId: trip.selectedHotelId ? String(trip.selectedHotelId).substring(0, 50) : null,
      savedPlaceIds: Array.isArray(trip.savedPlaceIds) ? trip.savedPlaceIds.map((p) => String(p).substring(0, 50)) : [],
      expenses: Array.isArray(expenses)
        ? expenses.map((e) => ({
            id: String(e.id || '').substring(0, 50),
            description: String(e.description || '').trim().substring(0, 100),
            amount: Math.max(0, Number(e.amount) || 0),
            category: String(e.category || 'Miscellaneous').substring(0, 50),
            date: String(e.date || '').substring(0, 30),
          }))
        : [],
    };

    // Find existing trip for this user or create a new one
    let savedTrip = await Trip.findOne({ userId: req.user.id });

    if (savedTrip) {
      Object.assign(savedTrip, sanitizedTripData);
      await savedTrip.save();
    } else {
      savedTrip = new Trip(sanitizedTripData);
      await savedTrip.save();
    }

    res.json({
      success: true,
      message: 'Trip data successfully synchronized with MongoDB Atlas!',
      data: savedTrip,
    });
  } catch (err) {
    console.error('Error syncing trip:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to sync trip to MongoDB Atlas.',
    });
  }
});

/**
 * GET /api/trips/latest
 * Fetch the latest saved trip for authenticated user
 */
router.get('/latest', authenticateToken, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'MongoDB Atlas is offline.',
      });
    }

    const trip = await Trip.findOne({ userId: req.user.id }).sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: trip,
    });
  } catch (err) {
    console.error('Error fetching latest trip:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch latest trip.',
    });
  }
});

export default router;
