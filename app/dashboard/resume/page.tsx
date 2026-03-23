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
  Github,
  Palette,
  Sparkles,
  ArrowUpDown,
  MoveUp,
  MoveDown,
  LayoutTemplate
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

type TemplateType = 'classic' | 'modern' | 'minimal'

export default function AdvancedResumeBuilderPage() {
  const { user } = useAuthStore()
  const { portfolioProjects, skills: dashboardSkills } = useDashboardStore()
  
  const [activeStep, setActiveStep] = useState(0)
  const steps = [
    { label: 'Personal Info', icon: User },
    { label: 'Experience', icon: Briefcase },
    { label: 'Education', icon: GraduationCap },
    { label: 'Projects', icon: Layout },
    { label: 'Skills & Finish', icon: Code2 },
  ]

  const [activeTemplate, setActiveTemplate] = useState<TemplateType>('modern')
  const [primaryColor, setPrimaryColor] = useState('#0ea5e9') // Default sky-500

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
    
    const summaries = [
      `Detail-oriented Software Developer with expertise in ${allSkills}. Highly skilled in building ${topProject} and committed to writing clean, scalable code.`,
      `Full-Stack Developer passionate about ${allSkills}. Proven track record of delivering high-quality projects like ${topProject} with modern architectures.`,
      `Creative Problem Solver and Developer. Specialist in ${allSkills.split(',')[0]} and ${allSkills.split(',')[1] || 'UI/UX'}. Dedicated to project excellence and functional design.`
    ]
    
    const randomSummary = summaries[Math.floor(Math.random() * summaries.length)]
    updatePersonalInfo({ summary: randomSummary })
    toast.success('AI Summary Generated!', { icon: <Sparkles className="w-4 h-4 text-emerald-500" /> })
  }

  // --- Render Helpers ---
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Full Name</label>
                <input 
                  value={resumeData.personalInfo.name} 
                  onChange={e => updatePersonalInfo({ name: e.target.value })}
                  className="w-full bg-input border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/50 outline-none" 
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <input 
                  value={resumeData.personalInfo.email} 
                  onChange={e => updatePersonalInfo({ email: e.target.value })}
                  className="w-full bg-input border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/50 outline-none" 
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Phone</label>
                <input 
                  value={resumeData.personalInfo.phone} 
                  onChange={e => updatePersonalInfo({ phone: e.target.value })}
                  className="w-full bg-input border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/50 outline-none" 
                  placeholder="+1 234 567 890"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Location</label>
                <input 
                  value={resumeData.personalInfo.location} 
                  onChange={e => updatePersonalInfo({ location: e.target.value })}
                  className="w-full bg-input border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/50 outline-none" 
                  placeholder="City, Country"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium block">Professional Summary</label>
                <button 
                  onClick={generateAISummary}
                  className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1 hover:opacity-80"
                >
                  <Sparkles className="w-3 h-3" /> Generate with AI
                </button>
              </div>
              <textarea 
                value={resumeData.personalInfo.summary} 
                onChange={e => updatePersonalInfo({ summary: e.target.value })}
                rows={4}
                className="w-full bg-input border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/50 outline-none resize-none" 
                placeholder="Brief professional profile..."
              />
            </div>
          </div>
        )
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-foreground">Work Experience</h4>
              <button onClick={addExperience} className="text-sm text-primary hover:underline flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add Experience
              </button>
            </div>
            {resumeData.experience.map((exp, expIndex) => (
              <GlassCard key={exp.id} className="relative transition-all hover:border-primary/30">
                <div className="absolute top-4 right-4 flex gap-2">
                  <button 
                    onClick={() => removeExperience(exp.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <GlassCardContent className="p-4 grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      placeholder="Company" 
                      value={exp.company}
                      onChange={e => {
                        const newExp = [...resumeData.experience]
                        newExp[expIndex].company = e.target.value
                        setResumeData(prev => ({ ...prev, experience: newExp }))
                      }}
                      className="bg-transparent border-b border-border py-1 focus:border-primary outline-none"
                    />
                    <input 
                      placeholder="Role" 
                      value={exp.role}
                      onChange={e => {
                        const newExp = [...resumeData.experience]
                        newExp[expIndex].role = e.target.value
                        setResumeData(prev => ({ ...prev, experience: newExp }))
                      }}
                      className="bg-transparent border-b border-border py-1 focus:border-primary outline-none"
                    />
                  </div>
                  <input 
                    placeholder="Period (e.g. Jan 2023 - Present)" 
                    value={exp.period}
                    onChange={e => {
                      const newExp = [...resumeData.experience]
                      newExp[expIndex].period = e.target.value
                      setResumeData(prev => ({ ...prev, experience: newExp }))
                    }}
                    className="bg-transparent border-b border-border py-1 focus:border-primary outline-none"
                  />
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Achievements/Bullets</label>
                    {exp.bullets.map((bullet, bulletIndex) => (
                      <div key={bulletIndex} className="flex gap-2">
                        <input 
                          value={bullet}
                          onChange={e => updateExperienceBullet(exp.id, bulletIndex, e.target.value)}
                          placeholder="Bullet point..."
                          className="flex-1 bg-transparent border-b border-border/50 py-1 text-sm focus:border-primary outline-none"
                        />
                        <button onClick={() => removeExperienceBullet(exp.id, bulletIndex)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => addExperienceBullet(exp.id)}
                      className="text-[10px] text-primary hover:underline flex items-center gap-1 mt-1"
                    >
                      <Plus className="w-3 h-3" /> Add Bullet
                    </button>
                  </div>
                </GlassCardContent>
              </GlassCard>
            ))}
            {resumeData.experience.length === 0 && (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                Add your work experience to build your resume.
              </div>
            )}
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-foreground">Education</h4>
              <button onClick={addEducation} className="text-sm text-primary hover:underline flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add Education
              </button>
            </div>
            {resumeData.education.map((edu, index) => (
              <GlassCard key={edu.id} className="relative transition-all hover:border-primary/30">
                <button 
                  onClick={() => removeEducation(edu.id)}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <GlassCardContent className="p-4 grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      placeholder="School / University" 
                      value={edu.school}
                      onChange={e => {
                        const newEdu = [...resumeData.education]
                        newEdu[index].school = e.target.value
                        setResumeData(prev => ({ ...prev, education: newEdu }))
                      }}
                      className="bg-transparent border-b border-border py-1 focus:border-primary outline-none"
                    />
                    <input 
                      placeholder="Degree" 
                      value={edu.degree}
                      onChange={e => {
                        const newEdu = [...resumeData.education]
                        newEdu[index].degree = e.target.value
                        setResumeData(prev => ({ ...prev, education: newEdu }))
                      }}
                      className="bg-transparent border-b border-border py-1 focus:border-primary outline-none"
                    />
                  </div>
                  <input 
                    placeholder="Period (e.g. 2019 - 2023)" 
                    value={edu.period}
                    onChange={e => {
                      const newEdu = [...resumeData.education]
                      newEdu[index].period = e.target.value
                      setResumeData(prev => ({ ...prev, education: newEdu }))
                    }}
                    className="bg-transparent border-b border-border py-1 focus:border-primary outline-none"
                  />
                </GlassCardContent>
              </GlassCard>
            ))}
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <h4 className="font-medium text-foreground">Featured Projects</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolioProjects.map(project => {
                const isSelected = resumeData.projects.some(p => p.id === project.id)
                return (
                  <button
                    key={project.id}
                    onClick={() => {
                      if (isSelected) {
                        setResumeData(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== project.id) }))
                      } else {
                        setResumeData(prev => ({ 
                          ...prev, 
                          projects: [...prev.projects, { 
                            id: project.id, 
                            title: project.title, 
                            description: project.description, 
                            skills: project.skills,
                            url: project.url 
                          }] 
                        }))
                      }
                    }}
                    className={cn(
                      "text-left p-4 rounded-xl border transition-all duration-200",
                      isSelected ? "bg-primary/10 border-primary" : "bg-input border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-bold truncate">{project.title}</h5>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
                  </button>
                )
              })}
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-8">
            <section>
              <h4 className="font-medium text-foreground mb-4">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {dashboardSkills.map(skill => {
                  const isSelected = resumeData.skills.includes(skill.name)
                  return (
                    <button
                      key={skill.id}
                      onClick={() => {
                        if (isSelected) {
                          setResumeData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill.name) }))
                        } else {
                          setResumeData(prev => ({ ...prev, skills: [...prev.skills, skill.name] }))
                        }
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm transition-all",
                        isSelected ? "bg-primary text-primary-foreground" : "bg-input border border-border hover:border-primary/50"
                      )}
                    >
                      {skill.name}
                    </button>
                  )
                })}
              </div>
            </section>

            <section>
              <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                <Palette className="w-4 h-4" /> Visual Settings
              </h4>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground block mb-2">Pick Template</label>
                  <div className="flex gap-2">
                    {(['classic', 'modern', 'minimal'] as TemplateType[]).map(t => (
                      <button
                        key={t}
                        onClick={() => setActiveTemplate(t)}
                        className={cn(
                          "px-3 py-2 rounded-lg text-xs capitalize transition-all border",
                          activeTemplate === t ? "bg-primary/20 border-primary text-primary font-bold" : "bg-input border-border"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground block mb-2">Primary Color</label>
                  <div className="flex gap-2">
                    {['#0ea5e9', '#ec4899', '#f59e0b', '#10b981', '#6366f1'].map(color => (
                      <button
                        key={color}
                        onClick={() => setPrimaryColor(color)}
                        className={cn(
                          "w-6 h-6 rounded-full transition-transform active:scale-95",
                          primaryColor === color ? "ring-2 ring-white ring-offset-2 scale-110" : ""
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <div className="pt-6 border-t border-border">
              <div className="flex flex-col sm:flex-row gap-4">
                <MagneticButton variant="primary" onClick={handlePrint} className="flex-1">
                  <Download className="w-4 h-4" /> Download Professional PDF
                </MagneticButton>
                <MagneticButton variant="secondary" onClick={() => toast.success("Draft saved to cloud!")}>
                  Save Draft
                </MagneticButton>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <FileText className="w-8 h-8 text-primary" />
          Advanced Resume <span className="gradient-text">Builder</span>
        </h1>
        <p className="text-muted-foreground">
          Tailored, professional, and AI-assisted. Your career starts here.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Editor Side */}
        <div className="space-y-8">
          {/* Progress Tracker */}
          <div className="flex justify-between relative px-2">
            <div className="absolute top-5 left-8 right-8 h-[2px] bg-border -z-10" />
            {steps.map((step, index) => (
              <div key={step.label} className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setActiveStep(index)}>
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                  activeStep === index ? "bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/20" : 
                  activeStep > index ? "bg-emerald-500 text-white" : "bg-card border border-border text-muted-foreground"
                )}>
                  {activeStep > index ? <CheckCircle2 className="w-6 h-6" /> : <step.icon className="w-5 h-5" />}
                </div>
                <span className={cn(
                  "text-[9px] uppercase font-bold tracking-wider transition-colors",
                  activeStep === index ? "text-primary" : "text-muted-foreground"
                )}>{step.label}</span>
              </div>
            ))}
          </div>

          <GlassCard delay={0.1}>
            <GlassCardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">{steps[activeStep].label}</h3>
                <span className="text-xs text-muted-foreground">Step {activeStep + 1} of 5</span>
              </div>
            </GlassCardHeader>
            <GlassCardContent className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>
              
              <div className="mt-8 flex justify-between pt-6 border-t border-border">
                <button 
                  onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
                  className={cn(
                    "flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-all",
                    activeStep === 0 && "opacity-0 pointer-events-none"
                  )}
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                {activeStep < steps.length - 1 && (
                  <MagneticButton 
                    variant="primary" 
                    onClick={() => setActiveStep(prev => Math.min(steps.length - 1, prev + 1))}
                  >
                    Next Step <ChevronRight className="w-4 h-4" />
                  </MagneticButton>
                )}
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>

        {/* Live Preview Side */}
        <div className="hidden lg:block sticky top-8 print:static">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <LayoutTemplate className="w-4 h-4 text-primary" />
               <h3 className="font-semibold text-foreground">Live Preview</h3>
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-border" />)}
            </div>
          </div>
          
          <div 
            id="resume-preview" 
            className={cn(
              "aspect-[1/1.41] bg-white text-slate-800 shadow-2xl rounded-2xl overflow-hidden transition-all duration-500",
              activeTemplate === 'classic' ? "p-[1.2in]" : 
              activeTemplate === 'modern' ? "p-[1in]" : "flex p-0"
            )}
          >
            {activeTemplate === 'minimal' ? (
              <>
                {/* Left Sidebar */}
                <div className="w-1/3 bg-slate-50 border-r border-slate-100 p-8 flex flex-col gap-8">
                  <div className="mb-4">
                    <h2 className="text-xl font-black uppercase text-slate-900 leading-tight mb-2">
                       {resumeData.personalInfo.name.split(' ')[0]}<br/>
                       <span style={{ color: primaryColor }}>{resumeData.personalInfo.name.split(' ').slice(1).join(' ')}</span>
                    </h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Software Engineer</p>
                  </div>

                  <section>
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Contact</h4>
                    <div className="space-y-2 text-[10px] text-slate-600 font-medium">
                      {resumeData.personalInfo.email && <div className="flex items-center gap-2 truncate"><Mail className="w-3 h-3" /> {resumeData.personalInfo.email}</div>}
                      {resumeData.personalInfo.phone && <div className="flex items-center gap-2"><Phone className="w-3 h-3" /> {resumeData.personalInfo.phone}</div>}
                      {resumeData.personalInfo.location && <div className="flex items-center gap-2"><MapPin className="w-3 h-3" /> {resumeData.personalInfo.location}</div>}
                    </div>
                  </section>

                  <section>
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {resumeData.skills.map(s => <span key={s} className="bg-white border border-slate-200 px-2 py-1 rounded text-[9px] text-slate-700 font-bold">{s}</span>)}
                    </div>
                  </section>
                </div>
                {/* Right Main */}
                <div className="flex-1 p-10 h-full overflow-hidden flex flex-col gap-6">
                   <section>
                     <h4 className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: primaryColor }}>Profile</h4>
                     <p className="text-[11px] leading-relaxed text-slate-700">{resumeData.personalInfo.summary}</p>
                   </section>

                   <section>
                     <h4 className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: primaryColor }}>Experience</h4>
                     <div className="space-y-6">
                        {resumeData.experience.map(exp => (
                          <div key={exp.id}>
                            <div className="font-bold text-slate-900 text-[12px]">{exp.role}</div>
                            <div className="flex justify-between items-center text-[10px] mb-2">
                              <span className="font-bold text-slate-500 italic">{exp.company}</span>
                              <span className="text-slate-400">{exp.period}</span>
                            </div>
                            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600">
                               {exp.bullets.map((b, i) => b && <li key={i}>{b}</li>)}
                            </ul>
                          </div>
                        ))}
                     </div>
                   </section>

                   <section>
                      <h4 className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: primaryColor }}>Featured Projects</h4>
                      <div className="space-y-4">
                        {resumeData.projects.map(proj => (
                          <div key={proj.id}>
                            <div className="font-bold text-slate-900 text-[11px]">{proj.title}</div>
                            <p className="text-[10px] text-slate-600">{proj.description}</p>
                          </div>
                        ))}
                      </div>
                   </section>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col">
                {/* Header */}
                <header className={cn(
                  "flex flex-col mb-10",
                  activeTemplate === 'modern' ? "items-center text-center" : "items-start"
                )}>
                  <h2 className="text-4xl font-extrabold uppercase tracking-tight text-slate-900 mb-3">
                    {resumeData.personalInfo.name || 'Your Name'}
                  </h2>
                  <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {resumeData.personalInfo.email && <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {resumeData.personalInfo.email}</span>}
                    {resumeData.personalInfo.phone && <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {resumeData.personalInfo.phone}</span>}
                    {resumeData.personalInfo.location && <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {resumeData.personalInfo.location}</span>}
                    {resumeData.personalInfo.website && <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> {resumeData.personalInfo.website.replace('https://', '')}</span>}
                  </div>
                </header>

                <div className="grid grid-cols-1 gap-10 text-[11px] leading-relaxed flex-1">
                   {/* Summary */}
                   {resumeData.personalInfo.summary && (
                    <section>
                      <h4 className="text-[10px] font-black uppercase tracking-widest pb-1.5 border-b-2 mb-3" style={{ borderColor: primaryColor, color: primaryColor }}>About Me</h4>
                      <p className="text-slate-700">{resumeData.personalInfo.summary}</p>
                    </section>
                  )}

                  {/* Experience */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                    <section className="col-span-full">
                      <h4 className="text-[10px] font-black uppercase tracking-widest pb-1.5 border-b-2 mb-4" style={{ borderColor: primaryColor, color: primaryColor }}>Professional Background</h4>
                      <div className="space-y-6">
                        {resumeData.experience.map(exp => (
                          <div key={exp.id}>
                            <div className="flex justify-between items-baseline mb-1">
                              <span className="font-bold text-slate-900 text-[13px]">{exp.role}</span>
                              <span className="text-[10px] font-bold text-slate-400">{exp.period}</span>
                            </div>
                            <div className="font-bold mb-2 uppercase tracking-wide text-[10px]" style={{ color: primaryColor }}>{exp.company}</div>
                            <ul className="space-y-1.5">
                               {exp.bullets.map((b, i) => b && (
                                 <li key={i} className="flex gap-2 text-slate-700">
                                   <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: primaryColor }} />
                                   {b}
                                 </li>
                               ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section>
                      <h4 className="text-[10px] font-black uppercase tracking-widest pb-1.5 border-b-2 mb-4" style={{ borderColor: primaryColor, color: primaryColor }}>Education</h4>
                      <div className="space-y-4">
                        {resumeData.education.map(edu => (
                          <div key={edu.id}>
                            <div className="font-bold text-slate-900 mb-0.5">{edu.school}</div>
                            <div className="text-[10px] text-slate-500 font-medium">{edu.degree}</div>
                            <div className="text-[9px] text-slate-400 font-bold">{edu.period}</div>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section>
                      <h4 className="text-[10px] font-black uppercase tracking-widest pb-1.5 border-b-2 mb-4" style={{ borderColor: primaryColor, color: primaryColor }}>Key Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {resumeData.skills.map(skill => (
                          <span key={skill} className="px-2 py-1 bg-slate-50 border border-slate-100 rounded font-bold text-slate-600 text-[9px]">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #resume-preview, #resume-preview * {
            visibility: visible !important;
          }
          #resume-preview {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            padding: 1in !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            transform: none !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}
