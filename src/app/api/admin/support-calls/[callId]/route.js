import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import connectDB from '@/lib/db';
import SupportCall from '@/models/SupportCall';
import { isAdmin } from '@/lib/auth';
import { sendEmail } from '@/lib/mail';

export async function PATCH(request, { params }) {
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

    const { callId } = params;
    const { action } = await request.json();

    // Find the call
    const call = await SupportCall.findById(callId)
      .populate('userId', 'email');

    if (!call) {
      return NextResponse.json(
        { message: 'Call not found' },
        { status: 404 }
      );
    }

    // Update call status based on action
    if (action === 'accept') {
      call.status = 'scheduled';
      // Send confirmation email to user
      await sendEmail({
        to: call.userId.email,
        template: 'CALL_CONFIRMATION',
        data: {
          date: call.date.toLocaleDateString(),
          time: call.time,
          topic: call.topic,
          message: 'Your support call has been confirmed. An admin will contact you at the scheduled time.'
        }
      });
    } else if (action === 'decline') {
      call.status = 'cancelled';
      // Send cancellation email to user
      await sendEmail({
        to: call.userId.email,
        template: 'CALL_CANCELLED',
        data: {
          date: call.date.toLocaleDateString(),
          time: call.time,
          message: 'Your support call has been cancelled. Please schedule a new call.'
        }
      });
    }

    await call.save();

    return NextResponse.json({ 
      message: `Call ${action}ed successfully`,
      call
    });
  } catch (error) {
    console.error(`Error ${action}ing support call:`, error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 