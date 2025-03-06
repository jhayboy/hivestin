import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { verifyResetToken } from '@/lib/auth';
import { sendEmail } from '@/lib/mail';

export async function POST(request) {
  try {
    await connectDB();
    const { token, newPassword } = await request.json();

    const user = await User.findOne({
      resetPasswordToken: await verifyResetToken(token),
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Send password change notification
    await sendEmail({
      to: user.email,
      template: 'PASSWORD_CHANGED',
      data: {
        time: new Date().toLocaleString()
      }
    });

    return NextResponse.json({ 
      message: 'Password has been reset successfully' 
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { message: 'Failed to reset password' },
      { status: 500 }
    );
  }
} 