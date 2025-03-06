import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Investment from '@/models/Investment';
import ProfitDistribution from '@/models/ProfitDistribution';
import { sendEmail } from '@/lib/mail';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Process investment profits
    const activeInvestments = await Investment.find({ status: 'active' });
    
    for (const investment of activeInvestments) {
      const profitRate = calculateProfitRate(investment.plan);
      const dailyProfit = investment.amount * profitRate;

      const distribution = await ProfitDistribution.create({
        userId: investment.userId,
        amount: dailyProfit,
        type: 'investment'
      });

      await User.findByIdAndUpdate(investment.userId, {
        $inc: { 
          balance: dailyProfit,
          profit: dailyProfit
        }
      });

      // Notify user
      const user = await User.findById(investment.userId);
      await sendEmail({
        to: user.email,
        template: 'PROFIT_DISTRIBUTION',
        data: {
          amount: dailyProfit,
          total: user.profit + dailyProfit,
          date: new Date().toLocaleDateString()
        }
      });

      distribution.status = 'processed';
      distribution.processedAt = new Date();
      await distribution.save();
    }

    return NextResponse.json({ message: 'Profit distribution completed' });
  } catch (error) {
    console.error('Profit distribution error:', error);
    return NextResponse.json(
      { message: 'Profit distribution failed' },
      { status: 500 }
    );
  }
}

function calculateProfitRate(plan) {
  const rates = {
    starter: 0.01,    // 1% daily
    advanced: 0.015,  // 1.5% daily
    premium: 0.02,    // 2% daily
    vip: 0.025       // 2.5% daily
  };
  return rates[plan] || 0.01;
} 