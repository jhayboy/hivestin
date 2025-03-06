import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getServerSession();
    return NextResponse.json({
      authenticated: !!session,
      user: session?.user || null
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({
      authenticated: false,
      error: 'Failed to check authentication'
    });
  }
} 