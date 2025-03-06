import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import connectDB from '@/lib/db';
import SupportCall from '@/models/SupportCall';

const AVAILABLE_TIMES = [
  '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'
];

export async function GET(request) {
  try {
    await connectDB();
    
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get date from query params
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { message: 'Date is required' },
        { status: 400 }
      );
    }

    // Check if user already has a booking for this date
    const userBooking = await SupportCall.findOne({
      userId: session.user.id,
      date: new Date(date),
      status: 'scheduled'
    });

    if (userBooking) {
      return NextResponse.json({
        availableSlots: [],
        message: 'You already have a booking for this date'
      });
    }

    // Get booked slots for the date
    const bookedCalls = await SupportCall.find({
      date: new Date(date),
      status: { $ne: 'cancelled' }
    }).select('time');

    // Create a set of blocked times (including 3 hours after each booked slot)
    const blockedTimes = new Set();
    bookedCalls.forEach(call => {
      const [hours, minutes] = call.time.split(':').map(Number);
      const baseTime = hours * 60 + minutes;
      
      // Block the booked time and next 3 hours
      for (let i = 0; i <= 180; i += 60) {
        const blockedHour = Math.floor((baseTime + i) / 60);
        const blockedMinutes = '00';
        blockedTimes.add(`${blockedHour.toString().padStart(2, '0')}:${blockedMinutes}`);
      }
    });

    // Filter available times
    const availableSlots = AVAILABLE_TIMES.filter(time => !blockedTimes.has(time));

    return NextResponse.json({ 
      availableSlots,
      hasExistingBooking: false
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 