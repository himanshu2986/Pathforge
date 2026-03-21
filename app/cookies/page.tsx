import { InfoPage } from '@/components/content/info-page'

export default function CookiesPage() {
  return (
    <InfoPage
      eyebrow="Cookies"
      title="Cookie usage summary"
      description="This page explains how browser storage and similar mechanisms may be used to support the application experience."
      sections={[
        {
          heading: 'Essential storage',
          body:
            'Some browser storage may be used to remember session state, login status, onboarding progress, and interface preferences so the app works consistently.',
        },
        {
          heading: 'Measurement',
          body:
            'Analytics or performance tooling may use storage to understand app usage patterns, diagnose failures, and improve reliability over time.',
        },
        {
          heading: 'Browser controls',
          body:
            'Most browsers let users inspect, clear, or restrict cookies and local storage, though some product features may degrade if essential storage is disabled.',
        },
      ]}
    />
  )
}
