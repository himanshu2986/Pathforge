'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Trash2, 
  Download, 
  User, 
  Briefcase, 
  GraduationCap, 
  Code2, 
  Layout,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  FileText,
  Mail,
  Phone,
  MapPin,
  Globe,
  Palette,
  Sparkles,
  LayoutTemplate,
  Camera,
  Layers,
  Award,
  Zap,
  Star,
  BookOpen,
  Cpu,
  PenTool,
  Trophy,
  Activity,
  AppWindow,
  Grid
} from 'lucide-react'
import { GlassCard, GlassCardContent, GlassCardHeader } from '@/components/ui/glass-card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { useAuthStore, useDashboardStore } from '@/lib/store'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// --- Types ---
interface ResumeData {
  personalInfo: {
    name: string
    email: string
    phone: string
    location: string
    website: string
    github: string
    summary: string
    photo?: string
  }
  experience: {
    id: string
    company: string
    role: string
    period: string
    bullets: string[]
  }[]
  education: {
    id: string
    school: string
    degree: string
    period: string
  }[]
  skills: { name: string, level: number }[]
  projects: {
    id: string
    title: string
    description: string
    skills: string[]
  }[]
}

type TemplateType = 'tech' | 'creative' | 'minimal' | 'executive' | 'cyber' | 'maverick' | 'sidebar-left' | 'sidebar-right' | 'swiss' | 'elegant'

