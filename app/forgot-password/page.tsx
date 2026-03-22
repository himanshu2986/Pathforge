'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, Mail, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email) {
      setError('Please enter your email address')
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (response.ok) {
        setIsSubmitted(true)
      } else {
        const data = await response.json()
        setError(data.message || 'Something went wrong. Try again.')
      }
    } catch (err) {
      setError('A network error occurred.')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/30" />
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/15 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-accent/15 rounded-full blur-[120px]" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center"
          >
            <Zap className="w-7 h-7 text-primary-foreground" />
          </motion.div>
          <span className="text-2xl font-bold gradient-text">PathForge</span>
        </Link>
        
        <GlassCard hover={false}>
          <GlassCardContent className="p-8">
            {!isSubmitted ? (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-foreground mb-2">Reset Password</h1>
                  <p className="text-muted-foreground">
                    Enter your email and we&apos;ll send you instructions to reset your password
                  </p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                  
                  {/* Error message */}
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-destructive-foreground text-sm text-center bg-destructive/10 py-2 rounded-lg"
                    >
                      {error}
                    </motion.p>
                  )}
                  
                  {/* Submit */}
                  <MagneticButton
                    type="submit"
                    variant="primary"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                    <ArrowRight className="w-5 h-5" />
                  </MagneticButton>
                </form>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Check Your Email</h2>
                <p className="text-muted-foreground mb-6">
                  We&apos;ve sent password reset instructions to <span className="text-foreground font-medium">{email}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Didn&apos;t receive the email? Check your spam folder or{' '}
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-primary hover:underline"
                  >
                    try again
                  </button>
                </p>
              </motion.div>
            )}
            
            {/* Back to login */}
            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </div>
          </GlassCardContent>
        </GlassCard>
      </motion.div>
    </div>
  )
}
