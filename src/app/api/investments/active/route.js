import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';

export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check for active deposit
    const activeDeposit = await Transaction.findOne({
      userId: session.user.id,
      type: 'deposit',
      status: 'completed'
    }).sort({ createdAt: -1 });

    const hasActiveInvestment = !!activeDeposit;

    return NextResponse.json({
      hasActiveInvestment,
      depositDetails: hasActiveInvestment ? {
        amount: activeDeposit.amount,
        date: activeDeposit.createdAt,
        planId: activeDeposit.planId
      } : null
    });

  } catch (error) {
    console.error('Error checking active investment:', error);
    return NextResponse.json(
      { message: 'Failed to check active investment' },
      { status: 500 }
    );
  }
} 