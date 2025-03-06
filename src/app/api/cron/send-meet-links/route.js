import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SupportCall from '@/models/SupportCall';
import { sendEmail } from '@/lib/mail';
import { createGoogleMeetLink } from '@/lib/googleMeet';

// This endpoint should be called every minute by a cron job
export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get calls that are starting in 5 minutes and haven't sent the meet link
    const now = new Date();
    const calls = await SupportCall.find({
      status: 'scheduled',
      emailScheduled: {
        $lte: now,
        $gt: new Date(now.getTime() - 60000) // Within the last minute
      },
      meetLinkSent: { $ne: true }
    }).populate('userId', 'email');

    for (const call of calls) {
      // Create Google Meet link
      const meetLink = await createGoogleMeetLink({
        summary: `Support Call - ${call.topic}`,
        startTime: new Date(`${call.date.toISOString().split('T')[0]}T${call.time}`),
        duration: 30 // 30 minutes
      });

      // Send email with meet link
      await sendEmail({
        to: call.userId.email,
        template: 'MEET_LINK',
        data: {
          meetLink,
          topic: call.topic,
          time: call.time
        }
      });

      // Mark link as sent
      call.meetLinkSent = true;
      await call.save();
    }

    return NextResponse.json({
      message: 'Meet links sent successfully',
      processedCalls: calls.length
    });
  } catch (error) {
    console.error('Error sending meet links:', error);
    return NextResponse.json(
      { message: 'Failed to send meet links' },
      { status: 500 }
    );
  }
} 