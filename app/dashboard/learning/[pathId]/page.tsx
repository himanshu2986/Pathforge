'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, 
  CheckCircle2, 
  Circle, 
  BookOpen, 
  Play, 
  FileText, 
  ArrowRight,
  ArrowLeft,
  Code2,
  Zap,
  Layout,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  Search,
  MessageCircle,
  Trophy,
  History,
  Terminal,
  Maximize2,
  Sparkles,
  Send,
  Download,
  Award,
  Check
} from 'lucide-react'
import { useDashboardStore } from '@/lib/store'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'

// --- Component: Mentor AI Bot ---
const MentorBot = ({ moduleTitle, moduleContent }: { moduleTitle: string, moduleContent: string }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([
    { role: 'ai', content: `Hello! I'm your Pathforce Mentor. I've read the documentation for "${moduleTitle}". How can I help you master this chapter?` }
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

    // Simulating Contextual AI Analysis
    setTimeout(() => {
      let aiResponse = `Based on the "${moduleTitle}" documentation, remember that the core objective is efficiency. `
      if (userMsg.toLowerCase().includes('help') || userMsg.toLowerCase().includes('explain')) {
        aiResponse += `This module focuses on: ${moduleContent.substring(0, 100)}... Is there a specific part of the blueprint you'd like me to break down?`
      } else {
        aiResponse += "That's a great question! In professional environments, we prioritize modularity and clean architecture as discussed in this chapter."
      }
      setMessages(prev => [...prev, { role: 'ai', content: aiResponse }])
      setIsTyping(false)
    }, 1500)
  }

  return (
    <div className="fixed bottom-10 right-10 z-[110]">
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }} className="absolute bottom-20 right-0 w-80 md:w-96 h-[500px] bg-[#030712] border border-white/10 rounded-[2.5rem] shadow-3xl overflow-hidden flex flex-col">
            <header className="p-6 bg-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center"><Sparkles className="w-4 h-4" /></div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-widest leading-none">Mentor AI</h4>
                  <p className="text-[8px] text-white/60 font-bold mt-1 uppercase">Mission Specialist</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform"><X className="w-5 h-5" /></button>
            </header>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/5">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex", m.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div className={cn("max-w-[80%] p-4 text-xs font-medium leading-relaxed", m.role === 'user' ? 'bg-indigo-600 text-white rounded-[1.5rem] rounded-tr-none' : 'bg-white/5 text-slate-300 border border-white/10 rounded-[1.5rem] rounded-tl-none')}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isTyping && <div className="text-[10px] text-slate-500 font-bold italic">Mentor is analyzing...</div>}
            </div>
            <div className="p-4 border-t border-white/10 bg-black/40 flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-xs text-white outline-none focus:border-indigo-500 transition-all" placeholder="Ask about this chapter..." />
              <button onClick={handleSend} className="p-3 bg-indigo-600 text-white rounded-xl hover:scale-105 active:scale-95 transition-all"><Send className="w-4 h-4" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={() => setIsOpen(!isOpen)} className="w-16 h-16 bg-[#002d5b] text-white rounded-full flex items-center justify-center shadow-3xl border-2 border-indigo-500/30 hover:scale-110 active:scale-90 transition-all group relative">
        <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#020617] animate-pulse" />
      </button>
    </div>
  )
}

