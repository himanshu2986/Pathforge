'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, MessageSquare, Briefcase, Zap, TrendingUp, Target, Send, X, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export function CareerMentorAI() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([
    { role: 'ai', content: "Protocol Active. I am your Lead Career Architect. I've analyzed your current Skill Galaxy and Resume Integrity. How can I steer your professional deployment today?" }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return
    const userMsg = input
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setIsTyping(true)

    let aiResponse = ""
    setTimeout(() => {
      const lowerReq = userMsg.toLowerCase()
      if (lowerReq.includes('job') || lowerReq.includes('hired')) {
        aiResponse = "Based on your current 88% React mastery, I recommend targeting Mid-Level Frontend roles at high-growth startups. Your 'Maverick' resume template is optimal for this sector."
      } else if (lowerReq.includes('skill') || lowerReq.includes('learn')) {
        aiResponse = "I detect a Node.js saturation gap in your current matrix. Synchronizing with the 'Full-Stack' learning path would increase your hireability by ~32%."
      } else if (lowerReq.includes('resume')) {
        aiResponse = "Your Resume Integrity Score is currently 82%. Using the 'Neural Bullet Optimizer' on your recent project entries will bridge the gap to Elite Status."
      } else {
        aiResponse = "Acknowledged. To maximize your professional velocity, we should focus on quantifying your impact vectors. Would you like to analyze your latest project for recruit-ready metrics?"
      }
      setMessages(prev => [...prev, { role: 'ai', content: aiResponse }])
      setIsTyping(false)
    }, 1500)
  }

  return (
    <div className="fixed bottom-10 right-10 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.9, filter: 'blur(20px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 30, scale: 0.9, filter: 'blur(20px)' }}
            className="absolute bottom-24 right-0 w-[420px] h-[600px] bg-[#07090f] border border-white/10 rounded-[3.5rem] shadow-4xl overflow-hidden flex flex-col backdrop-blur-3xl"
          >
             <header className="p-10 bg-gradient-to-br from-primary to-indigo-900 text-white relative">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="flex justify-between items-center mb-8">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg"><Sparkles className="w-6 h-6" /></div>
                      <div>
                         <h4 className="text-sm font-black uppercase tracking-[0.3em] leading-none mb-1">Career Mentor</h4>
                         <p className="text-[8px] font-bold text-white/50 uppercase tracking-widest leading-none">AI Strategic Deployment Node</p>
                      </div>
                   </div>
                   <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform"><X className="w-6 h-6 text-white/40" /></button>
                </div>
                <div className="flex gap-4">
                   <div className="flex-1 px-4 py-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                      <p className="text-[7px] font-black uppercase text-white/40 mb-1">Status</p>
                      <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Optimizing Matrix</p>
                   </div>
                   <div className="flex-1 px-4 py-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                      <p className="text-[7px] font-black uppercase text-white/40 mb-1">Accuracy</p>
                      <p className="text-[9px] font-bold text-white uppercase tracking-widest">99.8% AI Node</p>
                   </div>
                </div>
             </header>

             <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-6 custom-scrollbar bg-[#020617]/50">
                {messages.map((m, i) => (
                  <div key={i} className={cn("flex", m.role === 'user' ? 'justify-end' : 'justify-start')}>
                    <div className={cn(
                      "max-w-[85%] p-6 text-xs font-medium leading-relaxed shadow-xl",
                      m.role === 'user' ? "bg-primary text-white rounded-[2rem] rounded-tr-none" : "bg-white/5 text-slate-300 border border-white/10 rounded-[2rem] rounded-tl-none"
                    )}>
                       {m.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex items-center gap-3 text-[9px] font-black uppercase text-slate-500 italic px-2">
                     <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                     Mentor is analyzing career vectors...
                  </div>
                )}
             </div>

             <div className="p-6 bg-black/40 border-t border-white/10 flex gap-4 backdrop-blur-md">
                <input 
                  value={input} 
                  onChange={e => setInput(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && handleSend()} 
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 text-xs text-white outline-none focus:border-primary transition-all py-4" 
                  placeholder="Ask for strategic advice..." 
                />
                <button onClick={handleSend} className="p-4 bg-primary text-white rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"><Send className="w-5 h-5" /></button>
             </div>

             <footer className="p-4 bg-black/80 flex justify-center border-t border-white/5">
                <div className="flex items-center gap-3 opacity-30">
                   <ShieldCheck className="w-3 h-3 text-primary" />
                   <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white">Secure Strategic Protocol</p>
                </div>
             </footer>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={cn(
          "w-20 h-20 rounded-[2.5rem] bg-indigo-600 border-2 border-primary/30 flex items-center justify-center shadow-4xl group transition-all relative overflow-hidden",
          isOpen ? "rotate-90 scale-110" : "hover:scale-110 active:scale-95"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {isOpen ? <X className="w-8 h-8 text-white relative z-10" /> : <Sparkles className="w-8 h-8 text-white relative z-10" />}
      </button>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
    </div>
  )
}
