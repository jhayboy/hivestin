import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import connectDB from '@/lib/db';
import SupportTicket from '@/models/SupportTicket';

export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { subject, message, category } = await request.json();

    const ticket = await SupportTicket.create({
      userId: session.user.id,
      subject,
      message,
      category: category || 'general',
      messages: [{
        sender: session.user.id,
        content: message
      }]
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Support ticket creation error:', error);
    return NextResponse.json(
      { message: 'Failed to create support ticket' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const tickets = await SupportTicket.find({ userId: session.user.id })
      .sort({ updatedAt: -1 });

    return NextResponse.json(tickets);
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
} 