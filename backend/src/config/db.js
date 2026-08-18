const mongoose = require('mongoose');
const { initMemoryStore } = require('../services/memoryStore');

let isConnected = false;

const connectDB = async () => {
  // Ensure MemoryStore is initialized on startup
  await initMemoryStore();

  const uri = process.env.MONGODB_URI;

  if (uri) {
    try {
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
      isConnected = true;
      console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.warn(`MongoDB Atlas URI error (${error.message}). Trying local MongoDB fallback...`);
    }
  }

  try {
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/smart_warehouse', {
      serverSelectionTimeoutMS: 1500,
    });
    isConnected = true;
    console.log(`Local MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`No active MongoDB server on port 27017 (${error.message}).`);
    console.log('Activating In-Memory CSV Dataset Engine & Offline Fallback Mode...');
    mongoose.set('bufferCommands', false);
  }
};

module.exports = connectDB;
