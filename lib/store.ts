import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'student' | 'admin'
  createdAt: string
}

export interface Skill {
  id: string
  name: string
  category: string
  track?: string
  notes?: string
  level: number // 0-100
  targetLevel: number
  lastUpdated: string
}

export interface PortfolioProject {
  id: string
  title: string
  description: string
  skills: string[]
  url?: string
  imageUrl?: string
  createdAt: string
  views?: number
  likes?: number
  stars?: number
  forks?: number
  lastViewed?: string
  category?: string
}

export interface LearningPath {
  id: string
  title: string
  description: string
  progress: number
  modules: {
    id: string
    title: string
    completed: boolean
  }[]
}

export interface Internship {
  id: string
  company: string
  role: string
  location: string
  type: 'remote' | 'onsite' | 'hybrid'
  matchScore: number
  skills: string[]
  deadline: string
  applied: boolean
}

// Auth Store
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  updateUser: (updates: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true })
        
        // Mock login - check localStorage for registered users
        const users = JSON.parse(localStorage.getItem('pathforge_users') || '[]')
        const user = users.find((u: User & { password: string }) => 
          u.email === email && u.password === password
        )
        
        if (user) {
          const { password: _, ...userWithoutPassword } = user
          set({ user: userWithoutPassword, isAuthenticated: true, isLoading: false })
          useDashboardStore.getState().loadUserData(userWithoutPassword.id)
          return true
        }
        
        // Demo account
        if (email === 'demo@pathforge.com' && password === 'demo123') {
          const demoUser: User = {
            id: 'demo-user',
            email: 'demo@pathforge.com',
            name: 'Demo User',
            role: 'student',
            createdAt: new Date().toISOString()
          }
          set({ user: demoUser, isAuthenticated: true, isLoading: false })
          useDashboardStore.getState().loadUserData(demoUser.id)
          return true
        }
        
        set({ isLoading: false })
        return false
      },
      
      signup: async (email: string, password: string, name: string) => {
        set({ isLoading: true })
        
        const users = JSON.parse(localStorage.getItem('pathforge_users') || '[]')
        
        // Check if user exists
        if (users.some((u: User) => u.email === email)) {
          set({ isLoading: false })
          return false
        }
        
        const newUser: User & { password: string } = {
          id: `user-${Date.now()}`,
          email,
          password,
          name,
          role: 'student',
          createdAt: new Date().toISOString()
        }
        
        users.push(newUser)
        localStorage.setItem('pathforge_users', JSON.stringify(users))
        
        const { password: _, ...userWithoutPassword } = newUser
        set({ user: userWithoutPassword, isAuthenticated: true, isLoading: false })
        useDashboardStore.getState().loadUserData(userWithoutPassword.id)
        return true
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false })
        useDashboardStore.getState().clearUserData()
      },
      
      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } })
        }
      }
    }),
    {
      name: 'pathforge-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated })
    }
  )
)

// Dashboard Data Store
interface DashboardState {
  skills: Skill[]
  portfolioProjects: PortfolioProject[]
  learningPaths: LearningPath[]
  internships: Internship[]
  portfolioScore: number
  weeklyProgress: number
  currentUserId: string | null
  loadUserData: (userId: string) => void
  clearUserData: () => void
  setSkills: (skills: Skill[]) => void
  addSkill: (skill: Skill) => void
  updateSkill: (id: string, updates: Partial<Skill>) => void
  deleteSkill: (id: string) => void
  setPortfolioProjects: (projects: PortfolioProject[]) => void
  addPortfolioProject: (project: PortfolioProject) => void
  updatePortfolioProject: (id: string, updates: Partial<PortfolioProject>) => void
  deletePortfolioProject: (id: string) => void
  setLearningPaths: (paths: LearningPath[]) => void
  setInternships: (internships: Internship[]) => void
  applyToInternship: (id: string) => void
}

interface DashboardSnapshot {
  skills: Skill[]
  portfolioProjects: PortfolioProject[]
  learningPaths: LearningPath[]
  internships: Internship[]
  portfolioScore: number
  weeklyProgress: number
}

