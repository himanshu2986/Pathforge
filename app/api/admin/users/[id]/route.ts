import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  try {
    const decoded: any = jwt.verify((token as any), process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.userId);
    return (user && user.role === 'admin') ? user : null;
  } catch (err) { return null; }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const { id } = await params;
    const updates = await req.json();
    const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });
    
    if (!updatedUser) return NextResponse.json({ message: 'User not found' }, { status: 404 });
    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    
    const { id } = await params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'User permanently banned and removed.' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
