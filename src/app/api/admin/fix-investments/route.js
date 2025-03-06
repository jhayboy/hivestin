import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import Investment from '@/models/Investment';
import { INVESTMENT_PLANS } from '@/config/investmentPlans';

export async function POST(request) {
  try {
    await connectDB();
    const results = { updated: 0, failed: 0, details: [] };

    // Get all completed deposits
    const deposits = await Transaction.find({
      type: 'deposit',
      status: 'completed'
    }).populate('userId');

    for (const deposit of deposits) {
      try {
        const depositDate = new Date(deposit.createdAt);
        const currentDate = new Date();
        const daysSinceDeposit = Math.floor((currentDate - depositDate) / (24 * 60 * 60 * 1000));
        
        // Only process deposits older than 7 days
        if (daysSinceDeposit < 7) continue;

        // Find or create investment record
        let investment = await Investment.findOne({
          userId: deposit.userId._id,
          transactionId: deposit._id
        });

        if (!investment) {
          investment = await Investment.create({
            userId: deposit.userId._id,
            planId: deposit.planId,
            amount: deposit.amount,
            status: 'active',
            startDate: deposit.createdAt,
            nextPayoutDate: new Date(deposit.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000),
            transactionId: deposit._id
          });
        }

        // Calculate number of weeks since deposit
        const weeksElapsed = Math.floor(daysSinceDeposit / 7);
        
        // Get plan details
        const plan = INVESTMENT_PLANS.find(p => p.id === deposit.planId);
        if (!plan) continue;

        // Calculate total profit
        const weeklyProfit = (deposit.amount * plan.returnRate) / 100;
        const totalProfit = weeklyProfit * weeksElapsed;

        // Update user's profit and balance
        await User.findByIdAndUpdate(deposit.userId._id, {
          $set: { 
            profit: totalProfit,
            balance: deposit.amount + totalProfit
          }
        });

        // Update investment record
        investment.totalProfit = totalProfit;
        investment.nextPayoutDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await investment.save();

        results.updated++;
        results.details.push({
          userId: deposit.userId._id,
          email: deposit.userId.email,
          depositAmount: deposit.amount,
          weeksElapsed,
          totalProfit,
          status: 'success'
        });

      } catch (error) {
        results.failed++;
        results.details.push({
          userId: deposit.userId?._id,
          error: error.message,
          status: 'failed'
        });
      }
    }

    return NextResponse.json({
      message: 'Investment profits updated',
      results
    });

  } catch (error) {
    console.error('Error fixing investments:', error);
    return NextResponse.json(
      { message: 'Failed to fix investments', error: error.message },
      { status: 500 }
    );
  }
} 