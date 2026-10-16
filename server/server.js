import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import tripRoutes from './routes/trips.js';
import { connectToDatabase, getAtlasStatus } from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin requests
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

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
    message: `API route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? undefined : err.message,
  });
});

// Attempt database connection and start listening
async function startServer() {
  console.log('🚀 [Server] Initializing TripPlanner API with MongoDB Atlas...');
  await connectToDatabase();

  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🌐 Server running at: http://localhost:${PORT}`);
    console.log(`📡 MongoDB Atlas Health: http://localhost:${PORT}/api/health`);
    console.log(`🔐 Auth Endpoints: http://localhost:${PORT}/api/auth/register`);
    console.log(`======================================================\n`);
  });
}

startServer();
