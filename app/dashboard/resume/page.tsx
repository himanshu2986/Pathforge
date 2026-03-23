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
  BookOpen
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

type TemplateType = 'modern' | 'classic' | 'minimal' | 'executive' | 'tech' | 'creative'

export default function LuxuryResumeBuilderPage() {
  const { user } = useAuthStore()
  const { portfolioProjects, skills: dashboardSkills } = useDashboardStore()
  
  const [activeStep, setActiveStep] = useState(0)
  const steps = [
    { label: 'Style', icon: Palette },
    { label: 'Bio', icon: User },
    { label: 'History', icon: Briefcase },
    { label: 'Details', icon: Layout },
    { label: 'Finalize', icon: Zap },
  ]

  const [activeTemplate, setActiveTemplate] = useState<TemplateType>('tech')
  const [primaryColor, setPrimaryColor] = useState('#0ea5e9')
  const [fontFamily, setFontFamily] = useState('sans') // 'sans' | 'serif' | 'mono'

  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      location: user?.location || '',
      website: user?.website || '',
      github: '',
      summary: user?.bio || '',
      photo: user?.avatarUrl || ''
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

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'tech', name: 'Tech Innovator', desc: 'Dark-themed, high-contrast, skills-focused', icon: Zap },
              { id: 'creative', name: 'Creative Portfolio', desc: 'Bold, asymmetric, with photo support', icon: Star },
              { id: 'minimal', name: 'Nordic Minimal', desc: 'Clean, spacious, ultra-modern', icon: Layers },
              { id: 'executive', name: 'Ivy Executive', desc: 'Elite, serif-based, formal', icon: Award },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => { setActiveTemplate(t.id as TemplateType); setActiveStep(1) }}
                className={cn(
                  "p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] flex flex-col gap-3",
                  activeTemplate === t.id ? "bg-primary/10 border-primary ring-2 ring-primary/20" : "bg-card border-border shadow-sm"
                )}
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", activeTemplate === t.id ? "bg-primary text-primary-foreground" : "bg-muted")}>
                   <t.icon className="w-6 h-6" />
                </div>
                <div>
                   <h4 className="font-bold text-sm">{t.name}</h4>
                   <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{t.desc}</p>
                </div>
              </button>
            ))}
          </div>
        )
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-6 mb-4">
               <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                     {resumeData.personalInfo.photo ? (
                       <img src={resumeData.personalInfo.photo} className="w-full h-full object-cover" />
                     ) : (
                       <Camera className="w-8 h-8 text-muted-foreground" />
                     )}
                  </div>
                  <input type="file" onChange={handlePhotoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl pointer-events-none">
                     <span className="text-[10px] font-bold text-white uppercase tracking-wider">Change</span>
                  </div>
               </div>
               <div className="flex-1 space-y-4">
                  <input 
                    value={resumeData.personalInfo.name} 
                    onChange={e => setResumeData(p => ({ ...p, personalInfo: { ...p.personalInfo, name: e.target.value } }))}
                    className="w-full bg-transparent border-b-2 border-border focus:border-primary text-xl font-bold outline-none pb-2" 
                    placeholder="Full Name"
                  />
                  <input 
                    value={resumeData.personalInfo.email} 
                    onChange={e => setResumeData(p => ({ ...p, personalInfo: { ...p.personalInfo, email: e.target.value } }))}
                    className="w-full bg-transparent border-b border-border focus:border-primary text-sm outline-none pb-1" 
                    placeholder="Email Address"
                  />
               </div>
            </div>
            <textarea 
              value={resumeData.personalInfo.summary} 
              onChange={e => setResumeData(p => ({ ...p, personalInfo: { ...p.personalInfo, summary: e.target.value } }))}
              placeholder="Write a brief professional summary..."
              className="w-full bg-input border border-border rounded-xl p-4 text-sm outline-none resize-none h-32"
            />
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
             <div className="flex justify-between items-center"><h4 className="font-bold">Experience</h4><button onClick={() => setResumeData(p => ({ ...p, experience: [...p.experience, { id: Date.now().toString(), company: '', role: '', period: '', bullets: [''] }] }))} className="text-xs text-primary">+ Add Job</button></div>
             {resumeData.experience.map((exp, i) => (
                <div key={exp.id} className="p-4 rounded-xl bg-card border border-border relative">
                   <button onClick={() => setResumeData(p => ({ ...p, experience: p.experience.filter(e => e.id !== exp.id) }))} className="absolute top-2 right-2 text-muted-foreground"><Trash2 className="w-3 h-3" /></button>
                   <div className="grid grid-cols-2 gap-3 mb-3">
                      <input placeholder="Company" value={exp.company} onChange={e => { const n = [...resumeData.experience]; n[i].company = e.target.value; setResumeData(p => ({ ...p, experience: n })) }} className="bg-transparent border-b border-border text-sm outline-none" />
                      <input placeholder="Role" value={exp.role} onChange={e => { const n = [...resumeData.experience]; n[i].role = e.target.value; setResumeData(p => ({ ...p, experience: n })) }} className="bg-transparent border-b border-border text-sm outline-none" />
                   </div>
                   <input placeholder="Period" value={exp.period} onChange={e => { const n = [...resumeData.experience]; n[i].period = e.target.value; setResumeData(p => ({ ...p, experience: n })) }} className="w-full bg-transparent border-b border-border text-[10px] outline-none" />
                </div>
             ))}
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <h4 className="font-bold">Featured Projects</h4>
            <div className="grid grid-cols-2 gap-3">
               {portfolioProjects.map(p => {
                 const isSel = resumeData.projects.find(rp => rp.id === p.id)
                 return (
                   <button key={p.id} onClick={() => setResumeData(prev => ({ ...prev, projects: isSel ? prev.projects.filter(rp => rp.id !== p.id) : [...prev.projects, p] }))} 
                   className={cn("p-3 rounded-xl border text-left transition-all", isSel ? "border-primary bg-primary/5" : "border-border bg-card")}>
                      <h5 className="text-[10px] font-bold truncate">{p.title}</h5>
                      <p className="text-[8px] text-muted-foreground line-clamp-1 mt-1">{p.description}</p>
                   </button>
                 )
               })}
            </div>
            <h4 className="font-bold mt-8">Technical Skills</h4>
            <div className="flex flex-wrap gap-2">
               {dashboardSkills.map(s => {
                 const isSel = resumeData.skills.find(rs => rs.name === s.name)
                 return (
                   <button key={s.id} onClick={() => setResumeData(prev => ({ ...prev, skills: isSel ? prev.skills.filter(rs => rs.name !== s.name) : [...prev.skills, { name: s.name, level: s.level }] }))}
                   className={cn("px-3 py-1 rounded-full text-[10px] border transition-all", isSel ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border")}>
                      {s.name}
                   </button>
                 )
               })}
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-8 text-center pt-10">
             <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-primary" />
             </div>
             <div>
                <h3 className="text-xl font-bold">Ready to Launch?</h3>
                <p className="text-sm text-muted-foreground mt-2">Your luxury resume is ready for download. You can fine-tune colors below.</p>
             </div>
             <div className="flex justify-center gap-3">
                {['#0ea5e9', '#6366f1', '#1e293b', '#10b981', '#f59e0b', '#dc2626'].map(c => (
                  <button key={c} onClick={() => setPrimaryColor(c)} className={cn("w-10 h-10 rounded-full border-4", primaryColor === c ? "border-white shadow-lg" : "border-transparent")} style={{ backgroundColor: c }} />
                ))}
             </div>
             <div className="flex gap-4">
                <MagneticButton variant="primary" onClick={() => window.print()} className="flex-1 py-4">
                   <Download className="w-4 h-4" /> Download PDF
                </MagneticButton>
             </div>
          </div>
        )
      default: return null
    }
  }

  return (
    <div className="p-6 lg:p-12 max-w-[1600px] mx-auto min-h-screen bg-transparent">
       <div className="grid lg:grid-cols-[400px_1fr] gap-12 items-start">
          
          {/* Left Panel: Editor */}
          <div className="space-y-8 sticky top-12">
             <div className="flex items-center gap-4 mb-10">
                <div className="p-3 bg-primary rounded-2xl shadow-lg shadow-primary/20"><Zap className="w-6 h-6 text-primary-foreground" /></div>
                <div><h1 className="text-2xl font-black gradient-text">Luxury Resume</h1><p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Advanced Studio</p></div>
             </div>

             <div className="flex justify-between items-center relative py-4">
                <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-border -z-10" />
                {steps.map((s, idx) => (
                  <button key={idx} onClick={() => setActiveStep(idx)} className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all", activeStep === idx ? "bg-primary text-primary-foreground scale-110 shadow-xl" : activeStep > idx ? "bg-emerald-500 text-white" : "bg-card border border-border text-muted-foreground")}>
                     {activeStep > idx ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-4 h-4" />}
                  </button>
                ))}
             </div>

             <GlassCard className="border-none shadow-2xl bg-card/80 backdrop-blur-3xl overflow-hidden">
                <GlassCardHeader className="bg-muted/50 py-4 border-b border-white/5"><h3 className="text-sm font-black uppercase tracking-widest">{steps[activeStep].label}</h3></GlassCardHeader>
                <GlassCardContent className="p-8"><AnimatePresence mode="wait"><motion.div key={activeStep} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}>{renderStepContent()}</motion.div></AnimatePresence></GlassCardContent>
                <div className="p-6 bg-muted/30 flex justify-between border-t border-white/5">
                   <button onClick={() => setActiveStep(p => Math.max(0, p - 1))} className={cn("text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors", activeStep === 0 && "opacity-0")}>Prev</button>
                   {activeStep < steps.length - 1 && <button onClick={() => setActiveStep(p => p + 1)} className="text-xs font-black uppercase tracking-widest text-primary hover:scale-105 transition-transform">Continue</button>}
                </div>
             </GlassCard>
          </div>

          {/* Right Panel: Advanced Live Preview */}
          <div className="hidden lg:block">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3"><LayoutTemplate className="w-5 h-5 text-primary" /><h3 className="font-bold text-lg">Active Template: <span className="text-primary capitalize">{activeTemplate}</span></h3></div>
                <div className="flex gap-2">
                   {['sans', 'serif', 'mono'].map(f => <button key={f} onClick={() => setFontFamily(f)} className={cn("px-3 py-1 rounded-lg text-[10px] font-bold border transition-all", fontFamily === f ? "bg-white text-black border-black" : "bg-muted border-border")}>{f.toUpperCase()}</button>)}
                </div>
             </div>

             <div className={cn("aspect-[1/1.41] bg-white text-slate-900 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] rounded-sm overflow-hidden p-0", fontFamily === 'serif' ? 'font-serif' : fontFamily === 'mono' ? 'font-mono' : 'font-sans')}>
                <div id="resume-preview" className="h-full w-full">
                  {/* TECH INNOVATOR TEMPLATE */}
                  {activeTemplate === 'tech' && (
                    <div className="h-full flex flex-col bg-[#111827] text-gray-200">
                       <div className="p-12 flex justify-between items-start border-b border-gray-800 bg-[#030712]">
                          <div><h2 className="text-4xl font-black tracking-tight text-white mb-2">{resumeData.personalInfo.name || 'FULL NAME'}</h2><div className="flex gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest"><span>{resumeData.personalInfo.email}</span><span>{resumeData.personalInfo.location}</span></div></div>
                          <div className="w-20 h-20 rounded-2xl border-4 border-gray-800 overflow-hidden bg-gray-900">{resumeData.personalInfo.photo && <img src={resumeData.personalInfo.photo} className="w-full h-full object-cover" />}</div>
                       </div>
                       <div className="flex-1 grid grid-cols-[1fr_260px] h-full">
                          <div className="p-12 space-y-12">
                             <section><h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-6" style={{ color: primaryColor }}><Zap className="w-3 h-3" /> Core Narrative</h4><p className="text-sm leading-relaxed text-gray-400">{resumeData.personalInfo.summary}</p></section>
                             <section><h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-6" style={{ color: primaryColor }}><Briefcase className="w-3 h-3" /> Mission Logs</h4><div className="space-y-8">{resumeData.experience.map(e => <div key={e.id} className="relative pl-6 border-l border-gray-800"><div className="absolute top-0 left-[-4.5px] w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} /><div className="font-bold text-white">{e.role}</div><div className="text-xs text-gray-500 mb-2 font-black uppercase tracking-wider">{e.company} | {e.period}</div><ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">{e.bullets.map((b, i) => b && <li key={i}>{b}</li>)}</ul></div>)}</div></section>
                          </div>
                          <div className="bg-[#1f2937]/50 p-10 border-l border-gray-800 space-y-10">
                             <section><h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-6">Stack Matrix</h4><div className="space-y-4">{resumeData.skills.map(s => <div key={s.name} className="space-y-1.5"><div className="flex justify-between text-[10px] uppercase font-bold text-gray-300"><span>{s.name}</span><span>{s.level}%</span></div><div className="h-1 bg-gray-800 rounded-full overflow-hidden"><div className="h-full transition-all duration-1000" style={{ width: `${s.level}%`, backgroundColor: primaryColor }} /></div></div>)}</div></section>
                             <section><h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Repo Showcase</h4><div className="space-y-6">{resumeData.projects.map(p => <div key={p.id} className="p-4 rounded-xl bg-gray-900/50 border border-gray-800"><h5 className="font-bold text-[11px] text-white">/{p.title}</h5><p className="text-[9px] text-gray-500 mt-1 line-clamp-2">{p.description}</p></div>)}</div></section>
                          </div>
                       </div>
                    </div>
                  )}

                  {/* CREATIVE PORTFOLIO TEMPLATE */}
                  {activeTemplate === 'creative' && (
                    <div className="h-full grid grid-cols-[340px_1fr]">
                       <div className="bg-[#fafafa] p-12 flex flex-col items-center text-center border-r border-gray-100">
                          <div className="w-40 h-40 rounded-full overflow-hidden mb-8 ring-8 ring-white shadow-xl bg-gray-200">{resumeData.personalInfo.photo && <img src={resumeData.personalInfo.photo} className="w-full h-full object-cover" />}</div>
                          <h2 className="text-3xl font-black text-slate-900 leading-tight mb-2 uppercase">{resumeData.personalInfo.name}</h2>
                          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-10">Creative Engineer</p>
                          <div className="w-full space-y-8 text-left">
                             <section><h4 className="text-[9px] font-black uppercase tracking-widest mb-4" style={{ color: primaryColor }}>Connections</h4><div className="space-y-3 text-[10px] font-medium text-slate-600"><div>{resumeData.personalInfo.email}</div><div>{resumeData.personalInfo.location}</div></div></section>
                             <section><h4 className="text-[9px] font-black uppercase tracking-widest mb-4" style={{ color: primaryColor }}>Top Arsenal</h4><div className="flex flex-wrap gap-1.5">{resumeData.skills.map(s => <span key={s.name} className="px-2 py-1 bg-white border border-gray-200 rounded text-[9px] font-bold shadow-sm">{s.name}</span>)}</div></section>
                          </div>
                       </div>
                       <div className="p-16 space-y-16">
                          <section><div className="w-12 h-1 mb-6" style={{ backgroundColor: primaryColor }} /><h3 className="text-xl font-black text-slate-900 mb-6">Brief</h3><p className="text-sm leading-relaxed text-slate-600 font-medium italic">"{resumeData.personalInfo.summary}"</p></section>
                          <section><h3 className="text-xl font-black text-slate-900 mb-8">Journey</h3><div className="space-y-12">{resumeData.experience.map(e => <div key={e.id}><h5 className="text-lg font-bold text-slate-900">{e.role}</h5><p className="text-xs font-black uppercase tracking-widest mt-1" style={{ color: primaryColor }}>{e.company} // {e.period}</p><ul className="mt-4 space-y-2 text-xs text-slate-500 font-medium list-none">{e.bullets.map((b, i) => b && <li key={i} className="flex gap-3"><span>—</span>{b}</li>)}</ul></div>)}</div></section>
                       </div>
                    </div>
                  )}

                  {/* MINIMALIST TEMPLATE */}
                  {activeTemplate === 'minimal' && (
                    <div className="p-20 h-full flex flex-col gap-20 bg-white">
                       <header className="flex justify-between items-end border-b-2 border-slate-900 pb-10">
                          <div><h1 className="text-5xl font-black tracking-tighter text-slate-900">{resumeData.personalInfo.name}</h1><p className="text-xs font-bold uppercase tracking-[0.4em] text-slate-400 mt-2">Design-Led Development</p></div>
                          <div className="text-right text-[10px] font-bold text-slate-800 uppercase space-y-1"><div>{resumeData.personalInfo.email}</div><div>{resumeData.personalInfo.location}</div></div>
                       </header>
                       <div className="grid grid-cols-[1fr_260px] gap-20">
                          <div className="space-y-16">
                             <section><h3 className="text-xs font-black uppercase tracking-widest mb-8 text-slate-300">Background</h3><p className="text-sm leading-loose text-slate-900">{resumeData.personalInfo.summary}</p></section>
                             <section><h3 className="text-xs font-black uppercase tracking-widest mb-10 text-slate-300">Selection of Work</h3><div className="space-y-12">{resumeData.experience.map(e => <div key={e.id} className="grid grid-cols-[100px_1fr] gap-8"><div className="text-[10px] font-black uppercase tracking-widest text-slate-400 pt-1">{e.period}</div><div><h4 className="text-sm font-bold text-slate-900">{e.company}</h4><p className="text-[11px] font-medium text-slate-500 underline decoration-slate-200 underline-offset-4 mt-1 mb-4">{e.role}</p><ul className="space-y-2">{e.bullets.map((b, i) => b && <li key={i} className="text-xs text-slate-700 leading-relaxed">• {b}</li>)}</ul></div></div>)}</div></section>
                          </div>
                          <div className="space-y-16">
                             <section><h3 className="text-xs font-black uppercase tracking-widest mb-8 text-slate-300">Technical</h3><div className="space-y-4">{resumeData.skills.map(s => <div key={s.name} className="flex flex-col gap-1"><span className="text-[10px] font-black uppercase tracking-wider text-slate-700">{s.name}</span><div className="w-full h-[1px] bg-slate-100" /><span className="text-[9px] font-bold text-slate-300">Proficiency: {s.level}%</span></div>)}</div></section>
                          </div>
                       </div>
                    </div>
                  )}

                  {/* EXECUTIVE TEMPLATE */}
                  {activeTemplate === 'executive' && (
                    <div className="h-full p-16 flex flex-col bg-slate-50 overflow-hidden">
                       <div className="border-[12px] border-slate-900 p-12 h-full flex flex-col">
                          <header className="text-center mb-16 border-b border-slate-200 pb-10">
                             <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-4">{resumeData.personalInfo.name}</h1>
                             <div className="flex justify-center gap-6 text-[10px] font-bold text-slate-400 tracking-widest uppercase"><span>{resumeData.personalInfo.email}</span><span>•</span><span>{resumeData.personalInfo.location}</span><span>•</span><span>{resumeData.personalInfo.phone}</span></div>
                          </header>
                          <div className="grid grid-cols-1 gap-12 flex-1">
                             <section className="text-center max-w-2xl mx-auto"><h3 className="text-[11px] font-black uppercase tracking-[0.2em] mb-4 text-slate-300">Professional Profile</h3><p className="text-sm font-medium leading-relaxed text-slate-700 italic">"{resumeData.personalInfo.summary}"</p></section>
                             <section><h3 className="text-[11px] font-black uppercase tracking-[0.2em] mb-8 text-slate-300 border-b border-slate-100 pb-2 text-center">Distinguished Career</h3><div className="space-y-10">{resumeData.experience.map(e => <div key={e.id} className="grid grid-cols-[140px_1fr] gap-8"><div className="text-[10px] font-black text-slate-400 uppercase pt-1">{e.period}</div><div><h4 className="text-sm font-bold text-slate-900 uppercase">{e.company}</h4><p className="text-xs font-black italic text-slate-500 mb-4">{e.role}</p><ul className="space-y-2">{e.bullets.map((b, i) => b && <li key={i} className="text-xs text-slate-700 leading-relaxed">• {b}</li>)}</ul></div></div>)}</div></section>
                          </div>
                       </div>
                    </div>
                  )}
                </div>
             </div>
          </div>
       </div>

       <style jsx global>{`
        @media print {
          body * { visibility: hidden !important; }
          #resume-preview, #resume-preview * { visibility: visible !important; }
          #resume-preview { position: fixed !important; left: 0 !important; top: 0 !important; width: 210mm !important; height: 297mm !important; box-shadow: none !important; border-radius: 0 !important; margin: 0 !important; z-index: 9999 !important; }
        }
       `}</style>
    </div>
  )
}
