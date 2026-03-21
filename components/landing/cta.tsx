'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { MagneticButton } from '@/components/ui/magnetic-button'

export function CTA() {
  const router = useRouter()

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-background/95" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px]" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-accent/20 rounded-full blur-[100px]" />
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Limited Time: First Month Free</span>
          </motion.div>
          
          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-6 leading-tight">
            <span className="text-foreground">Ready to </span>
            <span className="gradient-text text-glow">Transform</span>
            <br />
            <span className="text-foreground">Your Career?</span>
          </h2>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty">
            Join thousands of professionals who have accelerated their careers with PathForge. 
            Start your free trial today and see the difference AI-powered learning makes.
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <MagneticButton variant="primary" size="lg" onClick={() => router.push('/signup')}>
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </MagneticButton>
            <MagneticButton variant="secondary" size="lg" onClick={() => router.push('/login')}>
              Sign In
            </MagneticButton>
          </div>
          
          {/* Trust signals */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-8 text-sm text-muted-foreground"
          >
            No credit card required. Cancel anytime.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
