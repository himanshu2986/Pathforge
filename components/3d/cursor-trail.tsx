'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { usePerformanceAdaptive } from '@/hooks/use-performance'

interface TrailPoint {
  x: number
  y: number
  timestamp: number
}

export function CursorTrail() {
  const trailRef = useRef<TrailPoint[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const lastDrawTime = useRef<number>(0)
  const [isEnabled, setIsEnabled] = useState(true)

  const isLowPerformance = usePerformanceAdaptive()

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springX = useSpring(mouseX, { stiffness: 500, damping: 50 })
  const springY = useSpring(mouseY, { stiffness: 500, damping: 50 })

  // Performance check - disable on low-end devices or reduced motion preference
  useEffect(() => {
    setIsEnabled(!isLowPerformance)
  }, [isLowPerformance])

  const draw = useCallback(() => {
    if (!isEnabled) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const now = Date.now()

    // Adaptive frame rate based on performance
    const targetFps = isLowPerformance ? 20 : 30
    const frameInterval = 1000 / targetFps

    // Throttle drawing based on performance
    if (now - lastDrawTime.current < frameInterval) {
      animationRef.current = requestAnimationFrame(draw)
      return
    }

    lastDrawTime.current = now

    // Clear canvas with slight fade for smoother effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Filter old points (shorter trail on low performance)
    const trailDuration = isLowPerformance ? 200 : 300
    trailRef.current = trailRef.current.filter(
      point => now - point.timestamp < trailDuration
    )

    // Draw trail with optimized rendering
    if (trailRef.current.length > 1) {
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'

      // Reduce gradient operations on low performance
      const step = isLowPerformance ? 2 : 1

      for (let i = trailRef.current.length - 1; i >= 0; i -= step) {
        const point = trailRef.current[i]
        const age = (now - point.timestamp) / trailDuration
        const alpha = Math.max(0, 1 - age)

        // Simplified glow effect
        const gradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, (isLowPerformance ? 6 : 8) * alpha
        )
        gradient.addColorStop(0, `rgba(0, 212, 255, ${alpha * 0.6})`)
        gradient.addColorStop(1, 'rgba(0, 212, 255, 0)')

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(point.x, point.y, (isLowPerformance ? 6 : 8) * alpha, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.restore()
    }

    animationRef.current = requestAnimationFrame(draw)
  }, [isEnabled, isLowPerformance])

  useEffect(() => {
    if (!isEnabled) return

    const canvas = canvasRef.current
    if (!canvas) return

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)

      trailRef.current.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now()
      })

      // Adaptive trail length
      const maxLength = isLowPerformance ? 15 : 25
      if (trailRef.current.length > maxLength) {
        trailRef.current.shift()
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    animationRef.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [draw, mouseX, mouseY, isEnabled, isLowPerformance])

  if (!isEnabled) {
    return (
      <motion.div
        className="pointer-events-none fixed z-50 w-3 h-3 -ml-1.5 -mt-1.5 rounded-full"
        style={{
          x: springX,
          y: springY,
          background: 'rgba(0,212,255,0.8)',
          boxShadow: '0 0 10px rgba(0,212,255,0.5)',
        }}
      />
    )
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-50"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* Main cursor dot */}
      <motion.div
        className="pointer-events-none fixed z-50 w-4 h-4 -ml-2 -mt-2 rounded-full"
        style={{
          x: springX,
          y: springY,
          background: 'radial-gradient(circle, rgba(0,212,255,0.8) 0%, rgba(139,92,246,0.4) 50%, transparent 100%)',
          boxShadow: '0 0 20px rgba(0,212,255,0.5), 0 0 40px rgba(139,92,246,0.3)',
        }}
      />
    </>
  )
}

export default CursorTrail
