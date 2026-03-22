import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import GlobalLearningPath from '@/lib/models/GlobalLearningPath';
import { cookies } from 'next/headers';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.userId);
    return (user && user.role === 'admin') ? user : null;
  } catch (err) { return null; }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    if (!(await verifyAdmin())) return NextResponse.json({ message: 'Unhauthorized' }, { status: 403 });
    const data = await req.json();
    const newPath = await GlobalLearningPath.create(data);
    return NextResponse.json(newPath, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const paths = await GlobalLearningPath.find({}).sort({ createdAt: -1 });
    return NextResponse.json(paths, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
