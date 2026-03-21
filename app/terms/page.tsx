import { InfoPage } from '@/components/content/info-page'

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="Terms"
      title="Terms of use summary"
      description="This page outlines the basic expectations for using the PathForge platform responsibly."
      sections={[
        {
          heading: 'Acceptable use',
          body:
            'Users are expected to provide accurate account information, avoid misuse of platform features, and refrain from actions that could disrupt service or misrepresent progress.',
        },
        {
          heading: 'Platform changes',
          body:
            'Features, recommendations, and eligibility logic may evolve over time as the product changes, and access to parts of the service may be updated accordingly.',
        },
        {
          heading: 'User responsibility',
          body:
            'Career and learning outcomes still depend on the effort, judgment, and decisions of the individual user. The platform is a tool for guidance, not a guarantee of results.',
        },
      ]}
    />
  )
}
