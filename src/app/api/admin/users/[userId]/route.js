import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { isAdmin } from '@/lib/auth';

export async function DELETE(request, { params }) {
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

    const { userId } = params;

    // Delete user
    await User.findByIdAndDelete(userId);

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 