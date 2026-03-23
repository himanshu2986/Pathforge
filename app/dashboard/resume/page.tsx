'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  Github
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
    description: string
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

export default function ResumeBuilderPage() {
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
      experience: [...prev.experience, { id: Date.now().toString(), company: '', role: '', period: '', description: '' }]
    }))
  }

  const removeExperience = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
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

  // --- Render Helpers ---
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="space-y-4">
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
              <div>
                <label className="text-sm font-medium mb-1 block">Website / Portfolio</label>
                <input 
                  value={resumeData.personalInfo.website} 
                  onChange={e => updatePersonalInfo({ website: e.target.value })}
                  className="w-full bg-input border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/50 outline-none" 
                  placeholder="https://johndoe.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">GitHub Profile</label>
                <input 
                  value={resumeData.personalInfo.github} 
                  onChange={e => updatePersonalInfo({ github: e.target.value })}
                  className="w-full bg-input border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/50 outline-none" 
                  placeholder="https://github.com/johndoe"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Professional Summary</label>
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
            {resumeData.experience.map((exp, index) => (
              <GlassCard key={exp.id} className="relative transition-all hover:border-primary/30">
                <button 
                  onClick={() => removeExperience(exp.id)}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <GlassCardContent className="p-4 grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      placeholder="Company" 
                      value={exp.company}
                      onChange={e => {
                        const newExp = [...resumeData.experience]
                        newExp[index].company = e.target.value
                        setResumeData(prev => ({ ...prev, experience: newExp }))
                      }}
                      className="bg-transparent border-b border-border py-1 focus:border-primary outline-none"
                    />
                    <input 
                      placeholder="Role" 
                      value={exp.role}
                      onChange={e => {
                        const newExp = [...resumeData.experience]
                        newExp[index].role = e.target.value
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
                      newExp[index].period = e.target.value
                      setResumeData(prev => ({ ...prev, experience: newExp }))
                    }}
                    className="bg-transparent border-b border-border py-1 focus:border-primary outline-none"
                  />
                  <textarea 
                    placeholder="Description / Key achievements..." 
                    value={exp.description}
                    onChange={e => {
                      const newExp = [...resumeData.experience]
                      newExp[index].description = e.target.value
                      setResumeData(prev => ({ ...prev, experience: newExp }))
                    }}
                    rows={2}
                    className="bg-transparent border-b border-border py-1 focus:border-primary outline-none resize-none"
                  />
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
                    <div className="mt-2 flex flex-wrap gap-1">
                      {project.skills.slice(0, 3).map(skill => (
                        <span key={skill} className="text-[10px] px-1.5 py-0.5 rounded-full bg-border">{skill}</span>
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>
            {portfolioProjects.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No projects found. Add projects from your Portfolio first.
              </div>
            )}
          </div>
        )
      case 4:
        return (
          <div className="space-y-6">
            <h4 className="font-medium text-foreground">Skills</h4>
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
            <div className="pt-6 border-t border-border">
              <h4 className="font-medium text-foreground mb-4">Summary & Preview</h4>
              <p className="text-sm text-muted-foreground mb-6">
                You're all set! Review your resume in the preview panel and download as PDF whenever you're ready.
              </p>
              <div className="flex gap-4">
                <MagneticButton variant="primary" onClick={handlePrint}>
                  <Download className="w-4 h-4" /> Download PDF
                </MagneticButton>
                <MagneticButton variant="secondary" onClick={() => toast.success("Draft saved!")}>
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
          Resume <span className="gradient-text">Builder</span>
        </h1>
        <p className="text-muted-foreground">
          Create a professional resume tailored to your skills and projects.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Editor Side */}
        <div className="space-y-8">
          {/* Progress Tracker */}
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <div key={step.label} className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setActiveStep(index)}>
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                  activeStep === index ? "bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/20" : 
                  activeStep > index ? "bg-emerald-500 text-white" : "bg-input border border-border text-muted-foreground"
                )}>
                  {activeStep > index ? <CheckCircle2 className="w-6 h-6" /> : <step.icon className="w-5 h-5" />}
                </div>
                <span className={cn(
                  "text-[10px] font-medium transition-colors",
                  activeStep === index ? "text-primary" : "text-muted-foreground"
                )}>{step.label}</span>
              </div>
            ))}
          </div>

          <GlassCard delay={0.1}>
            <GlassCardHeader>
              <h3 className="text-lg font-semibold text-foreground">{steps[activeStep].label}</h3>
            </GlassCardHeader>
            <GlassCardContent className="p-6">
              {renderStepContent()}
              
              <div className="mt-8 flex justify-between pt-6 border-t border-border">
                <button 
                  onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
                  disabled={activeStep === 0}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-0 transition-all"
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
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Printer className="w-4 h-4" /> Live Preview
            </h3>
            <span className="text-xs text-muted-foreground px-2 py-1 rounded bg-input border border-border">A4 Format</span>
          </div>
          
          <div id="resume-preview" className="aspect-[1/1.41] bg-white text-slate-800 shadow-2xl rounded-2xl overflow-hidden p-[1.2in] transition-all transform hover:scale-[1.01] duration-500">
            {/* Template Header */}
            <div className="border-b-2 border-slate-900 pb-6 mb-6">
              <h2 className="text-4xl font-extrabold uppercase tracking-tight text-slate-900 mb-2">
                {resumeData.personalInfo.name || 'Your Name'}
              </h2>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-slate-600">
                {resumeData.personalInfo.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {resumeData.personalInfo.email}</span>}
                {resumeData.personalInfo.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {resumeData.personalInfo.phone}</span>}
                {resumeData.personalInfo.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {resumeData.personalInfo.location}</span>}
                {resumeData.personalInfo.website && <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {resumeData.personalInfo.website.replace('https://', '')}</span>}
              </div>
            </div>

            {/* Template Sections */}
            <div className="grid grid-cols-1 gap-6 text-[11px] leading-relaxed">
              {/* Summary */}
              {resumeData.personalInfo.summary && (
                <section>
                  <h4 className="text-sm font-bold uppercase border-b border-slate-200 pb-1 mb-2">Profile</h4>
                  <p className="text-slate-700">{resumeData.personalInfo.summary}</p>
                </section>
              )}

              {/* Experience */}
              {resumeData.experience.length > 0 && (
                <section>
                  <h4 className="text-sm font-bold uppercase border-b border-slate-200 pb-1 mb-2">Experience</h4>
                  <div className="space-y-3">
                    {resumeData.experience.map(exp => (
                      <div key={exp.id}>
                        <div className="flex justify-between items-baseline mb-0.5">
                          <span className="font-bold text-slate-800">{exp.role}</span>
                          <span className="text-[10px] font-semibold italic text-slate-500">{exp.period}</span>
                        </div>
                        <div className="text-slate-600 font-semibold mb-1">{exp.company}</div>
                        <p className="text-slate-700 whitespace-pre-wrap">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Projects */}
              {resumeData.projects.length > 0 && (
                <section>
                  <h4 className="text-sm font-bold uppercase border-b border-slate-200 pb-1 mb-2">Projects</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {resumeData.projects.map(proj => (
                      <div key={proj.id}>
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="font-bold text-slate-800">{proj.title}</span>
                          {proj.url && <span className="text-[9px] text-primary">View Project</span>}
                        </div>
                        <p className="text-slate-700 mb-1">{proj.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {proj.skills.map(s => <span key={s} className="bg-slate-100 px-1 py-0.5 rounded text-[9px] text-slate-600">#{s.toLowerCase()}</span>)}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Education */}
              {resumeData.education.length > 0 && (
                <section>
                  <h4 className="text-sm font-bold uppercase border-b border-slate-200 pb-1 mb-2">Education</h4>
                  <div className="space-y-2">
                    {resumeData.education.map(edu => (
                      <div key={edu.id} className="flex justify-between items-baseline">
                        <div>
                          <div className="font-bold text-slate-800">{edu.school}</div>
                          <div className="text-slate-600 italic">{edu.degree}</div>
                        </div>
                        <span className="text-[10px] font-semibold italic text-slate-500">{edu.period}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Skills */}
              {resumeData.skills.length > 0 && (
                <section>
                  <h4 className="text-sm font-bold uppercase border-b border-slate-200 pb-1 mb-2">Technical Skills</h4>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {resumeData.skills.map(skill => (
                      <span key={skill} className="flex items-center gap-1.5 font-medium text-slate-700">
                        <span className="w-1 h-1 rounded-full bg-slate-400" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer Instructions */}
      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>Tip: Use a modern browser and select "Save as PDF" in the print menu for the best results.</p>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #resume-preview, #resume-preview * {
            visibility: visible;
          }
          #resume-preview {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            padding: 1in !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            transform: none !important;
          }
          .lg\\:block {
            display: block !important;
          }
        }
      `}</style>
    </div>
  )
}
