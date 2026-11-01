import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  ChevronDown,
  ClipboardList,
  LogOut,
  Menu,
  UserRound,
  Wrench,
  X,
} from 'lucide-react'
import NotificationBell from './NotificationBell'

const NAV_ITEMS = [
  { id: 'home', label: 'Services', icon: Wrench },
  { id: 'track', label: 'Track Booking', icon: ClipboardList },
]

function Navbar({ activePage, onNavigate, user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)

  const go = (page, target) => {
    setMenuOpen(false)
    setProfileOpen(false)
    onNavigate(page, target)
  }

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!profileRef.current?.contains(event.target)) setProfileOpen(false)
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setProfileOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <header className="navbar">
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
              className={`nav-link${activePage === id ? ' is-active' : ''}`}
              onClick={() => go(id, id === 'home' ? 'services' : undefined)}
              aria-current={activePage === id ? 'page' : undefined}
            >
              <Icon size={16} strokeWidth={2} />
              {label}
            </button>
          ))}
          <button
            type="button"
            className="btn btn-primary nav-cta"
            onClick={() => go('home', 'services')}
          >
            Book a Service
            <ArrowRight size={15} />
          </button>
          {user ? (
            <div className="nav-account-group">
              <NotificationBell />
              <div className="nav-profile" ref={profileRef}>
              <button
                type="button"
                className={`nav-user${profileOpen ? ' is-open' : ''}`}
                onClick={() => setProfileOpen((open) => !open)}
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
