'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glow?: 'primary' | 'accent' | 'secondary' | 'none'
  delay?: number
}

export function GlassCard({
  children,
  className,
  hover = true,
  glow = 'none',
  delay = 0
}: GlassCardProps) {
  const glowColors = {
    primary: 'hover:shadow-[0_0_30px_rgba(0,212,255,0.2)]',
    accent: 'hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]',
    secondary: 'hover:shadow-[0_0_30px_rgba(96,165,250,0.2)]',
    none: ''
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { y: -5, transition: { duration: 0.2 } } : undefined}
      className={cn(
        'relative rounded-xl overflow-hidden',
        'bg-card/40 backdrop-blur-xl',
        'border border-border/50',
        'transition-shadow duration-300',
        glow !== 'none' && glowColors[glow],
        className
      )}
    >
      {/* Gradient border effect */}
      <div className="absolute inset-0 rounded-xl p-[1px] -z-10">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
      </div>
      
      {children}
    </motion.div>
  )
}

export function GlassCardHeader({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <div className={cn('p-6 pb-0', className)}>
      {children}
    </div>
  )
}

export function GlassCardContent({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <div className={cn('p-6', className)}>
      {children}
    </div>
  )
}

export function GlassCardFooter({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <div className={cn('p-6 pt-0', className)}>
      {children}
    </div>
  )
}
