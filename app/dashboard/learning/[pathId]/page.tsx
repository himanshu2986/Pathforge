'use client'

import { useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, 
  CheckCircle2, 
  Circle, 
  BookOpen, 
  Play, 
  FileText, 
  MessageSquare,
  Award,
  ArrowRight
} from 'lucide-react'
import { GlassCard, GlassCardContent, GlassCardHeader } from '@/components/ui/glass-card'
import { useDashboardStore } from '@/lib/store'
import { Progress } from '@/components/ui/progress'
import { MagneticButton } from '@/components/ui/magnetic-button'

export default function PathDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { learningPaths, toggleLearningModule } = useDashboardStore()
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)

  const path = useMemo(() => {
    return learningPaths.find(p => p.id === params.pathId)
  }, [learningPaths, params.pathId])

  const selectedModule = useMemo(() => {
    if (!path || !selectedModuleId) return null
    return path.modules.find(m => m.id === selectedModuleId)
  }, [path, selectedModuleId])

  if (!path) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">Path Not Found</h2>
        <MagneticButton onClick={() => router.back()}>Go Back</MagneticButton>
      </div>
    )
  }

  // Set first module as selected by default
  if (!selectedModuleId && path.modules.length > 0) {
    setSelectedModuleId(path.modules[0].id)
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Navigation */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Sidebar: Path Structure */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard delay={0.1} glow="primary">
            <GlassCardContent className="p-6">
              <div className="mb-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-xl font-bold text-foreground mb-2">{path.title}</h1>
                <p className="text-xs text-muted-foreground leading-relaxed">{path.description}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground font-medium">Overall Progress</span>
                  <span className="text-primary font-bold">{path.progress}%</span>
                </div>
                <Progress value={path.progress} className="h-2" />
              </div>
            </GlassCardContent>
          </GlassCard>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-2 mb-4">Course Modules</h3>
            {path.modules.map((module, i) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
              >
                <button
                  onClick={() => setSelectedModuleId(module.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all border ${
                    selectedModuleId === module.id 
                      ? 'bg-primary/10 border-primary/50 text-white' 
                      : 'bg-muted/10 border-border/50 text-muted-foreground hover:bg-muted/20'
                  }`}
                >
                  {module.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className={`w-5 h-5 shrink-0 ${selectedModuleId === module.id ? 'text-primary' : 'text-muted-foreground/30'}`} />
                  )}
                  <span className="text-sm font-medium text-left line-clamp-1">{module.title}</span>
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Main Content: Lesson Viewer */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedModule ? (
              <motion.div
                key={selectedModule.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <GlassCard delay={0}>
                  <GlassCardHeader className="border-b border-border/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">Current Module</p>
                        <h2 className="text-2xl font-bold text-foreground">{selectedModule.title}</h2>
                      </div>
                      <MagneticButton 
                        variant={selectedModule.completed ? 'ghost' : 'primary'}
                        onClick={() => toggleLearningModule(path.id, selectedModule.id)}
                        className={selectedModule.completed ? 'text-emerald-500 hover:bg-emerald-500/10' : ''}
                      >
                        {selectedModule.completed ? (
                          <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Completed</span>
                        ) : (
                          'Mark as Done'
                        )}
                      </MagneticButton>
                    </div>
                  </GlassCardHeader>
                  <GlassCardContent className="p-8">
                    <div className="prose prose-invert max-w-none">
                      <div className="aspect-video rounded-2xl bg-muted/30 border border-border flex items-center justify-center mb-8 group cursor-pointer hover:bg-muted/40 transition-colors">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="w-8 h-8 text-primary" fill="currentColor" />
                        </div>
                        <p className="absolute bottom-4 text-xs text-muted-foreground font-mono">VIDEO_LECTURE_01.MP4 (Coming Soon)</p>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center gap-2 text-primary">
                          <BookOpen className="w-5 h-5" />
                          <h3 className="text-lg font-bold m-0">Module Overview</h3>
                        </div>
                        <p className="text-muted-foreground">
                          In this module, you'll dive deep into the core concepts of <strong>{selectedModule.title}</strong>. This content is curated by Pathforge AI to ensure you master the industry's most relevant techniques.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-4 my-8">
                          <div className="p-4 rounded-xl bg-muted/20 border border-border/50">
                            <FileText className="w-5 h-5 text-accent mb-3" />
                            <h4 className="text-sm font-semibold mb-1">Reading Materials</h4>
                            <p className="text-xs text-muted-foreground">PDFs, documentation links, and cheat sheets.</p>
                          </div>
                          <div className="p-4 rounded-xl bg-muted/20 border border-border/50">
                            <MessageSquare className="w-5 h-5 text-violet-500 mb-3" />
                            <h4 className="text-sm font-semibold mb-1">Community Discussion</h4>
                            <p className="text-xs text-muted-foreground">Ask questions and collaborate with other learners.</p>
                          </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-bold m-0">Hands-on Challenge</h4>
                            <span className="px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-500 text-[10px] font-bold">150 XP</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4 italic">
                            "Build a basic implementation using the principles discussed in this module and upload it to your portfolio for bonus points!"
                          </p>
                          <MagneticButton variant="ghost" className="w-full text-xs h-9">
                            Start Lab Challenge <ArrowRight className="ml-2 w-3 h-3" />
                          </MagneticButton>
                        </div>
                      </div>
                    </div>
                  </GlassCardContent>
                </GlassCard>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
