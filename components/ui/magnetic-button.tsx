'use client'

import { useRef, useState } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

interface MagneticButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  magnetic?: boolean
}

export function MagneticButton({
  children,
  variant = 'primary',
  size = 'md',
  magnetic = true,
  className,
  ...props
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!magnetic || !buttonRef.current) return
    
    const rect = buttonRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const distanceX = e.clientX - centerX
    const distanceY = e.clientY - centerY
    
    setPosition({
      x: distanceX * 0.2,
      y: distanceY * 0.2
    })
  }
  
  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
  }
  
  const variants = {
    primary: 'bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-[0_0_30px_rgba(0,212,255,0.5)]',
    secondary: 'bg-secondary/50 text-secondary-foreground border border-border hover:bg-secondary/70',
    ghost: 'bg-transparent text-foreground hover:bg-muted/50'
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }
  
  return (
    <motion.button
      ref={buttonRef}
      className={cn(
        'relative rounded-lg font-medium transition-all duration-300',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
        'disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      animate={{
        x: position.x,
        y: position.y
      }}
      transition={{
        type: 'spring',
        stiffness: 150,
        damping: 15,
        mass: 0.1
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      
      {/* Glow effect */}
      {variant === 'primary' && (
        <motion.div
          className="absolute inset-0 -z-10 rounded-lg opacity-0 blur-xl"
          style={{
            background: 'linear-gradient(135deg, var(--primary), var(--accent))'
          }}
          whileHover={{ opacity: 0.5 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.button>
  )
}
