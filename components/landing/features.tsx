'use client'

import { motion } from 'framer-motion'
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Briefcase, 
  Layers,
  Sparkles 
} from 'lucide-react'
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card'

const features = [
  {
    icon: Brain,
    title: 'AI Skill Assessment',
    description: 'Advanced algorithms analyze your skills and identify gaps with precision accuracy.',
    color: 'from-cyan-500 to-blue-500',
    glow: 'primary' as const
  },
  {
    icon: Target,
    title: 'Personalized Roadmaps',
    description: 'Custom learning paths tailored to your career goals and current skill level.',
    color: 'from-violet-500 to-purple-500',
    glow: 'accent' as const
  },
  {
    icon: TrendingUp,
    title: 'Real-Time Analytics',
    description: 'Track your progress with detailed insights and performance metrics.',
    color: 'from-cyan-500 to-teal-500',
    glow: 'primary' as const
  },
  {
    icon: Briefcase,
    title: 'Internship Matching',
    description: 'AI-powered matching connects you with opportunities that fit your profile.',
    color: 'from-blue-500 to-indigo-500',
    glow: 'secondary' as const
  },
  {
    icon: Layers,
    title: 'Portfolio Builder',
    description: 'Showcase your projects and achievements in a professional portfolio.',
    color: 'from-purple-500 to-pink-500',
    glow: 'accent' as const
  },
  {
    icon: Sparkles,
    title: 'Smart Recommendations',
    description: 'Get AI-driven suggestions for courses, projects, and career moves.',
    color: 'from-teal-500 to-cyan-500',
    glow: 'primary' as const
  }
]

export function Features() {
  return (
    <section id="features" className="relative py-24 lg:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-primary/10 rounded-full blur-[100px]" />
      <div className="absolute top-1/3 right-0 w-72 h-72 bg-accent/10 rounded-full blur-[100px]" />
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-foreground">Everything You Need to </span>
            <span className="gradient-text">Succeed</span>
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Powerful tools and AI-driven insights to accelerate your career growth
          </p>
        </motion.div>
        
        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, i) => (
            <GlassCard key={feature.title} glow={feature.glow} delay={i * 0.1}>
              <GlassCardContent className="p-8">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} p-3 mb-6`}>
                  <feature.icon className="w-full h-full text-white" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </GlassCardContent>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  )
}
