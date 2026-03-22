'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Compass, Zap } from 'lucide-react'

interface InfoPageProps {
  eyebrow: string
  title: string
  description: string
  sections: {
    heading: string
    body: string
  }[]
}

export function InfoPage({ eyebrow, title, description, sections }: InfoPageProps) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/30" />
      <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-primary/15 blur-[120px]" />
      <div className="absolute bottom-20 right-1/4 h-72 w-72 rounded-full bg-accent/15 blur-[120px]" />

      <div className="relative container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <Link href="/" className="mb-10 inline-flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
            <Compass className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold gradient-text">PathForge</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-4xl rounded-3xl border border-border/60 bg-background/70 p-8 backdrop-blur-xl sm:p-10"
        >
          <p className="mb-4 text-sm uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
          <h1 className="mb-4 text-4xl font-bold text-foreground sm:text-5xl">{title}</h1>
          <p className="max-w-2xl text-lg text-muted-foreground">{description}</p>

          <div className="mt-10 space-y-8">
            {sections.map((section) => (
              <section key={section.heading}>
                <h2 className="mb-3 text-xl font-semibold text-foreground">{section.heading}</h2>
                <p className="leading-7 text-muted-foreground">{section.body}</p>
              </section>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
