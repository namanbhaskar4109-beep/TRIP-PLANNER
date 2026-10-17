import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import tripRoutes from './routes/trips.js';
import { connectToDatabase, getAtlasStatus } from './config/db.js';
import { User } from './models/User.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed client origins for CORS with credentials
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
];

if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

// Enable Cross-Origin requests with credentials (cookies)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Allow during local development
    },
    credentials: true,
  })
);

// Parse JSON request bodies (with safe payload limit)
app.use(express.json({ limit: '2mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);

// Health & Diagnosis Check endpoint
app.get('/api/health', async (req, res) => {
  const atlas = await getAtlasStatus();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    atlas,
  });
});

// Fallback 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API route ${req.method} ${req.originalUrl} not found`,
  });
});

// Global error handler - Never leak stack traces in production
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.message || err);
  res.status(err.status || 500).json({
    success: false,
    message: 'Internal server error. Please try again later.',
    error: process.env.NODE_ENV === 'production' ? undefined : err.message,
  });
});

// Attempt database connection and start listening
async function startServer() {
  console.log('🚀 [Server] Initializing TripPlanner API with MongoDB Atlas...');
  const connected = await connectToDatabase();

  // If connected, verify or seed sample account for seamless testing
  if (connected) {
    try {
      const sampleEmail = 'traveler@tripplanner.com';
      const existing = await User.findOne({ email: sampleEmail });
      if (!existing) {
        const sampleUser = new User({
          name: 'Alex Morgan',
          email: sampleEmail,
          password: 'AtlasTrip2025!',
        });
        await sampleUser.save();
        console.log(`✨ [Server] Created sample test account in MongoDB Atlas: ${sampleEmail}`);
      }
    } catch (e) {
      console.warn('Sample traveler seed check notice:', e.message);
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`🌐 Server running at: http://localhost:${PORT} (http://127.0.0.1:${PORT})`);
    console.log(`📡 MongoDB Atlas Health: http://localhost:${PORT}/api/health`);
    console.log(`🔐 Auth Endpoints: http://localhost:${PORT}/api/auth/register`);
    console.log(`======================================================\n`);
  });
}

startServer();
