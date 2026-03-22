import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import DashboardData from '@/lib/models/DashboardData';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const projectId = searchParams.get('projectId');
    const token = searchParams.get('token');

    if (!token || !userId || !projectId) {
      return NextResponse.json({ message: 'Missing parameters' }, { status: 400 });
    }

    await dbConnect();

    // Verify current data
    const dashboard = await DashboardData.findOne({ userId });
    if (!dashboard) return NextResponse.json({ message: 'Dashboard not found' }, { status: 404 });

    const project = (dashboard as any).portfolioProjects.find((p: any) => p.id === projectId);
    if (!project) return NextResponse.json({ message: 'Project not found' }, { status: 404 });

    if (project.verificationToken !== token) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
    }

    // Mark as verified
    await DashboardData.updateOne(
      { userId, 'portfolioProjects.id': projectId },
      { 
        $set: { 'portfolioProjects.$.isVerified': true },
        $unset: { 'portfolioProjects.$.verificationToken': '' }
      }
    );

    // Redirect to dashboard with success message
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${baseUrl}/dashboard/portfolio?projectVerified=true`);
  } catch (error: any) {
    console.error('Project verification error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
