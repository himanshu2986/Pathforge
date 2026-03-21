import { InfoPage } from '@/components/content/info-page'

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="About"
      title="Career growth with clearer direction"
      description="PathForge helps learners and early-career professionals turn scattered effort into a focused roadmap."
      sections={[
        {
          heading: 'What PathForge does',
          body:
            'We combine skill tracking, portfolio building, and internship discovery into one guided workflow so users can spend less time guessing and more time building momentum.',
        },
        {
          heading: 'Who it is for',
          body:
            'The platform is built for students, self-taught developers, and career-switchers who need a practical system for identifying gaps, prioritizing work, and showing progress.',
        },
        {
          heading: 'How we think',
          body:
            'Useful guidance should be specific, measurable, and connected to real outcomes. That principle drives the product direction and the experience across the app.',
        },
      ]}
    />
  )
}
