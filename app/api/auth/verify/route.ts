import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      return NextResponse.json({ message: 'Missing token or email' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ email, verificationToken: token });

    if (!user) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
    }

    if (user.isVerified) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login?verified=already`);
    }

    // Mark as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    // Redirect to login with success message
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login?verified=true`);
  } catch (error: any) {
    console.error('Verification error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
