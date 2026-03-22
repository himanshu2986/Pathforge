'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, BrainCircuit, Target, Lightbulb } from 'lucide-react'
import { GlassCard, GlassCardContent, GlassCardHeader } from '@/components/ui/glass-card'
import { useDashboardStore } from '@/lib/store'
import { MagneticButton } from '@/components/ui/magnetic-button'

export function CareerAI() {
  const { portfolioProjects, skills, learningPaths } = useDashboardStore()

  const recommendation = useMemo(() => {
    const allSkills = new Set([
      ...skills.map(s => s.name.toLowerCase()),
      ...portfolioProjects.flatMap(p => p.skills.map(s => s.toLowerCase()))
    ])

    if (allSkills.size === 0) {
      return {
        title: 'Kickstart Your Journey',
        description: 'You haven\'t added any skills or projects yet. Start by mastering HTML & CSS to build your foundation.',
        nextStep: 'Full-Stack Development Path',
        icon: Target
      }
    }

    // Simple path recommendation logic
    if (allSkills.has('react') || allSkills.has('javascript')) {
      if (!allSkills.has('node.js') && !allSkills.has('express')) {
        return {
          title: 'Complete the Stack',
          description: 'You have strong Frontend skills! To become a Full-Stack developer, your next logical step is mastering Node.js and Backend architectures.',
          nextStep: 'Node.js Backend Module',
          icon: BrainCircuit
        }
      }
      return {
        title: 'Specialize in AI',
        description: 'Great job mastering Full-Stack! Have you considered integrating Machine Learning into your apps? Python and TensorFlow are waiting.',
        nextStep: 'Machine Learning Path',
        icon: Sparkles
      }
    }

    if (allSkills.has('python')) {
      return {
        title: 'Data Science Evolution',
        description: 'You already know Python! Elevate your career by learning how to visualize data and build predictive models.',
        nextStep: 'Data Science Fundamentals',
        icon: Lightbulb
      }
    }

    return {
      title: 'Broaden Your Horizons',
      description: 'Your portfolio is growing! Try exploring a new domain like Cloud Computing or Mobile Development to diversify your expertise.',
      nextStep: 'Cloud Architecture Path',
      icon: Target
    }
  }, [portfolioProjects, skills])

  return (
    <GlassCard delay={0.6} glow="accent">
      <GlassCardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-accent/20">
            <BrainCircuit className="w-5 h-5 text-accent" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Career Intelligence</h3>
        </div>
      </GlassCardHeader>
      <GlassCardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center shrink-0">
              <recommendation.icon className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">{recommendation.title}</h4>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {recommendation.description}
              </p>
            </div>
          </div>
          
          <Link href="/dashboard/learning" className="block p-3 rounded-lg bg-accent/5 border border-accent/10 hover:bg-accent/10 transition-colors group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-accent tracking-wider mb-0.5">Recommended Next Step</p>
                <p className="text-sm font-medium text-foreground">{recommendation.nextStep}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-accent group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link href="/dashboard/skills" className="block">
            <MagneticButton variant="ghost" className="w-full text-xs py-2 h-auto text-accent hover:bg-accent/10">
              View Career Roadmap <ArrowRight className="ml-2 w-3 h-3" />
            </MagneticButton>
          </Link>
        </div>
      </GlassCardContent>
    </GlassCard>
  )
}
