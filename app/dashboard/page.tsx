'use client'

import { Suspense, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Target, 
  Award, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  BookOpen
} from 'lucide-react'
import { GlassCard, GlassCardContent, GlassCardHeader } from '@/components/ui/glass-card'
import { useAuthStore, useDashboardStore } from '@/lib/store'
import { Progress } from '@/components/ui/progress'

const PortfolioHologram = dynamic(
  () => import('@/components/3d/portfolio-hologram'),
  { ssr: false, loading: () => null }
)

function StatCard({ stat, index }: { stat: {
  label: string
  value: string | number
  change: string
  trend: 'up' | 'down'
  icon: typeof Award
  color: string
}, index: number }) {
  return (
    <GlassCard delay={index * 0.1} glow="primary">
      <GlassCardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} p-3`}>
            <stat.icon className="w-full h-full text-white" />
          </div>
          <div className={`flex items-center gap-1 text-sm ${
            stat.trend === 'up' ? 'text-emerald-500' : 'text-red-500'
          }`}>
            {stat.trend === 'up' ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            {stat.change}
          </div>
        </div>
        <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
        <div className="text-sm text-muted-foreground">{stat.label}</div>
      </GlassCardContent>
    </GlassCard>
  )
}

function RecentActivity() {
  const { portfolioProjects, skills, internships } = useDashboardStore()
  const activities = useMemo(() => {
    const projectActivities = portfolioProjects.slice(-3).map((project) => ({
      action: `Added project: ${project.title}`,
      time: new Date(project.createdAt).toLocaleDateString(),
    }))

    const skillActivities = skills.slice(-3).map((skill) => ({
      action: `Tracked skill: ${skill.name}`,
      time: new Date(skill.lastUpdated).toLocaleDateString(),
    }))

    const internshipActivities = internships
      .filter((internship) => internship.applied)
      .slice(-3)
      .map((internship) => ({
        action: `Applied to ${internship.company} for ${internship.role}`,
        time: new Date(internship.deadline).toLocaleDateString(),
      }))

    return [...projectActivities, ...skillActivities, ...internshipActivities].slice(0, 5)
  }, [portfolioProjects, skills, internships])

  return (
    <GlassCard delay={0.3}>
      <GlassCardHeader>
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
      </GlassCardHeader>
      <GlassCardContent>
        {activities.length === 0 ? (
          <div className="flex min-h-[180px] items-center justify-center text-center">
            <p className="max-w-xs text-sm text-muted-foreground">
              No activity yet. Add a skill, project, or internship application to start building history.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {activities.map((activity, i) => (
              <motion.li
                key={`${activity.action}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                <div className="flex-1">
                  <p className="text-sm text-foreground">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </GlassCardContent>
    </GlassCard>
  )
}

function LearningProgress() {
  const { learningPaths } = useDashboardStore()
  
  return (
    <GlassCard delay={0.4}>
      <GlassCardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Learning Progress</h3>
          <BookOpen className="w-5 h-5 text-muted-foreground" />
        </div>
      </GlassCardHeader>
      <GlassCardContent>
        {learningPaths.length === 0 ? (
          <div className="flex min-h-[180px] items-center justify-center text-center">
            <p className="max-w-xs text-sm text-muted-foreground">
              No learning paths yet. Add skills first, then your roadmap can grow from there.
            </p>
          </div>
        ) : (
          <ul className="space-y-5">
            {learningPaths.slice(0, 3).map((path, i) => (
              <motion.li
                key={path.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{path.title}</span>
                  <span className="text-sm text-primary">{path.progress}%</span>
                </div>
                <Progress value={path.progress} className="h-2" />
              </motion.li>
            ))}
          </ul>
        )}
      </GlassCardContent>
    </GlassCard>
  )
}

function UpcomingDeadlines() {
  const { internships } = useDashboardStore()
  const upcomingInternships = internships.filter(i => !i.applied).slice(0, 3)
  
  return (
    <GlassCard delay={0.5}>
      <GlassCardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Upcoming Deadlines</h3>
          <Briefcase className="w-5 h-5 text-muted-foreground" />
        </div>
      </GlassCardHeader>
      <GlassCardContent>
        {upcomingInternships.length === 0 ? (
          <div className="flex min-h-[120px] items-center justify-center text-center">
            <p className="max-w-xs text-sm text-muted-foreground">
              No upcoming deadlines. Add or apply to internships to track them here.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {upcomingInternships.map((internship, i) => (
              <motion.li
                key={internship.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex items-center gap-4 p-3 rounded-lg bg-muted/30"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{internship.role}</p>
                  <p className="text-xs text-muted-foreground">{internship.company}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-primary">{internship.matchScore}%</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(internship.deadline).toLocaleDateString()}
                  </p>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </GlassCardContent>
    </GlassCard>
  )
}

export default function DashboardOverview() {
  const { user } = useAuthStore()
  const { portfolioScore, skills, internships, portfolioProjects, weeklyProgress } = useDashboardStore()
  const stats = useMemo(() => {
    const appliedInternships = internships.filter((internship) => internship.applied)
    const availableInternships = internships.length
    const matchRate = availableInternships === 0
      ? 0
      : Math.round(internships.reduce((sum, internship) => sum + internship.matchScore, 0) / availableInternships)

    return [
      {
        label: 'Portfolio Score',
        value: portfolioProjects.length === 0 ? 0 : portfolioScore,
        change: portfolioProjects.length === 0 ? 'No projects yet' : `${portfolioProjects.length} project${portfolioProjects.length > 1 ? 's' : ''}`,
        trend: 'up' as const,
        icon: Award,
        color: 'from-cyan-500 to-blue-500'
      },
      {
        label: 'Skills Mastered',
        value: skills.length,
        change: skills.length === 0 ? 'No skills yet' : `${skills.length} tracked`,
        trend: 'up' as const,
        icon: Target,
        color: 'from-violet-500 to-purple-500'
      },
      {
        label: 'Weekly Progress',
        value: `${weeklyProgress}h`,
        change: weeklyProgress === 0 ? 'No activity yet' : 'Active this week',
        trend: 'up' as const,
        icon: Clock,
        color: 'from-emerald-500 to-teal-500'
      },
      {
        label: 'Match Rate',
        value: `${matchRate}%`,
        change: appliedInternships.length === 0 ? 'No applications yet' : `${appliedInternships.length} applied`,
        trend: 'down' as const,
        icon: Briefcase,
        color: 'from-orange-500 to-red-500'
      },
    ]
  }, [portfolioScore, portfolioProjects.length, skills.length, internships, weeklyProgress])
  
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
          Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0] || 'User'}</span>
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your career development progress
        </p>
      </motion.div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        {stats.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} index={i} />
        ))}
      </div>
      
      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Portfolio Hologram */}
        <GlassCard className="lg:col-span-1" delay={0.2}>
          <GlassCardHeader>
            <h3 className="text-lg font-semibold text-foreground">Portfolio Score</h3>
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
        
        {/* Right Column */}
        <div className="lg:col-span-2 grid gap-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <RecentActivity />
            <LearningProgress />
          </div>
          <UpcomingDeadlines />
        </div>
      </div>
    </div>
  )
}
