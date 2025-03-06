import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

export async function POST(request) {
  try {
    await connectDB();
    const userId = '67b2142e6f2c837ca3fa45ff';

    const deposit = await Transaction.findOne({
      userId,
      type: 'deposit',
      status: 'completed'
    }).sort({ createdAt: 1 });

    if (!deposit) {
      return NextResponse.json({ message: 'No deposit found' });
    }

    const depositDate = new Date(deposit.createdAt);
    const currentDate = new Date();
    const weeksSinceDeposit = Math.floor((currentDate - depositDate) / (7 * 24 * 60 * 60 * 1000));
    const weeklyProfitRate = 0.10;
    const calculatedProfit = deposit.amount * weeklyProfitRate * weeksSinceDeposit;

    // Update user's profit
    await User.findByIdAndUpdate(userId, {
      $set: { profit: calculatedProfit }
    });

    return NextResponse.json({
      message: 'Profit updated successfully',
      newProfit: calculatedProfit
    });
  } catch (error) {
    console.error('Error updating profit:', error);
    return NextResponse.json({ message: 'Error updating profit' }, { status: 500 });
  }
} 