'use client'

import { Suspense, useMemo } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  Target, 
  Award, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  BookOpen,
  Share2,
  Copy,
  Check,
  Zap,
  Globe,
  Sparkles,
  ChevronRight
} from 'lucide-react'
import { GlassCard, GlassCardContent, GlassCardHeader } from '@/components/ui/glass-card'
import { useAuthStore, useDashboardStore } from '@/lib/store'
import { Progress } from '@/components/ui/progress'
import { CareerAI } from '@/components/dashboard/career-ai'
import { SkillGalaxy } from '@/components/dashboard/skill-galaxy'
import { JobMatchmaker } from '@/components/dashboard/job-matchmaker'
import { CareerMentorAI } from '@/components/dashboard/career-mentor-ai'
import { toast } from 'sonner'

const PortfolioHologram = dynamic(
  () => import('@/components/3d/portfolio-hologram'),
  { ssr: false, loading: () => null }
)

function StatCard({ stat, index }: { stat: {
  label: string
  value: string | number
  change: string
  trend: 'up' | 'down'
  icon: any
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
        <div className="text-3xl font-bold text-foreground mb-1 font-mono italic">{stat.value}</div>
        <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{stat.label}</div>
      </GlassCardContent>
    </GlassCard>
  )
}

function PublicProfileCard() {
  const { user } = useAuthStore()
  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/p/${user?.id}` : ''
  
  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl)
    toast.success("Profile URL Copied to Clipboard!")
  }

  return (
    <GlassCard delay={0.2} glow="accent">
       <GlassCardContent className="p-8 group relative overflow-hidden">
          <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/20 transition-all" />
          
          <div className="flex flex-col md:flex-row items-center gap-10">
             <div className="w-20 h-20 bg-white text-black rounded-[1.5rem] flex items-center justify-center shadow-2xl shrink-0 group-hover:scale-110 transition-transform">
                <Globe className="w-10 h-10" />
             </div>
             
             <div className="flex-1 text-center md:text-left space-y-4">
                <div>
                   <h3 className="text-2xl font-black italic tracking-tighter mb-1">Public Architect Profile</h3>
                   <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Global Atlas Synchronization ACTIVE</p>
                </div>
                <p className="text-sm font-medium text-muted-foreground max-w-lg">Your public portfolio is live and verified. Recruiters can view your full mission history, certificates, and validated skill levels.</p>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                   <div className="px-4 py-2 bg-black/40 border border-white/10 rounded-xl text-[10px] font-bold text-primary truncate max-w-[200px]">
                      {publicUrl}
                   </div>
                   <button onClick={handleCopy} className="p-3 bg-white/5 hover:bg-white text-gray-500 hover:text-black rounded-xl transition-all"><Copy className="w-4 h-4" /></button>
                   <Link href={`/p/${user?.id}`} target="_blank" className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                      View Profile <ArrowUpRight className="w-4 h-4" />
                   </Link>
                </div>
             </div>
          </div>
       </GlassCardContent>
    </GlassCard>
  )
}

const timeAgo = (dateString: string) => {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return `just now`;
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function DashboardOverview() {
  const { user } = useAuthStore()
  const { portfolioScore, skills, internships, portfolioProjects, weeklyProgress, learningPaths, loadUserData, activityLogs } = useDashboardStore()

  const handleGlobalSync = () => {
    const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/p/${user?.id}` : ''
    navigator.clipboard.writeText(publicUrl)
    toast.success("Global Sync: Profile URL Copied!")
  }

  const handleInitialize = () => {
    const tId = toast.loading("Initializing Mission Matrix...")
    if (user?.id) {
      loadUserData(user.id)
    }
    setTimeout(() => toast.success("Mission Matrix Resynced Online.", { id: tId }), 800)
  }
  
  const stats = useMemo(() => {
    const appliedInternships = internships.filter((internship) => internship.applied)
    const availableInternships = internships.length
    const matchRate = availableInternships === 0
      ? 0
      : Math.round(internships.reduce((sum, internship) => sum + internship.matchScore, 0) / availableInternships)

    return [
      {
        label: 'Global Score',
        value: portfolioProjects.length === 0 ? 0 : portfolioScore,
        change: `${portfolioProjects.length} NODE${portfolioProjects.length !== 1 ? 'S' : ''}`,
        trend: 'up' as const,
        icon: Award,
        color: 'from-pink-500 to-indigo-500'
      },
      {
        label: 'Skill Saturation',
        value: `${Math.round(skills.reduce((a,b)=>a+b.level,0)/skills.length || 0)}%`,
        change: `${skills.length} VECTORS`,
        trend: 'up' as const,
        icon: Target,
        color: 'from-cyan-500 to-blue-500'
      },
      {
        label: 'Sync Status',
        value: `${learningPaths.filter(p => p.progress === 100).length}`,
        change: 'Certificates Issued',
        trend: 'up' as const,
        icon: BookOpen,
        color: 'from-emerald-500 to-emerald-600'
      },
      {
        label: 'Mission Cap',
        value: `${matchRate}%`,
        change: 'HIREABILITY RATING',
        trend: 'up' as const,
        icon: Zap,
        color: 'from-amber-500 to-orange-500'
      },
    ]
  }, [portfolioScore, portfolioProjects.length, skills.length, internships, learningPaths])
  
  return (
    <div className="p-4 md:p-8 lg:p-12 space-y-8 md:space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
      >
        <div>
           <div className="flex flex-wrap items-center gap-2 mb-4">
              <div className="px-2 py-1 bg-primary/10 border border-primary/20 text-primary text-[7px] md:text-[8px] font-black uppercase tracking-[0.3em] rounded-full">Mission Status: Online</div>
              <div className="text-gray-600 text-[7px] md:text-[8px] font-black uppercase tracking-widest">• 24ms Platform Latency</div>
           </div>
           <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground italic tracking-tighter leading-none">
             ARCHITECT COMMAND: <span className="gradient-text pr-2">{user?.name?.split(' ')[0] || 'User'}</span>
           </h1>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
           <button onClick={handleGlobalSync} className="flex-1 md:flex-none px-4 md:px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
              <Share2 className="w-4 h-4" /> <span className="whitespace-nowrap">Global Sync</span>
           </button>
           <button onClick={handleInitialize} className="flex-1 md:flex-none px-4 md:px-6 py-3 bg-primary text-white rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-center">
              Initialize Protocol
           </button>
        </div>
      </motion.div>
      
      {/* Dynamic Profile Sharing */}
      <PublicProfileCard />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
        {stats.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} index={i} />
        ))}
      </div>
      
      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-12 gap-10">
        
        {/* Left Control: Holograms & Intelligence */}
        <div className="lg:col-span-4 space-y-10">
           <GlassCard delay={0.2}>
             <GlassCardHeader>
                <div className="flex items-center justify-between">
                   <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Portfolio Projection</h3>
                   <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                   </div>
                </div>
             </GlassCardHeader>
             <GlassCardContent className="h-[300px]">
               <Suspense fallback={
                 <div className="h-full flex items-center justify-center">
                   <Sparkles className="w-8 h-8 text-primary animate-spin" />
                 </div>
               }>
                 <PortfolioHologram score={portfolioScore} />
               </Suspense>
             </GlassCardContent>
           </GlassCard>

           <CareerAI />

           <GlassCard delay={0.3}>
              <GlassCardHeader>
                 <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Synchronization Status</h3>
              </GlassCardHeader>
              <GlassCardContent className="p-6">
                 <ul className="space-y-6">
                    {learningPaths.slice(0, 3).map((path, i) => (
                       <li key={path.id}>
                          <Link href={`/dashboard/learning/${path.id}`} className="group block">
                             <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-black uppercase text-gray-300 group-hover:text-primary transition-colors">{path.title}</span>
                                <span className="text-[10px] font-black text-primary italic">{path.progress}%</span>
                             </div>
                             <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${path.progress}%` }} className="h-full bg-primary" />
                             </div>
                          </Link>
                       </li>
                    ))}
                 </ul>
                 <Link href={`/dashboard/learning/${learningPaths[0]?.id || '1'}`} className="mt-10 flex items-center justify-center gap-2 py-4 border border-dashed border-white/10 rounded-xl text-[10px] font-black uppercase text-gray-500 hover:text-white hover:border-white/20 transition-all">
                    Expand Roadmap <ChevronRight className="w-4 h-4" />
                 </Link>
              </GlassCardContent>
           </GlassCard>
        </div>

        {/* Right Mainframe: Skill Galaxy & Matchmaker */}
        <div className="lg:col-span-8 space-y-12">
           <SkillGalaxy />
           <JobMatchmaker />
           
           {/* Secondary Activity Stream */}
           <div className="grid md:grid-cols-2 gap-8">
              <GlassCard delay={0.4}>
                 <GlassCardHeader>
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Terminal Output</h3>
                 </GlassCardHeader>
                 <GlassCardContent className="p-6">
                     <div className="space-y-4 font-mono">
                        {activityLogs?.slice(0, 4).map((log) => (
                          <div key={log.id || log.action} className="flex justify-between items-center text-[10px]">
                             <span className="text-gray-400">{">"} {log.action}</span>
                             <span className="text-gray-600 italic">{timeAgo(log.timestamp)}</span>
                          </div>
                        ))}
                     </div>
                 </GlassCardContent>
              </GlassCard>

              <GlassCard delay={0.5}>
                 <GlassCardHeader>
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Upcoming Node Syncs</h3>
                 </GlassCardHeader>
                 <GlassCardContent className="p-6">
                    {internships.filter(i => !i.applied).slice(0, 2).map((job, i) => (
                       <div key={i} className="flex items-center gap-4 mb-4 last:mb-0 p-3 bg-white/5 rounded-2xl border border-white/5">
                          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black italic shadow-lg">J</div>
                          <div className="flex-1">
                             <p className="text-[10px] font-black text-white leading-none mb-1">{job.role}</p>
                             <p className="text-[8px] font-black uppercase text-gray-600">{job.company}</p>
                          </div>
                          <div className="text-[10px] font-black text-emerald-500">{new Date(job.deadline).toLocaleDateString()}</div>
                       </div>
                    ))}
                 </GlassCardContent>
              </GlassCard>
           </div>
        </div>
        
      </div>
    </div>
  )
}
