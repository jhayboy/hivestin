import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { verifyTOTP } from '@/lib/totp';
import { getClientIp, getUserAgent } from '@/lib/utils';

export async function POST(request) {
  try {
    await connectDB();
    const { code, email } = await request.json();
    
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if using backup code
    const isBackupCode = await checkBackupCode(user, code);
    const isValidCode = isBackupCode || await verifyTOTP(user.security.twoFactorSecret, code);

    if (!isValidCode) {
      user.security.failedLoginAttempts += 1;
      user.security.lastFailedLogin = new Date();
      await user.save();

      if (user.security.failedLoginAttempts >= 5) {
        // Lock account and notify user
        await handleAccountLock(user);
        return NextResponse.json(
          { message: 'Account locked due to too many failed attempts' },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { message: 'Invalid verification code' },
        { status: 401 }
      );
    }

    // Reset failed attempts on successful verification
    user.security.failedLoginAttempts = 0;
    
    // Log successful login
    const ip = getClientIp(request);
    user.security.loginHistory.push({
      ip,
      userAgent: getUserAgent(request),
      location: await getLocationFromIP(ip),
      timestamp: new Date()
    });

    await user.save();

    return NextResponse.json({ 
      message: 'Verification successful',
      verified: true 
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { message: 'Verification failed' },
      { status: 500 }
    );
  }
} 