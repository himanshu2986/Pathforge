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
            { id: '1c', title: 'React & State Management', completed: false, content: 'React is a library for building modular user interfaces using a component-based architecture. State and Props are the primary mechanism for managing data Flow.\n\nState is what allows components to "remember" things—like user input, server responses, or toggle status.', example: '<div id="root"></div>\n<script type="text/babel">\n  function App() {\n    const [count, setCount] = React.useState(0);\n    return (\n      <div style={{textAlign: "center", padding: "2rem"}}>\n        <h1>Phase 3: React Protocol</h1>\n        <button onClick={() => setCount(count + 1)} style={{padding: "1rem 2rem", background: "indigo", color: "white", borderRadius: "10px", border: "none"}}>Count Triggered: {count}</button>\n      </div>\n    );\n  }\n  ReactDOM.render(<App />, document.getElementById("root"));\n</script>' }, 
            { id: '1d', title: 'Node.js & Express', completed: false, content: 'Node.js allows you to execute JavaScript on the server. Express is the minimal framework that helps you build high-performance APIs and backends.\n\nMiddleware and routing are the primary concepts in Express development.', example: '<!-- Simulation of an Express Server Response -->\n<div style="font-family: monospace; background: #1e293b; color: #38bdf8; padding: 2rem; border-radius: 12px;">\n  <p>> GET /api/v1/mission-status</p>\n  <p>> 200 OK - Payload Received</p>\n  <pre>\n  {\n    "status": "synchronized",\n    "latency": "12ms",\n    "uplink": "established"\n  }\n  </pre>\n</div>' }, 
            { id: '1e', title: 'Database Design', completed: false, content: 'Databases are where data lives. SQL (Relational) and NoSQL (Document-based) are the two primary choices. Efficient schema design is critical for performance.', example: '<!-- Database Schema Visualization -->\n<div style="display: flex; gap: 20px; font-family: sans-serif;">\n  <div style="background: #f1f5f9; padding: 20px; border: 2px solid #cbd5e1; border-radius: 12px; flex: 1;">\n    <h3 style="margin-top:0">USERS TABLE</h3>\n    <ul style="font-size: 12px; color: #475569;">\n      <li>ID: UUID</li>\n      <li>EMAIL: VARCHAR(255)</li>\n      <li>AVATAR: URL</li>\n    </ul>\n  </div>\n  <div style="background: #fdf2f8; padding: 20px; border: 2px solid #fbcfe8; border-radius: 12px; flex: 1;">\n    <h3 style="margin-top:0; color: #db2777;">RESUMES TABLE</h3>\n    <ul style="font-size: 12px; color: #db2777;">\n      <li>USER_ID: FK(USERS)</li>\n      <li>NAME: STRING</li>\n      <li>STRENGTH: INT</li>\n    </ul>\n  </div>\n</div>' } 
          ] 
        },
        { 
          id: '2', 
          title: 'Machine Learning Fundamentals', 
          description: 'Introduction to ML concepts and practical applications', 
          progress: 0, 
          modules: [ 
            { id: '2a', title: 'Python for ML', completed: false, content: 'Python is the language of AI. Libraries like NumPy, Pandas, and Scikit-Learn provide the power required for model building.', example: '<script>\n  const data = [1.2, 2.3, 3.4, 4.5];\n  const mean = data.reduce((a,b)=>a+b)/data.length;\n  document.body.innerHTML = `<h1>Data Analysis</h1><p>Processed: ${data.length} nodes</p><p>Vector Mean: ${mean}</p>`;\n</script>' }, 
            { id: '2b', title: 'Linear Algebra Basics', completed: false, content: 'Linear algebra is the mathematical foundation of machine learning. Concepts like Scalar, Vector, Matrix, and Tensor operations allow us to transform data mathematically.', example: '<!-- Vector Math View -->\n<div style="font-family: serif; font-size: 24px; color: #002d5b; border-left: 4px solid #002d5b; padding-left: 20px;">\n  A = [x<sub>1</sub>, x<sub>2</sub>, ..., x<sub>n</sub>]<sup>T</sup>\n</div>' }, 
            { id: '2c', title: 'Supervised Learning', completed: false, content: 'Supervised Learning is the machine learning task of learning a function that maps an input to an output based on example input-output pairs.', example: '<!-- Linear Regression Prediction Simulation -->\n<script>\n  const predict = (x) => 2 * x + 5;\n  document.body.innerHTML = `<h1>Prediction Engine</h1><p>Test Input: 10</p><p>Outcome Prediction: ${predict(10)}</p>`;\n</script>' }, 
            { id: '2d', title: 'Neural Networks', completed: false, content: 'Neural Networks are inspired by the biological structures of the brain. They consist of layers of interconnected "neurons" that process signals to identify complex patterns.', example: '<!-- Dynamic Layer Visualizer -->\n<div style="display:flex; justify-content:space-between; width:200px; padding:20px; background:#000; border-radius:20px;">\n   <div style="width:20px; height:20px; border-radius:50%; background:#fff; box-shadow: 0 0 10px #fff;"></div>\n   <div style="width:20px; height:20px; border-radius:50%; background:#ec4899; box-shadow: 0 0 10px #ec4899;"></div>\n   <div style="width:20px; height:20px; border-radius:50%; background:#fff; box-shadow: 0 0 10px #fff;"></div>\n</div>' } 
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
