import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SupportCall from '@/models/SupportCall';
import { sendEmail } from '@/lib/mail';

// This endpoint should be called every minute by a cron job
export async function GET(request) {
  try {
    const authKey = new URL(request.url).searchParams.get('auth_key');
    if (authKey !== process.env.CRON_SECRET) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get scheduled calls that need notifications
    const now = new Date();
    const calls = await SupportCall.find({
      status: 'scheduled',
      emailScheduled: {
        $lte: now,
        $gt: new Date(now.getTime() - 60000) // Within the last minute
      },
      notificationSent: { $ne: true }
    }).populate('userId', 'email');

    for (const call of calls) {
      // Send email notification
      await sendEmail({
        to: call.userId.email,
        template: 'SUPPORT_CALL_REMINDER',
        data: {
          topic: call.topic,
          time: call.time,
          date: call.date
        }
      });

      // Mark notification as sent
      call.notificationSent = true;
      await call.save();
    }

    return NextResponse.json({
      message: 'Support call notifications sent',
      processedCalls: calls.length
    });
  } catch (error) {
    console.error('Error sending notifications:', error);
    return NextResponse.json(
      { message: 'Failed to send notifications' },
      { status: 500 }
    );
  }
} 