// Privacy Policy page — hosted at chatbot.recoverystarts.com/privacy
// Used as the Privacy Policy URL for Recovery Tracker Google Play Store listing

export const metadata = {
  title: 'Privacy Policy — Recovery Tracker & Recovery Starts',
  description: 'Privacy policy for Recovery Tracker mobile app and Recovery Starts chatbot.',
}

export default function PrivacyPage() {
  return (
    <main style={{
      maxWidth: '720px',
      margin: '0 auto',
      padding: '48px 24px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#333',
      lineHeight: '1.7',
    }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a2e', marginBottom: '8px' }}>
          Privacy Policy
        </h1>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Effective date: February 20, 2026 · Applies to: Recovery Tracker app & Recovery Starts chatbot
        </p>
      </div>

      <section style={{ marginBottom: '32px', padding: '20px', background: '#f0f9ff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1e40af', marginBottom: '12px' }}>
          Summary (Plain Language)
        </h2>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Your check-in data, streaks, and notes stay <strong>on your device only</strong></li>
          <li>Chat messages are sent to our server to generate a response, then discarded</li>
          <li>We collect <strong>no personal information</strong> — no name, email, or location</li>
          <li><strong>No advertising, no data selling. Ever.</strong></li>
        </ul>
      </section>

      <Section title="Information We Collect">
        <SubSection title="Stored only on your device">
          <p>The following is stored exclusively in your phone&apos;s local storage and never uploaded to our servers:</p>
          <ul>
            <li>Daily check-in records (date, mood, activities, notes)</li>
            <li>Streak count and history</li>
            <li>Chat message history</li>
            <li>App first-use date and notification preferences</li>
          </ul>
        </SubSection>
        <SubSection title="Sent to our server (chat only)">
          <p>
            When you use the <strong>Chat with Rhizome</strong> feature, your message is sent to
            <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '13px' }}>
              {' '}chatbot.recoverystarts.com{' '}
            </code>
            to generate a response. We do not store, log, or share these messages.
          </p>
        </SubSection>
      </Section>

      <Section title="What We Do NOT Collect">
        <p>We do not collect:</p>
        <ul>
          <li>Your name, email address, or any contact information</li>
          <li>Your location or GPS data</li>
          <li>Device identifiers (advertising IDs, etc.)</li>
          <li>Analytics, crash reports, or usage telemetry</li>
        </ul>
      </Section>

      <Section title="Data Sharing">
        <p>
          We do not sell, trade, or share your personal information with any third party.
        </p>
        <p>
          The Rhizome chat feature uses Claude, an AI model by Anthropic. Messages you send
          through chat may be processed by Anthropic in accordance with their{' '}
          <a href="https://www.anthropic.com/privacy" style={{ color: '#2563eb' }}>privacy policy</a>.
        </p>
      </Section>

      <Section title="Children's Privacy">
        <p>
          This app is not directed at children under 13. We do not knowingly collect information
          from children under 13.
        </p>
      </Section>

      <Section title="Your Rights">
        <p>
          Since we do not collect personal data on our servers, all your data is on your device.
          Deleting the app removes all locally stored data. There is nothing for us to delete or
          export on your behalf.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions? Contact us at:{' '}
          <a href="mailto:mixenelementsltd@gmail.com" style={{ color: '#2563eb' }}>
            mixenelementsltd@gmail.com
          </a>
        </p>
        <p style={{ color: '#666', fontSize: '13px', marginTop: '8px' }}>
          Mixen Elements Ltd
        </p>
      </Section>

      <p style={{ color: '#999', fontSize: '12px', marginTop: '48px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
        Last updated: February 20, 2026
      </p>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '28px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e', marginBottom: '12px', borderBottom: '2px solid #e2e8f0', paddingBottom: '6px' }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
        {title}
      </h3>
      {children}
    </div>
  )
}
