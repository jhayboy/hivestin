import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

export async function GET(request) {
  try {
    await connectDB();
    const userId = '67b2142e6f2c837ca3fa45ff';

    // Get user's deposit transaction
    const deposit = await Transaction.findOne({
      userId,
      type: 'deposit',
      status: 'completed'
    }).sort({ createdAt: 1 }); // Get first deposit

    if (!deposit) {
      return NextResponse.json({ message: 'No deposit found' });
    }

    // Calculate weeks since deposit
    const depositDate = new Date(deposit.createdAt);
    const currentDate = new Date();
    const weeksSinceDeposit = Math.floor((currentDate - depositDate) / (7 * 24 * 60 * 60 * 1000));

    // Calculate expected profit (10% weekly)
    const weeklyProfitRate = 0.10; // 10%
    const expectedProfit = deposit.amount * weeklyProfitRate * weeksSinceDeposit;

    // Get user's current profit
    const user = await User.findById(userId);

    return NextResponse.json({
      depositAmount: deposit.amount,
      depositDate: deposit.createdAt,
      weeksSinceDeposit,
      expectedProfit,
      currentProfit: user.profit,
      difference: expectedProfit - user.profit
    });
  } catch (error) {
    console.error('Error checking profits:', error);
    return NextResponse.json({ message: 'Error checking profits' }, { status: 500 });
  }
} 