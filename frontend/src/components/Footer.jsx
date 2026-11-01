import { Clock, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react'

const SOCIAL_LOGIN_LINKS = [
  { name: 'Instagram', href: 'https://www.instagram.com/accounts/login/' },
  { name: 'Facebook', href: 'https://www.facebook.com/login/' },
  { name: 'WhatsApp', href: 'https://web.whatsapp.com/' },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/login' },
  { name: 'X', href: 'https://x.com/i/flow/login' },
]

function SocialIcon({ name }) {
  if (name === 'Instagram') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3.25" y="3.25" width="17.5" height="17.5" rx="5.2" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="4.1" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="17.75" cy="6.6" r="1.2" fill="currentColor" />
      </svg>
    )
  }

  if (name === 'Facebook') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.019 4.388 11.002 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.513c-1.491 0-1.956.93-1.956 1.887v2.263h3.328l-.532 3.47h-2.796v8.385C19.612 23.075 24 18.092 24 12.073Z" />
      </svg>
    )
  }

  if (name === 'WhatsApp') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.4 11.8a8.35 8.35 0 0 1-12.35 7.33L3.6 20.4l1.3-4.32A8.35 8.35 0 1 1 20.4 11.8Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M8.25 7.7c-.25-.55-.52-.57-.76-.58h-.65c-.23 0-.6.09-.91.44-.32.35-1.2 1.17-1.2 2.85s1.23 3.31 1.4 3.54c.18.23 2.38 3.81 5.88 5.19 2.9 1.14 3.5.91 4.13.85.63-.06 2.03-.82 2.31-1.62.29-.8.29-1.49.2-1.63-.09-.15-.32-.24-.67-.41-.35-.18-2.03-1-2.35-1.12-.32-.12-.55-.17-.78.18-.24.35-.9 1.12-1.1 1.35-.2.23-.4.26-.75.09-.35-.18-1.47-.54-2.8-1.72-1.04-.93-1.74-2.08-1.94-2.43-.2-.35-.02-.54.15-.71.15-.15.35-.4.52-.6.18-.2.23-.35.35-.58.12-.24.06-.44-.03-.62-.09-.17-.78-1.87-1.07-2.56Z" fill="currentColor" transform="translate(2.4 1.2) scale(.8)" />
      </svg>
    )
  }

  if (name === 'LinkedIn') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.35V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.9 2H22l-6.78 7.75L23.2 22h-6.25l-4.9-7.4L5.58 22H2.45l7.25-8.28L1.8 2h6.4l4.43 6.76L18.9 2Zm-1.1 17.9h1.73L7.28 3.98H5.43L17.8 19.9Z" fill="currentColor" />
    </svg>
  )
}

function Footer({ onNavigate }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <button
              type="button"
              className="brand footer-brand-button"
              onClick={() => onNavigate('home')}
              aria-label="AutoCare home"
            >
              <img className="brand-full-logo" src="/AutoCareLogoOnly.png" alt="AutoCare" />
              <img className="brand-tagline" src="/onlytagline.png" alt="Smart Service, Smoother Drives." />
            </button>
            <p>
              A car-only care studio built around transparent pricing, skilled
              hands and appointments that respect your time.
            </p>
            <span className="footer-pill">
              <ShieldCheck size={14} />
              Cars only. No bikes.
            </span>
          </div>

          <div>
            <h4>Explore</h4>
            <div className="footer-links">
              <button type="button" onClick={() => onNavigate('home', 'services')}>
                Service menu
              </button>
              <button type="button" onClick={() => onNavigate('track')}>
                Track booking
              </button>
              <button type="button" onClick={() => onNavigate('reviews')}>
                Feedback &amp; reviews
              </button>
              <button type="button" onClick={() => onNavigate('about')}>
                About AutoCare
              </button>
              <button type="button" onClick={() => onNavigate('privacy')}>
                Privacy Policy
              </button>
            </div>
          </div>

          <div>
            <h4>Studio</h4>
            <div className="footer-contact">
              <span>
                <MapPin size={15} />
                Karachi, Pakistan
              </span>
              <span>
                <Clock size={15} />
                Mon–Sat · 9 AM – 9 PM
              </span>
              <a href="tel:+9221111222333">
                <Phone size={15} />
                (021) 111 222 333
              </a>
              <a href="mailto:support@autocare.com">
                <Mail size={15} />
                support@autocare.com
              </a>
            </div>
          </div>

          <div>
            <h4>Need a hand?</h4>
            <p className="footer-note">
              Talk to a service advisor before booking. We’ll help you pick the
              right package for your car.
            </p>
            <a className="footer-call" href="tel:+924211122233">
              Call the studio
              <Phone size={14} />
            </a>
            <h4 className="footer-social-heading">Follow us</h4>
            <nav className="footer-social-links" aria-label="Follow AutoCare on social media">
              {SOCIAL_LOGIN_LINKS.map(({ name, href }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`AutoCare on ${name}`}
                  title={`Open ${name}`}
                >
                  <SocialIcon name={name} />
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} AutoCare. All rights reserved.</span>
          <span>Built for cars. Driven by care.</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
