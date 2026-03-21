'use client'

import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

function ParticleSystem({ count = 1500 }) {
  const ref = useRef<THREE.Points>(null)
  const [isVisible, setIsVisible] = useState(false)

  // Performance-based particle count adjustment
  useEffect(() => {
    const adjustCount = () => {
      const hasLowPerformance = (
        ((navigator as any).deviceMemory && (navigator as any).deviceMemory < 4) ||
        navigator.hardwareConcurrency < 4
      )
      // Reduce count for low-performance devices
      if (hasLowPerformance) {
        count = Math.floor(count * 0.5)
      }
    }
    adjustCount()
    setIsVisible(true)
  }, [])

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      // Optimized sphere distribution with better clustering
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 3 + Math.random() * 4 // Reduced range for tighter clustering

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)

      // Optimized color calculation
      const t = Math.random()
      colors[i * 3] = 0.3 + t * 0.4     // R
      colors[i * 3 + 1] = 0.7 - t * 0.3 // G
      colors[i * 3 + 2] = 0.9           // B
    }

    return { positions, colors }
  }, [count])

  useFrame((state) => {
    if (ref.current && isVisible) {
      // Reduced rotation speeds for smoother performance
      ref.current.rotation.y = state.clock.elapsedTime * 0.03
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.02) * 0.05
    }
  })

  if (!isVisible) return null

  return (
    <Points ref={ref} positions={particles.positions} colors={particles.colors} stride={3}>
      <PointMaterial
        transparent
        vertexColors
        size={0.025} // Slightly smaller particles
        sizeAttenuation
        depthWrite={false}
        opacity={0.7} // Reduced opacity
        blending={THREE.AdditiveBlending}
      />
    </Points>
  )
}

function FloatingLights() {
  const light1 = useRef<THREE.PointLight>(null)
  const light2 = useRef<THREE.PointLight>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (light1.current) {
      light1.current.position.x = Math.sin(t * 0.3) * 4 // Reduced movement range
      light1.current.position.y = Math.cos(t * 0.2) * 2
      light1.current.position.z = Math.sin(t * 0.25) * 3
    }
    if (light2.current) {
      light2.current.position.x = Math.cos(t * 0.25) * 3
      light2.current.position.y = Math.sin(t * 0.3) * 2
      light2.current.position.z = Math.cos(t * 0.2) * 4
    }
  })

  return (
    <>
      <pointLight ref={light1} color="#00d4ff" intensity={1.5} distance={8} />
      <pointLight ref={light2} color="#8b5cf6" intensity={1.5} distance={8} />
    </>
  )
}

export function ParticleField({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        style={{ background: 'transparent' }}
        gl={{
          alpha: true,
          antialias: false, // Disabled for performance
          powerPreference: 'low-power' // Prefer integrated graphics
        }}
        dpr={[1, 2]} // Limit pixel ratio for performance
      >
        <ambientLight intensity={0.2} />
        <FloatingLights />
        <ParticleSystem />
      </Canvas>
    </div>
  )
}

export default ParticleField
