import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import User from '@/models/User';
import { isAdmin } from '@/lib/auth';
import { sendEmail } from '@/lib/mail';
import { BybitService } from '@/services/bybit';

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    
    const session = await getServerSession();
    if (!session || !isAdmin(session.user.email)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { transactionId } = params;
    const { action } = await request.json();

    const transaction = await Transaction.findById(transactionId)
      .populate('userId');

    if (!transaction) {
      return NextResponse.json(
        { message: 'Transaction not found' },
        { status: 404 }
      );
    }

    if (transaction.type === 'withdrawal') {
      if (action === 'reject') {
        // If rejecting withdrawal, add amount back to user's profit
        await User.findByIdAndUpdate(transaction.userId._id, {
          $inc: { profit: transaction.amount }
        });
        
        transaction.status = 'failed';
        await transaction.save();

        // Send rejection email
        await sendEmail({
          to: transaction.userId.email,
          template: 'WITHDRAWAL_REJECTED',
          data: {
            amount: transaction.amount,
            reason: 'Your withdrawal request was rejected'
          }
        });
      } else if (action === 'approve') {
        transaction.status = 'completed';
        await transaction.save();

        // Send approval email
        await sendEmail({
          to: transaction.userId.email,
          template: 'WITHDRAWAL_APPROVED',
          data: {
            amount: transaction.amount,
            walletAddress: transaction.walletAddress
          }
        });
      }
    } else if (action === 'verify') {
      try {
        const verification = await BybitService.verifyDeposit(
          transaction.transactionHash,
          transaction.currency
        );

        if (verification.verified) {
          transaction.status = 'completed';
          
          // Update user balance
          await User.findByIdAndUpdate(transaction.userId._id, {
            $inc: { balance: transaction.amount },
            hasDeposited: true
          });

          await transaction.save();

          return NextResponse.json({
            message: 'Transaction verified and approved automatically',
            verification
          });
        } else {
          return NextResponse.json({
            message: 'Transaction verification failed',
            verification
          }, { status: 400 });
        }
      } catch (error) {
        console.error('Verification error:', error);
        return NextResponse.json({
          message: 'Failed to verify transaction',
          error: error.message
        }, { status: 500 });
      }
    }

    // Fallback to manual approval/rejection
    if (action === 'approve') {
      try {
        transaction.status = 'completed';
        
        // Update user balance for deposits
        if (transaction.type === 'deposit') {
          await User.findByIdAndUpdate(transaction.userId._id, {
            $inc: { 
              balance: transaction.amount,
              totalDeposits: transaction.amount 
            },
            hasDeposited: true
          });
        }

        await transaction.save();

        // Send confirmation email with better error handling
        const emailResult = await sendEmail({
          to: transaction.userId.email,
          template: 'INVESTMENT_CONFIRMATION',
          data: {
            amount: transaction.amount,
            type: transaction.type,
            transactionId: transaction._id,
            date: new Date().toLocaleDateString()
          }
        });

        console.log('Email sending result:', emailResult);

        return NextResponse.json({ 
          message: 'Transaction approved successfully',
          transaction: transaction,
          emailStatus: emailResult.error ? 'failed' : 'sent'
        });

      } catch (approvalError) {
        console.error('Approval error:', approvalError);
        return NextResponse.json(
          { 
            message: 'Error while approving transaction', 
            error: approvalError.message 
          },
          { status: 500 }
        );
      }
    } else if (action === 'reject') {
      transaction.status = 'failed';
      
      // Send rejection email to user
      await sendEmail({
        to: transaction.userId.email,
        subject: 'Deposit Rejected',
        text: `Your deposit of $${transaction.amount} has been rejected. Please contact support for more information.`
      });
    }

    await transaction.save();

    return NextResponse.json({ 
      message: `Transaction ${action}ed successfully` 
    });
  } catch (error) {
    console.error(`Error processing transaction:`, error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
} 