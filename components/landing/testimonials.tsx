'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Software Engineer at Google',
    avatar: 'SC',
    content: 'PathForge completely transformed my career trajectory. The AI-powered skill assessment helped me identify exactly what I needed to learn, and within 6 months I landed my dream job.',
    rating: 5,
    color: 'from-cyan-500 to-blue-500'
  },
  {
    name: 'Marcus Johnson',
    role: 'Data Scientist at Meta',
    avatar: 'MJ',
    content: 'The personalized learning paths are incredible. Instead of wasting time on irrelevant courses, I focused on exactly what mattered for my career goals.',
    rating: 5,
    color: 'from-violet-500 to-purple-500'
  },
  {
    name: 'Emily Rodriguez',
    role: 'Product Manager at Stripe',
    avatar: 'ER',
    content: 'I went from feeling lost in my career to having a clear roadmap. The internship matching feature connected me with opportunities I never knew existed.',
    rating: 5,
    color: 'from-pink-500 to-rose-500'
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-background" />
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-accent/10 rounded-full blur-[100px]" />
      
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
            <span className="text-foreground">Loved by </span>
            <span className="gradient-text">Thousands</span>
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            See how PathForge has helped professionals transform their careers
          </p>
        </motion.div>
        
        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, i) => (
            <GlassCard key={testimonial.name} delay={i * 0.15} glow="primary">
              <GlassCardContent className="p-8">
                {/* Quote icon */}
                <Quote className="w-10 h-10 text-primary/30 mb-4" />
                
                {/* Content */}
                <p className="text-foreground/90 mb-6 leading-relaxed">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                
                {/* Rating */}
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                
                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-white font-semibold`}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  )
}
