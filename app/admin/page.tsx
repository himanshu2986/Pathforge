'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShieldAlert, Plus, Save, Activity, Users, User as UserIcon,
  Briefcase, Globe, Trash2, Edit2, CheckCircle,
  MapPin, Clock, Building2, UserCircle, BookOpen, Layers,
  BarChart3, Settings, Search, Filter, ShieldCheck, ChevronRight
} from 'lucide-react'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { GlassCard, GlassCardContent, GlassCardHeader } from '@/components/ui/glass-card'
import { useAuthStore } from '@/lib/store'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

const mockChartData = [
  { name: 'Mon', users: 400, sessions: 240 },
  { name: 'Tue', users: 300, sessions: 139 },
  { name: 'Wed', users: 600, sessions: 980 },
  { name: 'Thu', users: 800, sessions: 390 },
  { name: 'Fri', users: 500, sessions: 480 },
  { name: 'Sat', users: 900, sessions: 380 },
  { name: 'Sun', users: 1100, sessions: 430 },
]

export default function AdvancedAdminDashboard() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  
  const [internships, setInternships] = useState<any[]>([])
  const [learningPaths, setLearningPaths] = useState<any[]>([])
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  
  const [activeTab, setActiveTab] = useState<'overview' | 'internships' | 'users' | 'paths'>('overview')
  const [stats, setStats] = useState({ totalUsers: 0, totalInternships: 0, activePaths: 0, systemUptime: '99.98%' })
  const [isLoading, setIsLoading] = useState(false)
  
  const [jobForm, setJobForm] = useState({ company: '', role: '', location: 'Remote', type: 'remote', matchScore: 85, skills: '', deadline: '2026-12-31' })
  const [pathForm, setPathForm] = useState({ title: '', description: '', category: 'Web Development', level: 'beginner', modules: '' })

  useEffect(() => {
    if (!isAuthenticated) router.push('/login')
    else if (user?.role !== 'admin') router.push('/dashboard')
    else {
      refreshAll()
    }
  }, [user, isAuthenticated])

  const refreshAll = () => {
    fetchInternships()
    fetchStats()
    fetchUsers()
    fetchPaths()
  }

  const fetchStats = async () => {
    const res = await fetch('/api/admin/stats'); if (res.ok) setStats(await res.json())
  }
  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users'); if (res.ok) setAllUsers(await res.json())
  }
  const fetchInternships = async () => {
    const res = await fetch('/api/admin/internships'); if (res.ok) setInternships(await res.json())
  }
  const fetchPaths = async () => {
    const res = await fetch('/api/admin/learning-paths'); if (res.ok) setLearningPaths(await res.json())
  }

  const [editingUser, setEditingUser] = useState<any>(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', githubUsername: '' })
  
  const openEditModal = (u: any) => {
    setEditingUser(u)
    setEditForm({ name: u.name, email: u.email, githubUsername: u.githubUsername || '' })
  }

  const handleUpdateUserDetails = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    setIsLoading(true)
    const res = await fetch(`/api/admin/users/${editingUser._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm)
    })
    if (res.ok) {
      toast.success(`Node Identity Refined: ${editForm.name} updated.`);
      
      // Sync with global auth store if editing oneself
      if (user && user.id === editingUser._id) {
        useAuthStore.getState().updateUser(editForm);
      }
      
      setEditingUser(null);
      fetchUsers();
    }
    setIsLoading(false)
  }

  const handleBanUser = async (id: string, name: string) => {
    if (confirm(`Emergency Protocol: Permanently terminate directory access for ${name}?`)) {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success(`Access Revoked: ${name} removed from Atlas Nodes.`);
        setAllUsers(prev => prev.filter(u => u._id !== id));
        fetchStats();
      }
    }
  }

  const handleEditUserRole = async (u: any) => {
    const newRole = u.role === 'admin' ? 'student' : 'admin';
    const res = await fetch(`/api/admin/users/${u._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole })
    });
    if (res.ok) {
      toast.success(`Permission Override: ${u.name} is now ${newRole.toUpperCase()}`);
      setAllUsers(prev => prev.map(usr => usr._id === u._id ? { ...usr, role: newRole } : usr));
    }
  }

  const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsLoading(true);
    const res = await fetch('/api/admin/internships', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...jobForm, skills: jobForm.skills.split(',').map(s => s.trim()) })
    })
    if (res.ok) { 
      toast.success("Deployment Successful: Internship routed via Atlas.", { icon: <Globe className="w-5 h-5 text-cyan-400" /> }); 
      setJobForm({ company: '', role: '', location: 'Remote', type: 'remote', matchScore: 85, skills: '', deadline: '2026-12-31' }); 
      fetchInternships(); 
    }
    setIsLoading(false)
  }

  const handlePathSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsLoading(true)
    const res = await fetch('/api/admin/learning-paths', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...pathForm, modules: pathForm.modules.split(',').map(m => ({ title: m.trim(), completed: false })) })
    })
    if (res.ok) { 
      toast.success("Publication Matrix Updated: Learning Path is now live.", { icon: <BookOpen className="w-5 h-5 text-purple-400" /> }); 
      setPathForm({ title: '', description: '', category: 'Web Development', level: 'beginner', modules: '' }); 
      fetchPaths(); 
    }
    setIsLoading(false)
  }

  const filteredUsers = allUsers.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (user?.role !== 'admin') return null

  return (
    <div className="p-6 lg:p-10 min-h-screen relative overflow-hidden bg-[#07090f] text-white selection:bg-primary/30">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px] opacity-30 animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-[150px] opacity-20" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />

      {/* Modern Top Header */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-primary rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(79,70,229,0.3)] border border-white/10 group overflow-hidden">
               <ShieldAlert className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/40 tracking-tight">
                ADMIN COMMAND
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-500/80">Atlas Core v2.4.1 Online</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex gap-4">
          <div className="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Session Admin</p>
              <p className="text-sm font-semibold">{user?.name}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center font-bold text-primary">
              {user?.name?.[0]}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Advanced Navigation Bar */}
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-2 mb-10 p-1.5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-2xl w-full max-w-4xl mx-auto shadow-2xl">
        {[
          { id: 'overview', icon: BarChart3, label: 'Analytics' },
          { id: 'internships', icon: Briefcase, label: 'Deployment' },
          { id: 'paths', icon: BookOpen, label: 'Publication' },
          { id: 'users', icon: Users, label: 'Directory' }
        ].map((t) => (
          <button 
            key={t.id} 
            onClick={() => setActiveTab(t.id as any)} 
            className={cn(
              "flex items-center justify-center gap-3 py-3.5 rounded-xl text-sm font-bold transition-all duration-500 group",
              activeTab === t.id 
                ? "bg-gradient-to-r from-primary to-indigo-600 text-white shadow-xl shadow-primary/20 scale-[1.02]" 
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            <t.icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", activeTab === t.id ? "text-white" : "text-gray-500")} />
            {t.label}
          </button>
        ))}
      </div>
      
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="relative z-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { l: "Nodes Online", v: stats.totalUsers, i: Users, d: "+12% growth", c: "text-blue-400", bg: "from-blue-500/10" },
                { l: "Live Routings", v: internships.length, i: Globe, d: "Active sync", c: "text-indigo-400", bg: "from-indigo-500/10" },
                { l: "Publish Matrix", v: learningPaths.length, i: BookOpen, d: "Global Dist", c: "text-purple-400", bg: "from-purple-500/10" },
                { l: "Core Load", v: "14%", i: Activity, d: "Stable", c: "text-emerald-400", bg: "from-emerald-500/10" }
              ].map((s, i) => (
                <motion.div key={i} whileHover={{ y: -5 }}>
                  <GlassCard>
                    <GlassCardContent className={cn("p-7 flex flex-col justify-between bg-gradient-to-br to-transparent border-none", s.bg)}>
                      <div className="flex justify-between items-start">
                        <div className={cn("p-3 rounded-2xl bg-black/40 border border-white/5", s.c)}>
                          <s.i className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black uppercase text-gray-500">{s.d}</span>
                      </div>
                      <div className="mt-8">
                         <h3 className="text-4xl font-black mb-1">{s.v}</h3>
                         <p className="text-xs uppercase font-extrabold text-gray-400 tracking-wider font-mono">{s.l}</p>
                      </div>
                    </GlassCardContent>
                  </GlassCard>
                </motion.div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <GlassCard>
                  <div className="p-8">
                    <div className="flex justify-between items-center mb-10">
                      <div>
                        <h3 className="text-xl font-bold flex items-center gap-2 italic">NETWORK TRAFFIC</h3>
                        <p className="text-sm text-gray-500">Real-time session monitoring across all student nodes</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="w-3 h-3 rounded-full bg-primary" />
                        <span className="w-3 h-3 rounded-full bg-indigo-500" />
                      </div>
                    </div>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={mockChartData}>
                          <defs>
                            <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                          <XAxis dataKey="name" stroke="#ffffff20" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                          <YAxis stroke="#ffffff20" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#07090f', border: '1px solid #ffffff10', borderRadius: '16px', backdropFilter: 'blur(10px)' }}
                            itemStyle={{ color: '#fff', fontSize: '12px' }}
                          />
                          <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#glow)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </GlassCard>
              </div>
              
              <GlassCard>
                <div className="p-8 flex flex-col h-full">
                   <h3 className="text-lg font-bold mb-6 italic">SYSTEM HEALTH</h3>
                   <div className="space-y-8 flex-1">
                      {[
                        { label: "Database Latency", val: "12ms", color: "bg-emerald-500" },
                        { label: "Node.js Process", val: "24.5MB", color: "bg-blue-500" },
                        { label: "Vercel Execution", val: "Normal", color: "bg-indigo-500" },
                        { label: "Auth Tokens", val: "Active", color: "bg-purple-500" }
                      ].map((item, i) => (
                        <div key={i}>
                           <div className="flex justify-between text-xs font-bold uppercase mb-2">
                             <span className="text-gray-500">{item.label}</span>
                             <span>{item.val}</span>
                           </div>
                           <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: "80%" }} className={cn("h-full", item.color)} />
                           </div>
                        </div>
                      ))}
                   </div>
                   <div className="mt-8 pt-8 border-t border-white/5">
                      <div className="text-xs text-center text-gray-500 font-mono">ENCRYPTED AT REST: AES-256</div>
                   </div>
                </div>
              </GlassCard>
            </div>
          </motion.div>
        )}

        {activeTab === 'internships' && (
          <motion.div key="jobs" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid lg:grid-cols-12 gap-8 relative z-10">
            <div className="lg:col-span-4 select-none">
              <GlassCard>
                <div className="p-8">
                  <h2 className="text-2xl font-black mb-8 italic flex items-center gap-3">
                    <Globe className="w-6 h-6 text-primary" /> ROUTE NEW ASSET
                  </h2>
                  <form onSubmit={handleJobSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-500 ml-1 mb-2 block">Company Cluster</label>
                        <input required value={jobForm.company} onChange={(e)=>setJobForm({...jobForm, company:e.target.value})} className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-semibold" placeholder="e.g. Google Cloud" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-500 ml-1 mb-2 block">Role Protocol</label>
                        <input required value={jobForm.role} onChange={(e)=>setJobForm({...jobForm, role:e.target.value})} className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-semibold" placeholder="e.g. Systems Engineer" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-500 ml-1 mb-2 block">Skill Dependencies (CSV)</label>
                        <input required value={jobForm.skills} onChange={(e)=>setJobForm({...jobForm, skills:e.target.value})} className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-semibold" placeholder="Next.js, Tailwind, Rust" />
                      </div>
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full py-5 bg-gradient-to-r from-primary to-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all">
                      {isLoading ? 'ENCRYPTING DATA...' : 'DEPLOY TO GLOBAL DASHBOARDS'}
                    </button>
                  </form>
                </div>
              </GlassCard>
            </div>
            
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest">Active Atlas Streams ({internships.length})</h3>
                <div className="w-10 h-1 h-px bg-white/10" />
              </div>
              <div className="grid gap-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                {internships.map(j=>(
                  <motion.div key={j._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="group p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.08] transition-all flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-center group-hover:border-primary/40 transition-colors">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold tracking-tight">{j.role}</h4>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{j.company}</p>
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          <p className="text-[10px] font-mono text-cyan-400/70">{j.location}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="text-right mr-4 hidden md:block">
                          <p className="text-[10px] font-black uppercase text-gray-600">Sync Status</p>
                          <p className="text-xs font-bold text-emerald-500">OPTIMAL</p>
                       </div>
                       <button onClick={()=>setInternships(p=>p.filter(x=>x._id!==j._id))} className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500/20 active:scale-90 transition-all">
                        <Trash2 className="w-5 h-5" />
                       </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'paths' && (
          <motion.div key="paths" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-12 gap-8 relative z-10">
            <div className="lg:col-span-4">
              <GlassCard>
                <div className="p-8">
                  <h2 className="text-2xl font-black mb-8 italic flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-purple-500" /> PUBLISH MATRIX
                  </h2>
                  <form onSubmit={handlePathSubmit} className="space-y-6">
                    <input required value={pathForm.title} onChange={(e)=>setPathForm({...pathForm, title:e.target.value})} className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:border-purple-500 outline-none transition-all font-semibold" placeholder="Learning Path Title" />
                    <textarea required rows={4} value={pathForm.description} onChange={(e)=>setPathForm({...pathForm, description:e.target.value})} className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:border-purple-500 outline-none transition-all font-semibold resize-none" placeholder="Instructional Summary..." />
                    <input required value={pathForm.modules} onChange={(e)=>setPathForm({...pathForm, modules:e.target.value})} className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:border-purple-500 outline-none transition-all font-semibold" placeholder="Modules (Module 1, Module 2...)" />
                    <button type="submit" disabled={isLoading} className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-purple-500/20 hover:scale-[1.02] transition-all">
                      BROADCAST TO COHORT
                    </button>
                  </form>
                </div>
              </GlassCard>
            </div>
            <div className="lg:col-span-8 flex flex-col items-center justify-center p-20 border-2 border-dashed border-white/5 rounded-[40px] bg-white/[0.02]">
               <Layers className="w-16 h-16 text-gray-700 mb-6" />
               <h3 className="text-xl font-bold text-gray-500 uppercase tracking-widest mb-4">Live Matrix Postings ({learningPaths.length})</h3>
               <div className="flex flex-wrap gap-4 justify-center">
                  {learningPaths.map(p => (
                    <motion.div key={p._id} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl hover:border-purple-500/50 transition-all cursor-pointer">
                       <p className="font-bold">{p.title}</p>
                       <p className="text-[10px] uppercase text-gray-500 font-black mt-1">Status: Published</p>
                    </motion.div>
                  ))}
               </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div key="users" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
               <div>
                  <h2 className="text-3xl font-black italic tracking-tighter">COHORT DIRECTORY</h2>
                  <p className="text-sm text-gray-500 font-semibold">Managing {allUsers.length} total nodes in the cluster</p>
               </div>
               <div className="relative w-full max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-1 focus:ring-primary transition-all font-semibold" 
                    placeholder="Search by ID or Node Alias..." 
                  />
               </div>
            </div>

            <GlassCard>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-2 px-4 pb-4">
                  <thead className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] sticky top-0 bg-[#07090f]/80 backdrop-blur-md z-20">
                    <tr>
                      <th className="p-6">Node Signature</th>
                      <th className="p-6">Access Level</th>
                      <th className="p-6">Link Date</th>
                      <th className="p-6 text-right">Matrix Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-transparent">
                    {filteredUsers.map((u, i)=>(
                      <motion.tr 
                        key={u._id} 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white/[0.03] hover:bg-white/[0.06] transition-all group rounded-2xl overflow-hidden"
                      >
                        <td className="p-6 first:rounded-l-2xl">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-primary flex items-center justify-center font-bold text-sm shadow-lg ring-1 ring-white/10">
                                {u.name?.[0]}
                             </div>
                             <div>
                                <p className="font-bold text-white group-hover:text-primary transition-colors">{u.name}</p>
                                <p className="text-xs font-mono text-gray-500">{u.email}</p>
                             </div>
                          </div>
                        </td>
                        <td className="p-6">
                           <button 
                            onClick={()=>handleEditUserRole(u)} 
                            className={cn(
                              "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-2", 
                              u.role==='admin' 
                                ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20' 
                                : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
                            )}
                           >
                             {u.role==='admin' ? <ShieldCheck className="w-3 h-3"/> : <UserIcon className="w-3 h-3"/>}
                             {u.role}
                           </button>
                        </td>
                        <td className="p-6 text-xs font-bold text-gray-500 font-mono">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-6 text-right last:rounded-r-2xl">
                          <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => openEditModal(u)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                                <Settings className="w-4 h-4 text-gray-400" />
                             </button>
                             <button onClick={()=>handleBanUser(u._id, u.name)} className="p-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all group/ban">
                                <Trash2 className="w-4 h-4 text-red-500 group-hover/ban:scale-110" />
                             </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>

            {/* User Edit Modal */}
            <AnimatePresence>
              {editingUser && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
                   <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="w-full max-w-md bg-[#0d0f1a] border border-white/10 p-8 rounded-[32px] shadow-2xl">
                      <h3 className="text-xl font-bold mb-6 italic">REDEFINE NODE IDENTITY</h3>
                      <form onSubmit={handleUpdateUserDetails} className="space-y-6">
                         <div>
                            <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Alias</label>
                            <input value={editForm.name} onChange={e=>setEditForm({...editForm, name:e.target.value})} className="w-full mt-2 p-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary outline-none transition-all" />
                         </div>
                         <div>
                            <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Node Address (Email)</label>
                            <input value={editForm.email} onChange={e=>setEditForm({...editForm, email:e.target.value})} className="w-full mt-2 p-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary outline-none transition-all" />
                         </div>
                         <div>
                            <label className="text-[10px] font-black text-gray-500 uppercase ml-1">GitHub Handle (Identity Sync)</label>
                            <input value={editForm.githubUsername} onChange={e=>setEditForm({...editForm, githubUsername:e.target.value})} placeholder="e.g. Python-World" className="w-full mt-2 p-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary outline-none transition-all" />
                         </div>
                         <div className="flex gap-4 pt-4">
                            <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-4 bg-white/5 rounded-2xl font-bold text-xs uppercase hover:bg-white/10 transition-all">Abort</button>
                            <button type="submit" className="flex-1 py-4 bg-primary rounded-2xl font-bold text-xs uppercase hover:opacity-90 transition-all">Confirm Update</button>
                         </div>
                      </form>
                   </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
