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
    const u = await User.findById(decoded.userId);
    return u?.role === 'admin';
  } catch {
    return false;
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  if (!(await isAdmin())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  try {
    await GlobalInternship.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Internship Deleted' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
