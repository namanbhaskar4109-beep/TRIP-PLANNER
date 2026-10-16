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

    const trips = await Trip.find({ userId: req.user.id }).sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: trips,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve trips from MongoDB Atlas',
      error: err.message,
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

    if (!trip || !trip.destination) {
      return res.status(400).json({
        success: false,
        message: 'Valid trip data is required.',
      });
    }

    // Find existing trip or create new one
    let savedTrip = await Trip.findOne({ userId: req.user.id });

    if (savedTrip) {
      savedTrip.destination = trip.destination;
      savedTrip.startDate = trip.startDate;
      savedTrip.endDate = trip.endDate;
      savedTrip.travelers = trip.travelers;
      savedTrip.budget = trip.budget;
      savedTrip.interests = trip.interests || [];
      savedTrip.selectedHotelId = trip.selectedHotelId || null;
      savedTrip.savedPlaceIds = trip.savedPlaceIds || [];
      savedTrip.expenses = expenses || [];
      await savedTrip.save();
    } else {
      savedTrip = new Trip({
        userId: req.user.id,
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        travelers: trip.travelers,
        budget: trip.budget,
        interests: trip.interests || [],
        selectedHotelId: trip.selectedHotelId || null,
        savedPlaceIds: trip.savedPlaceIds || [],
        expenses: expenses || [],
      });
      await savedTrip.save();
    }

    res.json({
      success: true,
      message: 'Trip data successfully synchronized with MongoDB Atlas!',
      data: savedTrip,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to sync trip to MongoDB Atlas',
      error: err.message,
    });
  }
});

/**
 * GET /api/trips/latest
 * Fetch the latest saved trip from MongoDB Atlas
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
    res.status(500).json({
      success: false,
      message: 'Failed to fetch latest trip',
      error: err.message,
    });
  }
});

export default router;
