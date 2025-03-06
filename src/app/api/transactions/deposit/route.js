import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Investment from '@/models/Investment';
import Transaction from '@/models/Transaction';
import { INVESTMENT_PLANS } from '@/config/investmentPlans';

export async function POST(request) {
  try {
    await connectDB();
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { amount, currency, transactionHash, planId } = await request.json();

    // Validate required fields
    if (!amount || !currency || !transactionHash || !planId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get plan details
    const plan = INVESTMENT_PLANS.find(p => p.id === planId);
    if (!plan) {
      return NextResponse.json(
        { success: false, message: 'Invalid investment plan' },
        { status: 400 }
      );
    }

    // Create transaction record
    const transaction = await Transaction.create({
      userId: session.user.id,
      type: 'deposit',
      amount,
      currency,
      status: 'pending',
      transactionHash,
      planId
    });

    // Create investment record with plan details
    const investment = await Investment.create({
      userId: session.user.id,
      planId,
      planName: plan.name,
      amount,
      returnRate: plan.returnRate,
      duration: plan.duration,
      status: 'pending',
      transactionId: transaction._id,
      nextPayoutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    // Update user's hasDeposited status
    await User.findByIdAndUpdate(session.user.id, {
      hasDeposited: true
    });

    return NextResponse.json({
      success: true,
      message: 'Deposit submitted successfully',
      transactionId: transaction._id,
      investmentId: investment._id
    });

  } catch (error) {
    console.error('Deposit error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to process deposit', 
        error: error.message 
      },
      { status: 500 }
    );
  }
} 