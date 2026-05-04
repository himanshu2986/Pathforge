import Link from 'next/link'
import { ArrowLeft, Rocket, Github, Code2, Database, Layout, Brain, Shield, Terminal, Globe, Cpu, HeartPulse, Leaf, Users, CloudRain, Activity, BarChart, Bell } from 'lucide-react'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { PracticeWorkspace } from '@/components/ui/practice-workspace'
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
  
  // Dynamic step generation based on project type
  const getProjectSteps = (title: string) => {
    const t = title.toLowerCase()
    
    if (t.includes('portfolio')) return [
      "Design a custom grid layout to showcase your top 3 projects.",
      "Implement a responsive navigation bar with smooth anchor scrolling.",
      "Add an interactive 'skills' section with progress indicators.",
      "Create a 'Contact Me' section with a functional email link or form."
    ]
    if (t.includes('landing page')) return [
      "Draft a high-converting hero section with a clear Call to Action.",
      "Identify and list 3 key features with unique iconography.",
      "Add a 'Price Table' or 'Services' section relevant to the industry.",
      "Ensure the entire layout is fully responsive for mobile nodes."
    ]
    if (t.includes('quiz app')) return [
      "Define a data structure for questions, options, and correct answers.",
      "Build a game loop that transitions between multiple questions.",
      "Implement a scoring system that calculates results in real-time.",
      "Add a 'Result Matrix' summary showing the final architecture score."
    ]
    if (t.includes('to-do') || t.includes('note taker')) return [
      "Create an input field for adding new text entries/tasks.",
      "Implement persistent storage using LocalStorage or a Database.",
      "Add 'Mark as Completed' and 'Delete' functionalities.",
      "Implement a search filter to quickly find specific nodes/notes."
    ]
    if (t.includes('blog') || t.includes('cms')) return [
      "Set up a dynamic route to render individual article pages.",
      "Implement a Markdown parser to handle wealthy text content.",
      "Add a 'Recent Posts' feed on the homepage.",
      "Create an Admin interface for creating and editing and deleting posts."
    ]
    if (t.includes('tracker') || t.includes('manager') || t.includes('system')) return [
      "Create a table view to list all existing records/items.",
      "Implement a 'Create/Edit' modal for item deployment.",
      "Add sorting and filtering capabilities (e.g., sort by date/price).",
      "Integrate a 'Total Summary' widget showing overall count/cost."
    ]
    if (t.includes('streaming') || t.includes('player')) return [
      "Integrate an HTML5 player for audio/video playback.",
      "Build a 'Play Queue' or 'Playlist' sidebar.",
      "Implement play, pause, skip, and volume control protocols.",
      "Add a 'Current Item' card with progress seek bars."
    ]
    
    // Default fallback
    return [
      "Initialize your workspace with a modern framework (React/Next.js/Vue).",
      "Draft the primary UI components required for this specific architecture.",
      "Build the core logic (Data models, state management, and routing).",
      "Clean your code and deploy your first production candidate."
    ]
  }

  const steps = getProjectSteps(title)

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
                <h3 className="text-2xl font-semibold mb-4 text-foreground italic flex items-center gap-3">
                  <Terminal className="w-6 h-6 text-primary" /> MISSION STEPS
                </h3>
                <ol className="list-decimal list-inside space-y-4 text-muted-foreground ml-2">
                   {steps.map((s, i) => (
                     <li key={i} className="pl-2">
                       <span className="text-foreground font-semibold">{s.split(' ')[0]}</span> {s.split(' ').slice(1).join(' ')}
                     </li>
                   ))}
                </ol>
              </section>
              
              <PracticeWorkspace
                title="PROJECT WORKSPACE"
                intro={`Write and practice code for ${title} here. Your work is saved for ${title}.`}
                mode={tags.includes('React') || tags.includes('Next.js') || tags.includes('Vue') || tags.includes('HTML') ? 'code' : 'studio'}
                placeholder={tags.includes('React') || tags.includes('Next.js') ? `import React from 'react';\n\nexport default function ${title.replace(/\s+/g, '')}() {\n  return (\n    <div>\n      <h1>${title}</h1>\n      <p>Build your React project here.</p>\n    </div>\n  );\n}` : tags.includes('Python') || tags.includes('Django') ? `def main():\n    print("Welcome to ${title}")\n\nif __name__ == "__main__":\n    main()` : `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>${title}</title>\n</head>\n<body>\n  <h1>Hello ${title}</h1>\n  <p>Build this project example here.</p>\n</body>\n</html>`}
                checks={tags.includes('React') || tags.includes('Next.js') ? [
                  { label: "Defines a component", pattern: "export default function|function\\s+[A-Z]" },
                  { label: "Returns JSX", pattern: "return\\s*\\(|return\\s*<" }
                ] : tags.includes('Python') || tags.includes('Django') ? [
                  { label: "Defines a function or class", pattern: "def\\s+|class\\s+" },
                  { label: "Includes main block", pattern: "if __name__ == .__main__." }
                ] : [
                  { label: "Has a valid HTML document structure", pattern: "<!DOCTYPE html>" },
                  { label: "Includes a page heading", pattern: "<h[1-6]" },
                  { label: "Includes body content", pattern: "<body.*>.*</body>" }
                ]}
              />
              
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
