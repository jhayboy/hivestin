import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { token } = params;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Update user verification status
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Redirect to login page with success message
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?verified=true`
    );
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { message: 'Failed to verify email' },
      { status: 500 }
    );
  }
} 