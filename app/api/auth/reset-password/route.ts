import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // For security reasons, don't reveal if the user exists
      return NextResponse.json({ message: 'If an account exists, a reset link has been sent.' }, { status: 200 });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000); // 1 hour from now

    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    await user.save();

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;
    const resetUrl = `${baseUrl}/reset-password?token=${token}&email=${email}`;

    const { getBrandedEmail } = await import('@/lib/utils/email-template');

    const mailOptions = {
      from: `"Pathforge Atlas" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Password - Pathforge Atlas',
      html: getBrandedEmail({
        title: 'Need a New Password?',
        greeting: user.name,
        body: 'We received a request to reset your Pathforge account password. If you initiated this request, please click the button below to set a new password. This link will expire in 1 hour for your security.',
        buttonText: 'Reset My Password',
        buttonUrl: resetUrl,
        footerText: 'If you did not request a password reset, you can safely ignore this email. No changes will be made to your account.'
      }),
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Reset link sent successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
