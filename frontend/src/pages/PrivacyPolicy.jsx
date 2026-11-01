import { Mail, ShieldCheck } from 'lucide-react'

const POLICY_SECTIONS = [
  {
    title: 'Information We Collect',
    paragraphs: [
      'When you use AutoCare, we may collect information you provide directly, such as your name, email address, phone number, vehicle details, booking requests, reviews, and messages submitted through our contact form.',
      'We may also receive basic technical information needed to operate and protect the website, such as browser and request information.',
    ],
  },
  {
    title: 'How We Use Information',
    paragraphs: [
      'We use your information to manage appointments, provide requested services, respond to questions, send relevant booking updates, and maintain your account where applicable.',
      'We may also use information to improve our services, prevent misuse, maintain website security, and meet legal obligations. We do not sell your personal information.',
    ],
  },
  {
    title: 'Sharing and Service Providers',
    paragraphs: [
      'We share information only as needed to operate AutoCare—for example, with service providers that support our website, database, communications, or appointment workflow. Those providers may process information on our behalf.',
      'We may also disclose information when required by law, to protect the rights and safety of customers or AutoCare, or as part of a business transfer. We do not share contact details for third-party marketing.',
    ],
  },
  {
    title: 'Data Protection and Retention',
    paragraphs: [
      'AutoCare uses reasonable administrative and technical safeguards designed to protect personal information. No website or method of electronic storage can be guaranteed completely secure.',
      'We retain information for as long as needed to provide services, maintain business records, resolve disputes, and meet legal requirements. Retention periods may differ depending on the type of information.',
    ],
  },
  {
    title: 'Your Choices and Requests',
    paragraphs: [
      'You may contact us to request access to, correction of, or deletion of personal information associated with you, subject to applicable legal and operational requirements. We may need to verify your identity before handling a request.',
      'You can choose not to provide certain information, though this may prevent us from completing a booking or responding to an enquiry.',
    ],
  },
  {
    title: 'Updates to This Policy',
    paragraphs: [
      'We may update this Privacy Policy as our services or legal requirements change. The latest version will be posted on this page with its updated effective date.',
    ],
  },
]

function PrivacyPolicy({ onNavigate }) {
  return (
    <div className="privacy-page">
      <div className="container">
        <header className="privacy-header">
          <span className="eyebrow"><ShieldCheck size={14} /> Your privacy matters</span>
          <h1>Privacy <span>Policy</span></h1>
          <p>
            This policy explains how AutoCare collects, uses, and protects
            information when you browse our website or use our services.
          </p>
          <span className="privacy-effective-date">Effective date: November 2, 2026</span>
        </header>

        <div className="privacy-layout">
          <aside className="privacy-summary">
            <ShieldCheck size={20} />
            <h2>Clear care. Respectful data use.</h2>
            <p>
              We use the information needed to manage your vehicle care and
              respond to you—not to sell your personal details.
            </p>
          </aside>

          <main className="privacy-sections">
            {POLICY_SECTIONS.map((section, index) => (
              <section className="privacy-card" key={section.title}>
                <span className="privacy-section-number">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h2>{section.title}</h2>
                  {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </section>
            ))}

            <section className="privacy-card privacy-contact-card">
              <span className="privacy-section-number"><Mail size={17} /></span>
              <div>
                <h2>Contact AutoCare</h2>
                <p>
                  For privacy questions or requests, contact our team. We are
                  based in Karachi, Pakistan.
                </p>
                <a href="mailto:support@autocare.com">support@autocare.com</a>
              </div>
            </section>
          </main>
        </div>
        <div className="privacy-back-link">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onNavigate('home')}>
            Back to AutoCare
          </button>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy
