'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock,
  Building2,
  CheckCircle,
  ExternalLink,
  Briefcase,
  ArrowUpRight,
  X
} from 'lucide-react'
import { GlassCard, GlassCardContent, GlassCardHeader } from '@/components/ui/glass-card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { Progress } from '@/components/ui/progress'
import { useDashboardStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const filters = ['All', 'Remote', 'Onsite', 'Hybrid']

const typeColors = {
  remote: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  onsite: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  hybrid: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
}

export default function InternshipsPage() {
  const { internships, applyToInternship, setInternships } = useDashboardStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [selectedInternship, setSelectedInternship] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchGlobalJobs = async () => {
      try {
        const res = await fetch('/api/admin/internships');
        if (res.ok) {
          const global = await res.json();
          // Merge global postings with user's applied status natively
          const merged = global.map((gJob: any) => {
            const match = internships.find(i => i.id === gJob._id || i.company === gJob.company);
            return {
              id: gJob._id,
              company: gJob.company,
              role: gJob.role,
              location: gJob.location,
              type: gJob.type,
              matchScore: gJob.matchScore || 85,
              skills: gJob.skills || [],
              deadline: gJob.deadline,
              applied: match ? match.applied : false
            };
          });
          
          if (JSON.stringify(merged) !== JSON.stringify(internships)) {
            setInternships(merged);
          }
        }
      } catch (err) { }
    };
    fetchGlobalJobs();
  }, []);
  const filteredInternships = internships.filter(internship => {
    const matchesSearch = 
      internship.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      internship.role.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = 
      activeFilter === 'All' || 
      internship.type.toLowerCase() === activeFilter.toLowerCase()
    
    return matchesSearch && matchesFilter
  })
  
  const appliedCount = internships.filter(i => i.applied).length
  const avgMatchScore = internships.length > 0
    ? Math.round(internships.reduce((acc, i) => acc + i.matchScore, 0) / internships.length)
    : 0
  
  return (
    <div className="p-4 lg:p-8 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
          Internship <span className="gradient-text">Pathways</span>
        </h1>
        <p className="text-muted-foreground">
          AI-matched opportunities based on your skills and career goals
        </p>
      </motion.div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <GlassCard delay={0.1} glow="primary">
          <GlassCardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 p-3">
                <Briefcase className="w-full h-full text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available Positions</p>
                <p className="text-2xl font-bold text-foreground">{internships.length}</p>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>
        
        <GlassCard delay={0.2} glow="accent">
          <GlassCardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 p-3">
                <CheckCircle className="w-full h-full text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Applications Sent</p>
                <p className="text-2xl font-bold text-foreground">{appliedCount}</p>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>
        
        <GlassCard delay={0.3} glow="primary">
          <GlassCardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 p-3">
                <ArrowUpRight className="w-full h-full text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Match Score</p>
                <p className="text-2xl font-bold text-foreground">{avgMatchScore}%</p>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
      
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search positions or companies..."
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                activeFilter === filter
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
      
      {/* Internship Cards */}
      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {filteredInternships.map((internship, i) => (
            <motion.div
              key={internship.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: i * 0.05 }}
              layout
              className="min-w-0 w-full"
            >
              <GlassCard 
                hover 
                className={cn(
                  'cursor-pointer transition-all w-full min-w-0',
                  selectedInternship === internship.id && 'ring-2 ring-primary'
                )}
              >
                <GlassCardContent className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Company Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <Building2 className="w-7 h-7 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 min-w-0">
                          <h3 className="font-semibold text-foreground text-base sm:text-lg truncate flex-1 min-w-0">{internship.role}</h3>
                          {internship.applied && (
                            <span className="shrink-0 px-2 py-0.5 text-[10px] sm:text-xs rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                              Applied
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{internship.company}</p>
                      </div>
                    </div>
                    
                    {/* Details */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                        <MapPin className="w-3.5 h-3.5" />
                        {internship.location}
                      </div>
                      
                      <span className={cn(
                        'px-2 py-0.5 text-[10px] sm:text-xs rounded-full border capitalize whitespace-nowrap',
                        typeColors[internship.type]
                      )}>
                        {internship.type}
                      </span>
                      
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(internship.deadline).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {/* Match Score */}
                    <div className="flex items-center gap-4 w-full lg:w-48 min-w-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] sm:text-xs text-muted-foreground">Match</span>
                          <span className={cn(
                            'text-xs sm:text-sm font-semibold',
                            internship.matchScore >= 80 ? 'text-emerald-500' :
                            internship.matchScore >= 60 ? 'text-yellow-500' : 'text-orange-500'
                          )}>
                            {internship.matchScore}%
                          </span>
                        </div>
                        <Progress 
                          value={internship.matchScore} 
                          className="h-1 sm:h-1.5"
                        />
                      </div>
                      
                      <div className="shrink-0">
                        {!internship.applied ? (
                          <MagneticButton 
                            variant="primary" 
                            size="sm"
                            className="h-8 px-4 text-xs"
                            onClick={() => applyToInternship(internship.id)}
                          >
                            Apply
                          </MagneticButton>
                        ) : (
                          <a
                            href={`https://www.google.com/search?q=${encodeURIComponent(`${internship.company} ${internship.role}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Skills */}
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="flex flex-wrap gap-2">
                      {internship.skills.map((skill) => (
                        <span 
                          key={skill}
                          className="px-2.5 py-1 text-xs rounded-full bg-muted text-muted-foreground"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredInternships.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No internships found matching your criteria</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
