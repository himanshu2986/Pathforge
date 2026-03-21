'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Bell, 
  Shield, 
  Palette,
  Save,
  Camera
} from 'lucide-react'
import { GlassCard, GlassCardContent, GlassCardHeader } from '@/components/ui/glass-card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { useAuthStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
]

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [isSaving, setIsSaving] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState<'dark' | 'light' | 'system'>('dark')
  const [selectedAccent, setSelectedAccent] = useState('#00d4ff')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: 'Passionate developer focused on building great user experiences.',
    location: 'San Francisco, CA',
    website: 'https://myportfolio.com',
  })
  
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    skillReminders: true,
    internshipAlerts: true,
    weeklyDigest: false,
  })

  useEffect(() => {
    const root = document.documentElement
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches
    const resolvedTheme = selectedTheme === 'system'
      ? (prefersLight ? 'light' : 'dark')
      : selectedTheme

    root.classList.toggle('light', resolvedTheme === 'light')
    root.classList.toggle('dark', resolvedTheme !== 'light')
  }, [selectedTheme])

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--primary', selectedAccent)
    root.style.setProperty('--gradient-start', selectedAccent)
  }, [selectedAccent])
  
  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    updateUser({ name: formData.name })
    setIsSaving(false)
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setAvatarPreview(typeof reader.result === 'string' ? reader.result : null)
    }
    reader.readAsDataURL(file)
  }
  
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
          <span className="gradient-text">Settings</span>
        </h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </motion.div>
      
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Tabs */}
        <GlassCard className="lg:w-64 h-fit" delay={0.1}>
          <GlassCardContent className="p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left',
                    activeTab === tab.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  )}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </GlassCardContent>
        </GlassCard>
        
        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <GlassCard delay={0.2}>
              <GlassCardHeader>
                <h2 className="text-lg font-semibold text-foreground">Profile Settings</h2>
              </GlassCardHeader>
              <GlassCardContent>
                {/* Avatar */}
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative">
                    <div className="w-24 h-24 overflow-hidden rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-bold text-primary-foreground">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Profile preview" className="h-full w-full object-cover" />
                      ) : (
                        formData.name.charAt(0)
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Upload profile image"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{formData.name}</h3>
                    <p className="text-sm text-muted-foreground">{formData.email}</p>
                  </div>
                </div>
                
                {/* Form */}
                <div className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Bio
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none"
                    />
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <MagneticButton variant="primary" onClick={handleSave} disabled={isSaving}>
                      <Save className="w-5 h-5" />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </MagneticButton>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>
          )}
          
          {activeTab === 'notifications' && (
            <GlassCard delay={0.2}>
              <GlassCardHeader>
                <h2 className="text-lg font-semibold text-foreground">Notification Preferences</h2>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="space-y-6">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <div>
                        <p className="font-medium text-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications for {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </p>
                      </div>
                      <button
                        onClick={() => setNotifications({ ...notifications, [key]: !value })}
                        className={cn(
                          'w-12 h-6 rounded-full transition-colors relative',
                          value ? 'bg-primary' : 'bg-muted'
                        )}
                      >
                        <div className={cn(
                          'w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform',
                          value ? 'translate-x-6' : 'translate-x-0.5'
                        )} />
                      </button>
                    </div>
                  ))}
                </div>
              </GlassCardContent>
            </GlassCard>
          )}
          
          {activeTab === 'privacy' && (
            <GlassCard delay={0.2}>
              <GlassCardHeader>
                <h2 className="text-lg font-semibold text-foreground">Privacy Settings</h2>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="space-y-6">
                  <div className="p-4 rounded-lg bg-muted/30">
                    <h3 className="font-medium text-foreground mb-2">Profile Visibility</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Control who can see your profile and portfolio
                    </p>
                    <select className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option>Public</option>
                      <option>Recruiters Only</option>
                      <option>Private</option>
                    </select>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-muted/30">
                    <h3 className="font-medium text-foreground mb-2">Data Sharing</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Allow PathForge to share your data with partner companies
                    </p>
                    <select className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option>Allow with consent</option>
                      <option>Never share</option>
                    </select>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>
          )}
          
          {activeTab === 'appearance' && (
            <GlassCard delay={0.2}>
              <GlassCardHeader>
                <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-foreground mb-4">Theme</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <button
                        onClick={() => setSelectedTheme('dark')}
                        className={cn(
                          'p-4 rounded-lg text-center transition-colors',
                          selectedTheme === 'dark'
                            ? 'border-2 border-primary bg-muted/30'
                            : 'border border-border bg-muted/30 hover:border-primary/50'
                        )}
                      >
                        <div className="w-8 h-8 rounded-full bg-background border border-border mx-auto mb-2" />
                        <span className="text-sm text-foreground">Dark</span>
                      </button>
                      <button
                        onClick={() => setSelectedTheme('light')}
                        className={cn(
                          'p-4 rounded-lg text-center transition-colors',
                          selectedTheme === 'light'
                            ? 'border-2 border-primary bg-muted/30'
                            : 'border border-border bg-muted/30 hover:border-primary/50'
                        )}
                      >
                        <div className="w-8 h-8 rounded-full bg-white border border-border mx-auto mb-2" />
                        <span className="text-sm text-foreground">Light</span>
                      </button>
                      <button
                        onClick={() => setSelectedTheme('system')}
                        className={cn(
                          'p-4 rounded-lg text-center transition-colors',
                          selectedTheme === 'system'
                            ? 'border-2 border-primary bg-muted/30'
                            : 'border border-border bg-muted/30 hover:border-primary/50'
                        )}
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-background to-white border border-border mx-auto mb-2" />
                        <span className="text-sm text-foreground">System</span>
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-foreground mb-4">Accent Color</h3>
                    <div className="flex gap-3">
                      {['#00d4ff', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'].map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedAccent(color)}
                          className={cn(
                            'w-10 h-10 rounded-full transition-transform hover:scale-110',
                            color === selectedAccent && 'ring-2 ring-offset-2 ring-offset-background ring-primary'
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  )
}
