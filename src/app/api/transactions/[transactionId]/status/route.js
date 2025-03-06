import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import User from '@/models/User';
import { BybitService } from '@/services/bybit';
import { sendEmail } from '@/lib/mail';
import { INVESTMENT_PLANS } from '@/config/investmentPlans';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { transactionId } = params;
    const transaction = await Transaction.findById(transactionId)
      .populate('userId', 'email');

    if (!transaction) {
      return NextResponse.json(
        { message: 'Transaction not found' },
        { status: 404 }
      );
    }

    if (transaction.userId._id.toString() !== session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // If transaction is already completed or failed, return current status
    if (transaction.status !== 'pending') {
      return NextResponse.json({ status: transaction.status });
    }

    // Verify with Bybit
    try {
      const verification = await BybitService.verifyDeposit(
        transaction.transactionHash,
        transaction.currency
      );

      if (verification.verified) {
        transaction.status = 'completed';
        await transaction.save();

        // Update user balance
        await User.findByIdAndUpdate(session.user.id, {
          $inc: { balance: transaction.amount },
          hasDeposited: true
        });

        // Find the investment plan
        const plan = INVESTMENT_PLANS.find(p => p.amount === transaction.amount);
        
        // Send confirmation email
        await sendEmail({
          to: transaction.userId.email,
          template: 'INVESTMENT_CONFIRMATION',
          data: {
            amount: transaction.amount,
            planName: plan?.name || 'Custom Investment',
            transactionId: transaction._id,
            expectedReturn: plan?.returnRate || 10,
            duration: plan?.duration || '7 days'
          }
        });

        return NextResponse.json({ status: 'completed' });
      }
    } catch (error) {
      console.error('Verification error:', error);
    }

    return NextResponse.json({ status: transaction.status });
  } catch (error) {
    console.error('Error checking transaction status:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 