import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import GlobalInternship from '@/lib/models/GlobalInternship';
import { cookies } from 'next/headers';

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return false;
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.userId);
    return user?.role === 'admin';
  } catch {
    return false;
  }
}

export async function GET() {
  await dbConnect();
  if (!(await isAdmin())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  try {
    const internships = await GlobalInternship.find({}).sort({ createdAt: -1 });
    return NextResponse.json(internships, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  if (!(await isAdmin())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  try {
    const data = await req.json();
    const internship = await GlobalInternship.create(data);
    return NextResponse.json(internship, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
