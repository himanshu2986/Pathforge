import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  await dbConnect();
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const { isPublished } = await req.json();
    
    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      { isPublished },
      { new: true }
    );

    return NextResponse.json({ 
      message: isPublished ? 'Profile is now Public' : 'Profile is now Private',
      isPublished: updatedUser.isPublished 
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
