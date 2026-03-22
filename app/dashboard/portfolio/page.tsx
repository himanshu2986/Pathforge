'use client'

import { Suspense, useMemo, useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { 
  Plus, 
  ExternalLink, 
  Github,
  TrendingUp,
  Eye,
  Star,
  Calendar,
  X,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  Code,
  Zap
} from 'lucide-react'
import { GlassCard, GlassCardContent, GlassCardHeader } from '@/components/ui/glass-card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { toast } from 'sonner'
import { useAuthStore, useDashboardStore } from '@/lib/store'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Pie,
  PieChart as RechartsPieChart,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'

const PortfolioHologram = dynamic(
  () => import('@/components/3d/portfolio-hologram').then(mod => mod.PortfolioHologram),
  { ssr: false }
)

export default function PortfolioPage() {
  const { user } = useAuthStore()
  const {
    portfolioProjects,
    portfolioScore,
    addPortfolioProject,
    setPortfolioProjects,
    updatePortfolioProject,
    deletePortfolioProject,
  } = useDashboardStore()
  const [isAddingProject, setIsAddingProject] = useState(false)
  const [isEditingProject, setIsEditingProject] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [skillsInput, setSkillsInput] = useState('')
  const [url, setUrl] = useState('')



  const viewsData = useMemo(() => {
    const totalViews = portfolioProjects.reduce((sum, project) => sum + (project.views || 0), 0)
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    if (portfolioProjects.length === 0) {
      return days.map((name) => ({ name, views: 5, unique: 3 }))
    }
    const avg = Math.max(1, Math.round(totalViews / 7))
    return days.map((name, index) => ({
      name,
      views: avg + index * 5,
      unique: Math.max(0, avg - 2 + index * 2),
    }))
  }, [portfolioProjects])

  const scoreHistory = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    const baseScore = portfolioScore
    const direction = portfolioProjects.length > 0 ? Math.max(1, portfolioProjects.length) : 1

    return months.map((month, index) => {
      const factor = (index + 1) / months.length
      return {
        month,
        score: Math.max(0, Math.min(100, Math.round(baseScore * (0.4 + 0.6 * factor) + direction * 0.7)))
      }
    })
  }, [portfolioProjects.length, portfolioScore])

  const stats = useMemo(() => {
    const totalViews = portfolioProjects.reduce((sum, project) => sum + (project.views || 0), 0)
    const totalLikes = portfolioProjects.reduce((sum, project) => sum + (project.likes || 0), 0)
    const totalStars = portfolioProjects.reduce((sum, project) => sum + (project.stars || 0), 0)
    const avgRating = portfolioProjects.length === 0 ? 0 : Math.min(5, 4 + portfolioProjects.length * 0.15)
    return [
      { label: 'Total Views', value: totalViews.toLocaleString(), change: portfolioProjects.length === 0 ? '0 this month' : `+${Math.max(8, portfolioProjects.length * 6)} this month`, icon: Eye },
      { label: 'Projects', value: String(portfolioProjects.length), change: portfolioProjects.length === 0 ? '0 this month' : `+${portfolioProjects.length} total`, icon: Github },
      { label: 'Total Stars', value: totalStars.toLocaleString(), change: portfolioProjects.length === 0 ? '0 this month' : `+${Math.max(5, portfolioProjects.length * 4)} this month`, icon: Star },
      { label: 'Avg. Rating', value: avgRating.toFixed(1), change: portfolioProjects.length === 0 ? 'No ratings yet' : '+0.2 this month', icon: Award },
    ]
  }, [portfolioProjects])

  // Enhanced Analytics
  const skillDistribution = useMemo(() => {
    const skillCount: Record<string, number> = {}
    portfolioProjects.forEach(project => {
      project.skills.forEach(skill => {
        skillCount[skill] = (skillCount[skill] || 0) + 1
      })
    })
    return Object.entries(skillCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([skill, count]) => ({ skill, count }))
  }, [portfolioProjects])

  const categoryBreakdown = useMemo(() => {
    const categories: Record<string, { count: number; totalViews: number; totalStars: number }> = {}
    portfolioProjects.forEach(project => {
      const category = project.category || 'other'
      if (!categories[category]) {
        categories[category] = { count: 0, totalViews: 0, totalStars: 0 }
      }
      categories[category].count++
      categories[category].totalViews += project.views || 0
      categories[category].totalStars += project.stars || 0
    })
    return Object.entries(categories).map(([category, data]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      ...data
    }))
  }, [portfolioProjects])

  const projectPerformance = useMemo(() => {
    return portfolioProjects
      .map(project => {
        const views = project.views || 0
        const likes = project.likes || 0
        const stars = project.stars || 0
        const forks = project.forks || 0
        
        // 90% Penalty Logic: If project is unverified, severely throttle its impact
        const isVerified = (project as any).isVerified;
        const penaltyMultiplier = isVerified ? 1.0 : 0.1;

        const engagement = Math.round(((likes + forks) / Math.max(1, views)) * 100)
        const score = Math.round((views * 0.01 + stars * 0.5 + likes * 0.2 + forks * 0.3) * penaltyMultiplier)

        return {
          name: project.title.length > 15 ? project.title.substring(0, 15) + '...' : project.title,
          views,
          stars,
          engagement,
          score,
          isVerified
        }
      })
      .sort((a, b) => b.views - a.views)
  }, [portfolioProjects])

  // Recalculate global portfolio score when projects change
  useEffect(() => {
    if (portfolioProjects.length === 0) {
      useDashboardStore.setState({ portfolioScore: 0 });
      return;
    }
    
    // Aggregated score logic: Base score on projects + weighted impact
    const totalProjectPoints = projectPerformance.reduce((acc, curr) => acc + curr.score, 0);
    const countBonus = portfolioProjects.length * 5;
    const finalScore = Math.min(100, Math.round((totalProjectPoints / portfolioProjects.length) + countBonus));
    
    useDashboardStore.setState({ portfolioScore: finalScore });
  }, [projectPerformance, portfolioProjects.length]);

  const technologyRadar = useMemo(() => {
    const techData: Record<string, number> = {}
    portfolioProjects.forEach(project => {
      project.skills.forEach(skill => {
        techData[skill] = (techData[skill] || 0) + (project.views || 0)
      })
    })
    return Object.entries(techData)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6)
      .map(([technology, performance]) => ({
        technology,
        performance: Math.min(100, performance / 10)
      }))
  }, [portfolioProjects])

  const engagementTrend = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date.toISOString().split('T')[0]
    })

    return last7Days.map((date, index) => {
      const dayProjects = portfolioProjects.filter(project => 
        project.lastViewed && project.lastViewed.startsWith(date)
      )
      const baseViews = dayProjects.reduce((sum, p) => sum + (p.views || 0), 0)
      const baseEngagement = dayProjects.reduce((sum, p) => sum + ((p.likes || 0) + (p.forks || 0)), 0)
      const trendModifier = Math.round((index + 1) * 3)

      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        views: Math.max(0, baseViews + trendModifier),
        engagement: Math.max(0, baseEngagement + Math.round(trendModifier / 2)),
      }
    })
  }, [portfolioProjects])

  const [isLoadingStats, setIsLoadingStats] = useState(false)

  const fetchGithubStats = async (githubUrl: string) => {
    try {
      const res = await fetch(`/api/github/stats?repo=${encodeURIComponent(githubUrl)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) { console.error('GitHub Sync failed:', e); }
    return null;
  }

  const handleSaveProject = async () => {
    const projectTitle = title.trim()
    const projectDescription = description.trim()
    const projectSkills = skillsInput.split(',').map((skill) => skill.trim()).filter(Boolean)
    if (!projectTitle || !projectDescription || projectSkills.length === 0) return

    setIsLoadingStats(true)
    let githubStats = { stars: 0, forks: 0, views: 0, lastViewed: new Date().toISOString(), isVerified: false };
    
    if (url.includes('github.com')) {
      const fetched = await fetchGithubStats(url.trim());
      if (fetched) {
        githubStats = { ...fetched, isVerified: false }; // Always start with false for email verification
      }
    }

    let newProjectId = `project-${Date.now()}`;
    if (isEditingProject && editingProjectId) {
      newProjectId = editingProjectId;
      updatePortfolioProject(editingProjectId, {
        title: projectTitle,
        description: projectDescription,
        skills: projectSkills,
        url: url.trim() || undefined,
        ...githubStats
      })
    } else {
      addPortfolioProject({
        id: newProjectId,
        title: projectTitle,
        description: projectDescription,
        skills: projectSkills,
        url: url.trim() || undefined,
        createdAt: new Date().toISOString(),
        ...githubStats,
        likes: Math.floor(githubStats.stars * 0.2), // Estimate likes from stars
      })
    }

    // Trigger Email Verification for Project Ownership
    try {
      await fetch('/api/portfolio/verify-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          projectId: newProjectId, 
          projectTitle 
        })
      });
      toast.success('Project saved!', {
        description: 'Please check your email to verify ownership and unlock full scoring impact.'
      });
    } catch (e) {
      console.error('Failed to send verification email:', e);
      toast.error('Project saved, but verification email failed to send.');
    }

    setTitle('')
    setDescription('')
    setSkillsInput('')
    setUrl('')
    setIsAddingProject(false)
    setIsEditingProject(false)
    setEditingProjectId(null)
    setIsLoadingStats(false)
  }
  
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
            Portfolio <span className="gradient-text">Analytics</span>
          </h1>
          <p className="text-muted-foreground">
            Track your portfolio performance and optimize your presence
          </p>
        </div>
        <div className="flex gap-3">
          <MagneticButton variant="primary" onClick={() => {
            setIsAddingProject(true)
            setIsEditingProject(false)
            setEditingProjectId(null)
          }}>
            <Plus className="w-5 h-5" />
            Add Project
          </MagneticButton>
        </div>
      </motion.div>

      {isAddingProject && (
        <GlassCard className="mb-8" delay={0}>
          <GlassCardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Add Project</h3>
              <button
                onClick={() => setIsAddingProject(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close add project form"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Project Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task Manager"
                  className="w-full rounded-lg bg-input border border-border px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Project URL</label>
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://github.com/you/project"
                  className="w-full rounded-lg bg-input border border-border px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-foreground">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="What the project does and what you built."
                  className="w-full rounded-lg bg-input border border-border px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-foreground">Skills Used</label>
                <input
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="React, TypeScript, Tailwind CSS"
                  className="w-full rounded-lg bg-input border border-border px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setIsAddingProject(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <MagneticButton variant="primary" onClick={handleSaveProject} disabled={isLoadingStats}>
                {isLoadingStats ? 'Syncing GitHub...' : (isEditingProject ? 'Update Project' : 'Save Project')}
              </MagneticButton>
            </div>
          </GlassCardContent>
        </GlassCard>
      )}
      
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, i) => (
          <GlassCard key={stat.label} delay={i * 0.1} glow="primary">
            <GlassCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-emerald-500">{stat.change}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>
        ))}
      </div>
      
      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
        {/* Score Hologram */}
        <GlassCard delay={0.2}>
          <GlassCardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Portfolio Score</h3>
              <div className="text-right">
                <p className="text-4xl font-bold text-foreground">{portfolioScore}</p>
                <p className="text-xs text-muted-foreground">Overall score</p>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent className="h-[300px]">
            <Suspense fallback={
              <div className="h-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            }>
              <PortfolioHologram score={portfolioScore} />
            </Suspense>
          </GlassCardContent>
        </GlassCard>
        
        {/* Score Progress */}
        <GlassCard delay={0.3} className="lg:col-span-2">
          <GlassCardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Score Progress</h3>
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
          </GlassCardHeader>
          <GlassCardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scoreHistory}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
                <XAxis dataKey="month" stroke="#71717a" fontSize={12} />
                <YAxis stroke="#71717a" fontSize={12} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a2e', 
                    border: '1px solid #2a2a4a',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#e4e4e7' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#00d4ff" 
                  strokeWidth={2}
                  fill="url(#scoreGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCardContent>
        </GlassCard>
      </div>
      
      {/* Views Chart */}
      <GlassCard delay={0.4} className="mb-8">
        <GlassCardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Weekly Views</h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-muted-foreground">Total Views</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent" />
                <span className="text-muted-foreground">Unique Visitors</span>
              </div>
            </div>
          </div>
        </GlassCardHeader>
        <GlassCardContent className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={viewsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
              <XAxis dataKey="name" stroke="#71717a" fontSize={12} />
              <YAxis stroke="#71717a" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1a2e', 
                  border: '1px solid #2a2a4a',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#e4e4e7' }}
              />
              <Line 
                type="monotone" 
                dataKey="views" 
                stroke="#00d4ff" 
                strokeWidth={2}
                dot={{ fill: '#00d4ff', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="unique" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </GlassCardContent>
      </GlassCard>

      {/* Enhanced Analytics Section */}
      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
        {/* Skill Distribution */}
        <GlassCard delay={0.5}>
          <GlassCardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Skill Distribution</h3>
              <Code className="w-5 h-5 text-primary" />
            </div>
          </GlassCardHeader>
          <GlassCardContent className="h-[300px]">
            {skillDistribution.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center">
                <p className="text-sm text-muted-foreground">No skills data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={skillDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    label={(entry: { skill: string; count: number }) => `${entry.skill}: ${entry.count}`}
                  >
                    {skillDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            )}
          </GlassCardContent>
        </GlassCard>

        {/* Technology Performance Radar */}
        <GlassCard delay={0.6}>
          <GlassCardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Technology Performance</h3>
              <Zap className="w-5 h-5 text-primary" />
            </div>
          </GlassCardHeader>
          <GlassCardContent className="h-[300px]">
            {technologyRadar.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center">
                <p className="text-sm text-muted-foreground">No technology data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={technologyRadar}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="technology" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar
                    name="Performance"
                    dataKey="performance"
                    stroke="#00d4ff"
                    fill="#00d4ff"
                    fillOpacity={0.3}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </GlassCardContent>
        </GlassCard>
      </div>

      {/* Project Performance & Category Breakdown */}
      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
        {/* Project Performance Comparison */}
        <GlassCard delay={0.7}>
          <GlassCardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Project Performance</h3>
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
          </GlassCardHeader>
          <GlassCardContent className="h-[300px]">
            {projectPerformance.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center">
                <p className="text-sm text-muted-foreground">No project data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={10} />
                  <YAxis stroke="#71717a" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a2e', 
                      border: '1px solid #2a2a4a',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#e4e4e7' }}
                  />
                  <Bar dataKey="views" fill="#00d4ff" />
                  <Bar dataKey="stars" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </GlassCardContent>
        </GlassCard>

        {/* Category Breakdown */}
        <GlassCard delay={0.8}>
          <GlassCardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Category Breakdown</h3>
              <PieChart className="w-5 h-5 text-primary" />
            </div>
          </GlassCardHeader>
          <GlassCardContent className="h-[300px]">
            {categoryBreakdown.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center">
                <p className="text-sm text-muted-foreground">No category data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    label={(entry: { category: string; count: number }) => `${entry.category}: ${entry.count}`}
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${index * 60 + 30}, 70%, 60%)`} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            )}
          </GlassCardContent>
        </GlassCard>
      </div>

      {/* Engagement Trend */}
      <GlassCard delay={0.9} className="mb-8">
        <GlassCardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Engagement Trend</h3>
            <Activity className="w-5 h-5 text-primary" />
          </div>
        </GlassCardHeader>
        <GlassCardContent className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={engagementTrend}>
              <defs>
                <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
              <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
              <YAxis stroke="#71717a" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1a2e', 
                  border: '1px solid #2a2a4a',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#e4e4e7' }}
              />
              <Area
                type="monotone"
                dataKey="engagement"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#engagementGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCardContent>
      </GlassCard>
      
      {/* Projects */}
      <GlassCard delay={0.5}>
        <GlassCardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Your Projects</h3>
            <span className="text-sm text-muted-foreground">{portfolioProjects.length} projects</span>
          </div>
        </GlassCardHeader>
        <GlassCardContent>
          {portfolioProjects.length === 0 ? (
            <div className="flex min-h-[220px] items-center justify-center text-center">
              <p className="max-w-xs text-sm text-muted-foreground">
                No projects yet. Use `Add Project` to enter your first portfolio item.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolioProjects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="group p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {project.title}
                        <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                          (project as any).isVerified ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          {(project as any).isVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setIsAddingProject(true)
                          setIsEditingProject(true)
                          setEditingProjectId(project.id)
                          setTitle(project.title)
                          setDescription(project.description)
                          setSkillsInput(project.skills.join(', '))
                          setUrl(project.url || '')
                        }}
                        className="text-xs text-primary hover:text-accent"
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete project '${project.title}'?`)) {
                            deletePortfolioProject(project.id)
                          }
                        }}
                        className="text-xs text-destructive hover:text-destructive/80"
                        type="button"
                      >
                        Delete
                      </button>
                      {project.url ? (
                        <a 
                          href={project.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : null}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {project.skills.slice(0, 3).map((skill) => (
                      <span 
                        key={skill}
                        className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary"
                      >
                        {skill}
                      </span>
                    ))}
                    {project.skills.length > 3 && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
                        +{project.skills.length - 3}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {project.views || 0}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {project.stars || 0}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-3 h-3 text-yellow-400" />
                      <span>{Math.round((project.views || 0) * 0.35 + (project.stars || 0) * 12 + (project.likes || 0) * 6 + (project.forks || 0) * 4)}</span>
                      <Calendar className="w-3 h-3" />
                      {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </GlassCardContent>
      </GlassCard>
      
      {/* Portfolio Insights */}
      <GlassCard delay={0.7} className="mt-8">
        <GlassCardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Portfolio Insights</h3>
            <Target className="w-5 h-5 text-primary" />
          </div>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolioProjects.length === 0 ? (
              <div className="col-span-full flex items-center justify-center py-8">
                <p className="text-sm text-muted-foreground">Add projects to see insights</p>
              </div>
            ) : (
              <>
                <div className="p-4 rounded-xl bg-muted/20">
                  <p className="text-sm font-medium text-foreground mb-2">Top Performing Skill</p>
                  <p className="text-lg font-semibold text-primary">
                    {skillDistribution[0]?.skill || 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Used in {skillDistribution[0]?.count || 0} projects
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-muted/20">
                  <p className="text-sm font-medium text-foreground mb-2">Most Viewed Project</p>
                  <p className="text-lg font-semibold text-primary">
                    {projectPerformance[0]?.name || 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {projectPerformance[0]?.views || 0} views
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-muted/20">
                  <p className="text-sm font-medium text-foreground mb-2">Growth Opportunity</p>
                  <p className="text-lg font-semibold text-primary">
                    {categoryBreakdown.length > 1 ? 'Diversify Categories' : 'Add More Projects'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {categoryBreakdown.length} categories currently
                  </p>
                </div>
              </>
            )}
          </div>
        </GlassCardContent>
      </GlassCard>
    </div>
  )
}
