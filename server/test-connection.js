import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

import dns from 'dns';

// Fallback to Google and Cloudflare DNS to resolve Windows SRV DNS issues (querySrv EREFUSED)
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // Ignore if not supported
}

async function testConnection() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI is not set in .env');
    process.exit(1);
  }

  console.log('🔄 Testing MongoDB Atlas connection securely from .env...');

  try {
    const startTime = Date.now();
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    const pingTime = Date.now() - startTime;

    console.log('✅ Connection established successfully!');
    console.log(`🌐 Cluster Host: ${conn.connection.host}`);
    console.log(`📁 Database Name: ${conn.connection.name}`);
    console.log(`⚡ Ping Latency: ${pingTime}ms`);

    // Verify ping command
    const admin = conn.connection.db.admin();
    const pingResult = await admin.ping();
    console.log('📊 Admin Ping Result:', pingResult);

    await mongoose.disconnect();
    console.log('🔌 Disconnected cleanly. Database check passed!');
    process.exit(0);
  } catch (err) {
    // Sanitize any credentials if present in error message
    const sanitizedError = (err.message || 'Connection failed').replace(/mongodb(\+srv)?:\/\/[^@]+@/gi, 'mongodb$1://***:***@');
    console.error('❌ Connection error:', sanitizedError);

    if (err.message.includes('bad auth') || err.message.includes('Authentication failed')) {
      console.error('💡 Diagnosis: The username or password in .env is incorrect. Please check your credentials in MongoDB Atlas.');
    } else if (err.message.includes('ETIMEDOUT') || err.message.includes('timed out') || err.message.includes('Could not connect')) {
      console.error('💡 Diagnosis: Connection timed out. Make sure your IP address is allowed in MongoDB Atlas -> Network Access (Allow 0.0.0.0/0).');
    }
    process.exit(1);
  }
}

testConnection();
