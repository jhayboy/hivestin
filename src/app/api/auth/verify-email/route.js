import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { generateVerificationToken } from '@/lib/auth';
import { sendEmail } from '@/lib/mail';

export async function POST(request) {
  try {
    await connectDB();
    const { email } = await request.json();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    const verificationToken = generateVerificationToken();
    user.verificationToken = verificationToken;
    user.verificationExpires = Date.now() + 24 * 3600000; // 24 hours
    await user.save();

    await sendEmail({
      to: email,
      template: 'EMAIL_VERIFICATION',
      data: {
        verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`
      }
    });

    return NextResponse.json({ message: 'Verification email sent' });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { message: 'Failed to send verification email' },
      { status: 500 }
    );
  }
} 