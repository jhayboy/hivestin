import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import User from '@/models/User';
import { INVESTMENT_PLANS } from '@/config/investmentPlans';

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

    // Get all user's transactions
    const transactions = await Transaction.find({ 
      userId: session.user.id 
    }).sort({ createdAt: -1 });

    let totalInvestment = 0;
    let totalROI = 0;

    // Process transactions and calculate ROI
    const processedTransactions = transactions.map(tx => {
      const txObj = tx.toObject();
      
      if (tx.type === 'deposit' && tx.status === 'completed') {
        // Calculate weeks since deposit
        const depositDate = new Date(tx.createdAt);
        const currentDate = new Date();
        const weeksSinceDeposit = Math.floor(
          (currentDate - depositDate) / (7 * 24 * 60 * 60 * 1000)
        );

        // Find plan and ROI rate
        const plan = INVESTMENT_PLANS.find(p => p.id === tx.planId);
        const roiRate = plan ? plan.returnRate : 10; // Default to 10% if no plan found
        
        // Calculate ROI for this deposit
        const roi = (roiRate / 100) * weeksSinceDeposit;
        const roiAmount = tx.amount * roi;

        totalInvestment += tx.amount;
        totalROI += roiAmount;

        return {
          ...txObj,
          _id: tx._id.toString(),
          roi: roi * 100, // Convert to percentage for frontend
          roiAmount
        };
      } else if (tx.type === 'withdrawal') {
        if (tx.status === 'completed') {
          totalROI -= tx.amount; // Deduct completed withdrawals from ROI
        }
        // Note: Failed withdrawals don't affect the totalROI
      }

      return {
        ...txObj,
        _id: tx._id.toString()
      };
    });

    // Calculate ROI percentage
    const roiPercentage = totalInvestment > 0 
      ? (totalROI / totalInvestment) * 100 
      : 0;

    // Update user's profit
    await User.findByIdAndUpdate(session.user.id, {
      $set: { profit: totalROI }
    });

    return NextResponse.json({
      transactions: processedTransactions,
      stats: {
        totalROI,
        totalInvestment,
        roiPercentage
      }
    });

  } catch (error) {
    console.error('Error fetching transaction history:', error);
    return NextResponse.json(
      { message: 'Failed to fetch transaction history' },
      { status: 500 }
    );
  }
} 