import { InfoPage } from '@/components/content/info-page'

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="Privacy"
      title="Privacy overview"
      description="This page provides a straightforward summary of the kind of information a product like PathForge may handle."
      sections={[
        {
          heading: 'Account information',
          body:
            'Basic profile information such as your name, email, and progress data may be used to support authentication, personalization, and continuity across sessions.',
        },
        {
          heading: 'Product usage',
          body:
            'Interaction data may be used to understand which features are useful, detect issues, and improve the quality of recommendations and onboarding flows.',
        },
        {
          heading: 'Control and review',
          body:
            'Users should be able to review the information attached to their account and request updates or deletion through the product support process once that workflow is finalized.',
        },
      ]}
    />
  )
}
