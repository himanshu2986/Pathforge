import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, token, newPassword } = await req.json();

    if (!email || !token || !newPassword) {
      return NextResponse.json({ message: 'Missing required credentials' }, { status: 400 });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: 'Invalid token or email' }, { status: 400 });
    }

    // Check if passwords token matches
    if (user.resetToken !== token) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 400 });
    }

    // Check if token has expired
    if (!user.resetTokenExpiry || new Date() > new Date(user.resetTokenExpiry)) {
      return NextResponse.json({ message: 'Reset link has expired' }, { status: 400 });
    }

    // Passwords match, token is true and valid, hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Assign the new password and clear the tokens so they can't be reused
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    
    await user.save();

    return NextResponse.json({ message: 'Password has been successfully reset' }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
