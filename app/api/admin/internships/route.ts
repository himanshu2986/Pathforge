import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import GlobalInternship from '@/lib/models/GlobalInternship';
import { cookies } from 'next/headers';

async function getAdminUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) return null;

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'admin') {
      return null;
    }
    return user;
  } catch (error) {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json({ message: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const data = await req.json();
    const newInternship = await GlobalInternship.create(data);

    return NextResponse.json(newInternship, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    
    // Both admins and regular users can VIEW all open global internships!
    // Regular users will fetch this to populate their dashboard natively.
    const internships = await GlobalInternship.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json(internships, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
