import { InfoPage } from '@/components/content/info-page'

export default function CareersPage() {
  return (
    <InfoPage
      eyebrow="Careers"
      title="Open roles will appear here"
      description="PathForge does not have public openings listed in the app yet, but this route is now available for future hiring updates."
      sections={[
        {
          heading: 'Hiring focus',
          body:
            'When openings are published, they will likely emphasize product engineering, learning experience design, and operations that directly improve user outcomes.',
        },
        {
          heading: 'In the meantime',
          body:
            'You can continue exploring the platform and portfolio workflow while this section remains a placeholder for future recruiting content.',
        },
      ]}
    />
  )
}
