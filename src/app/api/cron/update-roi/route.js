import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import User from '@/models/User';
import { calculateAccumulatedROI } from '@/lib/investment';

export async function GET(request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get all users with completed deposits
    const users = await User.find({
      hasDeposited: true
    });

    const results = {
      processed: 0,
      failed: 0,
      details: []
    };

    for (const user of users) {
      try {
        const transactions = await Transaction.find({
          userId: user._id,
          type: 'deposit',
          status: 'completed'
        });

        const { totalROI } = calculateAccumulatedROI(transactions);

        // Update user's profit
        await User.findByIdAndUpdate(user._id, {
          $set: { profit: totalROI }
        });

        results.processed++;
        results.details.push({
          userId: user._id,
          email: user.email,
          newProfit: totalROI
        });
      } catch (error) {
        results.failed++;
        results.details.push({
          userId: user._id,
          error: error.message
        });
      }
    }

    return NextResponse.json({
      message: 'ROI update completed',
      results
    });
  } catch (error) {
    console.error('ROI update error:', error);
    return NextResponse.json(
      { message: 'Failed to update ROI' },
      { status: 500 }
    );
  }
} 