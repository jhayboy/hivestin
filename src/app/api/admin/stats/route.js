import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import { startOfDay, subDays, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import SupportCall from '@/models/SupportCall';
import { isAdmin } from '@/lib/auth';

export async function GET(request) {
  try {
    await connectDB();
    
    // Check if user is admin
    const session = await getServerSession();
    if (!session || !isAdmin(session.user.email)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'week';

    // Calculate date ranges
    const now = new Date();
    const startDate = timeframe === 'week' ? startOfWeek(now) :
                     timeframe === 'month' ? startOfMonth(now) :
                     startOfYear(now);

    // Fetch user stats
    const [
      totalUsers,
      activeUsers,
      newUsers,
      totalDeposits,
      totalWithdrawals,
      recentTransactions,
      supportCalls
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ hasDeposited: true }),
      User.countDocuments({ createdAt: { $gte: startOfDay(now) } }),
      Transaction.aggregate([
        { $match: { type: 'deposit', status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { type: 'withdrawal', status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('userId', 'email'),
      SupportCall.aggregate([
        { $group: { 
          _id: '$topic',
          count: { $sum: 1 }
        }},
        { $sort: { count: -1 } }
      ])
    ]);

    // Calculate weekly growth
    const lastWeekUsers = await User.countDocuments({
      createdAt: { $lt: startOfDay(now) }
    });
    const weeklyGrowth = lastWeekUsers ? 
      (((totalUsers - lastWeekUsers) / lastWeekUsers) * 100).toFixed(1) : 0;

    // Format recent activity
    const recentActivity = recentTransactions.map(tx => ({
      type: tx.type,
      description: `${tx.type === 'deposit' ? 'Deposit' : 'Withdrawal'} by ${tx.userId.email}`,
      amount: tx.amount,
      timestamp: tx.createdAt
    }));

    // Format response
    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        pending: totalUsers - activeUsers,
        newToday: newUsers,
        weeklyGrowth: parseFloat(weeklyGrowth)
      },
      finances: {
        totalDeposits: totalDeposits[0]?.total || 0,
        totalWithdrawals: totalWithdrawals[0]?.total || 0,
        totalProfit: (totalDeposits[0]?.total || 0) * 0.1, // Example: 10% profit
        currentBalance: (totalDeposits[0]?.total || 0) - (totalWithdrawals[0]?.total || 0),
        weeklyVolume: 0, // Calculate from transactions within timeframe
        monthlyVolume: 0
      },
      support: {
        totalCalls: await SupportCall.countDocuments(),
        pendingCalls: await SupportCall.countDocuments({ status: 'scheduled' }),
        completedCalls: await SupportCall.countDocuments({ status: 'completed' }),
        topTopics: supportCalls.map(topic => ({
          topic: topic._id,
          count: topic.count
        }))
      },
      recentActivity
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 