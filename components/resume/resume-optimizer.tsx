'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, CheckCircle2, AlertCircle, TrendingUp, Zap, Target, BookOpen, Brain, Lightbulb, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OptimizationSuggestion {
  id: string
  type: 'fix' | 'boost' | 'tip'
  message: string
  impact: number // 1-10
}

export function ResumeOptimizer({ data }: { data: any }) {
  const [isOpen, setIsOpen] = useState(false)

  const suggestions = useMemo(() => {
    const list: OptimizationSuggestion[] = []

    // 1. Check for Summary Length
    if (!data.personalInfo.summary || data.personalInfo.summary.length < 50) {
      list.push({
        id: 'summary-len',
        type: 'fix',
        message: 'Your personal mission is too brief. Recruiters look for at least 150 characters of core architectural objective.',
        impact: 8
      })
    }

    // 2. Check for Experience Metrics
    const experienceText = data.experience.map((e: any) => e.bullets.join(' ')).join(' ')
    const hasNumbers = /\d+/.test(experienceText)
    if (!hasNumbers && data.experience.length > 0) {
      list.push({
        id: 'exp-metrics',
        type: 'boost',
        message: 'Quantify your mission impact. Use percentages (%) or raw numbers (X Users, $Y Saved) to validate your mastery.',
        impact: 9
      })
    }

    // 3. Check for Skill Overlap
    if (data.skills.length < 5) {
      list.push({
        id: 'skills-len',
        type: 'fix',
        message: 'Your Skill Matrix is underpopulated. Aim for 8-10 core operational vectors.',
        impact: 7
      })
    }

    // 4. Strong Action Verbs
    const actionVerbs = ['Engineered', 'Architected', 'Deployed', 'Optimized', 'Synthesized', 'Spearheaded']
    const hasStrongVerbs = actionVerbs.some(v => experienceText.includes(v))
    if (!hasStrongVerbs && data.experience.length > 0) {
      list.push({
        id: 'verbs',
        type: 'tip',
        message: 'Integrate High-Velocity Verbs like "Architected" or "Synthesized" to demonstrate leadership.',
        impact: 6
      })
    }

    // 5. Mission Completion Badge (Mocked logic)
    if (list.length === 0) {
      list.push({
        id: 'perfect',
        type: 'boost',
        message: 'Your Resume Integrity is at 100%. Ready for High-Priority Deployments.',
        impact: 0
      })
    }

    return list
  }, [data])

  const overallScore = Math.max(0, 100 - suggestions.filter(s => s.impact > 0).length * 12)

  return (
    <div className="fixed bottom-10 right-10 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-24 right-[-24px] sm:right-0 w-[calc(100vw-40px)] sm:w-[400px] max-h-[70vh] sm:max-h-[600px] bg-slate-900 border border-white/10 rounded-[2.5rem] sm:rounded-[3rem] shadow-3xl overflow-hidden flex flex-col"
          >
             <header className="p-8 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="flex justify-between items-center mb-6">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-xl"><Brain className="w-5 h-5" /></div>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em]">Atlas Optimization Studio</span>
                   </div>
                   <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform"><AlertCircle className="rotate-45 w-6 h-6" /></button>
                </div>
                <div>
                   <h4 className="text-3xl font-black italic tracking-tighter mb-2">Integrity Score: {overallScore}%</h4>
                   <p className="text-[9px] font-bold text-indigo-200 uppercase tracking-widest leading-none">AI Identity Analysis ACTIVE</p>
                </div>
             </header>

             <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-[#020617]">
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                   <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center animate-pulse"><Target className="w-5 h-5 text-white" /></div>
                   <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest">Target Protocol: Senior Architect Engagement</p>
                </div>

                <div className="space-y-4">
                   <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-2">Actionable Intelligence</h5>
                   {suggestions.map((s) => (
                     <motion.div key={s.id} layout className={cn(
                       "p-6 rounded-2xl border transition-all",
                       s.type === 'fix' ? "bg-red-500/5 border-red-500/20" : 
                       s.type === 'boost' ? "bg-emerald-500/5 border-emerald-500/20" : 
                       "bg-indigo-500/5 border-indigo-500/20"
                     )}>
                        <div className="flex items-start gap-4">
                           <div className={cn(
                             "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                             s.type === 'fix' ? "bg-red-500 text-white" : 
                             s.type === 'boost' ? "bg-emerald-500 text-white" : 
                             "bg-indigo-500 text-white"
                           )}>
                              {s.type === 'fix' ? <AlertCircle className="w-4 h-4" /> : s.type === 'boost' ? <TrendingUp className="w-4 h-4" /> : <Lightbulb className="w-4 h-4" />}
                           </div>
                           <div>
                              <p className={cn("text-xs font-bold leading-relaxed", s.type === 'fix' ? "text-red-400" : "text-slate-300")}>{s.message}</p>
                              {s.impact > 0 && <div className="mt-3 flex items-center gap-2 text-[8px] font-black uppercase text-gray-500 tracking-tighter">Impact Vector: +{s.impact}% Efficiency</div>}
                           </div>
                        </div>
                     </motion.div>
                   ))}
                </div>

                <div className="pt-6 border-t border-white/5">
                   <button className="w-full py-4 bg-white/5 hover:bg-white text-gray-500 hover:text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                      <Zap className="w-4 h-4" /> Run Deep Sector Scan
                   </button>
                </div>
             </div>

             <footer className="p-6 bg-black border-t border-white/5 flex justify-center">
                <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest">Protocol v4.2.1-SECURE</p>
             </footer>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={cn(
          "w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-3xl border-2 transition-all group relative",
          overallScore === 100 ? "bg-emerald-500 border-emerald-400" : "bg-indigo-600 border-indigo-500"
        )}
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]" />
        <motion.div animate={{ rotate: isOpen ? 90 : 0 }} className={cn("relative z-10", overallScore === 100 ? "text-white" : "text-white")}>
           <Brain className="w-10 h-10" />
        </motion.div>
        
        {/* Particle Effect for "Perfect" Score */}
        {overallScore === 100 && (
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-12 h-12 bg-white/20 rounded-full animate-ping" />
          </div>
        )}

        <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-slate-900 shadow-lg">
           {suggestions.length}
        </div>
      </button>

      <style jsx global>{`
        .shadow-3xl { shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
      `}</style>
    </div>
  )
}
