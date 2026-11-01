import { Clock, MapPin, Phone, ShieldCheck } from 'lucide-react'

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
              <span className="brand-mark">
                <img src="/AutoCareLogo.png" alt="AutoCare Logo" />
              </span>
              <span className="brand-copy">
                <strong>
                  Auto<span>Care</span>
                </strong>
                <small>Smart Service, Smoother Drives.</small>
              </span>
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
            </div>
          </div>

          <div>
            <h4>Studio</h4>
            <div className="footer-contact">
              <span>
                <MapPin size={15} />
                Gulberg III, Lahore
              </span>
              <span>
                <Clock size={15} />
                Mon–Sat · 9 AM – 8 PM
              </span>
              <a href="tel:+924211122233">
                <Phone size={15} />
                (042) 111 222 33
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
