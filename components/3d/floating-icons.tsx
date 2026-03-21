'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { RoundedBox, Float, MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'

interface FloatingIconProps {
  position: [number, number, number]
  color: string
  icon: 'code' | 'brain' | 'chart' | 'rocket' | 'target' | 'star'
  delay?: number
}

function IconShape({ icon, color }: { icon: string; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5
    }
  })
  
  const iconGeometry = useMemo(() => {
    switch (icon) {
      case 'code':
        return <boxGeometry args={[0.4, 0.25, 0.08]} />
      case 'brain':
        return <sphereGeometry args={[0.22, 16, 16]} />
      case 'chart':
        return <cylinderGeometry args={[0.18, 0.18, 0.35, 6]} />
      case 'rocket':
        return <coneGeometry args={[0.15, 0.4, 8]} />
      case 'target':
        return <torusGeometry args={[0.18, 0.06, 8, 24]} />
      case 'star':
        return <octahedronGeometry args={[0.22]} />
      default:
        return <boxGeometry args={[0.3, 0.3, 0.3]} />
    }
  }, [icon])
  
  return (
    <mesh ref={meshRef}>
      {iconGeometry}
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  )
}

function FloatingIcon({ position, color, icon, delay = 0 }: FloatingIconProps) {
  return (
    <Float
      speed={2}
      rotationIntensity={0.5}
      floatIntensity={1}
      floatingRange={[-0.2, 0.2]}
    >
      <group position={position}>
        {/* Glass container */}
        <RoundedBox args={[0.6, 0.6, 0.6]} radius={0.1} smoothness={4}>
          <MeshTransmissionMaterial
            backside
            samples={4}
            thickness={0.3}
            chromaticAberration={0.1}
            anisotropy={0.3}
            distortion={0.1}
            distortionScale={0.2}
            temporalDistortion={0.1}
            iridescence={1}
            iridescenceIOR={1}
            iridescenceThicknessRange={[0, 1400]}
            color="#1a1a2e"
            transmission={0.95}
          />
        </RoundedBox>
        
        {/* Icon inside */}
        <IconShape icon={icon} color={color} />
        
        {/* Glow effect */}
        <pointLight color={color} intensity={0.5} distance={2} />
      </group>
    </Float>
  )
}

function Scene() {
  const icons: FloatingIconProps[] = [
    { position: [-3, 1.5, -2], color: '#00d4ff', icon: 'code' },
    { position: [3.5, 0.5, -1], color: '#8b5cf6', icon: 'brain' },
    { position: [-2.5, -1, -1.5], color: '#00d4ff', icon: 'chart' },
    { position: [2.5, 2, -2.5], color: '#06b6d4', icon: 'rocket' },
    { position: [-4, 0, -3], color: '#a855f7', icon: 'target' },
    { position: [4, -1.5, -2], color: '#00d4ff', icon: 'star' },
  ]
  
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} />
      
      {icons.map((props, i) => (
        <FloatingIcon key={i} {...props} delay={i * 0.2} />
      ))}
    </>
  )
}

export function FloatingIcons({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}

export default FloatingIcons