// Mock data
const mockSkills: Skill[] = [
  { id: '1', name: 'React', category: 'technical', track: 'Web Development', level: 75, targetLevel: 90, lastUpdated: new Date().toISOString() },
  { id: '2', name: 'TypeScript', category: 'technical', track: 'Web Development', level: 68, targetLevel: 85, lastUpdated: new Date().toISOString() },
  { id: '3', name: 'Node.js', category: 'technical', track: 'Backend Development', level: 60, targetLevel: 80, lastUpdated: new Date().toISOString() },
  { id: '4', name: 'Python', category: 'data-ai', track: 'Programming Fundamentals', level: 55, targetLevel: 75, lastUpdated: new Date().toISOString() },
  { id: '5', name: 'Communication', category: 'professional', track: 'Communication', level: 80, targetLevel: 90, lastUpdated: new Date().toISOString() },
  { id: '6', name: 'Problem Solving', category: 'professional', track: 'Critical Thinking', level: 85, targetLevel: 95, lastUpdated: new Date().toISOString() },
  { id: '7', name: 'Machine Learning', category: 'data-ai', track: 'Machine Learning', level: 45, targetLevel: 70, lastUpdated: new Date().toISOString() },
  { id: '8', name: 'Data Analysis', category: 'data-ai', track: 'Analytics', level: 50, targetLevel: 75, lastUpdated: new Date().toISOString() },
]

const mockPortfolioProjects: PortfolioProject[] = []

const mockLearningPaths: LearningPath[] = [
  {
    id: '1',
    title: 'Full-Stack Development',
    description: 'Master modern web development from frontend to backend',
    progress: 65,
    modules: [
      { id: '1a', title: 'HTML & CSS Fundamentals', completed: true },
      { id: '1b', title: 'JavaScript Deep Dive', completed: true },
      { id: '1c', title: 'React & State Management', completed: true },
      { id: '1d', title: 'Node.js & Express', completed: false },
      { id: '1e', title: 'Database Design', completed: false },
    ]
  },
  {
    id: '2',
    title: 'Machine Learning Fundamentals',
    description: 'Introduction to ML concepts and practical applications',
    progress: 30,
    modules: [
      { id: '2a', title: 'Python for ML', completed: true },
      { id: '2b', title: 'Linear Algebra Basics', completed: true },
      { id: '2c', title: 'Supervised Learning', completed: false },
      { id: '2d', title: 'Neural Networks', completed: false },
    ]
  }
]

const mockInternships: Internship[] = [
  {
    id: '1',
    company: 'TechCorp',
    role: 'Frontend Developer Intern',
    location: 'San Francisco, CA',
    type: 'hybrid',
    matchScore: 92,
    skills: ['React', 'TypeScript', 'Tailwind CSS'],
    deadline: '2026-04-15',
    applied: false
  },
  {
    id: '2',
    company: 'DataViz Inc',
    role: 'Data Science Intern',
    location: 'Remote',
    type: 'remote',
    matchScore: 78,
    skills: ['Python', 'Machine Learning', 'Data Analysis'],
    deadline: '2026-04-30',
    applied: false
  },
  {
    id: '3',
    company: 'StartupXYZ',
    role: 'Full-Stack Developer Intern',
    location: 'New York, NY',
    type: 'onsite',
    matchScore: 85,
    skills: ['React', 'Node.js', 'MongoDB'],
    deadline: '2026-05-01',
    applied: true
  }
]

const createSampleDashboardData = (): DashboardSnapshot => ({
  skills: structuredClone(mockSkills),
  portfolioProjects: structuredClone(mockPortfolioProjects),
  learningPaths: structuredClone(mockLearningPaths),
  internships: structuredClone(mockInternships),
  portfolioScore: 78,
  weeklyProgress: 12,
})

const createEmptyDashboardData = (): DashboardSnapshot => ({
  skills: [],
  portfolioProjects: [],
  learningPaths: [],
  internships: [],
  portfolioScore: 0,
  weeklyProgress: 0,
})

const createInitialDashboardData = (userId: string): DashboardSnapshot =>
  userId === 'demo-user' ? createSampleDashboardData() : createEmptyDashboardData()

const sanitizeUserDashboardData = (userId: string, snapshot: DashboardSnapshot): DashboardSnapshot => {
  if (userId === 'demo-user') return snapshot

  const skills = snapshot.skills.filter((skill) => skill.name !== 'New Skill')
  
  return {
    ...snapshot,
    skills,
    
  }
}

