import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import { cookies } from 'next/headers';
import DashboardData from '@/lib/models/DashboardData';
import mongoose from 'mongoose';

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
    
    // Aggregating real user growth data for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    // Map to a friendlier format for Recharts
    const chartData = userGrowth.map(d => ({ name: d._id.split('-').slice(1).join('/'), users: d.count }));

    // Count other resources
    const totalInternships = await mongoose.connection.collection('internships')?.countDocuments() || 0;
    const activePaths = await mongoose.connection.collection('learningpaths')?.countDocuments() || 0;

    return NextResponse.json({
      totalUsers,
      studentUsers,
      adminUsers,
      totalInternships,
      activePaths,
      chartData: chartData.length > 0 ? chartData : [{ name: 'Init', users: 0 }],
      systemUptime: '99.98%',
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
