'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ShieldAlert, Lock, ArrowRight, CheckCircle2 } from 'lucide-react'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const token = searchParams.get('token')
  const email = searchParams.get('email')
  
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!newPassword || !confirmPassword) {
      setError('Please fill in both fields')
      return
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!token || !email) {
      setError('Invalid reset link. Please go back to the Forgot Password page.')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword })
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        const data = await response.json()
        setError(data.message || 'Failed to reset password.')
      }
    } catch (err: any) {
      setError('An error occurred. Please try again later.')
    }
    
    setIsLoading(false)
  }

  if (success) {
    return (
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 className="w-8 h-8" />
        </motion.div>
        
        <h2 className="text-2xl font-bold text-foreground mb-4">Password Reset Successfully</h2>
        <p className="text-muted-foreground mb-8">
          Your password has been changed successfully. You are now being redirected to the login page...
        </p>
        
        <MagneticButton
          variant="primary"
          onClick={() => router.push('/login')}
          className="w-full"
        >
          Go to Login
        </MagneticButton>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!token || !email ? (
        <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <p>
            This link is invalid or missing required parts. Please go back to the <Link href="/forgot-password" className="underline font-bold">Forgot Password page</Link> and generate a new link.
          </p>
        </div>
      ) : null}
      
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          New Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
            placeholder="Type your new password"
            disabled={!token || !email || isLoading}
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
            placeholder="Confirm your new password"
            disabled={!token || !email || isLoading}
          />
        </div>
      </div>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-destructive-foreground text-sm text-center bg-destructive/10 py-2 rounded-lg"
        >
          {error}
        </motion.p>
      )}
      
      <MagneticButton
        type="submit"
        variant="primary"
        className="w-full"
        disabled={!token || !email || isLoading}
      >
        {isLoading ? 'Resetting...' : 'Reset Securely'}
        <ArrowRight className="w-5 h-5" />
      </MagneticButton>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/30" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent/20 rounded-full blur-[120px]" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center"
          >
            <ShieldAlert className="w-7 h-7 text-primary-foreground" />
          </motion.div>
          <span className="text-2xl font-bold gradient-text">PathForge</span>
        </Link>
        
        <GlassCard hover={false}>
          <GlassCardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">Create New Password</h1>
              <p className="text-muted-foreground">Please type a memorable new password.</p>
            </div>
            
            <Suspense fallback={<div className="text-center text-muted-foreground">Loading form...</div>}>
              <ResetPasswordForm />
            </Suspense>
            
          </GlassCardContent>
        </GlassCard>
      </motion.div>
    </div>
  )
}
