'use client'

import { useMemo } from 'react'

interface Skill {
  name: string
  level: number
  category: string
}

interface SkillRadarProps {
  skills: Skill[]
  className?: string
}

const categoryStrokeMap: Record<string, string> = {
  technical: '#38bdf8',
  professional: '#a855f7',
  'data-ai': '#14b8a6',
  business: '#f59e0b',
  creative: '#f472b6',
  language: '#22c55e',
  vocational: '#f97316',
}

export function SkillRadar({ skills, className = '' }: SkillRadarProps) {
  const trimmedSkills = skills.slice(0, 8)

  const { points, polygon, labels } = useMemo(() => {
    const center = 150
    const radius = 105

    const points = trimmedSkills.map((skill, index) => {
      const angle = (-Math.PI / 2) + (index / trimmedSkills.length) * Math.PI * 2
      const scaledRadius = (skill.level / 100) * radius

      return {
        ...skill,
        x: center + Math.cos(angle) * scaledRadius,
        y: center + Math.sin(angle) * scaledRadius,
        axisX: center + Math.cos(angle) * radius,
        axisY: center + Math.sin(angle) * radius,
        labelX: center + Math.cos(angle) * (radius + 24),
        labelY: center + Math.sin(angle) * (radius + 24),
      }
    })

    return {
      points,
      polygon: points.map((point) => `${point.x},${point.y}`).join(' '),
      labels: points,
    }
  }, [trimmedSkills])

  if (trimmedSkills.length === 0) {
    return (
      <div className={`flex h-full min-h-[400px] w-full items-center justify-center ${className}`}>
        <p className="text-sm text-muted-foreground">Add skills to generate your radar view.</p>
      </div>
    )
  }

  return (
    <div className={`flex h-full min-h-[400px] w-full items-center justify-center ${className}`}>
      <svg viewBox="0 0 300 300" className="h-full w-full max-w-[420px] overflow-visible">
        {[30, 55, 80, 105].map((ring, index) => (
          <circle
            key={ring}
            cx="150"
            cy="150"
            r={ring}
            fill="none"
            stroke="rgba(113,113,122,0.22)"
            strokeWidth={index === 3 ? 1.5 : 1}
          />
        ))}

        {labels.map((point, index) => (
          <line
            key={`${point.name}-axis`}
            x1="150"
            y1="150"
            x2={point.axisX}
            y2={point.axisY}
            stroke="rgba(113,113,122,0.28)"
            strokeWidth="1"
          />
        ))}

        <polygon
          points={polygon}
          fill="rgba(0, 212, 255, 0.18)"
          stroke="#00d4ff"
          strokeWidth="2"
        />

        {points.map((point) => (
          <g key={point.name}>
            <circle
              cx={point.x}
              cy={point.y}
              r="5"
              fill={categoryStrokeMap[point.category] ?? '#00d4ff'}
              stroke="#020617"
              strokeWidth="2"
            />
          </g>
        ))}

        {labels.map((point) => (
          <g key={`${point.name}-label`}>
            <text
              x={point.labelX}
              y={point.labelY}
              textAnchor="middle"
              fill="#e4e4e7"
              fontSize="11"
              fontWeight="600"
            >
              {point.name}
            </text>
            <text
              x={point.labelX}
              y={point.labelY + 14}
              textAnchor="middle"
              fill="#00d4ff"
              fontSize="10"
            >
              {point.level}%
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

export default SkillRadar
