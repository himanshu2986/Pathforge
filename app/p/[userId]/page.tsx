'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShieldCheck, 
  MapPin, 
  Globe, 
  Github, 
  Twitter, 
  Linkedin, 
  ArrowUpRight,
  Zap,
  Award,
  BookOpen,
  Briefcase,
  Layers,
  Code2,
  ExternalLink,
  Mail,
  FileText
} from 'lucide-react'
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

export default function PublicArchitectPortfolio() {
  const params = useParams()
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'resume' | 'projects' | 'mastery'>('resume')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/public/profile/${params.userId}`)
      if (res.ok) {
        setData(await res.json())
      } else {
        setError('Architect Profile Not Found')
      }
    } catch (e) {
      setError('Communication Protocol Error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#07090f] text-white overflow-hidden">
         <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px] animate-pulse" />
         <div className="text-center space-y-4">
            <Zap className="w-12 h-12 text-primary mx-auto animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Synchronizing Identity Matrix...</p>
         </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#07090f] text-white">
         <div className="text-center space-y-6 max-w-sm px-6">
            <ShieldCheck className="w-16 h-16 text-red-500 mx-auto opacity-50" />
            <h2 className="text-3xl font-black italic tracking-tighter">Directory Error</h2>
            <p className="text-gray-500 font-medium">This profile is either private or has been removed from the Atlas global registry.</p>
            <button onClick={() => router.push('/')} className="px-10 py-4 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-white/10 hover:scale-105 active:scale-95 transition-all">Return to Core</button>
         </div>
      </div>
    )
  }

  const { profile, skills, portfolioProjects, learningPaths, resume, stats } = data

  return (
    <div className="min-h-screen bg-[#07090f] text-white selection:bg-primary/30 overflow-x-hidden relative">
      
      {/* Decorative Background */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[180px] opacity-30 -translate-y-1/2 translate-x-1/3" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[180px] opacity-20 translate-y-1/3 -translate-x-1/3" />

      {/* Navigation Top (Recruiter Protocol) */}
      <nav className="fixed top-0 inset-x-0 h-20 z-50 bg-[#07090f]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 lg:px-20">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-indigo-600 rounded-xl flex items-center justify-center shadow-lg"><Zap className="w-6 h-6 text-white" /></div>
            <span className="text-xl font-black italic tracking-tighter">PATHFORGE <span className="text-gray-600">ARCHITECT</span></span>
         </div>
         <div className="flex items-center gap-4">
            <p className="hidden md:block text-[10px] font-black uppercase text-emerald-500 animate-pulse">Live Certification Engine Active</p>
            <a href={`mailto:${profile.email}`} className="px-5 py-2.5 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-200 transition-all shadow-xl shadow-white/10">
               <Mail className="w-4 h-4" /> Message Candidate
            </a>
         </div>
      </nav>

      <main className="relative pt-32 pb-40 max-w-7xl mx-auto px-6 lg:px-12">
         
         <div className="grid lg:grid-cols-12 gap-12 items-start">
            
            {/* Sidebar Profile Card */}
            <aside className="lg:col-span-4 space-y-10">
               <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <GlassCard>
                     <GlassCardContent className="p-8 text-center bg-gradient-to-br to-white/5 from-transparent">
                        <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-primary to-indigo-600 p-1 mx-auto mb-8 shadow-2xl relative group">
                           <div className="w-full h-full rounded-[2.2rem] bg-[#07090f] overflow-hidden flex items-center justify-center relative">
                              {profile.avatar ? (
                                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-5xl font-black text-gray-700">{profile.name?.[0]}</span>
                              )}
                              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                           </div>
                           <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-2xl border-4 border-[#07090f] flex items-center justify-center shadow-lg"><ShieldCheck className="w-5 h-5 text-white" /></div>
                        </div>

                        <h1 className="text-3xl font-black italic tracking-tighter mb-2">{profile.name}</h1>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Master Domain: {resume?.role || 'Senior Architect'}</p>
                        
                        <div className="flex items-center justify-center gap-3 mb-8">
                           <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2 text-[10px] font-bold text-gray-400">
                              <MapPin className="w-3 h-3" /> {resume?.location || 'Operational Base: Remote'}
                           </div>
                           <div className="px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-tighter">
                              Status: Verified Ready
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-8 border-t border-white/5">
                           <div>
                              <p className="text-2xl font-black italic">{stats.portfolioScore}</p>
                              <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mt-1">Global Score</p>
                           </div>
                           <div>
                              <p className="text-2xl font-black italic">{learningPaths.filter((lp: any) => lp.isMastered).length}</p>
                              <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mt-1">Certs Issued</p>
                           </div>
                        </div>
                     </GlassCardContent>
                  </GlassCard>
               </motion.div>

               {/* Mastery Quick View */}
               <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-3">
                     <Award className="w-4 h-4" /> Certification Chain
                  </h3>
                  <div className="space-y-3">
                     {learningPaths.map((lp: any, i: number) => (
                        <div key={i} className={cn("p-4 border rounded-2xl flex items-center justify-between group transition-all", lp.isMastered ? "bg-emerald-500/5 border-emerald-500/20" : "bg-white/5 border-white/5")}>
                           <div className="flex items-center gap-4">
                              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-lg", lp.isMastered ? "bg-emerald-500 text-white" : "bg-white/5 text-gray-600")}>
                                 <BookOpen className="w-5 h-5" />
                              </div>
                              <div>
                                 <p className="text-sm font-bold leading-none mb-1">{lp.title}</p>
                                 <p className="text-[10px] uppercase font-black text-gray-600">{lp.completedModules}/{lp.totalModules} Nodes Mastered</p>
                              </div>
                           </div>
                           {lp.isMastered && <div className="w-6 h-6 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><ArrowUpRight className="w-4 h-4" /></div>}
                        </div>
                     ))}
                  </div>
               </motion.div>
            </aside>

            {/* Content Main Area */}
            <section className="lg:col-span-8 space-y-12">
               
               {/* Primary Section Switcher */}
               <div className="flex p-1.5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-2xl w-fit">
                  {[
                    { id: 'resume', icon: FileText, label: 'Resume Profile' },
                    { id: 'projects', icon: Briefcase, label: 'Project Vault' },
                    { id: 'mastery', icon: Layers, label: 'Skill Matrix' }
                  ].map((t) => (
                    <button 
                      key={t.id} 
                      onClick={() => setActiveTab(t.id as any)} 
                      className={cn(
                        "flex items-center justify-center gap-3 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-500 group",
                        activeTab === t.id 
                          ? "bg-white text-black shadow-xl" 
                          : "text-gray-500 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <t.icon className={cn("w-4 h-4", activeTab === t.id ? "text-primary" : "text-gray-500")} />
                      {t.label}
                    </button>
                  ))}
               </div>

               <AnimatePresence mode="wait">
                  {activeTab === 'resume' && (
                    <motion.div key="resume" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
                       <GlassCard>
                          <GlassCardContent className="p-10">
                             <h2 className="text-3xl font-black italic mb-8">Professional Summary</h2>
                             <p className="text-xl text-gray-400 leading-relaxed font-medium italic">"{resume?.summary || 'No objective statement available.'}"</p>
                          </GlassCardContent>
                       </GlassCard>

                       <div className="space-y-10">
                          <h3 className="text-sm font-black text-gray-600 uppercase tracking-widest flex items-center gap-3 px-2">
                             <History className="w-4 h-4" /> EXPERIENCE TIMELINE
                          </h3>
                          <div className="space-y-8 px-2">
                             {resume?.experience?.map((exp: any, i: number) => (
                               <div key={i} className="flex gap-10 group relative">
                                  <div className="flex flex-col items-center">
                                     <div className="w-12 h-12 bg-white text-black flex items-center justify-center font-black rounded-2xl shadow-xl z-10 group-hover:scale-110 transition-transform">
                                        {i + 1}
                                     </div>
                                     <div className="flex-1 w-px bg-white/10 my-2" />
                                  </div>
                                  <div className="pb-12 flex-1">
                                     <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">{exp.startDate} — {exp.endDate}</p>
                                     <h4 className="text-2xl font-black italic mb-1">{exp.role}</h4>
                                     <p className="text-sm font-bold text-gray-500 uppercase tracking-tighter mb-4">{exp.company}</p>
                                     <p className="text-lg text-gray-400 font-medium leading-relaxed">{exp.description}</p>
                                  </div>
                               </div>
                             ))}
                          </div>
                       </div>
                    </motion.div>
                  )}

                  {activeTab === 'projects' && (
                    <motion.div key="projects" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid md:grid-cols-2 gap-8">
                       {portfolioProjects.length === 0 ? (
                         <div className="col-span-full py-40 border-2 border-dashed border-white/5 rounded-[40px] text-center bg-white/[0.02]">
                            <Briefcase className="w-16 h-16 text-gray-700 mx-auto mb-6" />
                            <p className="text-sm font-black uppercase text-gray-500 tracking-widest">No Projects in Public Registry</p>
                         </div>
                       ) : (
                         portfolioProjects.map((p: any, i: number) => (
                           <motion.div key={i} whileHover={{ y: -10 }}>
                              <GlassCard>
                                 <div className="h-48 bg-gradient-to-br from-primary/10 to-transparent relative overflow-hidden flex items-center justify-center p-12">
                                    <Code2 className="w-20 h-20 text-white opacity-10 group-hover:scale-110 transition-transform" />
                                    <div className="absolute top-4 right-4 flex items-center gap-3">
                                       <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-black uppercase tracking-widest text-gray-500">Verified</span>
                                    </div>
                                 </div>
                                 <div className="p-8">
                                    <h4 className="text-xl font-bold tracking-tight mb-2">{p.title}</h4>
                                    <p className="text-sm text-gray-500 font-medium mb-6 line-clamp-2 h-10">{p.description}</p>
                                    <div className="flex flex-wrap gap-2 mb-8">
                                       {p.skills?.slice(0,3).map((s: string, idx: number) => (
                                         <span key={idx} className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-bold text-gray-400 border border-white/5">{s}</span>
                                       ))}
                                    </div>
                                    <button className="w-full py-4 bg-white/5 hover:bg-white text-gray-400 hover:text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                                       Analyze Repository <ExternalLink className="w-4 h-4 ml-2" />
                                    </button>
                                 </div>
                              </GlassCard>
                           </motion.div>
                         ))
                       )}
                    </motion.div>
                  )}

                  {activeTab === 'mastery' && (
                    <motion.div key="mastery" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid md:grid-cols-2 gap-6">
                       {skills.map((s: any, i: number) => (
                         <GlassCard key={i}>
                            <GlassCardContent className="p-7">
                               <div className="flex justify-between items-start mb-6">
                                  <div className="flex items-center gap-4">
                                     <div className={cn("p-3 rounded-2xl bg-black/40 border border-white/10", s.level >= 80 ? 'text-primary' : 'text-gray-500')}>
                                       <Zap className="w-5 h-5" />
                                     </div>
                                     <div>
                                        <h4 className="text-lg font-bold tracking-tight leading-none mb-1">{s.name}</h4>
                                        <p className="text-[10px] font-black uppercase text-gray-600">{s.category}</p>
                                     </div>
                                  </div>
                                  <span className="text-xl font-black italic">{s.level}%</span>
                               </div>
                               <div className="space-y-3">
                                  <div className="flex justify-between text-[8px] font-black uppercase text-gray-600 tracking-widest">
                                     <span>Mastery Protocol</span>
                                     <span>{s.level >= 80 ? 'OPTIMAL' : 'SYNCHRONIZED'}</span>
                                  </div>
                                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                     <motion.div initial={{ width: 0 }} animate={{ width: `${s.level}%` }} className={cn("h-full", s.level >= 80 ? 'bg-primary shadow-[0_0_10px_#ec4899]' : 'bg-gray-700')} />
                                  </div>
                               </div>
                            </GlassCardContent>
                         </GlassCard>
                       ))}
                    </motion.div>
                  )}
               </AnimatePresence>

            </section>

         </div>

      </main>

      <footer className="relative pt-20 pb-40 px-6 lg:px-20 bg-white/[0.02] border-t border-white/5">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
            <div className="space-y-6 max-w-sm">
               <div className="flex items-center gap-3 justify-center md:justify-start">
                  <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center"><Zap className="w-6 h-6 text-primary" /></div>
                  <span className="text-2xl font-black italic">PATHFORGE</span>
               </div>
               <p className="text-sm font-medium text-gray-500 leading-relaxed">Generated via the Atlas Protocol. All skills and certificates are verified on-chain via the student's activity matrix.</p>
            </div>

            <div className="flex gap-4">
               {[Github, Twitter, Linkedin].map((Icon, i) => (
                 <button key={i} className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 hover:scale-110 active:scale-95 transition-all transition-transform">
                    <Icon className="w-6 h-6 text-gray-400 hover:text-white" />
                 </button>
               ))}
            </div>
         </div>
         <div className="mt-20 text-center">
            <p className="text-[10px] font-black uppercase text-gray-700 tracking-[1em]">Architecture Completed — v3.1.2 — 2026</p>
         </div>
      </footer>

      <style jsx global>{`
         @keyframes pulse-slow {
           0%, 100% { opacity: 0.3; }
           50% { opacity: 0.5; }
         }
         .animate-pulse { animation: pulse-slow 4s ease-in-out infinite; }
      `}</style>
    </div>
  )
}

import { History } from 'lucide-react'