const isSeededSampleData = (snapshot: DashboardSnapshot) =>
  snapshot.skills.length === 8 &&
  snapshot.skills.every((skill, index) => skill.id === String(index + 1)) &&
  snapshot.learningPaths.length === 2 &&
  snapshot.learningPaths[0]?.title === 'Full-Stack Development' &&
  snapshot.learningPaths[1]?.title === 'Machine Learning Fundamentals' &&
  snapshot.internships.length === 3 &&
  snapshot.internships[0]?.company === 'TechCorp' &&
  snapshot.internships[1]?.company === 'DataViz Inc' &&
  snapshot.internships[2]?.company === 'StartupXYZ'

const getDashboardStorageKey = (userId: string) => `pathforge-dashboard:${userId}`

const saveDashboardData = (userId: string | null, snapshot: DashboardSnapshot) => {
  if (!userId || typeof localStorage === 'undefined') return
  localStorage.setItem(getDashboardStorageKey(userId), JSON.stringify(snapshot))
}

const setAndPersistDashboardState = (
  set: (partial: Partial<DashboardState> | ((state: DashboardState) => Partial<DashboardState>)) => void,
  update: Partial<DashboardSnapshot> | ((state: DashboardState) => Partial<DashboardSnapshot>)
) => {
  set((state) => {
    const partial = typeof update === 'function' ? update(state) : update
    const nextState = { ...state, ...partial }

    saveDashboardData(state.currentUserId, {
      skills: nextState.skills,
      portfolioProjects: nextState.portfolioProjects,
      learningPaths: nextState.learningPaths,
      internships: nextState.internships,
      portfolioScore: nextState.portfolioScore,
      weeklyProgress: nextState.weeklyProgress,
    })

    return partial
  })
}

export const useDashboardStore = create<DashboardState>()((set) => ({
  ...createEmptyDashboardData(),
  currentUserId: null,

  loadUserData: (userId) => {
    const storedData = typeof localStorage !== 'undefined'
      ? localStorage.getItem(getDashboardStorageKey(userId))
      : null

    const parsedData: DashboardSnapshot | null = storedData
      ? JSON.parse(storedData)
      : null

    const dashboardData: DashboardSnapshot = !parsedData
      ? createInitialDashboardData(userId)
      : userId !== 'demo-user' && isSeededSampleData(parsedData)
        ? createEmptyDashboardData()
        : sanitizeUserDashboardData(userId, parsedData)

    if (
      !storedData ||
      (userId !== 'demo-user' && parsedData && isSeededSampleData(parsedData)) ||
      (parsedData && JSON.stringify(parsedData) !== JSON.stringify(dashboardData))
    ) {
      saveDashboardData(userId, dashboardData)
    }

    set({
      currentUserId: userId,
      ...dashboardData,
    })
  },

  clearUserData: () => {
    set({
      currentUserId: null,
      ...createEmptyDashboardData(),
    })
  },
  
  setSkills: (skills) => setAndPersistDashboardState(set, { skills }),
  addSkill: (skill) => setAndPersistDashboardState(set, (state) => ({ skills: [...state.skills, skill] })),
  updateSkill: (id, updates) => setAndPersistDashboardState(set, (state) => ({
    skills: state.skills.map(s => s.id === id ? { ...s, ...updates } : s)
  })),
  deleteSkill: (id) => setAndPersistDashboardState(set, (state) => ({
    skills: state.skills.filter(s => s.id !== id)
  })),
  setPortfolioProjects: (projects) => setAndPersistDashboardState(set, { portfolioProjects: projects }),
  addPortfolioProject: (project) => setAndPersistDashboardState(set, (state) => ({
    portfolioProjects: [...state.portfolioProjects, project],
    skills: state.skills.map((skill) => {
      if (project.skills.includes(skill.name)) {
        const newLevel = Math.min(100, skill.level + 5)
        return { ...skill, level: newLevel, lastUpdated: new Date().toISOString() }
      }
      return skill
    }),
  })),
  updatePortfolioProject: (id, updates) => setAndPersistDashboardState(set, (state) => ({
    portfolioProjects: state.portfolioProjects.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    ),
  })),
  deletePortfolioProject: (id) => setAndPersistDashboardState(set, (state) => ({
    portfolioProjects: state.portfolioProjects.filter((p) => p.id !== id),
  })),
  setLearningPaths: (paths) => setAndPersistDashboardState(set, { learningPaths: paths }),
  setInternships: (internships) => setAndPersistDashboardState(set, { internships }),
  applyToInternship: (id) => setAndPersistDashboardState(set, (state) => ({
    internships: state.internships.map(i => 
      i.id === id ? { ...i, applied: true } : i
    )
  })),
}))
