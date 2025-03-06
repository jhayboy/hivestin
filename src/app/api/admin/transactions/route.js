import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';  // Use our custom session handler
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import { isAdmin } from '@/lib/auth';

export async function GET() {
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

    // Get all transactions with user details
    const transactions = await Transaction.find()
      .populate('userId', 'email')
      .sort({ createdAt: -1 });

    console.log('Raw transactions from DB:', transactions); // Debug log

    // Transform the data to match the component's expectations
    const formattedTransactions = transactions.map(tx => {
      const transaction = tx.toObject(); // Convert to plain object
      return {
        _id: transaction._id.toString(),
        user: { email: transaction.userId?.email },
        type: transaction.type,
        amount: transaction.amount,
        status: transaction.status,
        currency: transaction.currency,
        createdAt: transaction.createdAt,
        walletAddress: transaction.walletAddress,
        transactionHash: transaction.transactionHash
      };
    });

    console.log('Formatted transactions:', formattedTransactions); // Debug log

    return NextResponse.json(formattedTransactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 