import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import { INVESTMENT_PLANS } from '@/config/investmentPlans';
import { sendEmail } from '@/lib/mail';

export async function GET(request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const results = { success: 0, failed: 0, details: [] };

    // Get all completed deposits that are at least 7 days old
    const eligibleDeposits = await Transaction.find({
      type: 'deposit',
      status: 'completed',
      createdAt: {
        $lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      }
    }).populate('userId');

    for (const deposit of eligibleDeposits) {
      try {
        // Get the investment plan details
        const plan = INVESTMENT_PLANS.find(p => p.id === deposit.planId);
        if (!plan) continue;

        // Check if profit was already distributed this week
        const lastProfit = await Transaction.findOne({
          userId: deposit.userId._id,
          type: 'profit',
          status: 'completed',
          relatedDepositId: deposit._id
        }).sort({ createdAt: -1 });

        if (lastProfit) {
          const daysSinceLastProfit = Math.floor(
            (new Date() - new Date(lastProfit.createdAt)) / (24 * 60 * 60 * 1000)
          );
          
          // Skip if less than 7 days since last profit
          if (daysSinceLastProfit < 7) continue;
        }

        // Calculate weekly profit (ROI)
        const weeklyProfit = (deposit.amount * plan.returnRate) / 100;

        // Update user's profit and balance
        await User.findByIdAndUpdate(deposit.userId._id, {
          $inc: { 
            profit: weeklyProfit,
            balance: weeklyProfit
          }
        });

        // Create profit transaction record
        await Transaction.create({
          userId: deposit.userId._id,
          type: 'profit',
          amount: weeklyProfit,
          status: 'completed',
          currency: 'USD',
          planId: deposit.planId,
          relatedDepositId: deposit._id,
          description: `Weekly ROI (${plan.returnRate}%) from ${plan.name}`
        });

        // Send profit notification email
        await sendEmail({
          to: deposit.userId.email,
          template: 'PROFIT_DISTRIBUTION',
          data: {
            amount: weeklyProfit,
            planName: plan.name,
            returnRate: plan.returnRate,
            nextProfitDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        });

        results.success++;
        results.details.push({
          userId: deposit.userId._id,
          email: deposit.userId.email,
          depositAmount: deposit.amount,
          profitAmount: weeklyProfit,
          planName: plan.name,
          status: 'success'
        });

      } catch (error) {
        console.error('Error processing profit for deposit:', error);
        results.failed++;
        results.details.push({
          userId: deposit.userId?._id,
          email: deposit.userId?.email,
          error: error.message,
          status: 'failed'
        });
      }
    }

    return NextResponse.json({
      message: 'Weekly profits distributed',
      results
    });

  } catch (error) {
    console.error('Profit distribution error:', error);
    return NextResponse.json(
      { message: 'Failed to distribute profits' },
      { status: 500 }
    );
  }
} 