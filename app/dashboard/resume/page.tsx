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
import { ResumeOptimizer } from '@/components/resume/resume-optimizer'

// --- Types ---
interface ResumeData {
  personalInfo: {
    name: string
    email: string
    phone: string
    location: string
    website: string
    github: string
    linkedin: string
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
  interests: string[]
  projects: {
    id: string
    title: string
    description: string
    skills: string[]
  }[]
  sections: {
    id: string
    title: string
    content: string
    visible: boolean
  }[]
}

type TemplateType = 'tech' | 'creative' | 'minimal' | 'executive' | 'cyber' | 'maverick' | 'sidebar-left' | 'sidebar-right' | 'swiss' | 'elegant' | 'professional'

export default function UltimateResumeStudioPage() {
  const { user } = useAuthStore()
  const { portfolioProjects, skills: dashboardSkills } = useDashboardStore()
  
  const [activeStep, setActiveStep] = useState(0)
  const steps = [
    { label: 'Template Gallery', icon: Grid },
    { label: 'Basic Info', icon: User },
    { label: 'Career History', icon: Briefcase },
    { label: 'Education', icon: GraduationCap },
    { label: 'Skills & Interests', icon: Code2 },
    { label: 'Projects', icon: Layout },
    { label: 'AI Mastery', icon: Sparkles },
    { label: 'Review & Design', icon: Palette },
  ]

  const [activeTemplate, setActiveTemplate] = useState<TemplateType>('professional')
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
      linkedin: '',
      summary: user?.bio || '',
      photo: user?.avatar || ''
    },
    experience: [],
    education: [],
    skills: [],
    interests: [],
    projects: [],
    sections: []
  })

  const [lineHeight, setLineHeight] = useState(1.5)
  const [marginSize, setMarginSize] = useState(2.5)
  const [isSaving, setIsSaving] = useState(false)

  // Cloud Persistence
  useEffect(() => {
    async function loadResume() {
      try {
        const res = await fetch('/api/dashboard/resume');
        if (res.ok) {
          const d = await res.json();
          if (d && d.data && Object.keys(d.data).length > 0) {
            setResumeData(p => ({ ...p, ...d.data }));
            if (d.settings) {
              setActiveTemplate(d.settings.template || 'professional');
              setPrimaryColor(d.settings.primaryColor || '#0ea5e9');
              setFontFamily(d.settings.fontFamily || 'sans');
              setLineHeight(d.settings.lineHeight || 1.5);
              setMarginSize(d.settings.marginSize || 2.5);
            }
          }
        }
      } catch (e) {
        console.error("Failed to load resume", e);
      }
    }
    loadResume();
  }, [])

  // Debounced Auto-Save
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (activeStep > 0) { // Don't save empty init state
        setIsSaving(true);
        try {
          await fetch('/api/dashboard/resume', {
            method: 'POST',
            body: JSON.stringify({
              data: resumeData,
              settings: {
                template: activeTemplate,
                primaryColor,
                fontFamily,
                lineHeight,
                marginSize
              }
            })
          });
        } catch (e) {
          console.error("Auto-save failed", e);
        } finally {
          setIsSaving(false);
        }
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [resumeData, activeTemplate, primaryColor, fontFamily, lineHeight, marginSize])

  // Strength Score Logic
  const resumeStrength = useMemo(() => {
    let score = 0;
    const { personalInfo, experience, education, skills, projects } = resumeData;
    
    if (personalInfo.name) score += 10;
    if (personalInfo.email && personalInfo.phone) score += 10;
    if (personalInfo.summary.length > 50) score += 10;
    if (personalInfo.photo) score += 5;
    
    // Experience weighting
    if (experience.length > 0) score += 15;
    if (experience.length > 1) score += 5;
    experience.forEach(e => { if (e.bullets.filter(b => b.length > 20).length >= 1) score += 5; });
    
    if (education.length > 0) score += 10;
    if (skills.length >= 5) score += 10;
    if (projects.length >= 2) score += 15;
    if (resumeData.interests.length > 0) score += 5;
    
    return Math.min(100, score);
  }, [resumeData])

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
  const handleAIImproveSummary = () => {
    toast.promise(new Promise(resolve => setTimeout(resolve, 2000)), {
      loading: 'Analyzing your profile...',
      success: () => {
        setResumeData(p => ({ ...p, personalInfo: { ...p.personalInfo, summary: `Highly accomplished ${p.experience[0]?.role || 'Professional'} with ${p.experience.length * 3}+ years of experience driving excellence at ${p.experience[0]?.company || 'leading firms'}. Expert in ${p.skills.slice(0, 3).map(s => s.name).join(', ')}.` } }))
        return 'AI Optimization Complete!'
      },
      error: 'AI Node Offline'
    })
  }

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
        {id === 'professional' && (
          <div className="h-full bg-white p-2 flex flex-col gap-2">
             <div className="flex justify-between items-start">
                <div className="space-y-1">
                   <div className="h-3 w-16 bg-blue-600" />
                   <div className="h-2 w-24 bg-slate-900" />
                   <div className="h-1 w-12 bg-slate-400" />
                </div>
                <div className="space-y-0.5">
                   <div className="h-1 w-16 bg-slate-300" />
                   <div className="h-1 w-16 bg-slate-300" />
                </div>
             </div>
             <div className="h-[1px] bg-slate-200 w-full my-1" />
             <div className="space-y-2">
                <div className="h-1.5 w-20 bg-blue-600/50" />
                <div className="space-y-1">
                   <div className="h-1 w-full bg-slate-100" />
                   <div className="h-1 w-5/6 bg-slate-100" />
                </div>
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
          <div className="space-y-8">
             <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'professional', name: 'Elite Professional', desc: 'Classic Corporate', icon: FileText },
                  { id: 'tech', name: 'Software Engineer', desc: 'Modern Tech Header', icon: Cpu },
                  { id: 'creative', name: 'Artisan / Designer', desc: 'Bold Layout', icon: PenTool },
                  { id: 'minimal', name: 'Minimalist', desc: 'Clean White Space', icon: Layers },
                  { id: 'elegant', name: 'Heritage', desc: 'Serif / Traditional', icon: BookOpen },
                ].map(t => (
                  <button 
                    key={t.id} 
                    onClick={() => setActiveTemplate(t.id as TemplateType)}
                    className={cn(
                      "p-5 rounded-2xl border-2 text-left transition-all flex items-start gap-4 hover:border-pink-500/50",
                      activeTemplate === t.id ? "bg-pink-50 border-pink-600 shadow-md" : "bg-slate-50 border-slate-100"
                    )}
                  >
                     <div className={cn("p-3 rounded-xl", activeTemplate === t.id ? "bg-pink-600 text-white" : "bg-white text-slate-400")}>
                        <t.icon className="w-6 h-6" />
                     </div>
                     <div>
                        <h4 className="text-xs font-black uppercase text-slate-900">{t.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">{t.desc}</p>
                     </div>
                  </button>
                ))}
             </div>
             <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-600/20 blur-3xl rounded-full" />
                <h4 className="text-xl font-black mb-2">Personalize Your Brand</h4>
                <p className="text-sm text-slate-400 mb-6">Select your signature accent color to stand out.</p>
                <div className="flex gap-3">
                   {['#0ea5e9', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#1e293b'].map(c => (
                     <button key={c} onClick={() => setPrimaryColor(c)} className={cn("w-10 h-10 rounded-full border-2 transition-all", primaryColor === c ? "border-white scale-110 shadow-lg" : "border-transparent text-white/20")} style={{ backgroundColor: c }} />
                   ))}
                </div>
             </div>
          </div>
        )
      case 1:
        return (
          <div className="space-y-12">
            <div className="grid grid-cols-2 gap-8 items-start">
               {/* Photo Upload */}
               <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile Picture</label>
                  <div className="w-full aspect-square max-w-[200px] rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:border-pink-500/50 transition-all">
                      {resumeData.personalInfo.photo ? (
                        <img src={resumeData.personalInfo.photo} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center p-6"><Camera className="w-10 h-10 text-slate-300 mx-auto mb-2" /><p className="text-[9px] font-black text-slate-300 uppercase">Drop headshot here</p></div>
                      )}
                      <input type="file" onChange={handlePhotoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
               </div>

               {/* Name & Title */}
               <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Identity</label>
                    <input 
                      value={resumeData.personalInfo.name} 
                      onChange={e => setResumeData(p => ({ ...p, personalInfo: { ...p.personalInfo, name: e.target.value } }))}
                      className="w-full bg-slate-50 rounded-2xl p-6 text-xl font-black text-slate-900 outline-none focus:ring-4 ring-pink-500/10 border-2 border-transparent focus:border-pink-500 transition-all" 
                      placeholder="e.g. Johnathan Doe"
                    />
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-8 border-t border-slate-50">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Email</label>
                  <input value={resumeData.personalInfo.email} onChange={e => setResumeData(p => ({ ...p, personalInfo: { ...p.personalInfo, email: e.target.value } }))} className="w-full bg-slate-50 rounded-xl p-4 text-sm font-bold outline-none focus:bg-white border-2 border-slate-50 focus:border-slate-900 transition-all" placeholder="hello@company.com" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Pulse</label>
                  <input value={resumeData.personalInfo.phone} onChange={e => setResumeData(p => ({ ...p, personalInfo: { ...p.personalInfo, phone: e.target.value } }))} className="w-full bg-slate-50 rounded-xl p-4 text-sm font-bold outline-none focus:bg-white border-2 border-slate-50 focus:border-slate-900 transition-all" placeholder="+1 (555) 000-0000" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">LinkedIn Node</label>
                  <input value={resumeData.personalInfo.linkedin} onChange={e => setResumeData(p => ({ ...p, personalInfo: { ...p.personalInfo, linkedin: e.target.value } }))} className="w-full bg-slate-50 rounded-xl p-4 text-sm font-bold outline-none focus:bg-white border-2 border-slate-50 focus:border-slate-900 transition-all" placeholder="linkedin.com/in/user" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deployment City</label>
                  <input value={resumeData.personalInfo.location} onChange={e => setResumeData(p => ({ ...p, personalInfo: { ...p.personalInfo, location: e.target.value } }))} className="w-full bg-slate-50 rounded-xl p-4 text-sm font-bold outline-none focus:bg-white border-2 border-slate-50 focus:border-slate-900 transition-all" placeholder="New York, SF, Remote" />
               </div>
            </div>

             <div className="space-y-4 pt-8 border-t border-slate-50">
                <div className="flex justify-between items-center">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mission Summary (Bio)</label>
                   <button onClick={handleAIImproveSummary} className="px-4 py-2 bg-pink-100 text-pink-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-pink-100 transition-all">
                      <Sparkles className="w-4 h-4" /> Improve with AI
                   </button>
                </div>
                <textarea 
                 value={resumeData.personalInfo.summary} 
                onChange={e => setResumeData(p => ({ ...p, personalInfo: { ...p.personalInfo, summary: e.target.value } }))}
                className="w-full bg-slate-50 rounded-3xl p-8 text-sm outline-none resize-none h-48 focus:bg-white border-2 border-slate-50 focus:border-slate-900 transition-all font-medium leading-relaxed"
                placeholder="Briefly describe your expertise and why you're a force to be reckoned with..."
              />
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-8">
             <div className="flex justify-between items-center">
                <h4 className="font-black text-xl text-slate-900">Work Experience</h4>
                <button onClick={() => setResumeData(p => ({ ...p, experience: [...p.experience, { id: Date.now().toString(), company: '', role: '', period: '', bullets: [''] }] }))} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all">
                  <Plus className="w-4 h-4" /> Add Experience
                </button>
             </div>
             
             <div className="space-y-6">
                {resumeData.experience.map((exp, i) => (
                  <div key={exp.id} className="p-8 rounded-3xl bg-slate-50 border-2 border-slate-100 relative group transition-all hover:border-slate-200">
                     <button onClick={() => setResumeData(p => ({ ...p, experience: p.experience.filter(e => e.id !== exp.id) }))} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                     
                     <div className="grid grid-cols-2 gap-8 mb-8">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Company / Organization</label>
                           <input value={exp.company} onChange={e => { const n = [...resumeData.experience]; n[i].company = e.target.value; setResumeData(p => ({ ...p, experience: n })) }} className="w-full bg-white rounded-xl p-4 text-sm font-bold border-2 border-transparent focus:border-slate-900 outline-none transition-all" placeholder="e.g. Google, Inc." />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Job Title / Role</label>
                           <input value={exp.role} onChange={e => { const n = [...resumeData.experience]; n[i].role = e.target.value; setResumeData(p => ({ ...p, experience: n })) }} className="w-full bg-white rounded-xl p-4 text-sm font-bold border-2 border-transparent focus:border-slate-900 outline-none transition-all" placeholder="e.g. Senior Software Architect" />
                        </div>
                     </div>

                     <div className="mb-8 space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Timeline</label>
                        <input value={exp.period} onChange={e => { const n = [...resumeData.experience]; n[i].period = e.target.value; setResumeData(p => ({ ...p, experience: n })) }} className="w-full bg-white rounded-xl p-4 text-[10px] font-black uppercase tracking-widest border-2 border-transparent focus:border-slate-900 outline-none transition-all" placeholder="e.g. JAN 2020 - PRESENT" />
                     </div>

                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Key Missions & Results</label>
                           <button onClick={() => { const n = [...resumeData.experience]; n[i].bullets.push(''); setResumeData(p => ({ ...p, experience: n })) }} className="text-[10px] font-black text-pink-600 hover:underline">+ New Result</button>
                        </div>
                        <div className="space-y-3">
                           {exp.bullets.map((bullet, bi) => (
                             <div key={bi} className="flex gap-3 items-center group/bullet">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                <input value={bullet} onChange={e => { const n = [...resumeData.experience]; n[i].bullets[bi] = e.target.value; setResumeData(p => ({ ...p, experience: n })) }} className="flex-1 bg-white rounded-xl p-4 text-xs font-medium border-2 border-transparent focus:border-slate-900 outline-none transition-all" placeholder="Briefly describe a major win or responsibility..." />
                                <button onClick={() => { const n = [...resumeData.experience]; n[i].bullets = n[i].bullets.filter((_, idx) => idx !== bi); setResumeData(p => ({ ...p, experience: n })) }} className="opacity-0 group-hover/bullet:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>
                ))}
             </div>
             
             {resumeData.experience.length === 0 && (
               <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                  <Briefcase className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No history added yet. Click &apos;Add Experience&apos; to begin.</p>
               </div>
             )}
          </div>
        )
      case 3:
        return (
          <div className="space-y-8">
             <div className="flex justify-between items-center"><h4 className="font-black text-xl text-slate-900">Education History</h4><button onClick={() => setResumeData(p => ({ ...p, education: [...p.education, { id: Date.now().toString(), school: '', degree: '', period: '' }] }))} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all"><Plus className="w-4 h-4" /> Add Education</button></div>
             <div className="space-y-6">
                {resumeData.education.map((edu, i) => (
                  <div key={edu.id} className="p-8 rounded-3xl bg-slate-50 border-2 border-slate-100 relative group transition-all hover:border-slate-200">
                     <button onClick={() => setResumeData(p => ({ ...p, education: p.education.filter(e => e.id !== edu.id) }))} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                     <div className="grid grid-cols-2 gap-8 mb-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Institution</label>
                           <input value={edu.school} onChange={e => { const n = [...resumeData.education]; n[i].school = e.target.value; setResumeData(p => ({ ...p, education: n })) }} className="w-full bg-white rounded-xl p-4 text-sm font-bold border-2 border-transparent focus:border-slate-900 outline-none transition-all" placeholder="University of Future Science" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Degree / Field</label>
                           <input value={edu.degree} onChange={e => { const n = [...resumeData.education]; n[i].degree = e.target.value; setResumeData(p => ({ ...p, education: n })) }} className="w-full bg-white rounded-xl p-4 text-sm font-bold border-2 border-transparent focus:border-slate-900 outline-none transition-all" placeholder="B.S. Software Engineering" />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Timeline</label>
                        <input value={edu.period} onChange={e => { const n = [...resumeData.education]; n[i].period = e.target.value; setResumeData(p => ({ ...p, education: n })) }} placeholder="e.g. AUG 2016 - MAY 2020" className="w-full bg-white rounded-xl p-4 text-[10px] font-black uppercase tracking-widest border-2 border-transparent focus:border-slate-900 outline-none transition-all" />
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-12">
            <section>
              <h4 className="font-black text-xl text-slate-900 mb-6">Mastery & Tech Stack</h4>
              <div className="flex flex-wrap gap-3">
                 {dashboardSkills.map(s => {
                   const isSel = resumeData.skills.find(rs => rs.name === s.name)
                   return (
                     <button key={s.id} onClick={() => setResumeData(prev => ({ ...prev, skills: isSel ? prev.skills.filter(rs => rs.name !== s.name) : [...prev.skills, { name: s.name, level: s.level }] }))}
                     className={cn("px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] border-2 transition-all", isSel ? "bg-pink-600 text-white border-pink-600 shadow-xl shadow-pink-600/20" : "bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-300")}>
                        {s.name}
                     </button>
                   )
                 })}
              </div>
            </section>
            
            <section className="pt-8 border-t border-slate-50">
              <h4 className="font-black text-xl text-slate-900 mb-6">Personal Interests</h4>
              <div className="space-y-6">
                 <div className="relative">
                    <input 
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          const val = (e.target as HTMLInputElement).value
                          if (val && !resumeData.interests.includes(val)) {
                            setResumeData(p => ({ ...p, interests: [...p.interests, val] }))
                            ;(e.target as HTMLInputElement).value = ''
                          }
                        }
                      }}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:bg-white focus:border-slate-900 transition-all" 
                      placeholder="Type an interest (e.g. Open Source, Hiking) and press Enter..." 
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-slate-200 rounded-lg text-[8px] font-black text-slate-500 uppercase tracking-widest">Enter</div>
                 </div>
                 <div className="flex flex-wrap gap-2">
                    {resumeData.interests.map(interest => (
                      <div key={interest} className="px-5 py-2 bg-slate-100 rounded-xl text-[10px] font-black uppercase text-slate-900 flex items-center gap-3">
                        {interest}
                        <button onClick={() => setResumeData(p => ({ ...p, interests: p.interests.filter(i => i !== interest) }))} className="text-slate-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                 </div>
              </div>
            </section>
          </div>
        )
      case 5:
        return (
          <div className="space-y-8">
             <div className="flex flex-col gap-2 mb-8">
                <h4 className="font-black text-xl text-slate-900">Portfolio Highlights</h4>
                <p className="text-xs text-slate-400 font-medium">Select up to 3 projects to showcase on your professional resume.</p>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                {portfolioProjects.map(p => {
                  const isSel = resumeData.projects.find(rp => rp.id === p.id)
                  return (
                    <button key={p.id} onClick={() => setResumeData(prev => ({ ...prev, projects: isSel ? prev.projects.filter(rp => rp.id !== p.id) : [...prev.projects, p] }))} 
                    className={cn("p-6 rounded-2xl border-2 text-left transition-all relative group", isSel ? "border-pink-600 bg-pink-50 shadow-md" : "bg-slate-50 border-slate-100 hover:border-slate-300")}>
                       <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all", isSel ? "bg-pink-600 text-white" : "bg-white text-slate-400 shadow-sm")}>
                          {isSel ? <CheckCircle2 className="w-5 h-5" /> : <Layout className="w-5 h-5" />}
                       </div>
                       <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-1 truncate pr-4">{p.title}</h5>
                       <p className="text-[9px] text-slate-400 font-medium line-clamp-2">{p.description}</p>
                    </button>
                  )
                })}
             </div>
             
             {portfolioProjects.length === 0 && (
                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                   <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No dashboard projects found. Sync your portfolio first.</p>
                </div>
             )}
          </div>
        )
      case 6:
        return (
          <div className="space-y-12">
             <div className="flex flex-col gap-2 mb-8">
                <h4 className="font-black text-xl text-slate-900">AI Section Mastery</h4>
                <p className="text-xs text-slate-400 font-medium">Add unique sections (Certificats, Awards, Languages) to stand out.</p>
             </div>
             
             <div className="space-y-6">
                {(resumeData.sections || []).map((section, si) => (
                  <div key={section.id} className="p-8 rounded-3xl bg-slate-50 border-2 border-slate-100 relative group transition-all">
                     <button onClick={() => setResumeData(p => ({ ...p, sections: p.sections.filter(s => s.id !== section.id) }))} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                     <div className="space-y-6">
                        <input value={section.title} onChange={e => { const n = [...resumeData.sections]; n[si].title = e.target.value; setResumeData(p => ({ ...p, sections: n })) }} className="text-2xl font-black bg-transparent border-none outline-none text-slate-900 p-0 w-full" placeholder="Section Title (e.g. Certifications)" />
                        <textarea value={section.content} onChange={e => { const n = [...resumeData.sections]; n[si].content = e.target.value; setResumeData(p => ({ ...p, sections: n })) }} className="w-full bg-white rounded-xl p-4 text-sm font-medium border-2 border-transparent focus:border-slate-900 outline-none transition-all h-32" placeholder="List your achievements here..." />
                     </div>
                  </div>
                ))}
                
                <button onClick={() => setResumeData(p => ({ ...p, sections: [...(p.sections || []), { id: Date.now().toString(), title: '', content: '', visible: true }] }))} className="w-full py-8 border-2 border-dashed border-slate-100 rounded-3xl text-sm font-black text-slate-300 uppercase tracking-widest hover:border-slate-200 hover:text-slate-400 transition-all flex flex-col items-center gap-3">
                   <Plus className="w-6 h-6" /> Add Custom Section
                </button>
             </div>
          </div>
        )
      case 7:
        return (
          <div className="space-y-10 h-full flex flex-col items-center justify-center py-10 bg-slate-50 rounded-[4rem] border-4 border-white shadow-2xl">
             <div className="relative">
                <div className="w-32 h-32 bg-pink-100 rounded-full flex items-center justify-center animate-bounce shadow-inner"><Zap className="w-16 h-16 text-pink-600" /></div>
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl border-4 border-white"><CheckCircle2 className="w-6 h-6 text-white" /></div>
             </div>
             <div className="text-center space-y-4 max-w-md">
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Your Masterpiece is Ready</h3>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest px-10">Your professional identity has been refined and synthesized. Ready for deployment.</p>
             </div>
             
             <div className="w-full max-w-sm mt-12 bg-white p-8 rounded-4xl shadow-xl space-y-8">
                <div className="space-y-6">
                   <div className="space-y-3">
                      <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-400"><span>Line Density</span><span>{lineHeight}x</span></div>
                      <input type="range" min="1" max="2" step="0.1" value={lineHeight} onChange={e => setLineHeight(parseFloat(e.target.value))} className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-pink-600" />
                   </div>
                   <div className="space-y-3">
                      <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-400"><span>Content Breathing</span><span>{marginSize}rem</span></div>
                      <input type="range" min="1" max="4" step="0.5" value={marginSize} onChange={e => setMarginSize(parseFloat(e.target.value))} className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-pink-600" />
                   </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-50">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-center">Brand Accent Color</label>
                   <div className="flex justify-center flex-wrap gap-3">
                      {['#0ea5e9', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#1e293b'].map(c => (
                        <button key={c} onClick={() => setPrimaryColor(c)} className={cn("w-8 h-8 rounded-full border-4 transition-all hover:scale-110 shadow-lg", primaryColor === c ? "border-slate-900 ring-4 ring-slate-100" : "border-transparent")} style={{ backgroundColor: c }} />
                      ))}
                   </div>
                </div>

                <button onClick={() => window.print()} className="w-full py-6 bg-pink-600 text-white rounded-[2rem] text-xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-pink-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4">
                   <Download className="w-7 h-7" /> Export PDF
                </button>
             </div>
          </div>
        )
      default: return null
    }
  }

  return (
       <div className="fixed inset-0 flex bg-[#f8fafc] text-slate-900 overflow-hidden font-sans">
          
          {/* UI Styles */}
          <style jsx global>{`
             .custom-scrollbar::-webkit-scrollbar { width: 6px; }
             .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
             .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 20px; }
             .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); }
             
             @media print {
               @page { size: A4; margin: 0; }
               body * { visibility: hidden !important; }
               #resume-preview, #resume-preview * { visibility: visible !important; }
               #resume-preview { 
                 position: fixed !important; 
                 left: 0 !important; 
                 top: 0 !important; 
                 width: 210mm !important; 
                 height: 297mm !important; 
                 box-shadow: none !important; 
                 border-radius: 0 !important; 
                 margin: 0 !important; 
                 z-index: 9999 !important; 
                 transform: scale(1) !important;
                 overflow: visible !important;
               }
             }
          `}</style>
       
          {/* Left Sidebar Navigation */}
           <aside className="fixed left-0 top-0 bottom-0 w-[300px] bg-[#002d5b] text-white flex flex-col pt-12 pb-8 px-8 shrink-0 z-50 overflow-y-auto">
             <div className="flex items-center gap-4 mb-14 px-2">
                <div className="w-10 h-10 bg-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-900/40"><Zap className="w-6 h-6 text-white" /></div>
                <h1 className="text-xl font-black tracking-tight">Pathforge Studio</h1>
             </div>

             <nav className="flex-1 space-y-2 relative">
                {steps.map((s, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveStep(idx)} 
                    className={cn(
                      "w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all relative group",
                      activeStep === idx ? "bg-white/10 text-white shadow-inner" : "text-white/40 hover:text-white hover:bg-white/5"
                    )}
                  >
                     {/* Connector Line */}
                     {idx < steps.length - 1 && (
                       <div className="absolute left-7 top-10 w-[2px] h-10 bg-white/10" />
                     )}

                     <div className={cn(
                       "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all shrink-0",
                       activeStep === idx ? "bg-pink-600 border-pink-600 text-white scale-110 shadow-[0_0_15px_rgba(236,72,153,0.4)]" : activeStep > idx ? "bg-emerald-500 border-emerald-500 text-white" : "border-white/20 bg-transparent text-white/40"
                     )}>
                        {activeStep > idx ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                     </div>
                     <span className={cn("text-xs font-bold tracking-wide transition-all", activeStep === idx ? "translate-x-1" : "")}>{s.label}</span>
                  </button>
                ))}
             </nav>

             {/* Progress Bar / Completeness */}
             <div className="mt-12 pt-8 border-t border-white/10">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-pink-500">{resumeStrength}%</span>
                 </div>
                 <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${resumeStrength}%` }} className="h-full bg-pink-600 shadow-[0_0_10px_rgba(236,72,153,0.6)]" />
                 </div>
             </div>

             <div className="mt-auto pt-8 flex flex-col gap-4 text-[10px] font-bold text-white/20 uppercase tracking-widest px-2">
                <a href="#" className="hover:text-white/40 transition-colors">Terms of Use</a>
                <a href="#" className="hover:text-white/40 transition-colors">Privacy Policy</a>
                <p className="mt-4">© 2026 PATHFORGE v2.0</p>
             </div>
          </aside>

          {/* Main Content Area */}
           <div className="flex-1 flex flex-row relative h-full ml-[300px]">
              
              {/* Dynamic Form Area (Left) */}
              <main className="flex-1 overflow-y-auto custom-scrollbar p-12 lg:p-20 bg-white min-w-0">
                 <div className="max-w-3xl mx-auto h-full flex flex-col">
                    <header className="mb-10">
                       <button onClick={() => setActiveStep(p => Math.max(0, p - 1))} className={cn("text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all flex items-center gap-2 mb-4", activeStep === 0 && "opacity-0 pointer-events-none")}>
                         <ChevronLeft className="w-4 h-4" /> Go Back
                       </button>
                       <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-4">{steps[activeStep].label}</h2>
                       <div className="h-1 w-20 bg-pink-600 rounded-full" />
                    </header>

                   <div className="flex-1">
                      <AnimatePresence mode="wait">
                         <motion.div key={activeStep} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}>
                            {renderStepContent()}
                         </motion.div>
                      </AnimatePresence>
                   </div>

                   <footer className="mt-12 py-10 border-t border-slate-100 flex justify-between items-center bg-white sticky bottom-0 z-20">
                      <div className="flex gap-4">
                         <button onClick={() => window.print()} className="px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all flex items-center gap-2">
                            <Download className="w-4 h-4" /> Download PDF
                         </button>
                         <button className="px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all">
                            Preview Only
                         </button>
                      </div>
                      
                      {activeStep < steps.length - 1 && (
                        <button 
                          onClick={() => setActiveStep(p => p + 1)} 
                          className="px-12 py-5 bg-pink-600 text-white text-[12px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-pink-600/20 hover:scale-105 hover:shadow-pink-600/40 active:scale-95 transition-all flex items-center gap-3"
                        >
                           Next: {steps[activeStep + 1].label} <ChevronRight className="w-5 h-5" />
                        </button>
                      )}
                      {activeStep === steps.length - 1 && (
                        <button 
                          onClick={() => toast.success("RESUME FINALIZED & SYNCED!")}
                          className="px-12 py-5 bg-indigo-600 text-white text-[12px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-600/20 hover:scale-105 transition-all flex items-center gap-3"
                        >
                           Finalize Resume <CheckCircle2 className="w-5 h-5" />
                        </button>
                      )}
                   </footer>
                </div>
             </main>

             {/* Small Sticky Preview (Right) */}
              <div className="w-[450px] border-l border-slate-100 bg-[#f1f5f9] flex shrink-0 relative overflow-hidden hidden xl:flex flex-col">
                 <div className="p-6 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-20">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Palette className="w-4 h-4" /> Preview Matrix</h3>
                   <div className="flex gap-1">
                      {['sans', 'serif', 'mono'].map(f => <button key={f} onClick={() => setFontFamily(f)} className={cn("w-12 py-1.5 rounded-md text-[8px] font-black border transition-all", fontFamily === f ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 text-slate-400")}>{f.toUpperCase()}</button>)}
                   </div>
                </div>
                
                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                   <div className="scale-[0.85] origin-top bg-white shadow-2xl rounded-sm">
                       <div className={cn("w-full bg-white text-slate-900 rounded-sm overflow-hidden p-0 relative group", fontFamily === 'serif' ? 'font-serif' : fontFamily === 'mono' ? 'font-mono' : 'font-sans')} style={{ lineHeight }}>
                          <div id="resume-preview" className="w-full" style={{ padding: `${marginSize}rem` }}>
                            {/* PROFESSIONAL TEMPLATE PREVIEW */}
                            {activeTemplate === 'professional' && (
                              <div className="bg-white text-slate-900 p-12 text-[10px]">
                                 <div className="flex justify-between items-start mb-8">
                                    <div className="space-y-1">
                                       <h1 className="text-3xl font-black tracking-tighter" style={{ color: primaryColor }}>{resumeData.personalInfo.name || 'Your Name'}</h1>
                                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{resumeData.experience[0]?.role || 'Professional Title'}</p>
                                    </div>
                                    <div className="text-right text-[7px] space-y-0.5 text-slate-400 font-bold uppercase tracking-[0.1em]">
                                       <div>{resumeData.personalInfo.email}</div>
                                       <div>{resumeData.personalInfo.phone}</div>
                                       <div>{resumeData.personalInfo.location}</div>
                                    </div>
                                 </div>
                                 <div className="space-y-8">
                                    {resumeData.personalInfo.summary && (
                                      <section>
                                         <h4 className="text-[7px] font-black uppercase tracking-[0.3em] mb-3 border-b-2 pb-1" style={{ color: primaryColor, borderColor: primaryColor }}>Personal Mission</h4>
                                         <p className="text-[9px] text-slate-600 leading-relaxed font-medium">{resumeData.personalInfo.summary}</p>
                                      </section>
                                    )}
                                    {resumeData.experience.length > 0 && (
                                      <section>
                                         <h4 className="text-[7px] font-black uppercase tracking-[0.3em] mb-4 border-b-2 pb-1" style={{ color: primaryColor, borderColor: primaryColor }}>Career History</h4>
                                         <div className="space-y-6">
                                            {resumeData.experience.map(e => <div key={e.id} className="space-y-2"><div className="flex justify-between font-black text-[9px]"><span>{e.company}</span><span className="text-slate-300">{e.period}</span></div><div className="text-slate-500 font-bold italic text-[8px]">{e.role}</div><ul className="space-y-1.5">{e.bullets.map((b, i) => b && <li key={i} className="flex gap-2 text-[8px] text-slate-600 leading-snug"><span className="mt-1 w-1 h-1 rounded-full bg-slate-300 shrink-0" />{b}</li>)}</ul></div>)}
                                         </div>
                                      </section>
                                    )}
                                    {resumeData.education.length > 0 && (
                                      <section>
                                         <h4 className="text-[7px] font-black uppercase tracking-[0.3em] mb-4 border-b-2 pb-1" style={{ color: primaryColor, borderColor: primaryColor }}>Education</h4>
                                         <div className="space-y-4">
                                            {resumeData.education.map(edu => <div key={edu.id} className="flex justify-between items-baseline"><div className="space-y-0.5"><div className="text-[9px] font-black text-slate-900">{edu.degree}</div><div className="text-[8px] font-bold text-slate-400">{edu.school}</div></div><span className="text-[7px] font-black uppercase text-slate-300">{edu.period}</span></div>)}
                                         </div>
                                      </section>
                                    )}
                                    {(resumeData.sections || []).filter(s => s.visible).map(s => (
                                       <section key={s.id}>
                                          <h4 className="text-[7px] font-black uppercase tracking-[0.3em] mb-4 border-b-2 pb-1" style={{ color: primaryColor, borderColor: primaryColor }}>{s.title}</h4>
                                          <p className="text-[9px] text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">{s.content}</p>
                                       </section>
                                    ))}
                                 </div>
                              </div>
                            )}

                            {/* TECH / CYBER VARIANT PREVIEWS */}
                            {activeTemplate !== 'professional' && (
                              <div className={cn("min-h-full p-12 flex flex-col transition-all", activeTemplate === 'tech' ? "bg-slate-900 text-white" : activeTemplate === 'cyber' ? "bg-black text-pink-500 font-mono border-4 border-pink-500/20" : "bg-white text-slate-900")}>
                                 <div className="w-full aspect-square max-w-[80px] rounded-2xl bg-slate-100 flex items-center justify-center mb-6 overflow-hidden">
                                    {resumeData.personalInfo.photo ? <img src={resumeData.personalInfo.photo} className="w-full h-full object-cover" /> : <User className="w-8 h-8 text-slate-300" />}
                                 </div>
                                 <h2 className="text-3xl font-black uppercase tracking-tighter mb-2" style={{ color: activeTemplate === 'cyber' ? primaryColor : 'inherit' }}>{resumeData.personalInfo.name}</h2>
                                 <p className={cn("text-xs font-bold uppercase tracking-widest mb-8", activeTemplate === 'tech' ? "text-primary" : "text-slate-400")}>{resumeData.experience[0]?.role || 'Professional Identity'}</p>
                                 <div className="space-y-8">
                                    <section>
                                       <h4 className="text-[8px] font-black uppercase tracking-widest mb-3 opacity-50">Overview</h4>
                                       <p className="text-[10px] leading-relaxed opacity-70">{resumeData.personalInfo.summary}</p>
                                    </section>
                                    <section>
                                       <h4 className="text-[8px] font-black uppercase tracking-widest mb-4 opacity-50">Core Arsenal</h4>
                                       <div className="flex flex-wrap gap-2">
                                          {resumeData.skills.slice(0, 8).map(s => <span key={s.name} className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-[7px] font-black uppercase">{s.name}</span>)}
                                       </div>
                                    </section>
                                 </div>
                                 <div className="mt-auto pt-10 text-center">
                                    <span className="px-5 py-2 bg-pink-600/10 text-pink-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-pink-600/20">{activeTemplate} engine</span>
                                 </div>
                              </div>
                            )}
                         </div>
                      </div>
                   </div>
                </div>

                {/* Floating Action Button for Mobile Preview */}
             </div>
           </div>
           
           <ResumeOptimizer data={resumeData} />
        </div>
   )
}
