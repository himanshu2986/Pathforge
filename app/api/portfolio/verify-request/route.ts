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

    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;
    const verificationUrl = `${baseUrl}/api/portfolio/verify?userId=${userId}&projectId=${projectId}&token=${verificationToken}`;

    const { getBrandedEmail } = await import('@/lib/utils/email-template');

    const mailOptions = {
      from: `"Pathforge Atlas" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Verify Ownership: ${projectTitle}`,
      html: getBrandedEmail({
        title: 'Ready for Your Career Verification?',
        greeting: user.name,
        body: `You recently added <strong>${projectTitle}</strong> to your Hub. Verifying ownership proves your identity and boosts your profile's authenticity. Once verified, this project's views and stars will contribute 100% to your Portfolio Score.`,
        buttonText: 'Verify Project Ownership',
        buttonUrl: verificationUrl,
        footerText: 'This verification helps us maintain a secure and trustworthy community for all users.'
      }),
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Verification email sent' }, { status: 200 });
  } catch (error: any) {
    console.error('Project verification request failed:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
