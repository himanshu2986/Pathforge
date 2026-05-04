'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface PracticeCheck {
  label: string
  pattern?: string
  requiredText?: string
}

interface PracticeWorkspaceProps {
  title?: string
  intro?: string
  placeholder?: string
  checks?: PracticeCheck[]
  actionLabel?: string
  mode?: 'code' | 'studio'
}

export function PracticeWorkspace({
  title = 'Practice Workspace',
  intro = 'Write and practice your code here.',
  placeholder = 'Type your code...',
  checks = [],
  actionLabel = 'Run Code Test',
  mode = 'code',
}: PracticeWorkspaceProps) {
  const [content, setContent] = useState('')
  const [feedback, setFeedback] = useState('')
  const [checkResults, setCheckResults] = useState<{ label: string; passed: boolean }[]>([])

  const handlePracticeCheck = () => {
    if (checks.length === 0) {
      setFeedback('Code submitted successfully.')
      return
    }

    const results = checks.map((check) => {
      let passed = false
      if (check.pattern) {
        passed = new RegExp(check.pattern, 'is').test(content)
      } else if (check.requiredText) {
        passed = content.toLowerCase().includes(check.requiredText.toLowerCase())
      } else {
        passed = content.trim().length > 0
      }
      return {
        label: check.label,
        passed,
      }
    })

    setCheckResults(results)

    const allPassed = results.every((r) => r.passed)
    if (allPassed) {
      setFeedback('All checks passed!')
    } else {
      setFeedback('Some checks failed. Keep trying!')
    }
  }

  return (
    <div className="rounded-xl border border-border/60 bg-muted/10 p-5 mt-8">
      <p className="text-xs uppercase tracking-[0.18em] text-primary">{title}</p>
      <p className="mt-3 text-sm text-muted-foreground">{intro}</p>

      <div className="mt-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          spellCheck={false}
          className={cn(
            'min-h-[260px] w-full rounded-xl border border-border/60 bg-background/30 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40',
            mode === 'code' && 'font-mono'
          )}
          placeholder={placeholder}
        />
      </div>

      {(checks.length > 0 && checkResults.length > 0) && (
        <div className="mt-4 space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {mode === 'code' ? 'Code Test Checks' : 'Practice Checks'}
          </p>
          {checkResults.map((check) => (
            <div
              key={check.label}
              className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm"
            >
              <span className="text-foreground">{check.label}</span>
              <span className={check.passed ? 'text-emerald-500' : 'text-amber-500'}>
                {check.passed ? 'Passed' : 'Failed'}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={handlePracticeCheck}
          className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted/20"
        >
          {actionLabel}
        </button>
        {feedback && (
          <p
            className={cn(
              'text-sm',
              feedback.includes('passed') || feedback.includes('successfully')
                ? 'text-emerald-500'
                : 'text-amber-500'
            )}
          >
            {feedback}
          </p>
        )}
      </div>
    </div>
  )
}
