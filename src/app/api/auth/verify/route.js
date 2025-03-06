import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { isAdmin } from '@/lib/auth';

// We should add verificationCode field to User model
const userSchema = {
  verificationCode: {
    code: String,
    timestamp: Date,
    attempts: Number
  }
};

// Create a TextEncoder instance
const encoder = new TextEncoder();

export async function POST(request) {
  try {
    await connectDB();
    const { email, code } = await request.json();

    console.log('Verifying code for:', email, 'Code:', code); // Debug log

    // Find user and their verification data
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if verification code exists
    if (!user.verificationCode || !user.verificationCode.code) {
      return NextResponse.json(
        { message: 'No verification code found. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check if code is expired (5 minutes)
    const codeAge = Date.now() - user.verificationCode.timestamp;
    if (codeAge > 5 * 60 * 1000) {
      user.verificationCode = undefined;
      await user.save();
      return NextResponse.json(
        { message: 'Verification code expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify code
    if (user.verificationCode.code !== code) {
      user.verificationCode.attempts += 1;
      await user.save();
      return NextResponse.json(
        { message: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Update last login and clear verification code
    user.lastLoginAt = new Date();
    user.verificationCode = undefined;
    await user.save();

    // Create JWT token with proper error handling
    try {
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
      }

      const secret = encoder.encode(process.env.JWT_SECRET);
      const token = await new jose.SignJWT({ 
        userId: user._id.toString(),
        email: user.email,
        isAdmin: user.isAdmin || isAdmin(user.email)
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(secret);

      const response = NextResponse.json(
        { message: 'Login successful', redirectUrl: '/dashboard' },
        { status: 200 }
      );

      // Set cookie with proper options
      response.cookies.set({
        name: 'auth_token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });

      return response;
    } catch (tokenError) {
      console.error('Token creation failed:', tokenError);
      return NextResponse.json(
        { message: 'Authentication failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 