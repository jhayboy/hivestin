import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();
    
    const userCount = await User.countDocuments();
    const availableSlots = Math.max(0, 5 - userCount);

    return NextResponse.json({ availableSlots });
  } catch (error) {
    console.error('Error checking slots:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 