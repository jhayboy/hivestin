require('dotenv').config({
  path: process.env.NODE_ENV === 'development' ? '.env.development' : '.env'
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  experimental: {
    serverActions: true,
  },
  // Add this to ensure proper static file serving
  poweredByHeader: false,
  reactStrictMode: true,
};

// Log environment variables for debugging
if (process.env.NODE_ENV !== 'production') {
  console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);
}

// Debug logging
if (process.env.NODE_ENV === 'development') {
  console.log('Environment variables loaded:', {
    APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    MONGODB_URI: process.env.MONGODB_URI?.substring(0, 10) + '...',
  });
}

module.exports = nextConfig;
