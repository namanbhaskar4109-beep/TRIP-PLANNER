import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

// Use reliable public DNS resolvers to prevent Windows SRV lookup failures (querySrv EREFUSED)
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // Graceful fallback
}

let connectionStatus = {
  isConnected: false,
  clusterHost: null,
  databaseName: null,
  error: null,
  lastPingMs: null,
  lastChecked: null,
};

/**
 * Connect to MongoDB Atlas with robust error handling and production settings
 */
export async function connectToDatabase(customUri = null) {
  const uri = customUri || process.env.MONGODB_URI;

  if (!uri || uri.includes('<username>') || uri.includes('<password>')) {
    connectionStatus = {
      isConnected: false,
      clusterHost: null,
      databaseName: null,
      error: 'MongoDB Atlas URI is not configured yet. Please update MONGODB_URI in .env with your Atlas connection string.',
      lastPingMs: null,
      lastChecked: new Date().toISOString(),
    };
    console.warn('\n⚠️  [MongoDB Atlas] MONGODB_URI is not set or contains default placeholders.');
    console.warn('👉 Please set your Atlas URI in .env: mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/tripplanner\n');
    return false;
  }

  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }

    console.log('🔄 [MongoDB Atlas] Connecting to cluster...');
    const startTime = Date.now();

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
    });

    const pingTime = Date.now() - startTime;
    const host = conn.connection.host || 'Atlas Cluster';
    const dbName = conn.connection.name || 'tripplanner';

    connectionStatus = {
      isConnected: true,
      clusterHost: host,
      databaseName: dbName,
      error: null,
      lastPingMs: pingTime,
      lastChecked: new Date().toISOString(),
    };

    console.log(`✅ [MongoDB Atlas] Connected successfully to host: ${host} | DB: ${dbName} (${pingTime}ms)`);
    return true;
  } catch (err) {
    let friendlyError = (err.message || 'Connection failed').replace(/mongodb(\+srv)?:\/\/[^@]+@/gi, 'mongodb$1://***:***@');

    if (err.message.includes('bad auth') || err.message.includes('Authentication failed')) {
      friendlyError = 'Authentication failed. Please verify your MongoDB Atlas username and password in .env.';
    } else if (err.message.includes('getaddrinfo ENOTFOUND') || err.message.includes('querySrv ENOTFOUND')) {
      friendlyError = 'Could not resolve MongoDB Atlas hostname. Check your cluster hostname in .env.';
    } else if (err.message.includes('ETIMEDOUT') || err.message.includes('timed out')) {
      friendlyError = 'Connection timed out. Ensure your IP address is whitelisted in MongoDB Atlas (Network Access -> Allow 0.0.0.0/0).';
    }

    connectionStatus = {
      isConnected: false,
      clusterHost: null,
      databaseName: null,
      error: friendlyError,
      lastPingMs: null,
      lastChecked: new Date().toISOString(),
    };

    console.error('❌ [MongoDB Atlas] Connection error:', friendlyError);
    return false;
  }
}

/**
 * Get the current MongoDB Atlas status, including ping latency
 */
export async function getAtlasStatus() {
  if (mongoose.connection.readyState === 1) {
    try {
      const start = Date.now();
      if (mongoose.connection.db) {
        await mongoose.connection.db.admin().ping();
      }
      const pingMs = Date.now() - start;

      return {
        isConnected: true,
        clusterHost: mongoose.connection.host,
        databaseName: mongoose.connection.name,
        error: null,
        lastPingMs: pingMs,
        lastChecked: new Date().toISOString(),
      };
    } catch (e) {
      return {
        ...connectionStatus,
        isConnected: false,
        error: `Ping failed: ${e.message}`,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  return {
    ...connectionStatus,
    lastChecked: new Date().toISOString(),
  };
}

// Connection event listeners
mongoose.connection.on('disconnected', () => {
  console.log('ℹ️  [MongoDB Atlas] Disconnected from cluster');
  connectionStatus.isConnected = false;
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ [MongoDB Atlas] Reconnected to cluster');
  connectionStatus.isConnected = true;
});
