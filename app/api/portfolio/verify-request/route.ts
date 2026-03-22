import { NextResponse } from 'next/server';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import DashboardData from '@/lib/models/DashboardData';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    return decoded.userId;
  } catch { return null; }
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUser();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, projectTitle } = await req.json();
    if (!projectId || !projectTitle) {
      return NextResponse.json({ message: 'Missing project details' }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Update the project in DashboardData
    await DashboardData.updateOne(
      { userId, 'portfolioProjects.id': projectId },
      { $set: { 'portfolioProjects.$.verificationToken': verificationToken } }
    );

    const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/portfolio/verify?userId=${userId}&projectId=${projectId}&token=${verificationToken}`;

    const mailOptions = {
      from: `"Pathforge Verification" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Verify Your Project: ${projectTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h1 style="color: #4F46E5; text-align: center;">Project Verification</h1>
          <p>You recently added the project <strong>${projectTitle}</strong> to your Hub. To verify your ownership and boost your score, please click the link below.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Project Ownership</a>
          </div>
          <p>Verified projects contribute 100% to your profile score, while unverified projects are limited to 10%.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">&copy; 2026 Pathforge Atlas. All rights reserved.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Verification email sent' }, { status: 200 });
  } catch (error: any) {
    console.error('Project verification request failed:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
