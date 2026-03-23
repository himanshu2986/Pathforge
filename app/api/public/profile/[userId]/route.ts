import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import DashboardData from '@/lib/models/DashboardData';
import Resume from '@/lib/models/Resume';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  await dbConnect();
  const { userId } = await params;

  try {
    const user = await User.findById(userId).select('name email avatar bio location website role createdAt').lean();
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const dashboard = await DashboardData.findOne({ userId }).lean();
    const resume = await Resume.findOne({ userId }).sort({ updatedAt: -1 }).lean();

    // Prepare public profile data
    const publicData = {
      profile: user,
      skills: dashboard?.skills || [],
      portfolioProjects: dashboard?.portfolioProjects || [],
      learningPaths: dashboard?.learningPaths?.map(lp => ({
        title: lp.title,
        progress: lp.progress,
        completedModules: lp.modules.filter(m => m.completed).length,
        totalModules: lp.modules.length,
        isMastered: lp.progress === 100
      })) || [],
      resume: resume ? {
        summary: resume.summary,
        experience: resume.experience,
        education: resume.education,
        projects: resume.projects,
        skills: resume.skills,
        strengthScore: resume.strengthScore
      } : null,
      stats: {
        portfolioScore: dashboard?.portfolioScore || 0,
        projectsCompleted: dashboard?.portfolioProjects?.length || 0,
        skillsMastered: (dashboard?.skills || []).filter(s => s.level >= 80).length
      }
    };

    return NextResponse.json(publicData, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
