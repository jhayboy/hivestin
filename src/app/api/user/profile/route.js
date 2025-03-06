import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(request) {
  try {
    await connectDB();
    const session = await getServerSession();

    if (!session) {
      console.log('No session found');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Fetching user data for ID:', session.user.id);
    
    const user = await User.findById(session.user.id)
      .select('email balance profit hasDeposited isAdmin totalPayout');
      
    console.log('User found:', !!user);

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user._id,
      email: user.email,
      balance: user.balance || 0,
      profit: user.profit || 0,
      hasDeposited: user.hasDeposited,
      isAdmin: user.isAdmin,
      totalPayout: user.totalPayout || 0
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { message: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    await connectDB();
    
    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $set: data },
      { new: true }
    );

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
} 


export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  await connectDB();

  try {
    const { email } = req.query; // Get user email from query params

    if (!email) {
      return res.status(400).json({ message: 'User email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
