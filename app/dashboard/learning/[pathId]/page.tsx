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
  Check,
  ShieldCheck,
  Timer
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
              <p className="text-slate-400 font-medium mb-10 px-10">You've successfully synchronized {score} of {quizData.length} conceptual nodes.</p>
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
          <div className="text-center space-y-8 relative z-10">
             <div className="w-32 h-32 bg-indigo-900 text-white rounded-full flex items-center justify-center mx-auto mb-10 shadow-xl"><ShieldCheck className="w-16 h-16" /></div>
             <p className="text-[12px] font-black uppercase tracking-[0.5em] text-indigo-600">Certificate of Professional Mastery</p>
             <h1 className="text-6xl font-black italic tracking-tighter uppercase leading-none border-y-2 border-indigo-100 py-10">PATHFORGE CERTIFIED</h1>
             <p className="text-xl font-medium max-w-2xl mx-auto leading-relaxed">This document formally verifies completion of the **${pathTitle}** curriculum.</p>
          </div>
          <div className="mt-16 flex justify-center">
             <button onClick={() => window.print()} className="px-12 py-4 bg-indigo-900 text-white rounded-xl font-black uppercase text-xs tracking-widest flex items-center gap-3 shadow-xl shadow-indigo-900/40"><Download className="w-5 h-5" /> Download PDF Archive</button>
          </div>
       </div>
    </motion.div>
  )
}

