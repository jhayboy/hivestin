import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import connectDB from '@/lib/db';
import SupportCall from '@/models/SupportCall';
import { sendEmail } from '@/lib/mail';

export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const { date, time, topic } = await request.json();

    // Create support call record
    const call = await SupportCall.create({
      userId: session.user.id,
      date: new Date(date),
      time,
      topic,
      status: 'scheduled'
    });

    // Send confirmation email to user
    await sendEmail({
      to: session.user.email,
      template: 'CALL_SCHEDULED',
      data: {
        date: date,
        time: time,
        topic: topic,
        message: 'Your support call has been scheduled. An admin will contact you at the scheduled time.'
      }
    });

    return NextResponse.json({
      message: 'Call scheduled successfully',
      callId: call._id
    });
  } catch (error) {
    console.error('Error scheduling call:', error);
    return NextResponse.json(
      { message: 'Failed to schedule call' },
      { status: 500 }
    );
  }
} 