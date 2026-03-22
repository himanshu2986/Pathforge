import Link from 'next/link'
import { ArrowLeft, Rocket, Github } from 'lucide-react'
import { MagneticButton } from '@/components/ui/magnetic-button'

export default async function ProjectDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  // Format slug back to nice title
  const title = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')

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
                <Rocket className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-3xl md:text-5xl font-bold leading-tight">{title}</h1>
            </div>
            
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              This is a practice workspace for the <strong>{title}</strong> project. To get started, set up a local repository on your machine, initialize your favorite framework, and bring your ideas to life!
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
