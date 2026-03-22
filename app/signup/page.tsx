'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Zap, Mail, Lock, User, ArrowRight, Eye, EyeOff, Check } from 'lucide-react'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card'
import { useAuthStore } from '@/lib/store'
import { signIn } from 'next-auth/react'

const passwordRequirements = [
  { text: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { text: 'Contains a number', test: (p: string) => /\d/.test(p) },
  { text: 'Contains uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
]

export default function SignupPage() {
  const router = useRouter()
  const { signup, isLoading } = useAuthStore()
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!name || !email || !password) {
      setError('Please fill in all fields')
      return
    }
    
    if (!agreedToTerms) {
      setError('Please agree to the terms and conditions')
      return
    }
    
    const allValid = passwordRequirements.every(req => req.test(password))
    if (!allValid) {
      setError('Password does not meet requirements')
      return
    }
    
    const success = await signup(email, password, name)
    if (success) {
      router.push('/dashboard')
    } else {
      setError('An account with this email already exists')
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/30" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-[120px]" />
      
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
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">Create Account</h1>
              <p className="text-muted-foreground">Start your career transformation today</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    placeholder="John Doe"
                  />
                </div>
              </div>
              
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
              
              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Password requirements */}
                <div className="mt-3 space-y-1">
                  {passwordRequirements.map((req) => (
                    <div key={req.text} className="flex items-center gap-2 text-xs">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        req.test(password) ? 'bg-green-500' : 'bg-muted'
                      }`}>
                        {req.test(password) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={req.test(password) ? 'text-green-500' : 'text-muted-foreground'}>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Terms */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-border bg-input text-primary focus:ring-primary/50"
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground">
                  I agree to the{' '}
                  <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                </label>
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
                {isLoading ? 'Creating account...' : 'Create Account'}
                <ArrowRight className="w-5 h-5" />
              </MagneticButton>
            </form>

            <div className="mt-8 relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0d0d15] px-2 text-muted-foreground">Or pulse into</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-medium text-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94L5.84 14.1z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                Sign up with Google
              </button>
            </div>
            
            {/* Sign in link */}
            <p className="mt-6 text-center text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </GlassCardContent>
        </GlassCard>
      </motion.div>
    </div>
  )
}
