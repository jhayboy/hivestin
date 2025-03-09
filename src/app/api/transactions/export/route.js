import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import { format } from 'date-fns';

export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const query = { userId: session.user.id };
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 });

    // Format transactions for export
    const formattedTransactions = transactions.map(tx => ({
      type: tx.type,
      amount: tx.amount,
      currency: tx.currency,
      status: tx.status,
      date: format(new Date(tx.createdAt), 'yyyy-MM-dd HH:mm:ss'),
      transactionId: tx._id
    }));

    return NextResponse.json({
      transactions: formattedTransactions,
      exportDate: format(new Date(), 'yyyy-MM-dd')
    });

  } catch (error) {
    console.error('Transaction export error:', error);
    return NextResponse.json(
      { message: 'Failed to export transactions' },
      { status: 500 }
    );
  }
} 