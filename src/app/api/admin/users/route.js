import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();
    
    // Get all users with their transactions
    const users = await User.find()
      .select('email balance profit totalPayout hasDeposited lastLoginAt')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      users,
      totalPayout: users.reduce((sum, user) => sum + (user.totalPayout || 0), 0)
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 