'use client'

import { useMemo, useState, useEffect } from 'react'
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
  Maximize2
} from 'lucide-react'
import { useDashboardStore } from '@/lib/store'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

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
            {/* Editor Side */}
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
            {/* Output Side */}
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

export default function PathDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { learningPaths, toggleLearningModule } = useDashboardStore()
  
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)
  const [showPlayground, setShowPlayground] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const path = useMemo(() => {
    return learningPaths.find(p => p.id === params.pathId)
  }, [learningPaths, params.pathId])

  const modules = useMemo(() => path?.modules || [], [path])
  
  const currentIdx = useMemo(() => {
    return modules.findIndex(m => m.id === selectedModuleId)
  }, [modules, selectedModuleId])

  const selectedModule = modules[currentIdx]

  // Set first module as selected by default
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

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-hidden flex flex-col font-sans">
      
      {/* Top Bar Navigation */}
      <header className="fixed top-0 inset-x-0 h-16 bg-[#002d5b] text-white z-50 flex items-center justify-between px-6 border-b border-white/5">
         <div className="flex items-center gap-6">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><Menu className="w-5 h-5" /></button>
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center shadow-lg"><BookOpen className="w-5 h-5 text-white" /></div>
               <span className="font-black tracking-tight text-lg hidden md:block">{path.title}</span>
            </div>
         </div>

         <div className="flex items-center gap-4">
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
         
         {/* Sidebar: W3Schools Documentation Style */}
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

         {/* Main Content Pane */}
         <main className={cn(
           "flex-1 overflow-y-auto transition-all bg-white relative",
           sidebarOpen ? "ml-64" : "ml-0"
         )}>
            {selectedModule ? (
              <div className="max-w-4xl mx-auto py-16 px-8 md:px-12 lg:px-16 min-h-screen flex flex-col">
                 
                 {/* Sequential Nav Top */}
                 <div className="flex justify-between items-center mb-16 pb-8 border-b border-slate-100">
                    <button 
                      onClick={handlePrev} 
                      disabled={currentIdx === 0}
                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 disabled:opacity-20 transition-all"
                    >
                       <ArrowLeft className="w-4 h-4" /> Previous
                    </button>
                    <div className="flex gap-1">
                       <div className="w-2 h-2 rounded-full bg-slate-100" />
                       <div className="w-2 h-2 rounded-full bg-slate-100" />
                       <div className="w-6 h-2 rounded-full bg-pink-600" />
                    </div>
                    <button 
                      onClick={handleNext} 
                      disabled={currentIdx === modules.length - 1}
                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#002d5b] hover:translate-x-1 transition-all disabled:opacity-20"
                    >
                       Next <ArrowRight className="w-4 h-4" />
                    </button>
                 </div>

                 <article className="prose prose-slate max-w-none flex-1">
                    <div className="flex items-center gap-3 mb-6">
                       <div className="px-3 py-1 bg-pink-100 text-pink-600 text-[8px] font-black uppercase tracking-widest rounded-full">Chapter {currentIdx + 1}</div>
                       <div className="h-[1px] flex-1 bg-slate-100" />
                    </div>

                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-8 leading-none">
                       {selectedModule.title}
                    </h1>

                    <div className="flex items-center gap-6 mb-12 p-3 bg-slate-50 border border-slate-100 rounded-2xl w-fit">
                       <div className="flex items-center gap-2 text-slate-400 text-xs font-bold"><FileText className="w-4 h-4" /> Tutorial Documentation</div>
                       <div className="w-[1px] h-4 bg-slate-200" />
                       <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold"><Zap className="w-4 h-4" /> Verified Strategy</div>
                    </div>

                    {/* Tutorial Content Section */}
                    {selectedModule.content ? (
                       <div className="text-lg leading-relaxed text-slate-600 space-y-6">
                          {selectedModule.content.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                       </div>
                    ) : (
                       <div className="space-y-6 text-lg leading-relaxed text-slate-600">
                          <p>In this module, we explore the essential principles of <strong>{selectedModule.title}</strong>, a cornerstone of professional mastery in this learning path.</p>
                          <p>A well-structured implementation of this topic focuses on efficiency, scalability, and adherence to industry-standard patterns. Understanding these core elements allows you to transition from theoretical knowledge to practical execution in high-stakes environments.</p>
                          
                          <div className="my-10 p-10 bg-indigo-900 text-white rounded-[2rem] relative overflow-hidden group">
                             <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-white/10 transition-colors" />
                             <h4 className="text-xl font-black mb-4">The Golden Rule</h4>
                             <p className="text-indigo-200 leading-relaxed font-medium italic">"Architecture is about the important stuff. Whatever that is. The goal is to maximize the amount of work NOT done."</p>
                          </div>

                          <p>As you progress through this chapter, take time to analyze the following examples. These represent real-world use cases encountered by senior engineers and specialists in the field.</p>
                       </div>
                    )}

                    {/* Example & Playground Block (The W3Schools Experience) */}
                    <div className="my-14 space-y-4">
                       <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                          <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center"><Layout className="w-5 h-5" /></div>
                          Practical Example
                       </h3>
                       <div className="bg-[#f8fafc] border-2 border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
                          <div className="p-4 bg-slate-100/50 border-b border-slate-100 flex items-center justify-between">
                             <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Source Blueprint</span>
                             <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                             </div>
                          </div>
                          <pre className="p-10 font-mono text-sm text-pink-600 bg-[#030712] overflow-x-auto m-0">
                             {selectedModule.example || `<!-- Example Implementation -->\n<div class="mission-critical">\n  <h1>${selectedModule.title} Protocol</h1>\n  <p>Status: Synchronized - Awaiting User Input</p>\n</div>`}
                          </pre>
                          <div className="p-6 bg-white border-t border-slate-100 flex justify-between items-center flex-wrap gap-4">
                             <p className="text-xs text-slate-400 font-medium max-w-xs">Tweak this example in our live simulator to see how the engine reacts.</p>
                             <button onClick={() => setShowPlayground(true)} className="px-8 py-3 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all">
                                Try it Yourself »
                             </button>
                          </div>
                       </div>
                    </div>

                    <div className="my-16 flex items-start gap-8">
                       <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0"><Terminal className="w-8 h-8 text-slate-400" /></div>
                       <div className="space-y-2">
                          <h4 className="text-lg font-black text-slate-900">Mission Outcome</h4>
                          <p className="text-slate-500 text-sm font-medium leading-relaxed">Completing this chapter successfully validates your understanding of the core {selectedModule.title.split(' ')[0]} syntax and implementation strategy.</p>
                       </div>
                    </div>
                 </article>

                 <footer className="mt-12 pt-16 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8 pb-10">
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Current Module Progression</p>
                       <button 
                         onClick={() => toggleLearningModule(path.id, selectedModule.id)}
                         className={cn(
                           "px-10 py-5 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all flex items-center gap-4",
                           selectedModule.completed 
                             ? "bg-slate-100 text-emerald-600 ring-2 ring-emerald-500/20" 
                             : "bg-[#002d5b] text-white shadow-2xl shadow-[#002d5b]/40 hover:scale-105"
                         )}
                       >
                          {selectedModule.completed ? (
                            <><CheckCircle2 className="w-5 h-5" /> Module Mastered</>
                          ) : (
                            <><Zap className="w-5 h-5 text-pink-500" /> Verify Knowledge</>
                          )}
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

      {/* Playground Modal */}
      <AnimatePresence>
         {showPlayground && selectedModule && (
           <PlaygroundModal 
             isOpen={showPlayground} 
             onClose={() => setShowPlayground(false)} 
             code={selectedModule.example || `<!-- Example Implementation -->\n<div class="mission-critical">\n  <h1>${selectedModule.title} Protocol</h1>\n  <p>Status: Synchronized - Awaiting User Input</p>\n</div>`}
             title={selectedModule.title}
           />
         )}
      </AnimatePresence>

      <style jsx global>{`
         .custom-scrollbar::-webkit-scrollbar { width: 5px; }
         .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
         .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 20px; }
         .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(18, 52, 102, 0.1); }
         
         @keyframes reverse-spin {
           from { transform: rotate(360deg); }
           to { transform: rotate(0deg); }
         }
         .animate-reverse-spin {
           animation: reverse-spin 2s linear infinite;
         }
      `}</style>
    </div>
  )
}
