import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import GlobalInternship from '@/lib/models/GlobalInternship';

export async function GET() {
  try {
    await dbConnect();
    
    // In a real app, verify admin JWT here exactly like in internships/route.ts
    // For now we assume middleware protects /api/admin/*
    
    const userCount = await User.countDocuments();
    const internshipCount = await GlobalInternship.countDocuments();
    
    return NextResponse.json({
      totalUsers: userCount,
      totalInternships: internshipCount,
      activePaths: 5,
      systemUptime: '99.9%'
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
