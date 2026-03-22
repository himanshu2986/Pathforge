import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const repo = searchParams.get('repo');

  if (!repo) {
    return NextResponse.json({ message: 'Repo parameter missing' }, { status: 400 });
  }

  try {
    // Basic regex to extract owner/repo if full URL is passed
    const match = repo.match(/github\.com\/([^/]+\/[^/]+)/i);
    const repoPath = match ? match[1] : repo;

    const res = await fetch(`https://api.github.com/repos/${repoPath}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        // Optional: Add GITHUB_TOKEN if rate limited
        ...(process.env.GITHUB_TOKEN ? { 'Authorization': `token ${process.env.GITHUB_TOKEN}` } : {})
      }
    });

    if (!res.ok) {
      if (res.status === 404) return NextResponse.json({ message: 'Repo not found' }, { status: 404 });
      throw new Error(`GitHub API responded with ${res.status}`);
    }

    const data = await res.json();
    
    // Fetch languages for a more complete skills list
    const langRes = await fetch(`https://api.github.com/repos/${repoPath}/languages`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        ...(process.env.GITHUB_TOKEN ? { 'Authorization': `token ${process.env.GITHUB_TOKEN}` } : {})
      }
    });
    const languages = langRes.ok ? await langRes.json() : {};
    
    // Combine primary language, topics, and top languages
    const skills = Array.from(new Set([
      data.language,
      ...data.topics,
      ...Object.keys(languages).slice(0, 3)
    ])).filter(Boolean);

    return NextResponse.json({
      stars: data.stargazers_count,
      forks: data.forks_count,
      views: data.watchers_count * 5, 
      lastViewed: new Date().toISOString(),
      skills,
      description: data.description,
      title: data.name
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
