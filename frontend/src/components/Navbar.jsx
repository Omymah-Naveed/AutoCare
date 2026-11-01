import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  Building2,
  ChevronDown,
  ClipboardList,
  Home as HomeIcon,
  MapPin,
  LogOut,
  Menu,
  MoreHorizontal,
  ShieldCheck,
  Star,
  UserRound,
  Wrench,
  X,
} from 'lucide-react'
import NotificationBell from './NotificationBell'

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'services', label: 'Services', icon: Wrench },
]

function Navbar({ activePage, onNavigate, user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const headerRef = useRef(null)
  const moreRef = useRef(null)
  const profileRef = useRef(null)

  const go = (page, target) => {
    setMenuOpen(false)
    setMoreOpen(false)
    setProfileOpen(false)
    onNavigate(page, target)
  }

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!headerRef.current?.contains(event.target)) {
        setMenuOpen(false)
        setMoreOpen(false)
        setProfileOpen(false)
        return
      }
      if (!moreRef.current?.contains(event.target)) setMoreOpen(false)
      if (!profileRef.current?.contains(event.target)) setProfileOpen(false)
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        setMoreOpen(false)
        setProfileOpen(false)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <header className="navbar" ref={headerRef}>
      <div className="container nav-inner">
        <button
          type="button"
          className="brand"
          onClick={() => go('home')}
          aria-label="AutoCare home"
        >
          <img className="brand-full-logo" src="/AutoCareLogoOnly.png" alt="AutoCare" />
          <img className="brand-tagline" src="/onlytagline.png" alt="Smart Service, Smoother Drives." />
        </button>

        <nav
          className={`nav-links${menuOpen ? ' is-open' : ''}`}
          id="primary-navigation"
          aria-label="Primary navigation"
        >
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`nav-link${(id === 'home' && activePage === 'home') || (id === 'services' && activePage === 'service') ? ' is-active' : ''}`}
              onClick={() => go('home', id === 'services' ? 'services' : undefined)}
              aria-current={(id === 'home' && activePage === 'home') || (id === 'services' && activePage === 'service') ? 'page' : undefined}
            >
              <Icon size={16} strokeWidth={2} />
              {label}
            </button>
          ))}
          <div className="nav-more" ref={moreRef}>
            <button
              type="button"
              className={`nav-link nav-more-toggle${moreOpen ? ' is-active' : ''}`}
              onClick={() => {
                setMoreOpen((open) => !open)
                setProfileOpen(false)
              }}
              aria-expanded={moreOpen}
              aria-haspopup="menu"
              aria-controls="nav-more-menu"
            >
              <MoreHorizontal size={17} strokeWidth={2} />
              More
              <ChevronDown size={13} className="nav-more-chevron" />
            </button>
            {moreOpen ? (
              <div className="nav-more-menu" id="nav-more-menu" role="menu" aria-label="More navigation">
                <button type="button" role="menuitem" onClick={() => go('profile')}>
                  <ClipboardList size={15} />
                  My Bookings
                </button>
                <button type="button" role="menuitem" onClick={() => go('about')}>
                  <Building2 size={15} />
                  About Us
                </button>
                <button type="button" role="menuitem" onClick={() => go('reviews')}>
                  <Star size={15} />
                  Customer Reviews
                </button>
                <button type="button" role="menuitem" onClick={() => go('contact')}>
                  <MapPin size={15} />
                  Contact Us
                </button>
                <span className="nav-more-divider" role="separator" />
                <button type="button" role="menuitem" className="nav-admin-link" onClick={() => go('admin')}>
                  <ShieldCheck size={15} />
                  Admin Login
                </button>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            className="btn btn-primary nav-cta"
            onClick={() => go('home', 'services')}
          >
            Book Now
            <ArrowRight size={15} />
          </button>
          {user ? (
            <div className="nav-account-group">
              <NotificationBell />
              <div className="nav-profile" ref={profileRef}>
              <button
                type="button"
                className={`nav-user${profileOpen ? ' is-open' : ''}`}
                onClick={() => {
                  setProfileOpen((open) => !open)
                  setMoreOpen(false)
                }}
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                title="Open profile menu"
              >
                <span>{user.profilePicture ? <img src={user.profilePicture} alt="" /> : user.name?.charAt(0).toUpperCase() || 'U'}</span>
                <strong>{user.name || user.email}</strong>
                <ChevronDown size={14} className="nav-user-chevron" />
              </button>
              {profileOpen ? (
                <div className="profile-dropdown" role="menu">
                  <div className="profile-dropdown-head">
                    <UserRound size={15} />
                    <div><strong>{user.name || 'AutoCare customer'}</strong><small>{user.email}</small></div>
                  </div>
                  <button type="button" role="menuitem" onClick={() => go('profile')}><UserRound size={15} />View profile</button>
                  <button type="button" role="menuitem" className="profile-dropdown-logout" onClick={() => { setProfileOpen(false); onLogout() }}><LogOut size={15} />Log out</button>
                </div>
              ) : null}
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-ghost nav-auth"
              onClick={() => go('auth')}
            >
              Login / Signup
            </button>
          )}
        </nav>

        <button
          type="button"
          className="nav-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
    </header>
  )
}

export default Navbar
