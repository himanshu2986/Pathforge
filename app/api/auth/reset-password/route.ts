import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email required' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      return NextResponse.json({ message: 'If an account with that email exists, we sent a reset link to it.' }, { status: 200 });
    }

    // Generate a secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Set token to expire in 15 minutes
    const tokenExpiry = new Date();
    tokenExpiry.setMinutes(tokenExpiry.getMinutes() + 15);

    user.resetToken = resetToken;
    user.resetTokenExpiry = tokenExpiry;
    await user.save();

    // In a production app you would use process.env.NEXT_PUBLIC_APP_URL instead of localhost!
    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    // Connect to your Gmail Account securely
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Structure the beautiful HTML Email it will send!
    const mailOptions = {
      from: `"Pathforge Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Reset Your Pathforge Password',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #0d0f1a; color: #fff; max-width: 600px; margin: 0 auto; padding: 30px; border-radius: 12px; border: 1px solid #ffffff15;">
          <h1 style="color: #00d4ff; font-size: 24px;">PathForge Password Reset</h1>
          <p style="color: #b0b5c1; font-size: 16px; line-height: 1.5;">We received a request to reset the password for your PathForge account. If this was you, please click the secure button below to choose a new password.</p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${resetLink}" style="display: inline-block; padding: 14px 28px; background-color: #00d4ff; color: #0d0f1a; text-decoration: none; border-radius: 8px; font-weight: bold; cursor: pointer;">
              Reset Password
            </a>
          </div>
          
          <p style="margin-top: 30px; font-size: 14px; color: #6b7280; text-align: center;">This link will expire in exactly 15 minutes. If you did not request this, your account is perfectly safe, and you can simply ignore this email.</p>
        </div>
      `
    };

    // Actually send it
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      message: 'If an account with that email exists, we sent a reset link to it.' 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Email sending error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
