'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Header } from '@/components/navigation/header'
import { Footer } from '@/components/navigation/footer'

const CursorTrail = dynamic(
  () => import('@/components/3d/cursor-trail').then(mod => mod.CursorTrail),
  { ssr: false }
)

const Hero = dynamic(() => import('@/components/landing/hero').then(mod => mod.Hero), {
  loading: () => <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
})

const Features = dynamic(() => import('@/components/landing/features').then(mod => mod.Features))

const HowItWorks = dynamic(() => import('@/components/landing/how-it-works').then(mod => mod.HowItWorks))

const Testimonials = dynamic(() => import('@/components/landing/testimonials').then(mod => mod.Testimonials))

const CTA = dynamic(() => import('@/components/landing/cta').then(mod => mod.CTA))

export default function LandingPage() {
  return (
    <main className="relative">
      {/* Custom cursor trail */}
      <Suspense fallback={null}>
        <CursorTrail />
      </Suspense>

      {/* Navigation */}
      <Header />

      {/* Page sections */}
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
        <Hero />
      </Suspense>

      <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>}>
        <Features />
      </Suspense>

      <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>}>
        <HowItWorks />
      </Suspense>

      <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>}>
        <Testimonials />
      </Suspense>

      <Suspense fallback={<div className="min-h-[30vh] flex items-center justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>}>
        <CTA />
      </Suspense>

      {/* Footer */}
      <Footer />
    </main>
  )
}
