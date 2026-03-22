'use client'

import { motion } from 'framer-motion'
import { Rocket, Code2, Database, Layout, Brain, Shield, Terminal, Globe, Cpu } from 'lucide-react'
import { MagneticButton } from '@/components/ui/magnetic-button'

const projectLevels = [
  {
    level: "Beginner",
    description: "Perfect for getting started with core concepts.",
    color: "from-green-500 to-emerald-700",
    projects: [
      {
        title: "Personal Portfolio",
        desc: "Build a static portfolio to showcase your skills. Learn HTML, CSS, and basic responsive design.",
        icon: Layout,
        tags: ["HTML", "CSS", "Responsive"],
      },
      {
        title: "To-Do Application",
        desc: "Create a task manager with local storage to understand state and simple CRUD operations.",
        icon: Terminal,
        tags: ["JavaScript", "DOM", "Local Storage"],
      },
      {
        title: "Weather Dashboard",
        desc: "Fetch real-time data from a public API and display it dynamically in a clean UI.",
        icon: Globe,
        tags: ["API", "Async/Await", "JSON"],
      }
    ]
  },
  {
    level: "Intermediate",
    description: "Take your skills to the next level with full-stack challenges.",
    color: "from-primary to-accent",
    projects: [
      {
        title: "E-Commerce Bookstore",
        desc: "Build a complete online store with a shopping cart, product catalog, and checkout flow.",
        icon: Code2,
        tags: ["React", "State Management", "Routing"],
      },
      {
        title: "Real-time Chat App",
        desc: "Develop a messaging application using WebSockets for instant communication.",
        icon: Rocket,
        tags: ["Node.js", "Socket.io", "Express"],
      },
      {
        title: "Blog CMS",
        desc: "Create a Content Management System to write, edit, and publish markdown blog posts.",
        icon: Database,
        tags: ["Next.js", "MongoDB", "Auth"],
      }
    ]
  },
  {
    level: "Advanced",
    description: "Complex architectures and advanced system design for seasoned developers.",
    color: "from-orange-500 to-red-600",
    projects: [
      {
        title: "AI-Powered SaaS",
        desc: "Develop a micro-SaaS application utilizing OpenAI APIs with subscription billing.",
        icon: Brain,
        tags: ["Stripe", "AI", "Serverless"],
      },
      {
        title: "End-to-End Encrypted Vault",
        desc: "Build a secure password and file manager with client-side encryption algorithms.",
        icon: Shield,
        tags: ["Cryptography", "Web3", "Security"],
      },
      {
        title: "Distributed Task Queue",
        desc: "Create a highly available background job processing system with Redis and workers.",
        icon: Cpu,
        tags: ["Redis", "Architecture", "Docker"],
      }
    ]
  }
]

export default function PracticeProjectsPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Practice <span className="gradient-text">Projects</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Bridge the gap between learning and production. Choose a project that matches your skill level, read the requirements, and start building.
          </p>
        </motion.div>

        <div className="space-y-24">
          {projectLevels.map((levelGroup, idx) => (
            <motion.div 
              key={levelGroup.level}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
            >
              <div className="mb-10 text-center md:text-left">
                <h2 className="text-3xl font-bold flex items-center justify-center md:justify-start gap-3">
                  <span className={`bg-gradient-to-r ${levelGroup.color} w-3 h-8 rounded-full inline-block`}></span>
                  {levelGroup.level} Level
                </h2>
                <p className="text-muted-foreground mt-2 ml-6">{levelGroup.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {levelGroup.projects.map((project, pIdx) => {
                  const Icon = project.icon
                  return (
                    <motion.div
                      key={project.title}
                      whileHover={{ y: -5, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="glass-card rounded-2xl p-6 relative overflow-hidden group flex flex-col h-full"
                    >
                      {/* Gradient Hover Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center mb-6 relative z-10 group-hover:border-primary/50 transition-colors">
                        <Icon className="w-6 h-6 text-primary group-hover:text-accent transition-colors" />
                      </div>
                      
                      <h3 className="text-xl font-semibold mb-3 relative z-10 group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-muted-foreground mb-6 flex-grow relative z-10">
                        {project.desc}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-6 relative z-10">
                        {project.tags.map(tag => (
                          <span key={tag} className="text-xs px-3 py-1 rounded-full bg-secondary/30 text-secondary-foreground border border-secondary/50">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="relative z-10 mt-auto">
                        <MagneticButton variant="primary" className="w-full">
                          Start Building
                        </MagneticButton>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-32 p-10 rounded-3xl bg-gradient-to-br from-primary/20 via-background to-accent/20 border border-primary/30 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-full glass pointer-events-none -z-10"></div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Have your own project idea?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            You don't have to stick to our list. Build whatever inspires you, connect it through your GitHub, and watch your PathForge score grow!
          </p>
          <MagneticButton variant="primary" className="px-8 py-3 translate-x-0">
            Connect GitHub
          </MagneticButton>
        </motion.div>
      </div>
    </div>
  )
}
