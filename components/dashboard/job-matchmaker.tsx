'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, Target, ArrowRight, Zap, Sparkles, AlertCircle } from 'lucide-react'
import { useDashboardStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export function JobMatchmaker() {
  const { internships, skills, learningPaths, applyToInternship } = useDashboardStore()
  
  const recommendations = useMemo(() => {
    return internships.slice(0, 2).map(job => {
      // Find missing skills required for this job
      const skillNames = skills.map(s => s.name.toLowerCase())
      const missingSkills = job.skills.filter(s => !skillNames.includes(s.toLowerCase()))
      
      // Recommend a relevant learning path module
      const suggestedPath = learningPaths.find(p => 
        p.modules.some(m => job.skills.some(js => m.title.toLowerCase().includes(js.toLowerCase())))
      )
      
      const suggestedModule = suggestedPath?.modules.find(m => !m.completed)

      return {
        ...job,
        missingSkills,
        suggestedPath,
        suggestedModule
      }
    })
  }, [internships, skills, learningPaths])

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest flex items-center gap-3">
             <Briefcase className="w-4 h-4" /> PATH-TO-HIRE MISSION SCOUT
          </h3>
          <span className="text-[10px] font-black uppercase text-emerald-500 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">AI Analytics ACTIVE</span>
       </div>

       <div className="grid md:grid-cols-2 gap-6">
          {recommendations.map((job, i) => (
            <motion.div 
              key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
               <div className="p-8 rounded-[2.5rem] bg-[#030712] border border-white/5 shadow-3xl hover:border-primary/20 transition-all group overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10" />
                  
                  <div className="flex justify-between items-start mb-8">
                     <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-3">
                        <Briefcase className="w-full h-full text-gray-400 group-hover:text-primary transition-colors" />
                     </div>
                     <div className="text-right">
                        <p className="text-2xl font-black italic tracking-tighter text-emerald-500">{job.matchScore}%</p>
                        <p className="text-[10px] font-black uppercase text-gray-600">Match Integrity</p>
                     </div>
                  </div>

                  <h4 className="text-xl font-black italic mb-1">{job.role}</h4>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-tighter mb-8">{job.company}</p>

                  {job.suggestedModule ? (
                    <div className="p-5 bg-primary/10 border border-primary/20 rounded-2xl mb-8 group-hover:bg-primary/20 transition-all">
                       <p className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                         <Target className="w-3 h-3" /> TARGET CHAPTER RECOMMENDATION
                       </p>
                       <p className="text-sm font-bold mb-4">Complete module "{job.suggestedModule.title}" to increase match score by +15%.</p>
                       <Link 
                         href={`/dashboard/learning/${job.suggestedPath?.id}`}
                         className="flex items-center gap-2 text-[10px] font-black uppercase text-white hover:text-primary transition-colors"
                       >
                         Initialize Session <ArrowRight className="w-4 h-4" />
                       </Link>
                    </div>
                  ) : (
                    <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl mb-8">
                       <p className="text-[11px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-2">READY FOR DEPLOYMENT</p>
                       <p className="text-xs font-medium text-slate-400">Your current skill matrix meets 100% of the operational requirements for this role.</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                     <Link href="/dashboard/internships" className="flex-1 py-4 bg-white/5 hover:bg-white text-gray-500 hover:text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center">Mission Brief</Link>
                     <button 
                       onClick={() => applyToInternship(job.id)}
                       disabled={job.applied}
                       className={cn(
                         "px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                         job.applied 
                           ? "bg-emerald-500/20 text-emerald-500 cursor-not-allowed" 
                           : "bg-primary text-white shadow-xl shadow-primary/20 hover:scale-105 active:scale-95"
                       )}
                     >
                       {job.applied ? 'Applied' : 'Apply Now'}
                     </button>
                  </div>
               </div>
            </motion.div>
          ))}
       </div>
    </div>
  )
}
