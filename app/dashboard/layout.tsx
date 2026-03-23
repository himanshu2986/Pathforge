'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  Route, 
  PieChart, 
  Briefcase, 
  Settings,
  LogOut,
  Menu,
  X,
  Compass, Zap, Shield,
  ChevronRight,
  User,
  Code2,
  FileText
} from 'lucide-react'

import { useAuthStore, useDashboardStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/dashboard/skills', icon: Route, label: 'Skills Roadmap' },
  { href: '/projects', icon: Code2, label: 'Project Lab' },

  { href: '/dashboard/portfolio', icon: PieChart, label: 'Portfolio Analytics' },
  { href: '/dashboard/resume', icon: FileText, label: 'Resume Builder' },
  { href: '/dashboard/internships', icon: Briefcase, label: 'Internships' },
]


const bottomNavItems = [
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { currentUserId, loadUserData, clearUserData } = useDashboardStore()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login')
    }
  }, [mounted, isAuthenticated, router])

  useEffect(() => {
    if (!mounted) return

    if (isAuthenticated && user && currentUserId !== user.id) {
      loadUserData(user.id)
    }

    if (!isAuthenticated && currentUserId) {
      clearUserData()
    }
  }, [mounted, isAuthenticated, user, currentUserId, loadUserData, clearUserData])
  
  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  
  const handleLogout = () => {
    logout()
    router.push('/')
  }
  
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-sidebar">
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Compass className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold gradient-text">PathForge</span>
          </Link>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {[...navItems, ...(user?.role === 'admin' ? [{ href: '/admin', icon: Shield, label: 'Admin Command Center' }] : [])].map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                    )}
                  >
                    <item.icon className={cn('w-5 h-5', isActive && 'text-primary')} />
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                      />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* User & Settings & Logout */}
          <div className="mt-8 pt-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-2 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </div>

            <ul className="space-y-1">
              {bottomNavItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                )
              })}
              <li>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </aside>
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Compass className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold gradient-text">PathForge</span>
          </Link>
          
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-foreground"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/50"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-72 bg-sidebar border-r border-sidebar-border flex flex-col"
            >
              <div className="p-6 border-b border-sidebar-border">
                <Link href="/" className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Compass className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <span className="text-xl font-bold gradient-text">PathForge</span>
                </Link>
              </div>
              
              <nav className="p-4 overflow-y-auto flex-1 pb-20">
                <ul className="space-y-1">
                  {[...navItems, ...(user?.role === 'admin' ? [{ href: '/admin', icon: Shield, label: 'Admin Command Center' }] : [])].map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setIsSidebarOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                            isActive
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                              : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                          )}
                        >
                          <item.icon className={cn('w-5 h-5', isActive && 'text-primary')} />
                          <span>{item.label}</span>
                          <ChevronRight className="ml-auto w-4 h-4" />
                        </Link>
                      </li>
                    )
                  })}
                </ul>

                <div className="mt-8 pt-4 border-t border-sidebar-border">
                  <div className="flex items-center gap-3 px-2 mb-6">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-sidebar-foreground truncate">
                        {user?.name || 'User'}
                      </p>
                      <p className="text-xs text-sidebar-foreground/60 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  <ul className="space-y-1">
                    {bottomNavItems.map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setIsSidebarOpen(false)}
                            className={cn(
                              'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                              isActive
                                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                            )}
                          >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                          </Link>
                        </li>
                      )
                    })}
                    <li>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                      </button>
                    </li>
                  </ul>
                </div>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      
      {/* Main Content */}
      <main className="flex-1 lg:pt-0 pt-16 overflow-auto w-full max-w-[100vw] overflow-x-hidden">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="min-h-full"
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}
