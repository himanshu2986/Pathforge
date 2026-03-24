import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Resume from '@/lib/models/Resume';
import { cookies } from 'next/headers';

export async function GET() {
  await dbConnect();
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const resume = await Resume.findOne({ userId: decoded.userId });
    return NextResponse.json(resume?.data || {}, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const body = await req.json();
    
    // We expect the entire resume data object in 'body.data' and settings in 'body.settings'
    const updatedResume = await Resume.findOneAndUpdate(
      { userId: decoded.userId },
      { 
        userId: decoded.userId,
        data: body.data,
        settings: body.settings,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ message: 'Sync Successful', updatedAt: updatedResume.updatedAt }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
