'use client'

import { useEffect, useState } from 'react'

interface PerformanceMetrics {
  fps: number
  memoryUsage?: number
  renderTime: number
}

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    renderTime: 0,
  })

  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()
    let animationId: number

    const measurePerformance = () => {
      const now = performance.now()
      frameCount++

      // Calculate FPS every second
      if (now - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (now - lastTime))
        const memoryUsage = (performance as any).memory?.usedJSHeapSize / 1048576 // MB

        setMetrics({
          fps: Math.min(fps, 60), // Cap at 60fps
          memoryUsage,
          renderTime: now - lastTime,
        })

        frameCount = 0
        lastTime = now
      }

      animationId = requestAnimationFrame(measurePerformance)
    }

    animationId = requestAnimationFrame(measurePerformance)

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [])

  return metrics
}

// Performance-based feature toggle
export function usePerformanceAdaptive() {
  const [isLowPerformance, setIsLowPerformance] = useState(false)

  useEffect(() => {
    // Check device capabilities
    const checkPerformance = () => {
      const hasLowMemory = (navigator as any).deviceMemory && (navigator as any).deviceMemory < 4
      const hasFewCores = navigator.hardwareConcurrency < 4
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      setIsLowPerformance(hasLowMemory || hasFewCores || prefersReducedMotion)
    }

    checkPerformance()

    // Listen for reduced motion preference changes
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = () => checkPerformance()
    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return isLowPerformance
}