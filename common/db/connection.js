const mongoose = require('mongoose');

// Prevent mongoose from buffering commands when disconnected
mongoose.set('bufferCommands', false);

async function connect() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hestia';
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    const maskedUri = uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    console.log('✅ MongoDB connected successfully to:', maskedUri);

    // Auto-seed if database is empty
    try {
      const HotelProperty = require('../../model/HotelProperty');
      const Room = require('../../model/Room');
      const { defaultHotels, defaultRooms } = require('../inMemoryStore');

      const hotelCount = await HotelProperty.countDocuments();
      if (hotelCount === 0) {
        console.log('🌱 Empty database detected. Auto-seeding initial hotels...');
        for (const h of defaultHotels) {
          const { _id, ...hotelData } = h;
          await HotelProperty.create(hotelData);
        }
        console.log('✅ Auto-seeded initial hotels');
      }

      const roomCount = await Room.countDocuments();
      if (roomCount === 0) {
        console.log('🌱 Empty database detected. Auto-seeding initial rooms...');
        for (const r of defaultRooms) {
          const { _id, ...roomData } = r;
          await Room.create(roomData);
        }
        console.log('✅ Auto-seeded initial rooms');
      }
    } catch (seedErr) {
      console.warn('⚠️ Auto-seed check failed:', seedErr.message);
    }
  } catch (err) {
    const maskedUri = uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    console.warn('⚠️ MongoDB connection failed on', maskedUri, ':', err.message);
    console.log('🚀 Running with High-Performance In-Memory Data Store (Instant local live testing)');
  }
}

const isDbConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

module.exports = { connect, mongoose, isDbConnected };