// --- Component: Quiz Modal ---
const QuizModal = ({ isOpen, onClose, quizData, onComplete }: { isOpen: boolean, onClose: () => void, quizData: any[], onComplete: () => void }) => {
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  if (!isOpen) return null

  const handleNext = () => {
    if (selected === quizData[step].answer) setScore(s => s + 1)
    if (step < quizData.length - 1) {
      setStep(step + 1)
      setSelected(null)
    } else {
      setFinished(true)
    }
  }

  const handleFinalSubmit = () => {
    onComplete()
    onClose()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
      <div className="w-full max-w-xl bg-[#030712] border border-white/10 rounded-[3rem] p-10 shadow-3xl text-white overflow-hidden relative">
         {!finished ? (
           <>
             <div className="flex justify-between items-center mb-10">
                <span className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.2em]">Live Assessment: Chapter Node</span>
                <span className="text-xs font-bold text-slate-500">Question {step + 1} of {quizData.length}</span>
             </div>
             <h3 className="text-2xl font-black mb-10 tracking-tight leading-tight">{quizData[step].question}</h3>
             <div className="space-y-4 mb-12">
                {quizData[step].options.map((opt: string, i: number) => (
                  <button key={i} onClick={() => setSelected(i)} className={cn("w-full p-6 rounded-2xl text-left font-bold text-sm transition-all border-2", selected === i ? "bg-indigo-600 border-indigo-400" : "bg-white/5 border-white/5 hover:border-white/20")}>
                    <div className="flex items-center gap-4">
                      <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center border", selected === i ? 'bg-white text-indigo-600' : 'bg-white/10 border-white/10')}>
                         {String.fromCharCode(65 + i)}
                      </div>
                      {opt}
                    </div>
                  </button>
                ))}
             </div>
             <button disabled={selected === null} onClick={handleNext} className="w-full py-6 bg-white text-black rounded-[1.5rem] font-black uppercase text-xs tracking-[0.3em] disabled:opacity-20 transition-all flex items-center justify-center gap-3">
               {step < quizData.length - 1 ? 'Next Phase' : 'Evaluate Knowledge'} <ArrowRight className="w-4 h-4" />
             </button>
           </>
         ) : (
           <div className="text-center py-10">
              <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-3xl border border-emerald-500/40">
                <Award className="w-12 h-12" />
              </div>
              <h2 className="text-4xl font-black mb-4">Mastery Verified!</h2>
              <p className="text-slate-400 font-medium mb-10 px-10">You've successfully synchronized {score} of {quizData.length} conceptual nodes. Skills have been updated in your profile.</p>
              <button onClick={handleFinalSubmit} className="w-full py-6 bg-emerald-500 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-[0.3em] shadow-xl shadow-emerald-500/20 transition-all">Proceed to Next Mission</button>
           </div>
         )}
      </div>
    </motion.div>
  )
}

// --- Component: Certificate Modal ---
const CertificateModal = ({ isOpen, onClose, pathTitle }: { isOpen: boolean, onClose: () => void, pathTitle: string }) => {
  if (!isOpen) return null

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-6">
       <button onClick={onClose} className="absolute top-10 right-10 text-white/40 hover:text-white transition-all"><X className="w-10 h-10" /></button>
       
       <div className="w-full max-w-4xl bg-white p-16 rounded-[1rem] shadow-2xl relative border-[20px] border-indigo-900 overflow-hidden text-[#002d5b]">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
          <div className="text-center space-y-8 relative z-10">
             <div className="w-32 h-32 bg-indigo-900 text-white rounded-full flex items-center justify-center mx-auto mb-10 shadow-xl">
                <ShieldCheck className="w-16 h-16" />
             </div>
             <p className="text-[12px] font-black uppercase tracking-[0.5em] text-indigo-600">Certificate of Professional Mastery</p>
             <h1 className="text-6xl font-black italic tracking-tighter uppercase leading-none border-y-2 border-indigo-100 py-10">
                PATHFORGE CERTIFIED
             </h1>
             <p className="text-xl font-medium max-w-2xl mx-auto leading-relaxed">This document formally verifies that the student has successfully completed all operational nodes in the **${pathTitle}** curriculum, achieving a master-level synchronization of core professional skills.</p>
             
             <div className="pt-20 flex justify-between items-end border-b-2 border-indigo-50 pr-4 pb-4">
                <div className="text-left">
                   <p className="text-[10px] font-black uppercase text-indigo-300">Identity UID</p>
                   <p className="text-xl font-bold font-mono">PF-X-${Math.random().toString(16).substring(2, 8).toUpperCase()}</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black uppercase text-indigo-300">Authorization Date</p>
                   <p className="text-xl font-bold font-mono uppercase">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
             </div>
          </div>
          <div className="mt-16 flex justify-center">
             <button onClick={() => window.print()} className="px-12 py-4 bg-indigo-900 text-white rounded-xl font-black uppercase text-xs tracking-widest flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-900/40">
                <Download className="w-5 h-5" /> Download PDF Archive
             </button>
          </div>
       </div>
    </motion.div>
  )
}

