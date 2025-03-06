import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import { getPlanByAmount } from '@/config/investmentPlans';

export async function POST(request) {
  try {
    await connectDB();
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Log the raw request body
    const requestData = await request.json();
    console.log('Received deposit request data:', requestData);

    const { amount, transactionHash } = requestData;

    // Log the extracted values
    console.log('Extracted values:', {
      amount,
      transactionHash,
      userId: session.user.id
    });

    // Validate amount
    if (!amount) {
      return NextResponse.json(
        { message: 'Amount is required' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { message: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Validate transaction hash
    if (!transactionHash) {
      return NextResponse.json(
        { message: 'Transaction hash is required' },
        { status: 400 }
      );
    }

    // Get investment plan based on amount
    const plan = getPlanByAmount(parseFloat(amount));
    if (!plan) {
      return NextResponse.json(
        { message: 'Invalid investment amount for any plan' },
        { status: 400 }
      );
    }

    // Log the transaction data before creation
    const transactionData = {
      userId: session.user.id,
      type: 'deposit',
      amount: parseFloat(amount),
      status: 'pending',
      transactionHash,
      planId: plan.id,
      currency: 'USD'
    };
    console.log('Creating transaction with data:', transactionData);

    // Create transaction record
    const transaction = await Transaction.create(transactionData);

    // Update user's hasDeposited status
    await User.findByIdAndUpdate(session.user.id, {
      hasDeposited: true
    });

    return NextResponse.json({
      message: 'Deposit submitted for review',
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
        planName: plan.name,
        returnRate: plan.returnRate,
        status: 'pending',
        currency: 'USD'
      }
    });

  } catch (error) {
    console.error('Deposit processing error:', error);
    console.error('Full error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      details: error
    });

    // Check if it's a validation error
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(field => ({
        field,
        message: error.errors[field].message
      }));
      return NextResponse.json(
        { 
          message: 'Validation failed',
          errors: validationErrors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Failed to process deposit',
        error: error.message,
        type: error.name
      },
      { status: 500 }
    );
  }
} 