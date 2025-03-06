import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  console.log('Middleware processing path:', path); // Debug log

  // Public routes that don't need authentication
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  if (publicRoutes.includes(path)) {
    return NextResponse.next();
  }

  // Get the token
  const token = request.cookies.get('auth_token')?.value;
  console.log('Auth token present:', !!token); // Debug log

  if (!token) {
    console.log('No token found, redirecting to login'); // Debug log
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verify token and get payload
    const payload = await verifyToken(token);

    // Check for admin routes
    if (path.startsWith('/admin')) {
      if (!payload.isAdmin) {
        console.log('Non-admin attempting to access admin route');
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // Check for dashboard routes
    if (path.startsWith('/dashboard')) {
      return NextResponse.next();
    }

    return NextResponse.next();
  } catch (error) {
    console.log('Token verification failed:', error); // Debug log
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password'
  ]
}; 