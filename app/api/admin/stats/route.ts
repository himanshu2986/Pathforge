import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import { cookies } from 'next/headers';
import DashboardData from '@/lib/models/DashboardData';

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
  if (!(await isAdmin())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const totalUsers = await User.countDocuments();
    const studentUsers = await User.countDocuments({ role: 'student' });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    
    // You could add more stats here, like total projects, skills, etc.
    const activePaths = 4; // Mock or count from a GlobalLearningPath model if it exists

    return NextResponse.json({
      totalUsers,
      studentUsers,
      adminUsers,
      activePaths,
      systemUptime: '99.99%',
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
