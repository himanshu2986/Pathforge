import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Resume from '@/lib/models/Resume';
import { cookies } from 'next/headers';

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

export async function GET() {
  await dbConnect();
  const userId = await getAuthenticatedUser();
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const resume = await Resume.findOne({ userId }).lean();
    return NextResponse.json(resume || { data: {}, settings: {} }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  const userId = await getAuthenticatedUser();
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const { data, settings } = await req.json();
    const resume = await Resume.findOneAndUpdate(
      { userId },
      { $set: { data, settings, updatedAt: new Date() } },
      { new: true, upsert: true }
    );
    return NextResponse.json(resume, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
