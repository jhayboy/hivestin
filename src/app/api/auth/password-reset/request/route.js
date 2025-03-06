import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { generateResetToken } from '@/lib/auth';
import { sendEmail } from '@/lib/mail';

export async function POST(request) {
  try {
    await connectDB();
    const { email } = await request.json();

    const user = await User.findOne({ email });
    if (!user) {
      // Return success even if user not found (security)
      return NextResponse.json({ message: 'If an account exists, a reset link has been sent' });
    }

    const resetToken = await generateResetToken();
    user.resetPasswordToken = resetToken.hash;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    await sendEmail({
      to: email,
      template: 'PASSWORD_RESET',
      data: {
        resetUrl: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken.token}`
      }
    });

    return NextResponse.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { message: 'Failed to process reset request' },
      { status: 500 }
    );
  }
} 