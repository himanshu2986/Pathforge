'use client'

import { motion } from 'framer-motion'
import { UserPlus, Brain, Route, Rocket } from 'lucide-react'

const steps = [
  {
    icon: UserPlus,
    number: '01',
    title: 'Create Your Profile',
    description: 'Sign up and tell us about your background, interests, and career aspirations.',
  },
  {
    icon: Brain,
    number: '02',
    title: 'AI Assessment',
    description: 'Our AI analyzes your skills, identifies gaps, and maps your potential.',
  },
  {
    icon: Route,
    number: '03',
    title: 'Follow Your Path',
    description: 'Get a personalized roadmap with curated courses and projects.',
  },
  {
    icon: Rocket,
    number: '04',
    title: 'Land Your Dream Role',
    description: 'Build your portfolio, get matched with internships, and launch your career.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-muted/30" />
      
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
            <span className="text-foreground">How </span>
            <span className="gradient-text">PathForge</span>
            <span className="text-foreground"> Works</span>
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Your journey to career success in four simple steps
          </p>
        </motion.div>
        
        {/* Steps */}
        <div className="relative max-w-5xl mx-auto">
          {/* Connection line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-accent/50 to-primary/50 hidden lg:block" />
          
          <div className="space-y-12 lg:space-y-0">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className={`relative flex flex-col lg:flex-row items-center gap-8 lg:gap-16 ${
                  i % 2 === 0 ? '' : 'lg:flex-row-reverse'
                }`}
              >
                {/* Content */}
                <div className={`flex-1 ${i % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                  <div className="inline-block">
                    <span className="text-5xl font-bold text-primary/20">{step.number}</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto lg:mx-0">
                    {step.description}
                  </p>
                </div>
                
                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent p-5 shadow-lg shadow-primary/25"
                >
                  <step.icon className="w-full h-full text-primary-foreground" />
                  
                  {/* Glow */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-accent blur-xl opacity-50" />
                </motion.div>
                
                {/* Spacer for alignment */}
                <div className="flex-1 hidden lg:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
