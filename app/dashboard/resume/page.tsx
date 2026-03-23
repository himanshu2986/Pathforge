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
  Printer,
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
  Layers,
  Award
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
    description: string
  }[]
  skills: string[]
  projects: {
    id: string
    title: string
    description: string
    skills: string[]
    url?: string
  }[]
}

type TemplateType = 'classic' | 'modern' | 'minimal' | 'executive'

export default function AdvancedResumeBuilderPage() {
  const { user } = useAuthStore()
  const { portfolioProjects, skills: dashboardSkills } = useDashboardStore()
  
  const [activeStep, setActiveStep] = useState(0)
  const steps = [
    { label: 'Template', icon: LayoutTemplate },
    { label: 'Personal', icon: User },
    { label: 'Work', icon: Briefcase },
    { label: 'Study', icon: GraduationCap },
    { label: 'Projects', icon: Layout },
    { label: 'Finish', icon: CheckCircle2 },
  ]

  const [activeTemplate, setActiveTemplate] = useState<TemplateType>('modern')
  const [primaryColor, setPrimaryColor] = useState('#0ea5e9')

  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      location: user?.location || '',
      website: user?.website || '',
      github: '',
      summary: user?.bio || ''
    },
    experience: [],
    education: [],
    skills: [],
    projects: []
  })

  // Pre-fill from store if data exists
  useEffect(() => {
    if (portfolioProjects.length > 0 && resumeData.projects.length === 0) {
      setResumeData(prev => ({
        ...prev,
        projects: portfolioProjects.map(p => ({
          id: p.id,
          title: p.title,
          description: p.description,
          skills: p.skills,
          url: p.url
        }))
      }))
    }
    if (dashboardSkills.length > 0 && resumeData.skills.length === 0) {
      setResumeData(prev => ({
        ...prev,
        skills: dashboardSkills.filter(s => s.level > 50).map(s => s.name)
      }))
    }
  }, [portfolioProjects, dashboardSkills])

  // --- Handlers ---
  const updatePersonalInfo = (updates: Partial<ResumeData['personalInfo']>) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, ...updates }
    }))
  }

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, { id: Date.now().toString(), company: '', role: '', period: '', bullets: [''] }]
    }))
  }

  const removeExperience = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }))
  }

  const updateExperienceBullet = (expId: string, bulletIndex: number, text: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => {
        if (exp.id === expId) {
          const newBullets = [...exp.bullets]
          newBullets[bulletIndex] = text
          return { ...exp, bullets: newBullets }
        }
        return exp
      })
    }))
  }

  const addExperienceBullet = (expId: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => {
        if (exp.id === expId) return { ...exp, bullets: [...exp.bullets, ''] }
        return exp
      })
    }))
  }

  const removeExperienceBullet = (expId: string, bulletIndex: number) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => {
        if (exp.id === expId) return { ...exp, bullets: exp.bullets.filter((_, i) => i !== bulletIndex) }
        return exp
      })
    }))
  }

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, { id: Date.now().toString(), school: '', degree: '', period: '', description: '' }]
    }))
  }

  const removeEducation = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }))
  }

  const handlePrint = () => {
    window.print()
  }

  const generateAISummary = () => {
    const allSkills = resumeData.skills.length > 0 ? resumeData.skills.join(', ') : 'modern tech stack'
    const topProject = resumeData.projects[0]?.title || 'innovative solutions'
    const summary = `Expert in ${allSkills}. Specialist in building high-performance applications like ${topProject}. Focused on delivering scalable and user-centric software solutions.`
    updatePersonalInfo({ summary })
    toast.success('AI Summary Generated!')
  }

  // --- Render Helpers ---
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'modern', name: 'Modern', desc: 'Centered, clean & high-impact', icon: Layers },
                { id: 'classic', name: 'Classic', desc: 'Standard professional layout', icon: Award },
                { id: 'minimal', name: 'Minimal', desc: 'Modern sidebar structure', icon: Layout },
                { id: 'executive', name: 'Executive', desc: 'Bold headings & dense info', icon: Briefcase },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveTemplate(t.id as TemplateType)
                    setActiveStep(1)
                  }}
                  className={cn(
                    "flex flex-col items-start p-4 rounded-xl border text-left transition-all group",
                    activeTemplate === t.id ? "bg-primary/10 border-primary ring-1 ring-primary" : "bg-card border-border hover:border-primary/50"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-colors",
                    activeTemplate === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                  )}>
                    <t.icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-foreground text-sm">{t.name} Template</h4>
                  <p className="text-[10px] text-muted-foreground mt-1">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Full Name</label>
                <input 
                  value={resumeData.personalInfo.name} 
                  onChange={e => updatePersonalInfo({ name: e.target.value })}
                  className="w-full bg-input border border-border rounded-lg px-4 py-2 outline-none" 
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <input 
                  value={resumeData.personalInfo.email} 
                  onChange={e => updatePersonalInfo({ email: e.target.value })}
                  className="w-full bg-input border border-border rounded-lg px-4 py-2 outline-none" 
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium block">Personal Statement</label>
                <button onClick={generateAISummary} className="text-[10px] font-bold text-primary flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI Summary
                </button>
              </div>
              <textarea 
                value={resumeData.personalInfo.summary} 
                onChange={e => updatePersonalInfo({ summary: e.target.value })}
                rows={4}
                className="w-full bg-input border border-border rounded-lg px-4 py-2 outline-none resize-none" 
              />
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
             <div className="flex justify-between items-center">
              <h4 className="font-medium">Experience</h4>
              <button onClick={addExperience} className="text-xs text-primary flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add Job
              </button>
            </div>
            {resumeData.experience.map((exp, expIndex) => (
              <GlassCard key={exp.id} className="p-4 grid gap-3">
                <div className="flex justify-between">
                  <input placeholder="Company" value={exp.company} onChange={e => {
                    const n = [...resumeData.experience]; n[expIndex].company = e.target.value; setResumeData(p => ({ ...p, experience: n }))
                  }} className="bg-transparent border-b border-border text-sm outline-none" />
                  <button onClick={() => removeExperience(exp.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                </div>
                <input placeholder="Role" value={exp.role} onChange={e => {
                  const n = [...resumeData.experience]; n[expIndex].role = e.target.value; setResumeData(p => ({ ...p, experience: n }))
                }} className="bg-transparent border-b border-border text-sm outline-none" />
                <div className="space-y-1">
                   {exp.bullets.map((b, bi) => (
                     <div key={bi} className="flex gap-2">
                        <input value={b} onChange={e => updateExperienceBullet(exp.id, bi, e.target.value)} className="flex-1 bg-transparent border-b border-border/50 text-xs outline-none" placeholder="Achievement..." />
                        <button onClick={() => removeExperienceBullet(exp.id, bi)}><Trash2 className="w-2 h-2 text-muted-foreground" /></button>
                     </div>
                   ))}
                   <button onClick={() => addExperienceBullet(exp.id)} className="text-[9px] text-primary">+ Bullet</button>
                </div>
              </GlassCard>
            ))}
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
             <div className="flex justify-between items-center">
              <h4 className="font-medium">Education</h4>
              <button onClick={addEducation} className="text-xs text-primary flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add Study
              </button>
            </div>
            {resumeData.education.map((edu, i) => (
              <GlassCard key={edu.id} className="p-4 grid gap-2">
                 <input placeholder="School" value={edu.school} onChange={e => {
                   const n = [...resumeData.education]; n[i].school = e.target.value; setResumeData(p => ({ ...p, education: n }))
                 }} className="bg-transparent border-b border-border text-sm outline-none" />
                 <input placeholder="Degree" value={edu.degree} onChange={e => {
                   const n = [...resumeData.education]; n[i].degree = e.target.value; setResumeData(p => ({ ...p, education: n }))
                 }} className="bg-transparent border-b border-border text-sm outline-none" />
              </GlassCard>
            ))}
          </div>
        )
      case 4:
        return (
          <div className="space-y-6">
            <h4 className="font-medium">Projects</h4>
            <div className="grid grid-cols-2 gap-3">
              {portfolioProjects.map(p => {
                const s = resumeData.projects.some(rp => rp.id === p.id)
                return (
                  <button key={p.id} onClick={() => {
                    if (s) setResumeData(prev => ({ ...prev, projects: prev.projects.filter(rp => rp.id !== p.id) }))
                    else setResumeData(prev => ({ ...prev, projects: [...prev.projects, { ...p }] }))
                  }} className={cn("p-2 border rounded-lg text-left text-xs", s ? "border-primary bg-primary/5" : "border-border")}>
                    {p.title}
                  </button>
                )
              })}
            </div>
          </div>
        )
      case 5:
        return (
          <div className="space-y-8">
            <section>
              <h4 className="font-medium mb-3">Branding</h4>
              <div className="flex gap-3">
                {['#0ea5e9', '#ec4899', '#10b981', '#6366f1', '#f59e0b', '#dc2626', '#1e293b'].map(c => (
                  <button key={c} onClick={() => setPrimaryColor(c)} className={cn("w-8 h-8 rounded-full border-2", primaryColor === c ? "border-white" : "border-transparent")} style={{ backgroundColor: c }} />
                ))}
              </div>
            </section>
            
            <section className="pt-6 border-t border-border">
              <MagneticButton variant="primary" onClick={handlePrint} className="w-full">
                <Download className="w-4 h-4" /> Download PDF
              </MagneticButton>
              <p className="text-[10px] text-muted-foreground text-center mt-4">
                You can change the template at any time in Step 1.
              </p>
            </section>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <FileText className="w-8 h-8 text-primary" />
          Resume <span className="gradient-text">Studio</span>
        </h1>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-8">
          <div className="flex justify-between relative px-2">
            <div className="absolute top-5 left-8 right-8 h-[1px] bg-border -z-10" />
            {steps.map((step, index) => (
              <div key={step.label} className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => setActiveStep(index)}>
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                  activeStep === index ? "bg-primary text-primary-foreground scale-110 shadow-lg" : 
                  activeStep > index ? "bg-emerald-500 text-white" : "bg-card border border-border text-muted-foreground"
                )}>
                  {activeStep > index ? <CheckCircle2 className="w-5 h-5" /> : <step.icon className="w-4 h-4" />}
                </div>
                <span className={cn("text-[8px] uppercase font-bold", activeStep === index ? "text-primary" : "text-muted-foreground")}>{step.label}</span>
              </div>
            ))}
          </div>

          <GlassCard>
            <GlassCardContent className="p-6">
              <AnimatePresence mode="wait">
                <motion.div key={activeStep} initial={{ opacity: 0, x: 5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -5 }}>
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>
              
              <div className="mt-8 flex justify-between pt-6 border-t border-border">
                <button onClick={() => setActiveStep(p => Math.max(0, p - 1))} className={cn("text-sm text-muted-foreground disabled:opacity-0", activeStep === 0 && "invisible")}>
                   Back
                </button>
                {activeStep < steps.length - 1 && (
                  <button onClick={() => setActiveStep(p => p + 1)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold">
                    Continue
                  </button>
                )}
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>

        <div className="hidden lg:block sticky top-8 print:static">
          <div id="resume-preview" className="aspect-[1/1.41] bg-white text-slate-800 shadow-2xl rounded-2xl overflow-hidden overflow-y-auto">
            {activeTemplate === 'minimal' ? (
              <div className="flex h-full">
                <div className="w-1/3 bg-slate-50 p-8 border-r border-slate-100 flex flex-col gap-6">
                  <h2 className="text-xl font-black uppercase text-slate-900 leading-tight">
                    {resumeData.personalInfo.name.split(' ')[0]}<br/>
                    <span style={{ color: primaryColor }}>{resumeData.personalInfo.name.split(' ').slice(1).join(' ')}</span>
                  </h2>
                  <div className="space-y-2 text-[10px] text-slate-500 font-medium">
                     {resumeData.personalInfo.email && <div className="flex items-center gap-2 truncate"><Mail className="w-3 h-3" /> {resumeData.personalInfo.email}</div>}
                     {resumeData.personalInfo.phone && <div className="flex items-center gap-2"><Phone className="w-3 h-3" /> {resumeData.personalInfo.phone}</div>}
                  </div>
                  <section>
                    <h4 className="text-[10px] font-black uppercase text-slate-300 mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {resumeData.skills.map(s => <span key={s} className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[8px] text-slate-600 font-bold">{s}</span>)}
                    </div>
                  </section>
                </div>
                <div className="flex-1 p-10 flex flex-col gap-6 text-[11px]">
                  <section><h4 className="text-[10px] font-black uppercase mb-2" style={{ color: primaryColor }}>Profile</h4><p className="text-slate-600">{resumeData.personalInfo.summary}</p></section>
                  <section><h4 className="text-[10px] font-black uppercase mb-2" style={{ color: primaryColor }}>Experience</h4>{resumeData.experience.map(e => <div key={e.id} className="mb-4"><div className="font-bold flex justify-between"><span>{e.role}</span><span className="text-[9px] text-slate-400">{e.period}</span></div><div className="text-slate-500 italic mb-1">{e.company}</div><ul className="list-disc list-inside space-y-0.5">{e.bullets.map((b, i) => b && <li key={i}>{b}</li>)}</ul></div>)}</section>
                </div>
              </div>
            ) : activeTemplate === 'executive' ? (
              <div className="p-12 space-y-8 flex flex-col text-[11px]">
                 <header className="border-b-4 pb-6" style={{ borderColor: primaryColor }}>
                    <h2 className="text-4xl font-black text-slate-900">{resumeData.personalInfo.name}</h2>
                    <div className="flex gap-4 mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                       <span>{resumeData.personalInfo.email}</span>
                       <span>{resumeData.personalInfo.location}</span>
                    </div>
                 </header>
                 <section><h4 className="text-sm font-black uppercase mb-4" style={{ color: primaryColor }}>Executive Summary</h4><p className="text-slate-700 leading-relaxed text-[12px]">{resumeData.personalInfo.summary}</p></section>
                 <div className="grid grid-cols-2 gap-8">
                    <section><h4 className="text-sm font-black uppercase mb-4" style={{ color: primaryColor }}>Professional Background</h4>{resumeData.experience.map(e => <div key={e.id} className="mb-4"><div className="font-bold text-[12px]">{e.company}</div><div className="italic text-slate-500 mb-1">{e.role} | {e.period}</div><ul className="list-disc list-inside">{e.bullets.map((b, i) => b && <li key={i}>{b}</li>)}</ul></div>)}</section>
                    <div className="space-y-8">
                       <section><h4 className="text-sm font-black uppercase mb-4" style={{ color: primaryColor }}>Core Competencies</h4><div className="grid grid-cols-2 gap-1">{resumeData.skills.map(s => <div key={s} className="flex items-center gap-1 font-bold text-slate-600"><div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />{s}</div>)}</div></section>
                    </div>
                 </div>
              </div>
            ) : (
              <div className={cn("p-12 flex flex-col h-full", activeTemplate === 'modern' ? "items-center text-center" : "items-start")}>
                 <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{resumeData.personalInfo.name}</h2>
                 <div className="flex flex-wrap justify-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 mb-10">
                    <span>{resumeData.personalInfo.email}</span>
                    <span>{resumeData.personalInfo.location}</span>
                 </div>
                 <div className="w-full text-left space-y-8 text-[11px]">
                    <section><h4 className="text-[10px] font-black uppercase border-b-2 pb-1 mb-3" style={{ color: primaryColor, borderColor: primaryColor }}>The Portfolio</h4><p className="text-slate-700">{resumeData.personalInfo.summary}</p></section>
                    <section><h4 className="text-[10px] font-black uppercase border-b-2 pb-1 mb-3" style={{ color: primaryColor, borderColor: primaryColor }}>Selected Experience</h4>{resumeData.experience.map(e => <div key={e.id} className="mb-6"><div className="flex justify-between font-bold text-[13px]"><span>{e.role}</span><span className="text-[10px] text-slate-400">{e.period}</span></div><div className="font-bold text-slate-500 text-[10px] uppercase tracking-wider mb-2">{e.company}</div><ul className="space-y-1">{e.bullets.map((b, i) => b && <li key={i} className="flex gap-2"> <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: primaryColor }} /> {b} </li>)}</ul></div>)}</section>
                    <section><h4 className="text-[10px] font-black uppercase border-b-2 pb-1 mb-3" style={{ color: primaryColor, borderColor: primaryColor }}>Top Skills</h4><div className="flex flex-wrap gap-1">{resumeData.skills.map(s => <span key={s} className="px-2 py-1 bg-slate-50 border border-slate-100 rounded text-[9px] font-bold text-slate-600">{s}</span>)}</div></section>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        @media print {
          body * { visibility: hidden !important; }
          #resume-preview, #resume-preview * { visibility: visible !important; }
          #resume-preview { position: fixed !important; left: 0 !important; top: 0 !important; width: 210mm !important; height: 297mm !important; padding: 1in !important; box-shadow: none !important; border-radius: 0 !important; margin: 0 !important; }
        }
      `}</style>
    </div>
  )
}
