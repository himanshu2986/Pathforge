import Link from 'next/link'
import { ArrowLeft, Rocket, Github, Code2, Database, Layout, Brain, Shield, Terminal, Globe, Cpu, HeartPulse, Leaf, Users, CloudRain, Activity, BarChart, Bell } from 'lucide-react'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { projectLevels } from '@/lib/projectsData'

const iconMap: Record<string, any> = {
  Rocket, Code2, Database, Layout, Brain, Shield, Terminal, Globe, Cpu, HeartPulse, Leaf, Users, CloudRain, Activity, BarChart, Bell
}

export default async function ProjectDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  const decodedSlug = decodeURIComponent(slug).toLowerCase()
  
  let targetProject: any = null
  for (const group of projectLevels) {
    const found = group.projects.find((p: any) => p.title.toLowerCase().replace(/\s+/g, '-') === decodedSlug)
    if (found) {
      targetProject = found
      break
    }
  }

  const title = targetProject ? targetProject.title : slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  const desc = targetProject ? targetProject.desc : "This is a practice workspace for your project. To get started, set up a local repository on your machine, initialize your favorite framework, and bring your ideas to life!"
  const tags = targetProject ? targetProject.tags : []
  const Icon = targetProject && iconMap[targetProject.iconName] ? iconMap[targetProject.iconName] : Rocket

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="container mx-auto max-w-4xl">
        <Link 
          href="/projects"
          className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Link>
        
        <div className="glass-card rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 mb-8">
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <Icon className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-2">{title}</h1>
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag: string) => (
                    <span key={tag} className="text-xs px-3 py-1 rounded-full bg-secondary/30 text-secondary-foreground border border-secondary/50">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              {desc}
            </p>
            
            <div className="space-y-8">
              <section>
                <h3 className="text-2xl font-semibold mb-4 text-foreground">Getting Started</h3>
                <ol className="list-decimal list-inside space-y-3 text-muted-foreground ml-2">
                  <li>Create a new directory on your computer for this project.</li>
                  <li>Initialize a new Git repository (`git init`).</li>
                  <li>Build the core features required for a standard {title} application.</li>
                  <li>Push your code to a new public repository on GitHub.</li>
                </ol>
              </section>
              
              <section>
                <h3 className="text-2xl font-semibold mb-4 text-foreground">Submission Checklist</h3>
                <ul className="list-disc list-inside space-y-3 text-muted-foreground ml-2">
                  <li>Clean and commented code</li>
                  <li>A README.md explaining what you built</li>
                  <li>No hardcoded secrets (API keys, passwords, etc.)</li>
                </ul>
              </section>
              
              <div className="pt-8 border-t border-border mt-12 flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard/portfolio" className="w-full sm:w-auto outline-none">
                  <MagneticButton variant="primary" className="w-full flex justify-center items-center gap-2 px-8 py-3">
                    <Github className="w-5 h-5" />
                    Submit Github URL
                  </MagneticButton>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
