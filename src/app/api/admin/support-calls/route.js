import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import connectDB from '@/lib/db';
import SupportCall from '@/models/SupportCall';
import { isAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await connectDB();
    
    // Check if user is admin
    const session = await getServerSession();
    if (!session || !isAdmin(session.user.email)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all support calls with user details
    const calls = await SupportCall.find()
      .populate('userId', 'email')
      .sort({ date: 1, time: 1 })
      .lean();

    // Transform the data to match the component's expectations
    const formattedCalls = calls.map(call => ({
      ...call,
      user: { email: call.userId.email },
      _id: call._id.toString()
    }));

    return NextResponse.json(formattedCalls);
  } catch (error) {
    console.error('Error fetching support calls:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 