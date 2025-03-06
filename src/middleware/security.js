import { rateLimit } from '@/lib/rateLimit';
import { getClientIp } from '@/lib/utils';
import { NextResponse } from 'next/server';

export async function securityMiddleware(request) {
  const ip = getClientIp(request);
  
  // Rate limiting check using Redis
  const rateLimitResult = await rateLimit(ip, request.nextUrl.pathname);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { message: 'Too many requests, please try again later' },
      { status: 429 }
    );
  }

  // IP restriction check
  const blockedIps = await getBlockedIps();
  if (blockedIps.includes(ip)) {
    return NextResponse.json(
      { message: 'Access denied from your location' },
      { status: 403 }
    );
  }

  return NextResponse.next();
} 