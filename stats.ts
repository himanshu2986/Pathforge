export interface Project {
  id: string;
  title: string;
  description: string;
  skills: string[];
  url: string;
  createdAt: string;
  views: number;
  likes: number;
  stars: number;
  forks: number;
  lastViewed: string;
}

export interface DashboardStats {
  totalViews: number;
  avgScore: number;
  totalPortfolioScore: number;
  totalStars: number;
  totalLikes: number;
  totalForks: number;
  totalProjects: number;
}

export function calculateStats(projects: Project[]): DashboardStats {
  const initialStats: DashboardStats = {
    totalViews: 0,
    avgScore: 0,
    totalPortfolioScore: 0,
    totalStars: 0,
    totalLikes: 0,
    totalForks: 0,
    totalProjects: 0,
  };

  if (!projects || projects.length === 0) {
    return initialStats;
  }

  const stats = projects.reduce((acc, project) => {
    acc.totalViews += project.views || 0;
    acc.totalStars += project.stars || 0;
    acc.totalLikes += project.likes || 0;
    acc.totalForks += project.forks || 0;
    return acc;
  }, { ...initialStats });

  stats.totalProjects = projects.length;
  
  // Calculate Avg Score based on stars (Total Stars / Project Count)
  stats.avgScore = stats.totalProjects > 0 
    ? Number((stats.totalStars / stats.totalProjects).toFixed(1)) 
    : 0;

  // Calculate Total Portfolio Score (Sum of engagement: Stars + Forks + Likes)
  stats.totalPortfolioScore = stats.totalStars + stats.totalForks + stats.totalLikes;

  return stats;
}