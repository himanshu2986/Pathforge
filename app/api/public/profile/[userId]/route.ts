import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import DashboardData from '@/lib/models/DashboardData';
import Resume from '@/lib/models/Resume';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  await dbConnect();
  const { userId } = await params;

  try {
    const user: any = await User.findById(userId).select('name email avatar bio location website role createdAt isPublished').lean();
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    let isOwner = false;
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get('auth_token')?.value;
      if (token) {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        if (decoded.userId === userId) {
          isOwner = true;
        }
      }
    } catch(e) {
      // Ignored
    }

    if (user.isPublished === false && !isOwner) {
      return NextResponse.json({ message: 'Stealth Protocol Active: This node is currently hidden from the global registry.' }, { status: 403 });
    }

    const dashboard = await DashboardData.findOne({ userId }).lean();
    const resume = await Resume.findOne({ userId }).sort({ updatedAt: -1 }).lean();

    // Prepare public profile data
    const publicData = {
      profile: user,
      skills: dashboard?.skills || [],
      portfolioProjects: dashboard?.portfolioProjects || [],
      learningPaths: dashboard?.learningPaths?.map((lp: any) => ({
        title: lp.title,
        progress: lp.progress,
        completedModules: lp.modules.filter((m: any) => m.completed).length,
        totalModules: lp.modules.length,
        isMastered: lp.progress === 100
      })) || [],
      resume: resume ? {
        summary: (resume as any).summary,
        experience: (resume as any).experience,
        education: (resume as any).education,
        projects: (resume as any).projects,
        skills: (resume as any).skills,
        strengthScore: (resume as any).strengthScore
      } : null,
      stats: {
        portfolioScore: dashboard?.portfolioScore || 0,
        projectsCompleted: dashboard?.portfolioProjects?.length || 0,
        skillsMastered: (dashboard?.skills || []).filter((s: any) => s.level >= 80).length
      }
    };

    return NextResponse.json(publicData, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