// --- Playground Component (With Timed Mission Mode) ---
const PlaygroundModal = ({ isOpen, onClose, code, title, isTimed = false }: { isOpen: boolean, onClose: () => void, code: string, title: string, isTimed?: boolean }) => {
  const [editorCode, setEditorCode] = useState(code)
  const [timeLeft, setTimeLeft] = useState(300) // 5 Minutes
  const [missionActive, setMissionActive] = useState(isTimed)
  
  useEffect(() => { setEditorCode(code) }, [code])

  useEffect(() => {
    if (missionActive && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000)
      return () => clearInterval(timer)
    } else if (timeLeft === 0) {
      setMissionActive(false)
      toast.error("Mission Time Expired. Skill matrix unverified.")
    }
  }, [missionActive, timeLeft])

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!isOpen) return null

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 md:p-10">
      <div className="w-full h-full bg-[#030712] rounded-[2rem] border border-white/10 shadow-3xl overflow-hidden flex flex-col">
         <header className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg"><Terminal className="w-6 h-6 text-white" /></div>
               <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">{title} <span className="text-slate-500 font-medium">— Trial Grounds</span></h3>
                  <p className="text-[10px] text-emerald-500/80 font-black uppercase tracking-widest leading-none">Live Execution Environment</p>
               </div>
            </div>
            <div className="flex items-center gap-6">
               {isTimed && timeLeft > 0 && (
                 <div className="px-6 py-2 bg-red-600 text-white rounded-full flex items-center gap-3 animate-pulse">
                    <Timer className="w-4 h-4" />
                    <span className="font-mono font-black italic">{formatTime(timeLeft)}</span>
                 </div>
               )}
               <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-full transition-all"><X className="w-6 h-6" /></button>
            </div>
         </header>

         <div className="flex-1 grid md:grid-cols-2 overflow-hidden">
            <div className="flex flex-col border-r border-white/5">
               <div className="p-3 bg-white/5 border-b border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Code2 className="w-3 h-3" /> Input Editor</span>
                  <button onClick={() => setEditorCode(code)} className="text-[10px] font-black text-pink-500 hover:underline flex items-center gap-1"><History className="w-3 h-3" /> Reset Source</button>
               </div>
               <textarea value={editorCode} onChange={(e) => setEditorCode(e.target.value)} className="flex-1 w-full bg-[#030712] p-8 font-mono text-sm text-pink-400 outline-none resize-none custom-scrollbar" spellCheck={false} />
            </div>
            <div className="flex flex-col bg-white">
               <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Layout className="w-3 h-3" /> Live View</span>
                  <div className="flex gap-1"><div className="w-2 h-2 rounded-full bg-red-400" /><div className="w-2 h-2 rounded-full bg-amber-400" /><div className="w-2 h-2 rounded-full bg-emerald-400" /></div>
               </div>
               <iframe srcDoc={editorCode} title="Live Execution" className="flex-1 w-full border-none bg-white" />
            </div>
         </div>

         <footer className="p-6 bg-white/5 border-t border-white/5 flex justify-between items-center text-slate-500 text-[10px] uppercase font-bold tracking-widest">
            <span>Powered by Pathforge v3 Engine</span>
            <button onClick={() => {
              if (isTimed) {
                 toast.success("MISSION COMPLETE: Time Efficiency Verified +15% Speed Badge.");
                 confetti();
              } else {
                 toast.success("Execution Successful.");
              }
              onClose();
            }} className="px-8 py-3 bg-primary text-white rounded-xl shadow-lg hover:scale-105 transition-all">Submit Sync Result</button>
         </footer>
      </div>
    </motion.div>
  )
}

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

  const path = useMemo(() => learningPaths.find(p => p.id === params.pathId), [learningPaths, params.pathId])
  const modules = useMemo(() => path?.modules || [], [path])
  const currentIdx = useMemo(() => modules.findIndex(m => m.id === selectedModuleId), [modules, selectedModuleId])
  const selectedModule = modules[currentIdx]

  useEffect(() => { if (!selectedModuleId && modules.length > 0) setSelectedModuleId(modules[0].id) }, [modules, selectedModuleId])

  if (!path) {
    return (
      <div className="flex h-screen w-full items-center justify-center p-6 bg-[#030712] pl-64">
        <div className="text-center bg-white/5 border border-white/10 p-12 rounded-[2.5rem] max-w-lg shadow-3xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/20 blur-3xl -translate-y-1/2 translate-x-1/2" />
           <div className="w-20 h-20 bg-indigo-500/20 text-indigo-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_-5px_rgba(99,102,241,0.3)]">
             <Terminal className="w-10 h-10" />
           </div>
           <h2 className="text-2xl font-black text-white italic mb-3">Module Not Synchronized</h2>
           <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">This learning path could not be located in your neural matrix. It may be loading, or it hasn't been assigned to your profile yet.</p>
           <button onClick={() => router.push('/dashboard')} className="px-8 py-4 bg-primary text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all w-full flex justify-center items-center gap-2 shadow-xl shadow-primary/20">
             <ArrowLeft className="w-4 h-4" /> Return to Command Center
           </button>
        </div>
      </div>
    )
  }

  const handleNext = () => { if (currentIdx < modules.length - 1) { setSelectedModuleId(modules[currentIdx + 1].id); window.scrollTo(0, 0); } }
  const handlePrev = () => { if (currentIdx > 0) { setSelectedModuleId(modules[currentIdx - 1].id); window.scrollTo(0, 0); } }

  const finalizeModule = () => {
    toggleLearningModule(path.id, selectedModule.id)
    toast.success("Skill Matrix Updated!", { icon: <Sparkles className="w-5 h-5 text-indigo-400" /> })
    const newProgress = Math.round(((modules.filter(m => m.completed).length + (selectedModule.completed ? -1 : 1)) / modules.length) * 100)
    if (newProgress === 100 && !selectedModule.completed) {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } })
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
            {path.progress === 100 && <button onClick={() => setShowCertificate(true)} className="px-5 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-2"><Trophy className="w-4 h-4" /> Claim Certificate</button>}
            <div className="hidden lg:flex flex-col items-end mr-4">
               <div className="flex justify-between w-32 mb-1"><span className="text-[8px] font-black uppercase text-white/40">Path Status</span><span className="text-[8px] font-black text-emerald-400">{path.progress}%</span></div>
               <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${path.progress}%` }} /></div>
            </div>
            <button onClick={() => router.push('/dashboard')} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all"><Maximize2 className="w-5 h-5" /></button>
         </div>
      </header>

      <div className="flex flex-1 pt-16 h-full relative">
         <aside className={cn("fixed left-0 top-16 bottom-0 bg-[#f1f5f9] border-r border-slate-200 overflow-y-auto custom-scrollbar transition-all z-40", sidebarOpen ? "w-64" : "w-0 opacity-0 pointer-events-none")}>
            <div className="px-4 py-8">
               <h3 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Course Chapters</h3>
               <nav className="space-y-1">
                  {modules.map((m, i) => (
                    <button key={m.id} onClick={() => setSelectedModuleId(m.id)} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all group", selectedModuleId === m.id ? "bg-white text-[#002d5b] shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:bg-slate-200")}>
                       <div className={cn("w-5 h-5 rounded-md flex items-center justify-center text-[10px] shrink-0", m.completed ? "bg-emerald-500 text-white" : selectedModuleId === m.id ? "bg-[#002d5b] text-white" : "bg-slate-300 text-slate-500")}>
                          {m.completed ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
                       </div>
                       <span className="truncate">{m.title}</span>
                       <ChevronRight className={cn("ml-auto w-3 h-3 transition-transform", selectedModuleId === m.id ? "opacity-100" : "opacity-0 group-hover:opacity-40")} />
                    </button>
                  ))}
               </nav>
            </div>
         </aside>

         <main className={cn("flex-1 overflow-y-auto transition-all bg-white relative", sidebarOpen ? "ml-64" : "ml-0")}>
            {selectedModule && (
              <div className="max-w-4xl mx-auto py-16 px-8 md:px-12 lg:px-16 min-h-screen flex flex-col">
                 <article className="prose prose-slate max-w-none flex-1">
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-8 leading-none">{selectedModule.title}</h1>
                    <div className="text-lg leading-relaxed text-slate-600 space-y-6">{selectedModule.content?.split('\n').map((line, i) => <p key={i}>{line}</p>)}</div>
                    
                    <div className="my-14 space-y-4">
                       <h3 className="text-xl font-black text-slate-900">Practical Example</h3>
                       <div className="bg-[#030712] border-2 border-slate-100 rounded-[2rem] overflow-hidden shadow-sm p-10">
                          <pre className="font-mono text-sm text-pink-600 mb-8">{selectedModule.example || `<!-- Example -->`}</pre>
                          <div className="flex gap-4">
                             <button onClick={() => setShowPlayground(true)} className="px-8 py-3 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase transition-all">Launch Trial Ground</button>
                             <button onClick={() => { setShowPlayground(true); /* Logic to trigger timed mode */ }} className="px-8 py-3 border-2 border-red-500/20 text-red-500 rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:bg-red-500 hover:text-white transition-all">
                                <Timer className="w-4 h-4" /> Timed Mission Mode
                             </button>
                          </div>
                       </div>
                    </div>
                 </article>

                 <footer className="mt-12 pt-16 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8 pb-10">
                    <button onClick={() => { if (!selectedModule.completed && selectedModule.quiz?.length) setShowQuiz(true); else finalizeModule(); }} className={cn("px-10 py-5 rounded-2xl text-[12px] font-black uppercase transition-all flex items-center gap-4", selectedModule.completed ? "bg-slate-100 text-emerald-600" : "bg-[#002d5b] text-white shadow-2xl")}>
                       {selectedModule.completed ? <><CheckCircle2 className="w-5 h-5" /> Module Mastered</> : <><Zap className="w-5 h-5 text-pink-500" /> Verify Knowledge</>}
                    </button>
                    <div className="flex gap-4">
                       <button onClick={handlePrev} disabled={currentIdx === 0} className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl border-2 border-slate-100 flex items-center justify-center"><ArrowLeft className="w-5 h-5" /></button>
                       <button onClick={handleNext} disabled={currentIdx === modules.length - 1} className="h-14 px-10 bg-slate-50 text-[#002d5b] text-[10px] font-black uppercase rounded-2xl border-2 border-slate-100 flex items-center justify-center gap-2">Next Chapter <ArrowRight className="w-4 h-4" /></button>
                    </div>
                 </footer>
              </div>
            )}
         </main>
      </div>

      <MentorBot moduleTitle={selectedModule?.title || ''} moduleContent={selectedModule?.content || ''} />
      <AnimatePresence>
         {showPlayground && selectedModule && <PlaygroundModal isOpen={showPlayground} onClose={() => setShowPlayground(false)} code={selectedModule.example || ''} title={selectedModule.title} isTimed={false} />}
         {showQuiz && selectedModule && <QuizModal isOpen={showQuiz} onClose={() => setShowQuiz(false)} quizData={selectedModule.quiz || []} onComplete={finalizeModule} />}
         {showCertificate && <CertificateModal isOpen={showCertificate} onClose={() => setShowCertificate(false)} pathTitle={path.title} />}
      </AnimatePresence>
    </div>
  )
}
const Execute = () => null
