import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { isAdmin } from '@/lib/auth';

export async function POST(request) {
  try {
    await connectDB();
    const { email, password } = await request.json();

    // Check if maximum users reached
    const userCount = await User.countDocuments();
    if (userCount >= 5) {
      return NextResponse.json(
        { message: 'Maximum number of users reached' },
        { status: 403 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with admin status
    const user = await User.create({
      email,
      password: hashedPassword,
      isAdmin: isAdmin(email),
      depositDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
    });

    console.log('User registered successfully:', {
      email: user.email,
      hashedPassword: user.password
    });

    return NextResponse.json(
      { 
        message: 'Registration successful. You can now login.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 