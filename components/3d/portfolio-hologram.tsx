'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text, Ring, Circle } from '@react-three/drei'
import * as THREE from 'three'

interface HologramProps {
  score: number
}

function HologramRings({ score }: { score: number }) {
  const group = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })
  
  const rings = useMemo(() => {
    return [
      { radius: 1.2, color: '#00d4ff', speed: 1, opacity: 0.6 },
      { radius: 1.5, color: '#8b5cf6', speed: -0.8, opacity: 0.4 },
      { radius: 1.8, color: '#06b6d4', speed: 0.6, opacity: 0.3 },
    ]
  }, [])
  
  return (
    <group ref={group}>
      {rings.map((ring, i) => (
        <Ring
          key={i}
          args={[ring.radius - 0.02, ring.radius + 0.02, 64]}
          rotation={[Math.PI / 2 + i * 0.3, 0, 0]}
        >
          <meshBasicMaterial
            color={ring.color}
            transparent
            opacity={ring.opacity}
            side={THREE.DoubleSide}
          />
        </Ring>
      ))}
    </group>
  )
}

function ScoreDisplay({ score }: { score: number }) {
  const textRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (textRef.current) {
      textRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05
    }
  })
  
  return (
    <group ref={textRef}>
      <Text
        position={[0, 0.1, 0]}
        fontSize={0.8}
        color="#00d4ff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Geist-Bold.ttf"
      >
        {score}
      </Text>
      <Text
        position={[0, -0.4, 0]}
        fontSize={0.15}
        color="#a1a1aa"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Geist-Regular.ttf"
      >
        Portfolio Score
      </Text>
    </group>
  )
}

function HologramBase() {
  const baseRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (baseRef.current) {
      const material = baseRef.current.material as THREE.MeshBasicMaterial
      material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.1
    }
  })
  
  return (
    <Circle ref={baseRef} args={[2, 64]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
      <meshBasicMaterial color="#00d4ff" transparent opacity={0.2} />
    </Circle>
  )
}

function ScanLines() {
  const linesRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.children.forEach((line, i) => {
        const offset = (state.clock.elapsedTime * 0.5 + i * 0.5) % 2
        line.position.y = -1 + offset
        const material = (line as THREE.Mesh).material as THREE.MeshBasicMaterial
        material.opacity = 1 - Math.abs(offset - 1)
      })
    }
  })
  
  return (
    <group ref={linesRef}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, i * 0.5, 0]}>
          <ringGeometry args={[1.9, 2, 64]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.1} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  )
}

function Scene({ score }: HologramProps) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 2, 2]} color="#00d4ff" intensity={1} />
      <pointLight position={[2, -1, -2]} color="#8b5cf6" intensity={0.5} />
      
      <HologramRings score={score} />
      <ScoreDisplay score={score} />
      <HologramBase />
      <ScanLines />
    </>
  )
}

export function PortfolioHologram({ score, className = '' }: HologramProps & { className?: string }) {
  return (
    <div className={`w-full h-full min-h-[300px] ${className}`}>
      <Canvas
        camera={{ position: [0, 1, 4], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <Scene score={score} />
      </Canvas>
    </div>
  )
}

export default PortfolioHologram
