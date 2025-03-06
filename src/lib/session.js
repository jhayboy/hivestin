import { cookies } from 'next/headers';
import * as jose from 'jose';
import User from '@/models/User';

export async function getServerSession() {
  try {
    const token = cookies().get('auth_token')?.value;
    
    if (!token) {
      return null;
    }

    // Create a TextEncoder instance
    const encoder = new TextEncoder();
    
    // Ensure JWT_SECRET exists and is properly formatted
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured');
      return null;
    }

    const secret = encoder.encode(process.env.JWT_SECRET);

    try {
      const { payload } = await jose.jwtVerify(token, secret);
      
      if (!payload.userId) {
        console.error('Invalid token payload');
        return null;
      }

      const user = await User.findById(payload.userId).select('email');

      if (!user) {
        return null;
      }

      return {
        user: {
          id: user._id,
          email: user.email
        }
      };
    } catch (verifyError) {
      console.error('Token verification failed:', verifyError);
      // Clear the invalid token from cookies
      cookies().delete('auth_token');
      return null;
    }
  } catch (error) {
    console.error('Session error:', error);
    return null;
  }
} 