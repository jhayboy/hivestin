import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { isAdmin } from '@/lib/auth';

export async function POST() {
  try {
    await connectDB();

    // Update all users' admin status
    const users = await User.find({});
    for (const user of users) {
      user.isAdmin = isAdmin(user.email);
      await user.save();
    }

    return NextResponse.json({ message: 'Admin status updated successfully' });
  } catch (error) {
    console.error('Error updating admin status:', error);
    return NextResponse.json(
      { message: 'Failed to update admin status' },
      { status: 500 }
    );
  }
} 