import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { generateSecret, generateTOTP } from '@/lib/totp';
import { sendEmail } from '@/lib/mail';

export async function POST(request) {
  try {
    await connectDB();
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await User.findById(session.user.id);
    const secret = generateSecret();
    
    // Store secret temporarily
    user.security.twoFactorSecret = secret;
    await user.save();

    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () => 
      crypto.randomBytes(4).toString('hex')
    );
    
    // Hash and store backup codes
    user.security.backupCodes = await Promise.all(
      backupCodes.map(code => bcrypt.hash(code, 12))
    );
    
    await user.save();

    // Send setup email
    await sendEmail({
      to: user.email,
      template: 'TWO_FACTOR_SETUP',
      data: {
        secret,
        backupCodes,
        qrCode: generateTOTP(secret).qrCode
      }
    });

    return NextResponse.json({
      message: '2FA setup initiated',
      secret,
      backupCodes
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json(
      { message: 'Failed to setup 2FA' },
      { status: 500 }
    );
  }
} 