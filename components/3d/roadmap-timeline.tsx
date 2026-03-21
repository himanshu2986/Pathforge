'use client'

import { CheckCircle2, Circle, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Module {
  id: string
  title: string
  completed: boolean
}

interface LearningPath {
  id: string
  title: string
  description: string
  progress: number
  modules: Module[]
}

interface RoadmapTimelineProps {
  paths: LearningPath[]
  className?: string
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, value))
}

export function RoadmapTimeline({ paths, className = '' }: RoadmapTimelineProps) {
  if (paths.length === 0) {
    return (
      <div className={cn('flex h-full min-h-[350px] w-full items-center justify-center', className)}>
        <p className="text-sm text-muted-foreground">No learning paths yet. Add skills to build your roadmap.</p>
      </div>
    )
  }

  return (
    <div className={cn('h-full min-h-[350px] w-full overflow-y-auto pr-1', className)}>
      <div className="space-y-6">
        {paths.slice(0, 3).map((path) => {
          const progress = clamp(path.progress)
          const completedModules = path.modules.filter((module) => module.completed).length

          return (
            <div key={path.id} className="rounded-2xl border border-border/60 bg-muted/10 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h4 className="text-base font-semibold text-foreground">{path.title}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{path.description}</p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm text-primary">
                  <Target className="h-4 w-4" />
                  {progress}% complete
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <span>Progress</span>
                  <span>{completedModules}/{path.modules.length} modules done</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted/30">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {path.modules.map((module, index) => {
                  const isLast = index === path.modules.length - 1

                  return (
                    <div key={module.id} className="flex gap-3">
                      <div className="flex w-6 flex-col items-center">
                        {module.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                        {!isLast && (
                          <div
                            className={cn(
                              'mt-1 w-px flex-1',
                              module.completed ? 'bg-emerald-500/50' : 'bg-border/80'
                            )}
                          />
                        )}
                      </div>
                      <div className="flex-1 rounded-xl border border-border/50 bg-background/20 px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-foreground">{module.title}</p>
                          <span
                            className={cn(
                              'text-xs font-medium',
                              module.completed ? 'text-emerald-500' : 'text-muted-foreground'
                            )}
                          >
                            {module.completed ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Step {index + 1} of {path.modules.length}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default RoadmapTimeline
