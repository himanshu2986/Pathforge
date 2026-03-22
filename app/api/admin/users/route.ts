import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function GET() {
  try {
    await dbConnect();
    
    // In a production app, verify the admin JWT cookie here just like the internship route!
    // For now we rely on the Next.js middleware protecting /admin routes.
    
    const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
    
    return NextResponse.json(users, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
