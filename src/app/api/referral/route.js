import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const referrals = await User.find({ referredBy: session.user.id });
    
    return NextResponse.json({
      referrals: referrals.map(ref => ({
        email: ref.email,
        joinedAt: ref.createdAt,
        hasDeposited: ref.hasDeposited
      }))
    });
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
} 