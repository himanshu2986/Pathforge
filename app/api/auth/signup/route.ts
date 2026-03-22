import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

// Create Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    
    // Validate input
    const validation = signupSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error.errors[0].message },
        { status: 400 }
      );
    }
    
    const { email, password, name } = validation.data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 409 }
      );
    }

    // Generate Verification Token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await User.create({
      email,
      name,
      password: hashedPassword,
      isVerified: false,
      verificationToken,
    });

    // Send Verification Email
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;
    const verificationUrl = `${baseUrl}/api/auth/verify?token=${verificationToken}&email=${email}`;

    const { getBrandedEmail } = await import('@/lib/utils/email-template');
    
    const mailOptions = {
      from: `"Pathforge Atlas" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - Pathforge Atlas',
      html: getBrandedEmail({
        title: 'Welcome to the Future of Career Advancement',
        greeting: name,
        body: 'Thank you for choosing Pathforge Atlas as your career navigator. Please verify your email address to unlock your personalized learning journey and start building your future today.',
        buttonText: 'Verify Email Address',
        buttonUrl: verificationUrl,
        footerText: 'If you did not sign up for a Pathforge account, please ignore this message.'
      }),
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: 'Signup successful. Please check your email to verify your account.' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
