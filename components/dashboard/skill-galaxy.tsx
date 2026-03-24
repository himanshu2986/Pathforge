'use client'

import { motion } from 'framer-motion'
import { Zap, Sparkles, Target } from 'lucide-react'
import { useDashboardStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export function SkillGalaxy() {
  const { skills } = useDashboardStore()
  
  // Create a visual node-based layout using absolute positioning and random offsets
  const nodes = skills.map((skill, i) => ({
    ...skill,
    x: 20 + (i * 25) % 60 + Math.random() * 10,
    y: 20 + (i * 15) % 60 + Math.random() * 10,
    size: 40 + (skill.level / 2)
  }))

  return (
    <div className="relative w-full h-[300px] bg-black/40 rounded-[2rem] border border-white/5 overflow-hidden group">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none" />
      
      {/* Dynamic Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 blur-[100px] rounded-full animate-pulse" />

      <div className="absolute top-6 left-8 z-10">
         <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] flex items-center gap-2">
           <Target className="w-3 h-3" /> Neural Skill Galaxy
         </h4>
      </div>

      <div className="relative w-full h-full p-10 cursor-grab active:cursor-grabbing">
        {nodes.map((node, i) => (
          <motion.div
            key={node.id || i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              left: `${node.x}%`,
              top: `${node.y}%`
            }}
            whileHover={{ scale: 1.1, zIndex: 20 }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ width: node.size, height: node.size }}
          >
            <div className={cn(
              "w-full h-full rounded-2xl flex items-center justify-center p-3 relative group",
              node.level >= 80 ? 'bg-primary/20 border-primary/40' : 'bg-white/5 border-white/10',
              "border backdrop-blur-xl shadow-2xl transition-all"
            )}>
              <div className="text-center">
                <p className="text-[8px] font-black uppercase tracking-tighter text-white truncate max-w-full">{node.name}</p>
                <p className="text-[12px] font-black italic text-primary">{node.level}%</p>
              </div>

              {/* Orbital Glow for Mastered Skills */}
              {node.level >= 80 && (
                <div className="absolute inset-[-4px] rounded-2xl border border-primary/40 animate-ping opacity-20" />
              )}
            </div>
          </motion.div>
        ))}

        {/* Dynamic Lines (Simplified representation) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
          {nodes.slice(0, -1).map((node, i) => (
            <line 
              key={i}
              x1={`${node.x}%`} 
              y1={`${node.y}%`} 
              x2={`${nodes[i+1].x}%`} 
              y2={`${nodes[i+1].y}%`} 
              stroke="currentColor" 
              strokeWidth="1" 
              className="text-primary/30"
            />
          ))}
        </svg>
      </div>

      <div className="absolute bottom-6 right-8 text-[8px] font-black uppercase text-gray-600">
         Total Proficiency: {Math.round(skills.reduce((a,b)=>a+b.level,0)/skills.length || 0)}% Matrix Coverage
      </div>
    </div>
  )
}
