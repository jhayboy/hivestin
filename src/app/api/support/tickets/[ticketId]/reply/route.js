import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import connectDB from '@/lib/db';
import SupportTicket from '@/models/SupportTicket';

export async function POST(request, { params }) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { ticketId } = params;
    const { message } = await request.json();

    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) {
      return NextResponse.json({ message: 'Ticket not found' }, { status: 404 });
    }

    // Add the new message
    ticket.messages.push({
      sender: session.user.id,
      content: message
    });
    ticket.updatedAt = new Date();
    await ticket.save();

    return NextResponse.json(ticket);
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to add reply' },
      { status: 500 }
    );
  }
} 