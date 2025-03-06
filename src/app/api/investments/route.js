import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import connectDB from '@/lib/db';
import Investment from '@/models/Investment';

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

    // Get user's investments
    const investments = await Investment.find({ userId: session.user.id })
      .sort({ startDate: -1 })
      .lean() || []; // Add default empty array

    // Calculate statistics with safety checks
    const stats = {
      totalInvested: investments?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0,
      totalProfit: investments?.reduce((sum, inv) => sum + (inv.totalProfit || 0), 0) || 0,
      activeInvestments: investments?.filter(inv => inv.status === 'active').length || 0,
      averageROI: investments?.length 
        ? ((investments.reduce((sum, inv) => sum + ((inv.totalProfit || 0) / (inv.amount || 1) * 100), 0) / investments.length) || 0).toFixed(2) 
        : '0.00'
    };

    return NextResponse.json({
      investments: investments || [],
      stats
    });
  } catch (error) {
    console.error('Error fetching investments:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 