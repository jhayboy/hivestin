import mongoose from 'mongoose';

// This file should only be imported in server-side code
const MONGODB_URI = process.env.MONGODB_URI;

// Debug logging
console.log('Environment:', process.env.NODE_ENV);
console.log('MongoDB URI exists:', !!MONGODB_URI);
if (!MONGODB_URI) {
  console.error('MongoDB URI is missing. Available env vars:', Object.keys(process.env));
}

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  throw new Error('Please define MONGODB_URI in your environment variables');
}

console.log('Attempting to connect to MongoDB...');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    console.log('Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('Successfully connected to MongoDB');
        return mongoose;
      })
      .catch((error) => {
        console.error('MongoDB connection error:', error);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB; 