export default function UltimateResumeStudioPage() {
  const { user } = useAuthStore()
  const { portfolioProjects, skills: dashboardSkills } = useDashboardStore()
  
  const [activeStep, setActiveStep] = useState(0)
  const steps = [
    { label: 'Template Gallery', icon: Grid },
    { label: 'Basic Info', icon: User },
    { label: 'Career History', icon: Briefcase },
    { label: 'Portfolio & Skills', icon: Code2 },
    { label: 'Review & Design', icon: Palette },
  ]

  const [activeTemplate, setActiveTemplate] = useState<TemplateType>('tech')
  const [primaryColor, setPrimaryColor] = useState('#0ea5e9')
  const [fontFamily, setFontFamily] = useState('sans')

  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      location: user?.location || '',
      website: user?.website || '',
      github: '',
      summary: user?.bio || '',
      photo: user?.avatar || ''

    },
    experience: [],
    education: [],
    skills: [],
    projects: []
  })

  // Sync data
  useEffect(() => {
    if (portfolioProjects.length > 0 && resumeData.projects.length === 0) {
      setResumeData(prev => ({ ...prev, projects: portfolioProjects.slice(0, 3) }))
    }
    if (dashboardSkills.length > 0 && resumeData.skills.length === 0) {
      setResumeData(prev => ({ ...prev, skills: dashboardSkills.map(s => ({ name: s.name, level: s.level })) }))
    }
  }, [portfolioProjects, dashboardSkills])

  // Handlers
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setResumeData(p => ({ ...p, personalInfo: { ...p.personalInfo, photo: reader.result as string } }))
      reader.readAsDataURL(file)
    }
  }

  // Visualization helper for Template Thumbnails
  const TemplateThumbnail = ({ id, color }: { id: TemplateType, color: string }) => {
    return (
      <div className="w-full aspect-[3/4] bg-white rounded-lg border border-border shadow-sm overflow-hidden p-2 transform transition-transform group-hover:scale-[1.05]">
        {/* Abstract mini representation */}
        {id === 'tech' && (
          <div className="h-full flex flex-col gap-1 bg-[#111827]">
            <div className="h-4 bg-[#030712] w-full" />
            <div className="flex-1 flex gap-1">
              <div className="flex-1 flex flex-col gap-1 p-1">
                 <div className="h-1 w-2/3" style={{ backgroundColor: color }} />
                 <div className="h-0.5 w-full bg-gray-800" />
                 <div className="h-0.5 w-5/6 bg-gray-800" />
                 <div className="h-1 w-1/2 mt-2" style={{ backgroundColor: color }} />
                 <div className="h-0.5 w-full bg-gray-800" />
              </div>
              <div className="w-1/3 bg-gray-900 border-l border-gray-800 p-1">
                 <div className="h-1 w-full bg-gray-700" />
                 <div className="h-1 w-full bg-gray-700 mt-1" />
              </div>
            </div>
          </div>
        )}
        {id === 'creative' && (
          <div className="h-full flex flex-col gap-1 items-center p-2">
             <div className="w-6 h-6 rounded-full bg-gray-200" />
             <div className="h-1 w-1/2 bg-slate-900" />
             <div className="h-1 w-1/3" style={{ backgroundColor: color }} />
             <div className="flex gap-2 w-full mt-2">
                <div className="flex-1 h-10 bg-slate-50 border border-slate-100" />
                <div className="flex-1 h-10 bg-slate-50 border border-slate-100" />
             </div>
          </div>
        )}
        {id === 'minimal' && (
          <div className="h-full flex flex-col gap-2 p-3 bg-white">
             <div className="h-2 w-3/4 bg-slate-900" />
             <div className="h-1 w-1/4 bg-slate-200" />
             <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="col-span-2 h-16 border-l-2 border-slate-100 pl-2 space-y-1">
                   <div className="h-1 w-full bg-slate-100" />
                   <div className="h-1 w-full bg-slate-100" />
                   <div className="h-1 w-5/6 bg-slate-100" />
                </div>
                <div className="space-y-1">
                   <div className="h-0.5 w-full bg-slate-200" />
                   <div className="h-0.5 w-full bg-slate-200" />
                </div>
             </div>
          </div>
        )}
        {id === 'executive' && (
          <div className="h-full p-2 bg-slate-50">
             <div className="h-full border-2 border-slate-900 flex flex-col p-1">
                <div className="h-2 w-2/3 bg-slate-900 mx-auto mt-2" />
                <div className="h-1 w-1/2 bg-slate-200 mx-auto mt-1 mb-4" />
                <div className="h-0.5 w-full bg-slate-100" />
                <div className="flex-1 flex flex-col gap-1 mt-2">
                   <div className="h-1 w-1/3 bg-slate-300" />
                   <div className="h-1 w-full bg-slate-100" />
                   <div className="h-1 w-full bg-slate-100" />
                </div>
             </div>
          </div>
        )}
        {id === 'cyber' && (
           <div className="h-full flex flex-col gap-1 bg-black p-2 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-4 h-4" style={{ borderRight: `2px solid ${color}`, borderTop: `2px solid ${color}` }} />
               <div className="h-2 w-1/2" style={{ backgroundColor: color }} />
               <div className="h-1 w-1/4" style={{ backgroundColor: `${color}40` }} />
               <div className="flex-1 flex flex-col gap-2 mt-4">
                  <div className="h-2 w-full border border-gray-800 flex items-center px-1"><div className="h-1 w-2/3" style={{ backgroundColor: color }} /></div>
                  <div className="h-2 w-full border border-gray-800 flex items-center px-1"><div className="h-1 w-1/2" style={{ backgroundColor: color }} /></div>
               </div>
           </div>
        )}
        {id === 'sidebar-left' && (
          <div className="h-full flex bg-white">
             <div className="w-1/3" style={{ backgroundColor: color }} />
             <div className="flex-1 p-2 space-y-2">
                <div className="h-1 w-2/3 bg-slate-900" />
                <div className="h-12 w-full bg-slate-50" />
                <div className="h-12 w-full bg-slate-50" />
             </div>
          </div>
        )}
        {id === 'sidebar-right' && (
          <div className="h-full flex bg-white">
             <div className="flex-1 p-2 space-y-2">
                <div className="h-1 w-2/3 bg-slate-900" />
                <div className="h-12 w-full bg-slate-50" />
             </div>
             <div className="w-1/3" style={{ backgroundColor: color }} opacity-20 />
          </div>
        )}
        {id === 'swiss' && (
          <div className="h-full bg-white p-2 flex flex-col gap-1 font-black">
             <div className="h-4 w-4 bg-red-600 self-end" />
             <div className="text-[12px] leading-none text-slate-900 uppercase">HELV<br/>ETICA</div>
             <div className="h-1 w-full bg-slate-900 mt-2" />
             <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="h-10 bg-slate-100" />
                <div className="h-10 bg-slate-100" />
             </div>
          </div>
        )}
        {id === 'maverick' && (
           <div className="h-full bg-slate-900 flex flex-col p-2 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-[200%] h-4 bg-primary/20 rotate-[-15deg] origin-top-left" style={{ backgroundColor: `${color}30` }} />
              <div className="h-2 w-1/2 bg-white mt-4" />
              <div className="flex-1 flex flex-col gap-1 mt-6">
                 <div className="h-4 w-full bg-white/5" />
                 <div className="h-4 w-full bg-white/5" />
              </div>
           </div>
        )}
        {id === 'elegant' && (
          <div className="h-full bg-[#fffcf5] border border-[#e8e2d5] flex flex-col items-center p-3 text-center">
             <div className="h-2 w-3/4 bg-slate-800" />
             <div className="h-0.5 w-1/3 bg-slate-400 mt-1 mb-4" />
             <div className="space-y-2 w-full">
                <div className="h-1 w-full bg-slate-200" />
                <div className="h-1 w-full bg-slate-200" />
                <div className="h-1 w-2/3 mx-auto bg-slate-200" />
             </div>
          </div>
        )}
      </div>
    )
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
            {[
              { id: 'tech', name: 'Tech Master', desc: 'Dark / High Performance', icon: Cpu },
              { id: 'creative', name: 'Artisan', desc: 'Artist / Bold Mix', icon: PenTool },
              { id: 'minimal', name: 'Zenith', desc: 'Minimal / Architectural', icon: Layers },
              { id: 'executive', name: 'Prestige', desc: 'Elite / Ivy League', icon: Trophy },
              { id: 'cyber', name: 'Neon', desc: 'Futuristic / Cyberpunk', icon: Activity },
              { id: 'sidebar-left', name: 'Columnist', desc: 'Modern Sidebar L', icon: Layout },
              { id: 'sidebar-right', name: 'Focus', desc: 'Modern Sidebar R', icon: AppWindow },
              { id: 'swiss', name: 'Grid Master', desc: 'Bold Swiss Design', icon: Grid },
              { id: 'maverick', name: 'Maverick', desc: 'Edgy / Modernist', icon: Zap },
              { id: 'elegant', name: 'Heritage', desc: 'Timeless / Serif', icon: BookOpen },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => { setActiveTemplate(t.id as TemplateType); toast.success(`${t.name} Selected`) }}

                className={cn(
                  "flex flex-col group gap-3 text-left transition-all",
                  activeTemplate === t.id ? "scale-[1.05]" : "opacity-70 hover:opacity-100"
                )}
              >
                <TemplateThumbnail id={t.id as TemplateType} color={primaryColor} />
                <div className="px-1">
                   <h4 className={cn("text-[10px] font-black uppercase tracking-widest", activeTemplate === t.id ? "text-primary" : "text-muted-foreground")}>{t.name}</h4>
                   <p className="text-[8px] text-muted-foreground/60 leading-tight mt-0.5">{t.desc}</p>
                </div>
              </button>
            ))}
          </div>
        )
      case 1:
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-8 bg-muted/20 p-6 rounded-3xl border border-white/5">
                <div className="relative group shrink-0">
                  <div className="w-28 h-28 rounded-full bg-muted border-4 border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
                     {resumeData.personalInfo.photo ? (
                       <img src={resumeData.personalInfo.photo} className="w-full h-full object-cover" />
                     ) : (
                       <Camera className="w-10 h-10 text-muted-foreground" />
                     )}
                  </div>
                  <input type="file" onChange={handlePhotoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full pointer-events-none">
                     <span className="text-[10px] font-black text-white uppercase">Upload</span>
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Full Name</label>
                    <input 
                      value={resumeData.personalInfo.name} 
                      onChange={e => setResumeData(p => ({ ...p, personalInfo: { ...p.personalInfo, name: e.target.value } }))}
                      className="w-full bg-transparent border-b-2 border-border focus:border-primary text-2xl font-black outline-none pb-2 placeholder:text-muted-foreground/30" 
                      placeholder="e.g. ALEX MORGAN"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-muted-foreground uppercase">Email</label>
                        <input value={resumeData.personalInfo.email} onChange={e => setResumeData(p => ({ ...p, personalInfo: { ...p.personalInfo, email: e.target.value } }))} className="w-full bg-transparent border-b border-border focus:border-primary text-sm outline-none pb-1" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-muted-foreground uppercase">Phone</label>
                        <input value={resumeData.personalInfo.phone} onChange={e => setResumeData(p => ({ ...p, personalInfo: { ...p.personalInfo, phone: e.target.value } }))} className="w-full bg-transparent border-b border-border focus:border-primary text-sm outline-none pb-1" />
                     </div>
                  </div>
                </div>
            </div>
            <div className="space-y-2">
               <div className="flex justify-between items-center"><label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Professional Summary</label></div>
               <textarea 
                value={resumeData.personalInfo.summary} 
                onChange={e => setResumeData(p => ({ ...p, personalInfo: { ...p.personalInfo, summary: e.target.value } }))}
                className="w-full bg-card border border-border rounded-2xl p-6 text-sm outline-none resize-none h-40 focus:ring-2 ring-primary/20 transition-all font-medium leading-relaxed"
                placeholder="Briefly describe your expertise and career goals..."
              />
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-8">
             <div className="flex justify-between items-center"><h4 className="font-black text-lg uppercase tracking-tight">Experience</h4><button onClick={() => setResumeData(p => ({ ...p, experience: [...p.experience, { id: Date.now().toString(), company: '', role: '', period: '', bullets: [''] }] }))} className="p-2 bg-primary/10 rounded-full hover:bg-primary/20 transition-colors"><Plus className="w-4 h-4 text-primary" /></button></div>
             <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {resumeData.experience.map((exp, i) => (
                  <GlassCard key={exp.id} className="relative transition-all hover:bg-muted/50">
                     <button onClick={() => setResumeData(p => ({ ...p, experience: p.experience.filter(e => e.id !== exp.id) }))} className="absolute top-4 right-4 text-muted-foreground/30 hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                     <GlassCardContent className="p-6 grid gap-4">
                        <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-1">
                              <label className="text-[10px] font-black text-muted-foreground uppercase italic">Company</label>
                              <input value={exp.company} onChange={e => { const n = [...resumeData.experience]; n[i].company = e.target.value; setResumeData(p => ({ ...p, experience: n })) }} className="w-full bg-transparent border-b border-border text-sm font-bold outline-none" />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[10px] font-black text-muted-foreground uppercase italic">Role</label>
                              <input value={exp.role} onChange={e => { const n = [...resumeData.experience]; n[i].role = e.target.value; setResumeData(p => ({ ...p, experience: n })) }} className="w-full bg-transparent border-b border-border text-sm font-bold outline-none" />
                           </div>
                        </div>
                        <input value={exp.period} onChange={e => { const n = [...resumeData.experience]; n[i].period = e.target.value; setResumeData(p => ({ ...p, experience: n })) }} placeholder="e.g. JAN 2022 - PRESENT" className="w-full bg-transparent border-b border-border text-[10px] font-black uppercase tracking-widest outline-none" />
                     </GlassCardContent>
                  </GlassCard>
                ))}
             </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-10">
            <section>
              <h4 className="font-black text-lg uppercase mb-4 tracking-tight">Featured Projects</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                 {portfolioProjects.map(p => {
                   const isSel = resumeData.projects.find(rp => rp.id === p.id)
                   return (
                     <button key={p.id} onClick={() => setResumeData(prev => ({ ...prev, projects: isSel ? prev.projects.filter(rp => rp.id !== p.id) : [...prev.projects, p] }))} 
                     className={cn("p-4 rounded-2xl border text-left transition-all relative group", isSel ? "border-primary bg-primary/5 shadow-inner" : "bg-card border-border hover:border-primary/50 shadow-sm")}>
                        <h5 className="text-[10px] font-black uppercase tracking-widest truncate">{p.title}</h5>
                        {isSel && <CheckCircle2 className="absolute top-2 right-2 w-3 h-3 text-primary" />}
                     </button>
                   )
                 })}
              </div>
            </section>
            <section>
              <h4 className="font-black text-lg uppercase mb-4 tracking-tight">The Arsenal (Skills)</h4>
              <div className="flex flex-wrap gap-2">
                 {dashboardSkills.map(s => {
                   const isSel = resumeData.skills.find(rs => rs.name === s.name)
                   return (
                     <button key={s.id} onClick={() => setResumeData(prev => ({ ...prev, skills: isSel ? prev.skills.filter(rs => rs.name !== s.name) : [...prev.skills, { name: s.name, level: s.level }] }))}
                     className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase border tracking-widest transition-all", isSel ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" : "bg-card border-border")}>
                        {s.name}
                     </button>
                   )
                 })}
              </div>
            </section>
          </div>
        )
      case 4:
        return (
          <div className="space-y-10 h-full flex flex-col items-center justify-center py-10">
             <div className="relative">
                <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center animate-pulse"><Zap className="w-12 h-12 text-primary" /></div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg"><CheckCircle2 className="w-5 h-5 text-white" /></div>
             </div>
             <div className="text-center space-y-2">
                <h3 className="text-2xl font-black gradient-text">Studio Finalized</h3>
                <p className="text-sm text-muted-foreground px-10">Your profile is ready. Select your signature accent color below.</p>
             </div>
             <div className="flex justify-center flex-wrap gap-4 px-10">
                {['#0ea5e9', '#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#14b8a6', '#1e293b'].map(c => (
                  <button key={c} onClick={() => setPrimaryColor(c)} className={cn("w-12 h-12 rounded-2xl border-4 transition-all hover:scale-110", primaryColor === c ? "border-white shadow-2xl scale-125" : "border-transparent opacity-60")} style={{ backgroundColor: c }} />
                ))}
             </div>
             <div className="w-full max-w-sm mt-8">
                <MagneticButton variant="primary" onClick={() => window.print()} className="w-full py-6 text-lg font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/40">
                   <Download className="w-6 h-6" /> Export PDF
                </MagneticButton>
             </div>
          </div>
        )
      default: return null
    }
  }

  return (
    <div className="p-6 lg:p-12 max-w-[1800px] mx-auto min-h-screen bg-transparent">
       {/* UI Styles */}
       <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
          @media print {
            body * { visibility: hidden !important; }
            #resume-preview, #resume-preview * { visibility: visible !important; }
            #resume-preview { position: fixed !important; left: 0 !important; top: 0 !important; width: 210mm !important; height: 297mm !important; box-shadow: none !important; border-radius: 0 !important; margin: 0 !important; z-index: 9999 !important; }
          }
       `}</style>

       <div className="grid lg:grid-cols-[450px_1fr] gap-12 items-start h-[calc(100vh-100px)]">
          
          {/* Left Panel: Ultimate Editor */}
          <div className="flex flex-col h-full space-y-8">
             <div className="flex items-center gap-6 px-4">
                <div className="p-4 bg-gradient-to-br from-primary to-accent rounded-3xl shadow-2xl shadow-primary/40"><Grid className="w-8 h-8 text-primary-foreground" /></div>
                <div><h1 className="text-3xl font-black tracking-tighter text-white">Ultimate Studio</h1><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black">Powered by AI Intelligence</p></div></div>
             </div>

             <nav className="flex justify-between items-center relative py-6 px-10 bg-muted/20 rounded-full border border-white/5">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[1px] bg-white/5 -z-10" />
                {steps.map((s, idx) => (
                  <button key={idx} onClick={() => setActiveStep(idx)} className={cn("relative group flex flex-col items-center gap-1", activeStep === idx ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
                     <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-2", activeStep === idx ? "bg-primary text-primary-foreground scale-110 shadow-2xl border-primary" : activeStep > idx ? "bg-emerald-500 text-white border-emerald-500 shadow-lg" : "bg-card border-white/5 shadow-sm")}>
                        {activeStep > idx ? <CheckCircle2 className="w-6 h-6" /> : <s.icon className="w-5 h-5" />}
                     </div>
                     <span className="text-[7px] font-black uppercase tracking-widest absolute -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{s.label}</span>
                  </button>
                ))}
             </nav>

             <GlassCard className="flex-1 border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] bg-slate-900/40 backdrop-blur-3xl overflow-hidden flex flex-col">
                <header className="bg-white/5 p-6 flex items-center justify-between border-b border-white/5">
                   <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white flex items-center gap-3"><span className="w-1 h-5 bg-primary rounded-full transition-all" /> {steps[activeStep].label}</h3>
                   <span className="text-[10px] font-black text-muted-foreground">Step {activeStep + 1} / 5</span>
                </header>
                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                   <AnimatePresence mode="wait">
                      <motion.div key={activeStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}>{renderStepContent()}</motion.div>
                   </AnimatePresence>
                </div>
                <footer className="p-8 bg-black/20 flex justify-between items-center border-t border-white/5">
                   <button onClick={() => setActiveStep(p => Math.max(0, p - 1))} className={cn("text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-colors flex items-center gap-2", activeStep === 0 && "opacity-0 pointer-events-none")}><ChevronLeft className="w-4 h-4" /> Go Back</button>
                   {activeStep < steps.length - 1 && (
                     <MagneticButton variant="primary" onClick={() => setActiveStep(p => p + 1)} className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 flex items-center gap-2">
                        Next Mission <ChevronRight className="w-4 h-4" />
                     </MagneticButton>
                   )}
                </footer>
             </GlassCard>
          </div>

          {/* Right Panel: Massive Visual Preview */}
          <div className="h-full flex flex-col gap-6">
             <div className="flex items-center justify-between px-6 py-4 bg-muted/10 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4"><Palette className="w-5 h-5 text-primary" /><h3 className="font-bold text-sm tracking-tight">Active Engine: <span className="text-primary uppercase font-black tracking-widest ml-2">{activeTemplate}</span></h3></div>
                <div className="flex gap-2">
                   {['sans', 'serif', 'mono'].map(f => <button key={f} onClick={() => setFontFamily(f)} className={cn("px-4 py-2 rounded-xl text-[9px] font-black tracking-widest border transition-all", fontFamily === f ? "bg-white text-black border-white shadow-xl" : "bg-card border-white/5 text-muted-foreground hover:bg-white/5")}>{f.toUpperCase()}</button>)}
                </div>
             </div>

             <div className={cn("flex-1 bg-white text-slate-900 shadow-[0_80px_160px_-40px_rgba(0,0,0,0.2)] rounded-sm overflow-hidden p-0 relative group", fontFamily === 'serif' ? 'font-serif' : fontFamily === 'mono' ? 'font-mono' : 'font-sans')}>
                <div id="resume-preview" className="h-full w-full overflow-y-auto custom-scrollbar">
                  {/* TECH MASTER */}
                  {activeTemplate === 'tech' && (
                    <div className="min-h-full flex flex-col bg-[#030712] text-gray-200">
                       <header className="p-16 border-b border-white/5 bg-[#020617] relative">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[120px] rounded-full" />
                          <div className="relative z-10 flex justify-between items-end">
                             <div><p className="text-[10px] font-black tracking-[0.5em] text-primary mb-4 opacity-50">INITIATING SEQUENCE...</p><h2 className="text-6xl font-black tracking-tighter text-white mb-2">{resumeData.personalInfo.name || 'FULL STACK'}</h2><div className="flex gap-6 text-[11px] font-bold text-gray-500 uppercase tracking-widest"><span>{resumeData.personalInfo.email}</span><span>{resumeData.personalInfo.location}</span></div></div>
                             <div className="w-24 h-24 rounded-3xl border-2 border-primary/20 p-1"><div className="w-full h-full rounded-2xl overflow-hidden bg-gray-900">{resumeData.personalInfo.photo && <img src={resumeData.personalInfo.photo} className="w-full h-full object-cover" />}</div></div>
                          </div>
                       </header>
                       <div className="flex-1 grid grid-cols-[1fr_300px] gap-0">
                          <main className="p-16 space-y-20 border-r border-white/5">
                             <section><h4 className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.3em] mb-10" style={{ color: primaryColor }}><div className="w-5 h-[2px]" style={{ backgroundColor: primaryColor }} /> Narrative Core</h4><p className="text-lg leading-relaxed text-gray-300 font-medium">{resumeData.personalInfo.summary}</p></section>
                             <section><h4 className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.3em] mb-12" style={{ color: primaryColor }}><div className="w-5 h-[2px]" style={{ backgroundColor: primaryColor }} /> Mission Deployment</h4><div className="space-y-16">{resumeData.experience.map(e => <div key={e.id} className="group-hover:translate-x-2 transition-transform duration-500"><div className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-2">{e.period}</div><div className="text-2xl font-black text-white">{e.role}</div><div className="text-xs font-bold uppercase tracking-wider mb-6" style={{ color: primaryColor }}>{e.company}</div><ul className="text-sm text-gray-400 space-y-4">{e.bullets.map((b, i) => b && <li key={i} className="flex gap-4"> <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: primaryColor }} /> {b} </li>)}</ul></div>)}</div></section>
                          </main>
                          <aside className="p-12 bg-black/20 space-y-16">
                             <section><h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-600 mb-10">Arsenal Matrix</h4><div className="space-y-8">{resumeData.skills.map(s => <div key={s.name} className="space-y-3"><div className="flex justify-between text-[11px] uppercase font-black text-white tracking-widest"><span>{s.name}</span><span style={{ color: primaryColor }}>{s.level}%</span></div><div className="h-2 bg-gray-800 rounded-full overflow-hidden border border-white/5"><motion.div initial={{ width: 0 }} whileInView={{ width: `${s.level}%` }} className="h-full shadow-[0_0_20px] shadow-primary/50" style={{ backgroundColor: primaryColor }} /></div></div>)}</div></section>
                          </aside>
                       </div>
                    </div>
                  )}

                  {/* CYBERPUNK / NEON */}
                  {activeTemplate === 'cyber' && (
                    <div className="min-h-full flex flex-col bg-black text-white p-16 font-mono">
                        <div className="absolute top-0 right-0 p-8 text-[8px] text-gray-800 opacity-20">SYSTEM_REVISION_v4.2.0</div>
                        <header className="mb-20 border-l-[10px] pl-10" style={{ borderColor: primaryColor }}>
                           <h2 className="text-7xl font-black tracking-tighter uppercase mb-2 break-all">{resumeData.personalInfo.name}</h2>
                           <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: primaryColor }}><span className="opacity-50">// ACCESS_TOKEN: ACTIVATED</span><span>:: {resumeData.personalInfo.location}</span></div>
                        </header>
                        <div className="grid grid-cols-2 gap-20">
                           <section className="space-y-10"><h4 className="text-xs font-black uppercase bg-white text-black px-4 py-1 inline-block">TERMINAL_SUMMARY</h4><p className="text-sm leading-loose border border-white/10 p-6 bg-white/5">{resumeData.personalInfo.summary}</p></section>
                           <section className="space-y-10"><h4 className="text-xs font-black uppercase bg-white text-black px-4 py-1 inline-block">SKILL_MODULES</h4><div className="grid grid-cols-2 gap-4">{resumeData.skills.map(s => <div key={s.name} className="flex items-center gap-3 border border-white/5 p-3 hover:bg-white/5 transition-colors"><div className="w-1.5 h-1.5 rotate-45" style={{ backgroundColor: primaryColor }} /><span className="text-[10px] font-bold uppercase tracking-widest">{s.name}</span></div>)}</div></section>
                        </div>
                    </div>
                  )}

                  {/* SWISS DESIGN */}
                  {activeTemplate === 'swiss' && (
                    <div className="min-h-full bg-white p-20 flex flex-col gap-20 font-sans">
                         <div className="w-20 h-20 bg-red-600 mb-[-140px] ml-auto relative z-10" />
                         <header className="space-y-4 relative z-0">
                            <h1 className="text-8xl font-black leading-[0.8] tracking-tighter text-slate-900 break-words">{resumeData.personalInfo.name.split(' ').map((n, i) => <div key={i}>{n}</div>)}</h1>
                            <div className="h-4 bg-slate-900 w-full mt-10" />
                         </header>
                         <div className="grid grid-cols-3 gap-20">
                            <div className="text-sm font-black leading-tight space-y-2 uppercase"><div>{resumeData.personalInfo.email}</div><div>{resumeData.personalInfo.location}</div></div>
                            <div className="col-span-2 space-y-12">
                               <p className="text-2xl font-bold leading-tight tracking-tight text-slate-800">{resumeData.personalInfo.summary}</p>
                               <div className="h-1 bg-slate-100 w-24" />
                               <div className="space-y-16">{resumeData.experience.map(e => <div key={e.id} className="grid grid-cols-[120px_1fr] gap-8"><div className="text-sm font-black text-slate-300">{e.period}</div><div><div className="text-xl font-black uppercase text-slate-900">{e.company}</div><div className="text-sm font-bold text-red-600 mt-1">{e.role}</div></div></div>)}</div>
                            </div>
                         </div>
                    </div>
                  )}

                  {/* ELEGANT HERITAGE */}
                  {activeTemplate === 'elegant' && (
                    <div className="min-h-full bg-[#fffcf5] p-24 text-slate-900 border-[1in] border-white shadow-inner">
                        <header className="text-center mb-24 space-y-4">
                           <h1 className="text-5xl font-serif italic text-slate-900">{resumeData.personalInfo.name}</h1>
                           <div className="h-[1px] w-24 bg-slate-200 mx-auto" />
                           <div className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-400">{resumeData.personalInfo.location} • {resumeData.personalInfo.email}</div>
                        </header>
                        <div className="max-w-2xl mx-auto space-y-20">
                           <section className="text-center"><h4 className="font-serif italic text-slate-400 mb-8 uppercase text-xs tracking-[0.2em]">— The Abstract —</h4><p className="text-lg leading-relaxed text-slate-800">{resumeData.personalInfo.summary}</p></section>
                           <section className="space-y-12"><h4 className="font-serif italic text-slate-400 mb-12 uppercase text-xs tracking-[0.2em] border-b border-slate-100 pb-4 text-center">Chronicle</h4>{resumeData.experience.map(e => <div key={e.id} className="text-center"> <div className="text-[13px] font-bold uppercase tracking-widest text-slate-900 mb-1">{e.company}</div> <div className="font-serif italic text-slate-500 mb-4">{e.role} — {e.period}</div> </div>)}</section>
                        </div>
                    </div>
                  )}

                  {/* Fallback for other templates (Simple implementation) */}
                  {!['tech', 'cyber', 'swiss', 'elegant'].includes(activeTemplate) && (
                    <div className="p-16 h-full flex flex-col items-center justify-center text-center space-y-6">
                       <h2 className="text-4xl font-black uppercase tracking-tighter" style={{ color: primaryColor }}>{resumeData.personalInfo.name}</h2>
                       <p className="text-slate-500 text-sm max-w-md">{resumeData.personalInfo.summary}</p>
                       <div className="flex flex-wrap justify-center gap-2">
                          {resumeData.skills.map(s => <span key={s.name} className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-bold">{s.name}</span>)}
                       </div>
                    </div>
                  )}
                </div>
             </div>
          </div>
       </div>
    </div>
  )
}