// --- Playground Component ---
const PlaygroundModal = ({ isOpen, onClose, code, title }: { isOpen: boolean, onClose: () => void, code: string, title: string }) => {
  const [editorCode, setEditorCode] = useState(code)
  
  useEffect(() => { setEditorCode(code) }, [code])

  if (!isOpen) return null

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 md:p-10">
      <div className="w-full h-full bg-[#030712] rounded-[2rem] border border-white/10 shadow-3xl overflow-hidden flex flex-col">
         <header className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20"><Terminal className="w-6 h-6 text-white" /></div>
               <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">{title} <span className="text-slate-500 font-medium">— Trial Grounds</span></h3>
                  <p className="text-[10px] text-emerald-500/80 font-black uppercase tracking-widest">Live Execution Environment</p>
               </div>
            </div>
            <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-full transition-all"><X className="w-6 h-6" /></button>
         </header>

         <div className="flex-1 grid md:grid-cols-2 overflow-hidden">
            <div className="flex flex-col border-r border-white/5">
               <div className="p-3 bg-white/5 border-b border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Code2 className="w-3 h-3" /> Input Editor</span>
                  <button onClick={() => setEditorCode(code)} className="text-[10px] font-black text-pink-500 hover:underline flex items-center gap-1"><History className="w-3 h-3" /> Reset Source</button>
               </div>
               <textarea 
                 value={editorCode}
                 onChange={(e) => setEditorCode(e.target.value)}
                 className="flex-1 w-full bg-[#030712] p-8 font-mono text-sm text-pink-400 outline-none resize-none custom-scrollbar"
                 spellCheck={false}
               />
            </div>
            <div className="flex flex-col bg-white">
               <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Layout className="w-3 h-3 text-slate-400" /> Live View</span>
                  <div className="flex gap-1">
                     <div className="w-2 h-2 rounded-full bg-red-400" />
                     <div className="w-2 h-2 rounded-full bg-amber-400" />
                     <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
               </div>
               <iframe 
                 srcDoc={editorCode}
                 title="Live Execution"
                 className="flex-1 w-full border-none bg-white"
               />
            </div>
         </div>

         <footer className="p-6 bg-white/5 border-t border-white/5 flex justify-between items-center text-slate-500 text-[10px] uppercase font-bold tracking-widest">
            <span>Powered by Pathforge v3 Engine</span>
            <span>Security: Sandboxed Container</span>
         </footer>
      </div>
    </motion.div>
  )
}

import { ShieldCheck } from 'lucide-react'

