import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import User from '@/models/User';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    console.log('Sending user data:', {
      id: user._id,
      email: user.email,
      hasDeposited: user.hasDeposited
    });

    return NextResponse.json({
      _id: user._id,
      email: user.email,
      balance: user.balance,
      profit: user.profit,
      hasDeposited: user.hasDeposited,
      isAdmin: user.isAdmin
    });

  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { message: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
} 

export default async function handler(req, res) {
  await connectToDatabase();

  try {
    const users = await User.find({}); // Fetch all users
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
}