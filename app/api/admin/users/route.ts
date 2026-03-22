import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import { cookies } from 'next/headers';

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return false;
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const u = await User.findById(decoded.userId);
    return u?.role === 'admin';
  } catch {
    return false;
  }
}

export async function GET() {
  await dbConnect();
  if (!(await isAdmin())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    return NextResponse.json(users, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
