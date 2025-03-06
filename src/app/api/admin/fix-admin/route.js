import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { isAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await connectDB();

    // Update specific admin users
    const adminEmails = [
      'mbamarajustice1@gmail.com',
      'megaonline247@gmail.com',
      'hopenancy1088@gmail.com'
    ];

    for (const email of adminEmails) {
      const user = await User.findOne({ email });
      if (user) {
        user.isAdmin = true;
        await user.save();
        console.log(`Updated admin status for ${email}`);
      }
    }

    return NextResponse.json({ 
      message: 'Admin status fixed successfully',
      status: 200 
    });
  } catch (error) {
    console.error('Error fixing admin status:', error);
    return NextResponse.json({ 
      message: 'Failed to fix admin status',
      error: error.message 
    }, { 
      status: 500 
    });
  }
} 