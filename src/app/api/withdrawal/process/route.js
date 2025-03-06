import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import { validateWalletAddress } from '@/config/wallets';

export async function POST(request) {
  try {
    await connectDB();
    
    const session = await getServerSession();
    console.log('Session in withdrawal process:', session);
    
    if (!session?.user?.id) {
      console.log('No valid session found');
      return NextResponse.json({ 
        message: 'Unauthorized - Please log in again',
        error: 'NO_SESSION' 
      }, { status: 401 });
    }

    const { amount, walletAddress } = await request.json();
    console.log('Processing withdrawal request:', { amount, walletAddress });

    // Validate required fields
    if (!amount || !walletAddress) {
      return NextResponse.json(
        { message: 'Amount and wallet address are required' },
        { status: 400 }
      );
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { message: 'Invalid withdrawal amount' },
        { status: 400 }
      );
    }

    // Validate wallet address format
    if (!validateWalletAddress(walletAddress, 'USDT')) {
      return NextResponse.json(
        { message: 'Invalid USDT (TRC20) wallet address' },
        { status: 400 }
      );
    }

    // Find user and verify profit
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Verify user has sufficient profit
    if (user.profit < amount) {
      return NextResponse.json(
        { message: 'Insufficient profit for withdrawal' },
        { status: 400 }
      );
    }

    // Create withdrawal transaction
    const transaction = await Transaction.create({
      userId: session.user.id,
      type: 'withdrawal',
      amount,
      currency: 'USDT',
      status: 'pending',
      walletAddress,
      transactionHash: `WD${Date.now()}`,
      planId: 'withdrawal'
    });

    // Deduct from profit immediately
    user.profit -= amount;
    await user.save();

    return NextResponse.json({
      message: 'Withdrawal request submitted successfully',
      remainingProfit: user.profit,
      remainingBalance: user.balance,
      transactionId: transaction._id
    });

  } catch (error) {
    console.error('Withdrawal processing error:', error);
    return NextResponse.json(
      { message: 'Failed to process withdrawal', error: error.message },
      { status: 500 }
    );
  }
} 