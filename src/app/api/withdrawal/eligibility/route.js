import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';  // Use our custom session handler
import connectDB from '@/lib/db';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Check for active investment (completed deposit)
    const activeInvestment = await Transaction.findOne({
      userId: session.user.id,
      type: 'deposit',
      status: 'completed'
    }).sort({ createdAt: -1 });

    if (!activeInvestment) {
      return NextResponse.json({
        eligible: false,
        hasActiveInvestment: false,
        availableProfit: 0,
        message: 'No active investment found'
      });
    }

    // Calculate days since investment
    const daysSinceInvestment = Math.floor(
      (new Date() - new Date(activeInvestment.createdAt)) / (1000 * 60 * 60 * 24)
    );

    // Investment amount is locked for 30 days
    const isInvestmentUnlocked = daysSinceInvestment >= 30;
    
    // Available profit is always withdrawable
    const availableProfit = user.profit || 0;

    return NextResponse.json({
      eligible: true,
      hasActiveInvestment: true,
      availableProfit,
      investmentAmount: activeInvestment.amount,
      investmentDate: activeInvestment.createdAt,
      daysSinceInvestment,
      isInvestmentUnlocked,
      message: isInvestmentUnlocked 
        ? 'Investment amount is now available for withdrawal'
        : `Investment amount will be available for withdrawal in ${30 - daysSinceInvestment} days`
    });

  } catch (error) {
    console.error('Error checking withdrawal eligibility:', error);
    return NextResponse.json(
      { message: 'Failed to check withdrawal eligibility' },
      { status: 500 }
    );
  }
} 