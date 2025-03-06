import connectDB from '@/lib/db';
import mongoose from 'mongoose';

// Create a Rate Limit Schema
const rateLimitSchema = new mongoose.Schema({
  key: { type: String, required: true },
  requests: [{
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, expires: 60, default: Date.now }
});

const RateLimit = mongoose.models.RateLimit || mongoose.model('RateLimit', rateLimitSchema);

const MAX_REQUESTS = {
  '/api/auth/login': 5,
  '/api/auth/register': 5,
  '/api/auth/2fa/verify': 5,
  default: 60
};

export async function rateLimit(ip, path) {
  await connectDB();
  const now = Date.now();
  const windowStart = now - 60000; // 1 minute ago
  const key = `${ip}:${path}`;
  
  try {
    const record = await RateLimit.findOneAndUpdate(
      { key },
      {
        $pull: { requests: { timestamp: { $lt: new Date(windowStart) } } },
        $push: { requests: { timestamp: new Date(now) } }
      },
      { upsert: true, new: true }
    );

    const limit = MAX_REQUESTS[path] || MAX_REQUESTS.default;
    const requestCount = record.requests.length;

    return {
      allowed: requestCount <= limit,
      remaining: Math.max(0, limit - requestCount)
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    return { allowed: true, remaining: 1 }; // Fail open for errors
  }
} 