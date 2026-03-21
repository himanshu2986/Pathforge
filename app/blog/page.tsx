import { InfoPage } from '@/components/content/info-page'

export default function BlogPage() {
  return (
    <InfoPage
      eyebrow="Blog"
      title="Notes on learning, portfolios, and hiring"
      description="This space is reserved for product updates and practical articles around skill development and career execution."
      sections={[
        {
          heading: 'What will be published here',
          body:
            'Expect short, practical pieces on portfolio quality, interview preparation, skill prioritization, internship strategy, and the tradeoffs behind product decisions.',
        },
        {
          heading: 'Current status',
          body:
            'The editorial section is not populated yet, but the route is now in place so navigation remains consistent while content is being prepared.',
        },
      ]}
    />
  )
}
