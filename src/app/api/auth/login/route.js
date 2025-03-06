import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { generateToken, isAdmin } from '@/lib/auth';

export async function POST(request) {
  try {
    await connectDB();
    const { email, password } = await request.json();

    console.log('Login attempt for:', email);
    console.log('Is admin email?', isAdmin(email));

    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('No user found with email:', email);
      return NextResponse.json(
        { message: 'User does not exist' },
        { status: 401 }
      );
    }

    console.log('Found user:', {
      email: user.email,
      hasPasswordField: !!user.password,
      userId: user._id,
      isAdmin: user.isAdmin,
      isAdminFunction: isAdmin(user.email)
    });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update user's admin status if needed
    if (user.isAdmin !== isAdmin(user.email)) {
      user.isAdmin = isAdmin(user.email);
      await user.save();
      console.log('Updated user admin status to:', user.isAdmin);
    }

    try {
      // Generate token
      const token = await generateToken(user);
      console.log('Token generated successfully');

      // Determine redirect URL based on admin status
      const redirectUrl = user.isAdmin ? '/admin' : '/dashboard';
      console.log('Setting redirect URL to:', redirectUrl, 'isAdmin:', user.isAdmin);

      const response = NextResponse.json({ 
        message: 'Login successful',
        isAdmin: user.isAdmin,
        redirectUrl: redirectUrl
      });

      // Set auth cookie
      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 // 7 days
      });

      return response;
    } catch (tokenError) {
      console.error('Token generation error:', tokenError);
      return NextResponse.json(
        { message: 'Authentication failed' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'An error occurred during login' },
      { status: 500 }
    );
  }
} 