// --- Main Page ---
export default function PathDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { learningPaths, toggleLearningModule } = useDashboardStore()
  
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)
  const [showPlayground, setShowPlayground] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [showCertificate, setShowCertificate] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const path = useMemo(() => {
    return learningPaths.find(p => p.id === params.pathId)
  }, [learningPaths, params.pathId])

  const modules = useMemo(() => path?.modules || [], [path])
  
  const currentIdx = useMemo(() => {
    return modules.findIndex(m => m.id === selectedModuleId)
  }, [modules, selectedModuleId])

  const selectedModule = modules[currentIdx]

  useEffect(() => {
    if (!selectedModuleId && modules.length > 0) {
      setSelectedModuleId(modules[0].id)
    }
  }, [modules, selectedModuleId])

  if (!path) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#020617] text-white">
        <div className="text-center space-y-6">
           <Zap className="w-12 h-12 text-pink-500 mx-auto animate-pulse" />
           <h2 className="text-4xl font-black tracking-tighter">Transmission Lost</h2>
           <button onClick={() => router.push('/dashboard')} className="px-8 py-3 bg-white text-black rounded-xl text-xs font-black uppercase">Return to Orbit</button>
        </div>
      </div>
    )
  }

  const handleNext = () => {
    if (currentIdx < modules.length - 1) {
      setSelectedModuleId(modules[currentIdx + 1].id)
      window.scrollTo(0, 0)
    }
  }

  const handlePrev = () => {
    if (currentIdx > 0) {
      setSelectedModuleId(modules[currentIdx - 1].id)
      window.scrollTo(0, 0)
    }
  }

  const handleModuleToggle = () => {
    if (!selectedModule.completed && selectedModule.quiz && selectedModule.quiz.length > 0) {
      setShowQuiz(true)
    } else {
      finalizeModule()
    }
  }

  const finalizeModule = () => {
    toggleLearningModule(path.id, selectedModule.id)
    toast.success("Skill Matrix Updated!", {
      icon: <Sparkles className="w-5 h-5 text-indigo-400" />
    })
    
    // Check for 100% path completion
    const newProgress = Math.round(((modules.filter(m => m.completed).length + (selectedModule.completed ? -1 : 1)) / modules.length) * 100)
    if (newProgress === 100 && !selectedModule.completed) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#ec4899', '#10b981']
      })
      setTimeout(() => setShowCertificate(true), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-hidden flex flex-col font-sans">
      
      <header className="fixed top-0 inset-x-0 h-16 bg-[#002d5b] text-white z-50 flex items-center justify-between px-6 border-b border-white/5">
         <div className="flex items-center gap-6">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><Menu className="w-5 h-5" /></button>
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center shadow-lg"><BookOpen className="w-5 h-5 text-white" /></div>
               <span className="font-black tracking-tight text-lg hidden md:block">{path.title}</span>
            </div>
         </div>

         <div className="flex items-center gap-4">
            {path.progress === 100 && (
              <button onClick={() => setShowCertificate(true)} className="px-5 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all flex items-center gap-2">
                <Trophy className="w-4 h-4" /> Claim Certificate
              </button>
            )}
            <div className="hidden lg:flex flex-col items-end mr-4">
               <div className="flex justify-between w-32 mb-1">
                  <span className="text-[8px] font-black uppercase text-white/40">Path Status</span>
                  <span className="text-[8px] font-black text-emerald-400">{path.progress}%</span>
               </div>
               <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${path.progress}%` }} />
               </div>
            </div>
            <button onClick={() => router.push('/dashboard')} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all"><Maximize2 className="w-5 h-5" /></button>
         </div>
      </header>

      <div className="flex flex-1 pt-16 h-full relative">
         <aside className={cn(
           "fixed left-0 top-16 bottom-0 bg-[#f1f5f9] border-r border-slate-200 overflow-y-auto custom-scrollbar transition-all z-40",
           sidebarOpen ? "w-64" : "w-0 opacity-0 pointer-events-none"
         )}>
            <div className="px-4 py-8">
               <h3 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Course Chapters</h3>
               <nav className="space-y-1">
                  {modules.map((m, i) => (
                    <button 
                      key={m.id}
                      onClick={() => setSelectedModuleId(m.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all group",
                        selectedModuleId === m.id 
                          ? "bg-white text-[#002d5b] shadow-sm ring-1 ring-slate-200" 
                          : "text-slate-500 hover:bg-slate-200"
                      )}
                    >
                       <div className={cn(
                         "w-5 h-5 rounded-md flex items-center justify-center text-[10px] shrink-0",
                         m.completed ? "bg-emerald-500 text-white" : selectedModuleId === m.id ? "bg-[#002d5b] text-white" : "bg-slate-300 text-slate-500"
                       )}>
                          {m.completed ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
                       </div>
                       <span className="truncate">{m.title}</span>
                       <ChevronRight className={cn("ml-auto w-3 h-3 transition-transform", selectedModuleId === m.id ? "opacity-100" : "opacity-0 group-hover:opacity-40")} />
                    </button>
                  ))}
               </nav>

               <div className="mt-12 p-4 bg-white/50 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-3 mb-3">
                     <div className="p-2 bg-pink-100 text-pink-600 rounded-lg"><Trophy className="w-4 h-4" /></div>
                     <span className="text-[10px] font-black uppercase text-slate-900">Total Reward</span>
                  </div>
                  <p className="text-xl font-black text-[#002d5b]">+2,400 XP</p>
                  <p className="text-[8px] text-slate-400 mt-1 font-bold uppercase">Locked in Portfolio</p>
               </div>
            </div>
         </aside>

         <main className={cn(
           "flex-1 overflow-y-auto transition-all bg-white relative",
           sidebarOpen ? "ml-64" : "ml-0"
         )}>
            {selectedModule ? (
              <div className="max-w-4xl mx-auto py-16 px-8 md:px-12 lg:px-16 min-h-screen flex flex-col">
                 <div className="flex justify-between items-center mb-16 pb-8 border-b border-slate-100">
                    <button onClick={handlePrev} disabled={currentIdx === 0} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 disabled:opacity-20 transition-all"><ArrowLeft className="w-4 h-4" /> Previous</button>
                    <div className="flex gap-1">
                       <div className="w-2 h-2 rounded-full bg-slate-100" />
                       <div className="w-2 h-2 rounded-full bg-slate-100" />
                       <div className="w-6 h-2 rounded-full bg-pink-600" />
                    </div>
                    <button onClick={handleNext} disabled={currentIdx === modules.length - 1} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#002d5b] hover:translate-x-1 transition-all disabled:opacity-20">Next <ArrowRight className="w-4 h-4" /></button>
                 </div>

                 <article className="prose prose-slate max-w-none flex-1">
                    <div className="flex items-center gap-3 mb-6">
                       <div className="px-3 py-1 bg-pink-100 text-pink-600 text-[8px] font-black uppercase tracking-widest rounded-full">Chapter {currentIdx + 1}</div>
                       <div className="h-[1px] flex-1 bg-slate-100" />
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-8 leading-none">{selectedModule.title}</h1>

                    <div className="flex items-center gap-6 mb-12 p-3 bg-slate-50 border border-slate-100 rounded-2xl w-fit">
                       <div className="flex items-center gap-2 text-slate-400 text-xs font-bold"><FileText className="w-4 h-4" /> Tutorial Documentation</div>
                       <div className="w-[1px] h-4 bg-slate-200" />
                       <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold"><Zap className="w-4 h-4" /> Verified Strategy</div>
                    </div>

                    <div className="text-lg leading-relaxed text-slate-600 space-y-6">
                       {selectedModule.content?.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                    </div>

                    <div className="my-14 space-y-4">
                       <h3 className="text-xl font-black text-slate-900 flex items-center gap-3"><div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center"><Layout className="w-5 h-5" /></div> Practical Example</h3>
                       <div className="bg-[#f8fafc] border-2 border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
                          <div className="p-4 bg-slate-100/50 border-b border-slate-100 flex items-center justify-between">
                             <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Source Blueprint</span>
                          </div>
                          <pre className="p-10 font-mono text-sm text-pink-600 bg-[#030712] overflow-x-auto m-0">
                             {selectedModule.example || `<!-- Example Implementation -->\n<div class="mission-critical">\n  <h1>${selectedModule.title} Protocol</h1>\n</div>`}
                          </pre>
                          <div className="p-6 bg-white border-t border-slate-100 flex justify-between items-center flex-wrap gap-4">
                             <p className="text-xs text-slate-400 font-medium max-w-xs">Tweak this example in our live simulator to see how the engine reacts.</p>
                             <button onClick={() => setShowPlayground(true)} className="px-8 py-3 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all">Try it Yourself »</button>
                          </div>
                       </div>
                    </div>

                    {currentIdx === modules.length - 1 && (
                      <div className="my-20 p-12 bg-black text-white rounded-[3rem] border border-white/10 relative overflow-hidden group">
                         <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600 rounded-full blur-[120px] opacity-20 group-hover:opacity-40 transition-opacity" />
                         <div className="relative z-10">
                            <h3 className="text-3xl font-black mb-4 flex items-center gap-4">FINAL MISSION: CAPSTONE PROJECT <Sparkles className="w-8 h-8 text-indigo-400" /></h3>
                            <p className="text-slate-400 text-lg font-medium mb-8">Deploy a production-ready application that utilizes all conceptual nodes learned in this path. Completion grants the Master Certification.</p>
                            <button onClick={() => toast.info("Project Board Initiated.")} className="px-10 py-5 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all flex items-center gap-3">
                               <Execute className="w-5 h-5" /> Initialize Deployment
                            </button>
                         </div>
                      </div>
                    )}
                 </article>

                 <footer className="mt-12 pt-16 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8 pb-10">
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Current Module Progression</p>
                       <button 
                         onClick={handleModuleToggle}
                         className={cn(
                           "px-10 py-5 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all flex items-center gap-4",
                           selectedModule.completed 
                             ? "bg-slate-100 text-emerald-600 ring-2 ring-emerald-500/20" 
                             : "bg-[#002d5b] text-white shadow-2xl shadow-[#002d5b]/40 hover:scale-105"
                         )}
                       >
                          {selectedModule.completed ? <><CheckCircle2 className="w-5 h-5" /> Module Mastered</> : <><Zap className="w-5 h-5 text-pink-500" /> Verify Knowledge</>}
                       </button>
                    </div>

                    <div className="flex gap-4">
                       <button onClick={handlePrev} disabled={currentIdx === 0} className="w-14 h-14 bg-slate-50 hover:bg-slate-100 text-slate-400 disabled:opacity-30 rounded-2xl border-2 border-slate-100 flex items-center justify-center transition-all"><ArrowLeft className="w-5 h-5" /></button>
                       <button onClick={handleNext} disabled={currentIdx === modules.length - 1} className="h-14 px-10 bg-slate-50 hover:bg-slate-100 text-[#002d5b] text-[10px] font-black uppercase disabled:opacity-30 rounded-2xl border-2 border-slate-100 flex items-center justify-center gap-2 transition-all">Next Chapter <ArrowRight className="w-4 h-4" /></button>
                    </div>
                 </footer>
              </div>
            ) : (
               <div className="h-full flex items-center justify-center">
                  <div className="text-center space-y-4">
                     <History className="w-12 h-12 text-slate-200 mx-auto animate-reverse-spin" />
                     <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Retrieving Path Data...</p>
                  </div>
               </div>
            )}
         </main>
      </div>

      <MentorBot moduleTitle={selectedModule?.title || ''} moduleContent={selectedModule?.content || ''} />

      <AnimatePresence>
         {showPlayground && selectedModule && <PlaygroundModal isOpen={showPlayground} onClose={() => setShowPlayground(false)} code={selectedModule.example || ''} title={selectedModule.title} />}
         {showQuiz && selectedModule && <QuizModal isOpen={showQuiz} onClose={() => setShowQuiz(false)} quizData={selectedModule.quiz || []} onComplete={finalizeModule} />}
         {showCertificate && <CertificateModal isOpen={showCertificate} onClose={() => setShowCertificate(false)} pathTitle={path.title} />}
      </AnimatePresence>

      <style jsx global>{`
         .custom-scrollbar::-webkit-scrollbar { width: 5px; }
         .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
         .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 20px; }
         .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(18, 52, 102, 0.1); }
         @keyframes reverse-spin { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
         .animate-reverse-spin { animation: reverse-spin 2s linear infinite; }
      `}</style>
    </div>
  )
}

const Execute = ({ className }: { className?: string }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
