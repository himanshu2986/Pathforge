import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import DashboardData from '@/lib/models/DashboardData';
import { cookies } from 'next/headers';

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

import GlobalLearningPath from '@/lib/models/GlobalLearningPath';
import GlobalInternship from '@/lib/models/GlobalInternship';

export async function GET() {
  await dbConnect();
  
  const userId = await getAuthenticatedUser();
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    let dashboard = await DashboardData.findOne({ userId }).lean();
    const globalPaths = await GlobalLearningPath.find({}).lean();
    const globalJobs = await GlobalInternship.find({}).lean();

    if (!dashboard) {
      const defaultLearningPaths = [
        { 
          id: '1', 
          title: 'Full-Stack Development', 
          description: 'Master modern web development from frontend to backend', 
          progress: 0, 
          modules: [ 
            { id: '1a', title: 'HTML & CSS Fundamentals', completed: false, content: 'HTML (HyperText Markup Language) is the standard markup language for documents designed to be displayed in a web browser.\n\nKey Concepts:\n- Elements and Tags\n- Document Structure\n- CSS Selectors and Box Model\n- Layout with Flexbox and Grid', example: '<!-- Basic HTML Structure -->\n<!DOCTYPE html>\n<html>\n<head>\n<style>\n  .box { \n    background: #ec4899; \n    padding: 20px; \n    color: white; \n    font-family: sans-serif; \n    border-radius: 12px; \n  }\n</style>\n</head>\n<body>\n  <div class="box">\n    <h1>Hello Pathforce!</h1>\n    <p>This is a live trial ground.</p>\n  </div>\n</body>\n</html>' }, 
            { id: '1b', title: 'JavaScript Deep Dive', completed: false, content: 'JavaScript is a versatile, high-level programming language that powers the interactive behavior of web pages.\n\nVariables, Functions, and Objects are the building blocks of JS.', example: '<script>\n  const user = { name: "Agent", level: 99 };\n  document.body.innerHTML = `<h1>User: ${user.name}</h1><p>Skill Level: ${user.level}</p>`;\n</script>' }, 
            { id: '1c', title: 'React & State Management', completed: false, content: 'React is a library for building modular user interfaces using a component-based architecture.', example: '<div id="root"></div>\n<script type="text/babel">\n  function App() {\n    return <h1>React Live Demo</h1>;\n  }\n</script>' }, 
            { id: '1d', title: 'Node.js & Express', completed: false }, 
            { id: '1e', title: 'Database Design', completed: false } 
          ] 
        },
        { 
          id: '2', 
          title: 'Machine Learning Fundamentals', 
          description: 'Introduction to ML concepts and practical applications', 
          progress: 0, 
          modules: [ 
            { id: '2a', title: 'Python for ML', completed: false, content: 'Python is the language of AI. Libraries like NumPy, Pandas, and Scikit-Learn provide the mathematical power required for model building.', example: '<script>\n  const data = [1.2, 2.3, 3.4, 4.5];\n  const mean = data.reduce((a,b)=>a+b)/data.length;\n  document.body.innerHTML = `<h1>Data Analysis</h1><p>Processed: ${data.length} nodes</p><p>Vector Mean: ${mean}</p>`;\n</script>' }, 
            { id: '2b', title: 'Linear Algebra Basics', completed: false }, 
            { id: '2c', title: 'Supervised Learning', completed: false }, 
            { id: '2d', title: 'Neural Networks', completed: false } 
          ] 
        }
      ];

      // Convert global paths to dashboard format
      const formattedGlobalPaths = globalPaths.map(p => ({
        id: (p as any)._id.toString(),
        title: (p as any).title,
        description: (p as any).description,
        progress: 0,
        modules: (p as any).modules.map((m: any, i: number) => ({ id: `${(p as any)._id}-${i}`, title: m.title, completed: false }))
      }));

      const formattedGlobalJobs = globalJobs.map(j => ({
        id: (j as any)._id.toString(),
        company: (j as any).company,
        role: (j as any).role,
        location: (j as any).location,
        type: (j as any).type,
        matchScore: (j as any).matchScore,
        skills: (j as any).skills,
        deadline: (j as any).deadline,
        applied: false
      }));

      const doc = await DashboardData.create({
        userId,
        skills: [],
        portfolioProjects: [],
        learningPaths: [...defaultLearningPaths, ...formattedGlobalPaths],
        internships: formattedGlobalJobs.length > 0 ? formattedGlobalJobs : [],
        portfolioScore: 0,
        weeklyProgress: 0,
      });
      dashboard = doc.toObject();
    } else {
      // Merge global content even for existing users if missing
      const existingPathIds = new Set(dashboard.learningPaths.map((p: any) => p.id));
      globalPaths.forEach((p: any) => {
        if (!existingPathIds.has(p._id.toString())) {
          dashboard!.learningPaths.push({
            id: p._id.toString(),
            title: p.title,
            description: p.description,
            progress: 0,
            modules: p.modules.map((m: any, i: number) => ({ id: `${p._id}-${i}`, title: m.title, completed: false }))
          });
        }
      });

      const existingJobIds = new Set(dashboard.internships.map((j: any) => j.id));
      globalJobs.forEach((j: any) => {
        if (!existingJobIds.has(j._id.toString())) {
          dashboard!.internships.push({
            id: j._id.toString(),
            company: j.company,
            role: j.role,
            location: j.location,
            type: j.type,
            matchScore: j.matchScore,
            skills: j.skills,
            deadline: j.deadline,
            applied: false
          });
        }
      });
    }

    return NextResponse.json(dashboard, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  
  const userId = await getAuthenticatedUser();
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();

    // Clean up _id fields from the incoming data so Mongoose doesn't complain about subdocument IDs
    const cleanData = JSON.parse(JSON.stringify(data));

    const dashboard = await DashboardData.findOneAndUpdate(
      { userId },
      { $set: cleanData },
      { new: true, upsert: true }
    );

    return NextResponse.json(dashboard, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
