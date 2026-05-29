const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in .env');
  }
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('[DB] MongoDB connected');
  } catch (e) {
    console.error('[DB] MongoDB connection failed', e);
    process.exit(1);
  }

};

module.exports = { connectDB };