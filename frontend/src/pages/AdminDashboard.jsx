import { useEffect, useMemo, useState } from 'react'
import {
  BadgeCheck,
  BarChart3,
  Building2,
  Check,
  CircleCheck,
  ClipboardList,
  Clock3,
  Eye,
  EyeOff,
  Inbox,
  KeyRound,
  LayoutDashboard,
  Lock,
  Mail,
  Menu,
  MessageSquareQuote,
  LogOut,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
  Star,
  UserRound,
  Users,
  Wallet,
  Wrench,
  X,
} from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import AdminAbout from './AdminAbout'
import AdminMessages from './AdminMessages'
import {
  BOOKING_STATUSES,
  CATEGORY_LABELS,
  DEFAULT_SERVICES,
  SERVICE_CATEGORIES,
  formatDate,
  formatPrice,
  getStartingPrice,
  toISODate,
} from '../lib/data'
import {
  deleteReview as deleteReviewApi,
  fetchAdminCustomers,
  fetchAdminReport,
  fetchReviews,
  getApiError,
  login as loginApi,
} from '../lib/api'
import NotificationBell from '../components/NotificationBell'
import { generateAdminOverviewPDF } from '../lib/pdf'

const STATUS_TABS = ['All', ...BOOKING_STATUSES]

function createEmptyServiceForm() {
  return {
    title: '',
    category: 'car-care',
    description: '',
    image: '',
    imageFile: null,
    duration: '45 min',
    badge: '',
    prices: { hatchback: '', sedan: '', suv: '' },
  }
}

function AdminDashboard({
  bookings,
  services,
  onUpdateStatus,
  onAddService,
  onUpdateService,
  onDeleteService,
  onResetServices,
  onNavigate,
  onLoadBookings,
  user,
  onAuthSuccess,
  onLogout,
}) {
  const [authed, setAuthed] = useState(() => user?.role === 'admin')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [gateError, setGateError] = useState('')

  const [statusFilter, setStatusFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState('')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [activeSection, setActiveSection] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [customers, setCustomers] = useState([])
  const [reviews, setReviews] = useState([])
  const [deletingReviewId, setDeletingReviewId] = useState('')
  const [report, setReport] = useState(null)
  const [moduleLoading, setModuleLoading] = useState(false)
  const [moduleError, setModuleError] = useState('')
  const [reportRange, setReportRange] = useState({ from: '', to: '' })
  const [customerSearch, setCustomerSearch] = useState('')

  const navigation = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'bookings', label: 'Bookings', icon: ClipboardList },
    { id: 'services', label: 'Services', icon: Wrench },
    { id: 'about', label: 'About Us', icon: Building2 },
    { id: 'users', label: 'Customers', icon: Users },
    { id: 'reviews', label: 'Customer Reviews', icon: MessageSquareQuote },
    { id: 'messages', label: 'Messages', icon: Inbox },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
  ]

  const selectSection = (section) => {
    setActiveSection(section)
    setSidebarOpen(false)
  }

  const [editingId, setEditingId] = useState(null)
  const [serviceForm, setServiceForm] = useState(createEmptyServiceForm)
  const [serviceErrors, setServiceErrors] = useState({})

  useEffect(() => {
    if (!notice) return undefined
    const timer = window.setTimeout(() => setNotice(''), 3200)
    return () => window.clearTimeout(timer)
  }, [notice])

  useEffect(() => {
    if (user?.role !== 'admin') return
    onLoadBookings().catch((error) => {
      setGateError(getApiError(error, 'Unable to load admin data.'))
    })
    // Load the protected dashboard once when an existing admin session is restored.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (
      user?.role !== 'admin'
      || !['users', 'reviews', 'reports'].includes(activeSection)
    ) return
    // Module data is synchronized with the protected admin APIs when its section opens.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setModuleLoading(true)
    setModuleError('')
    const request = activeSection === 'users'
      ? fetchAdminCustomers().then(setCustomers)
      : activeSection === 'reviews'
        ? fetchReviews().then((result) => {
          if (!Array.isArray(result)) throw new Error('Review data returned by the server is invalid.')
          setReviews(result)
        })
        : fetchAdminReport(reportRange).then(setReport)
    request.catch((error) => setModuleError(getApiError(error, 'Unable to load this admin module.'))).finally(() => setModuleLoading(false))
  }, [activeSection, user?.role, reportRange])

  const handleDeleteReview = async (review) => {
    if (!window.confirm(`Delete the review from ${review.name || 'this customer'}?`)) return
    setDeletingReviewId(review._id)
    try {
      await deleteReviewApi(review._id)
      setReviews((current) => current.filter((item) => item._id !== review._id))
      setNotice('Customer review deleted.')
    } catch (error) {
      setNotice(getApiError(error, 'Unable to delete this review.'))
    } finally {
      setDeletingReviewId('')
    }
  }

  const downloadReportCsv = () => {
    if (!report?.exportData?.length) return
    const headers = Object.keys(report.exportData[0])
    const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`
    const csv = [headers, ...report.exportData.map((row) => headers.map((header) => row[header]))].map((row) => row.map(escape).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `autocare-report-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const stats = useMemo(() => {
    const completed = bookings.filter((booking) => booking.status === 'Completed')
    const today = toISODate(new Date())
    return {
      total: bookings.length,
      pending: bookings.filter((booking) => booking.status === 'Pending').length,
      confirmed: bookings.filter((booking) => booking.status === 'Confirmed')
        .length,
      completed: completed.length,
      revenue: completed.reduce((total, booking) => total + booking.amount, 0),
      today: bookings.filter(
        (booking) => booking.date === today && booking.status !== 'Cancelled',
      ).length,
    }
  }, [bookings])

  const filteredBookings = useMemo(() => {
    const term = search.trim().toLowerCase()

    return bookings
      .filter((booking) => {
        const matchesStatus =
          statusFilter === 'All' || booking.status === statusFilter
        if (!matchesStatus) return false
        if (!term) return true

        return [
          booking.id,
          booking.name,
          booking.phone,
          booking.email,
          booking.serviceTitle,
          booking.model,
          booking.carTypeLabel,
        ]
          .join(' ')
          .toLowerCase()
          .includes(term)
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [bookings, search, statusFilter])

  const filteredCustomers = useMemo(() => {
    const term = customerSearch.trim().toLowerCase()
    if (!term) return customers
    return customers.filter((customer) => `${customer.name} ${customer.email} ${customer.phone || ''}`.toLowerCase().includes(term))
  }, [customers, customerSearch])

  const recentBookings = useMemo(() => [...bookings].sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)).slice(0, 5), [bookings])
  const pendingBookings = useMemo(() => bookings.filter((booking) => booking.status === 'Pending').slice(0, 4), [bookings])
  const popularServices = useMemo(() => {
    const counts = new Map()
    bookings.forEach((booking) => {
      const servicesForBooking = booking.services?.length ? booking.services : [{ serviceName: booking.serviceTitle }]
      servicesForBooking.forEach((service) => counts.set(service.serviceName, (counts.get(service.serviceName) || 0) + 1))
    })
    return [...counts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 4)
  }, [bookings])
  const weeklyActivity = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const day = new Date()
    day.setHours(0, 0, 0, 0)
    day.setDate(day.getDate() - (6 - index))
    const iso = toISODate(day)
    const dayBookings = bookings.filter((booking) => booking.date === iso)
    return { label: day.toLocaleDateString('en-US', { weekday: 'short' }), count: dayBookings.length, revenue: dayBookings.filter((booking) => booking.status === 'Completed').reduce((sum, booking) => sum + Number(booking.amount || 0), 0) }
  }), [bookings])
  const maxWeeklyCount = Math.max(...weeklyActivity.map((day) => day.count), 1)

  const countForStatus = (status) =>
    status === 'All'
      ? bookings.length
      : bookings.filter((booking) => booking.status === status).length

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const response = await loginApi({ email: adminEmail, password: adminPassword })
      if (response.user.role !== 'admin') {
        setGateError('This account does not have admin access.')
        return
      }
      window.localStorage.setItem('autocare.token.v1', response.token)
      onAuthSuccess(response.user, response.token)
      setAuthed(true)
      setAdminPassword('')
      setGateError('')
      await onLoadBookings()
    } catch (error) {
      setGateError(getApiError(error, 'Unable to sign in to the admin panel.'))
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('autocare.token.v1')
    window.localStorage.removeItem('autocare.user.v1')
    onLogout()
    setAuthed(false)
    setAdminPassword('')
    setStatusFilter('All')
    setSearch('')
  }

  const handleBookingAction = async (booking, nextStatus) => {
    let cancellationReason = ''
    if (nextStatus === 'Cancelled') {
      const confirmed = window.confirm(
        `Reject booking #${booking.id}? This will cancel the appointment.`,
      )
      if (!confirmed) return
      cancellationReason = window.prompt('Enter the cancellation reason:')?.trim() || ''
      if (cancellationReason.length < 3) {
        setNotice('A cancellation reason is required.')
        return
      }
    }

    try {
      await onUpdateStatus(booking.id, nextStatus, cancellationReason)
      setNotice(`Booking #${booking.id} marked as ${nextStatus}.`)
    } catch (error) {
      setNotice(getApiError(error, 'Unable to update booking status.'))
    }
  }

  const updateServiceField = (field, value) => {
    setServiceForm((current) => ({ ...current, [field]: value }))
    setServiceErrors((current) => ({ ...current, [field]: undefined }))
  }

  const updatePrice = (tier, value) => {
    setServiceForm((current) => ({
      ...current,
      prices: { ...current.prices, [tier]: value },
    }))
    setServiceErrors((current) => ({ ...current, prices: undefined }))
  }

  const resetServiceForm = () => {
    setEditingId(null)
    setServiceForm(createEmptyServiceForm())
    setServiceErrors({})
  }

  const startEditing = (service) => {
    setEditingId(service.id)
    setServiceForm({
      title: service.title,
      category: service.category,
      description: service.description,
      image: service.image || '',
      imageFile: null,
      duration: service.duration || '60 min',
      badge: service.badge || '',
      prices: {
        hatchback: String(service.prices.hatchback),
        sedan: String(service.prices.sedan),
        suv: String(service.prices.suv),
      },
    })
    setServiceErrors({})
    document
      .getElementById('service-form')
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const handleServiceSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    const prices = {}

    if (serviceForm.title.trim().length < 3) {
      nextErrors.title = 'Enter a service name.'
    }
    if (serviceForm.description.trim().length < 10) {
      nextErrors.description = 'Add a short description (10+ characters).'
    }
    if (!serviceForm.duration.trim()) {
      nextErrors.duration = 'Add an estimated duration.'
    }

    Object.entries(serviceForm.prices).forEach(([tier, value]) => {
      const numeric = Number(value)
      if (!numeric || numeric <= 0) {
        nextErrors.prices = 'Enter a valid price for all three car tiers.'
        return
      }
      prices[tier] = numeric
    })

    setServiceErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    const payload = new FormData()
    const fields = {
      title: serviceForm.title.trim(),
      category: serviceForm.category,
      description: serviceForm.description.trim(),
      duration: serviceForm.duration.trim(),
      badge: serviceForm.badge.trim(),
    }
    Object.entries(fields).forEach(([field, value]) => payload.append(field, value))
    payload.append('prices', JSON.stringify(prices))

    if (serviceForm.imageFile) {
      payload.append('image', serviceForm.imageFile)
    } else if (!editingId) {
      payload.append('image', DEFAULT_SERVICES[0].image)
    }

    try {
      if (editingId) {
        await onUpdateService(editingId, payload)
        setNotice(`“${fields.title}” updated.`)
      } else {
        await onAddService(payload)
        setNotice(`“${fields.title}” added to the catalog.`)
      }
    } catch (error) {
      setNotice(getApiError(error, 'Unable to save service.'))
      return
    }

    resetServiceForm()
  }

  const handleDeleteService = async (service) => {
    if (!window.confirm(`Delete “${service.title}” from the catalog?`)) return
    try {
      await onDeleteService(service.id)
      if (editingId === service.id) resetServiceForm()
      setNotice(`“${service.title}” removed.`)
    } catch (error) {
      setNotice(getApiError(error, 'Unable to delete service.'))
    }
  }

  const handleResetCatalog = async () => {
    if (!window.confirm('Restore the default AutoCare service catalog?')) return
    try {
      await onResetServices()
      resetServiceForm()
      setNotice('Service catalog restored to defaults.')
    } catch (error) {
      setNotice(getApiError(error, 'Unable to restore the service catalog.'))
    }
  }

  if (!authed) {
    return (
      <div className="admin-gate">
        <div className="container">
          <div className="gate-card">
            <span className="gate-logo">
              <img src="/AutoCareLogoTagline.png" alt="AutoCare · Smart Service, Smoother Drives." />
            </span>
            <span className="gate-lock">
              <Lock size={24} />
            </span>
            <span className="eyebrow">Protected area</span>
            <h1>Admin access</h1>
            <p>
              Sign in to manage incoming bookings, update live statuses and keep
              the service catalog current.
            </p>

            <form className="gate-form" onSubmit={handleLogin}>
              <div className="field">
                <label htmlFor="admin-email">Admin email</label>
                <div className="password-wrap">
                  <Mail size={16} />
                  <input
                    id="admin-email"
                    type="email"
                    value={adminEmail}
                    onChange={(event) => {
                      setAdminEmail(event.target.value)
                      if (gateError) setGateError('')
                    }}
                    placeholder="admin@example.com"
                    autoComplete="username"
                    autoFocus
                  />
                </div>
                <label htmlFor="admin-password">Admin password</label>
                <div className="password-wrap">
                  <KeyRound size={16} />
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(event) => {
                      setAdminPassword(event.target.value)
                      if (gateError) setGateError('')
                    }}
                    placeholder="Enter admin password"
                    autoComplete="current-password"
                    aria-invalid={Boolean(gateError)}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {gateError ? (
                <p className="gate-error" role="alert">
                  {gateError}
                </p>
              ) : null}

              <button type="submit" className="btn btn-primary btn-block">
                <ShieldCheck size={17} />
                Unlock dashboard
              </button>
            </form>

            <p className="gate-demo">Use the admin credentials configured in the backend environment.</p>
            <button
              type="button"
              className="gate-back"
              onClick={() => onNavigate('home')}
            >
              Back to services
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page admin-shell">
      <aside className={`admin-sidebar${sidebarOpen ? ' is-open' : ''}`}>
        <button type="button" className="admin-sidebar-brand" onClick={() => selectSection('overview')} aria-label="Open admin overview">
          <img className="admin-sidebar-full-logo" src="/AutoCareLogoOnly.png" alt="AutoCare" />
          <img className="admin-sidebar-tagline" src="/onlytagline.png" alt="Smart Service, Smoother Drives." />
        </button>
        <nav className="admin-sidebar-nav" aria-label="Admin navigation">
          <span className="admin-nav-label">Workspace</span>
          {navigation.map((item) => {
            const Icon = item.icon
            return <button type="button" key={item.id} className={`admin-nav-item${activeSection === item.id ? ' is-active' : ''}`} onClick={() => selectSection(item.id)}><Icon size={17} /><span>{item.label}</span>{item.comingSoon ? <small>Soon</small> : null}</button>
          })}
        </nav>
        <div className="admin-sidebar-footer"><span className="admin-secure-dot" /> Protected admin workspace</div>
      </aside>
      {sidebarOpen ? <button type="button" className="admin-sidebar-backdrop" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} /> : null}
      <div className="admin-main">
        <div className="admin-center-brand" aria-hidden="true"><img src="/AutoCareLogoTagline.png" alt="" /></div>
        <header className="admin-header">
          <div className="admin-header-left">
            <button type="button" className="admin-menu-toggle" onClick={() => setSidebarOpen((open) => !open)} aria-label="Toggle admin navigation"><Menu size={20} /></button>
            <div><span className="admin-breadcrumb">Admin workspace <span>/</span> {navigation.find((item) => item.id === activeSection)?.label}</span><h1>{navigation.find((item) => item.id === activeSection)?.label}</h1></div>
          </div>
          <div className="admin-header-actions">
            <span className="live-chip"><span className="live-dot" /> Live · {stats.today} today</span>
            <NotificationBell />
            <div className="admin-profile-wrap">
              <button type="button" className="admin-header-profile" onClick={() => setProfileMenuOpen((open) => !open)} aria-expanded={profileMenuOpen} aria-label="Open admin profile menu"><span className="admin-header-avatar"><UserRound size={16} /></span><div><strong>{user?.name || 'Admin'}</strong><small>Administrator</small></div></button>
              {profileMenuOpen ? <div className="admin-profile-menu"><strong>{user?.email || 'Admin account'}</strong><small>Protected administrator access</small><button type="button" onClick={handleLogout}><LogOut size={14} /> Lock panel</button></div> : null}
            </div>
          </div>
        </header>
        <div className="container admin-content">

        {activeSection === 'overview' ? <div className="admin-section-intro"><div><span className="eyebrow"><LayoutDashboard size={13} /> Workshop overview</span><h2>Good to see you, <span className="text-red">Admin.</span></h2><p>Monitor your workshop performance and today’s service activity.</p></div><span className="live-chip"><span className="live-dot" /> {stats.today} scheduled today</span></div> : null}

        {activeSection === 'overview' ? <div className="stats-grid">
          <article className="stat-card">
            <div className="stat-top">
              <span>Total bookings</span>
              <span className="stat-icon silver">
                <ClipboardList size={18} />
              </span>
            </div>
            <strong className="stat-value">{stats.total}</strong>
            <small className="stat-hint">{stats.today} scheduled today</small>
          </article>
          <article className="stat-card">
            <div className="stat-top">
              <span>Pending</span>
              <span className="stat-icon amber">
                <Clock3 size={18} />
              </span>
            </div>
            <strong className="stat-value">{stats.pending}</strong>
            <small className="stat-hint">Awaiting approval</small>
          </article>
          <article className="stat-card">
            <div className="stat-top">
              <span>Confirmed</span>
              <span className="stat-icon blue">
                <BadgeCheck size={18} />
              </span>
            </div>
            <strong className="stat-value">{stats.confirmed}</strong>
            <small className="stat-hint">Upcoming appointments</small>
          </article>
          <article className="stat-card">
            <div className="stat-top">
              <span>Completed</span>
              <span className="stat-icon green">
                <CircleCheck size={18} />
              </span>
            </div>
            <strong className="stat-value">{stats.completed}</strong>
            <small className="stat-hint">Finished jobs</small>
          </article>
          <article className="stat-card">
            <div className="stat-top">
              <span>Revenue</span>
              <span className="stat-icon red">
                <Wallet size={18} />
              </span>
            </div>
            <strong className="stat-value stat-value-money">
              {formatPrice(stats.revenue)}
            </strong>
            <small className="stat-hint">From completed services</small>
          </article>
        </div> : null}

        {activeSection === 'overview' ? <div className="overview-grid">
          <div className="overview-main-column">
            <section className="panel overview-panel">
              <div className="panel-head"><div><h2>Recent bookings</h2><p>Latest service requests across your workshop.</p></div><button type="button" className="btn btn-ghost btn-sm" onClick={() => selectSection('bookings')}>View all</button></div>
              <div className="overview-bookings-list">{recentBookings.length ? recentBookings.map((booking) => <div className="overview-booking-row" key={booking.id}><div><strong>#{booking.id}</strong><span>{booking.name} · {booking.serviceTitle}</span></div><div><span>{formatDate(booking.date)}</span><StatusBadge status={booking.status} /></div><button type="button" className="mini-btn neutral" onClick={() => { setSelectedBooking(booking); selectSection('bookings') }}><Eye size={13} /> View</button></div>) : <div className="module-loading">No bookings yet.</div>}</div>
            </section>
            <section className="panel overview-panel activity-panel">
              <div className="panel-head"><div><h2>Revenue & activity</h2><p>Booking activity over the last 7 days.</p></div><span className="chart-legend"><i /> Bookings</span></div>
              <div className="activity-chart">{weeklyActivity.map((day) => <div className="activity-bar-wrap" key={day.label} title={`${day.count} bookings · ${formatPrice(day.revenue)} completed revenue`}><div className="activity-value">{day.count || ''}</div><div className="activity-bar-track"><div className="activity-bar" style={{ height: `${Math.max((day.count / maxWeeklyCount) * 100, day.count ? 12 : 3)}%` }} /></div><span>{day.label}</span></div>)}</div>
            </section>
          </div>
          <aside className="overview-side-column">
            <section className="panel overview-widget"><div className="widget-heading"><div><h3>Action required</h3><span>Pending approvals</span></div><span className="widget-count">{stats.pending}</span></div>{pendingBookings.length ? pendingBookings.map((booking) => <div className="action-booking" key={booking.id}><div><strong>#{booking.id}</strong><span>{booking.name}</span></div><button type="button" className="mini-btn green" onClick={() => handleBookingAction(booking, 'Confirmed')}><Check size={12} /> Approve</button></div>) : <p className="widget-empty">All bookings are up to date.</p>}<button type="button" className="widget-link" onClick={() => selectSection('bookings')}>Open bookings <span>→</span></button></section>
            <section className="panel overview-widget"><div className="widget-heading"><div><h3>Popular services</h3><span>Most requested packages</span></div><Wrench size={16} /></div>{popularServices.length ? popularServices.map((service, index) => <div className="popular-service" key={service.name}><span className="popular-rank">0{index + 1}</span><span>{service.name}</span><strong>{service.count}</strong></div>) : <p className="widget-empty">Service data will appear after bookings.</p>}</section>
            <section className="panel overview-widget quick-actions-widget"><div className="widget-heading"><div><h3>Quick shortcuts</h3><span>Common admin actions</span></div></div><button type="button" className="quick-action" onClick={() => { selectSection('services'); window.setTimeout(() => document.getElementById('service-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80) }}><Plus size={15} /><span>Add service</span><b>→</b></button><button type="button" className="quick-action" onClick={() => generateAdminOverviewPDF({ stats, recentBookings })}><BarChart3 size={15} /><span>Export PDF</span><b>↓</b></button><button type="button" className="quick-action" onClick={() => selectSection('users')}><Users size={15} /><span>Manage customers</span><b>→</b></button></section>
          </aside>
        </div> : null}

        {activeSection === 'bookings' ? <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Incoming bookings</h2>
              <p>Approve, reject or complete jobs as they move through the studio.</p>
            </div>
            <div className="panel-tools">
              <div className="admin-search">
                <Search size={15} />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search bookings…"
                  aria-label="Search bookings"
                />
              </div>
            </div>
          </div>

          <div className="admin-tabs">
            {STATUS_TABS.map((status) => (
              <button
                type="button"
                key={status}
                className={`admin-tab${statusFilter === status ? ' is-active' : ''}`}
                onClick={() => setStatusFilter(status)}
                aria-pressed={statusFilter === status}
              >
                {status}
                <span className="admin-tab-count">{countForStatus(status)}</span>
              </button>
            ))}
          </div>

          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Vehicle</th>
                  <th>Schedule</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th className="align-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => {
                  const canApprove = booking.status === 'Pending'
                  const canComplete = booking.status === 'Confirmed'
                  const canReject =
                    booking.status === 'Pending' || booking.status === 'Confirmed'

                  return (
                    <tr key={booking.id}>
                      <td>
                        <span className="table-ref">#{booking.id}</span>
                      </td>
                      <td>
                        <div className="customer-cell">
                          <strong>{booking.name}</strong>
                           <span>{booking.phone}</span>
                           <span>{booking.email || 'No email available'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="service-cell">
                          <strong>{booking.serviceTitle}</strong>
                          <span>
                            {CATEGORY_LABELS[booking.category] || booking.category}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="vehicle-cell">
                          <strong>{booking.model}</strong>
                          <span>{booking.carTypeLabel}</span>
                        </div>
                      </td>
                      <td>
                        <div className="schedule-cell">
                          <strong>{formatDate(booking.date)}</strong>
                          <span>{booking.time}</span>
                        </div>
                      </td>
                      <td className="price-cell">{formatPrice(booking.amount)}</td>
                      <td>
                        <StatusBadge status={booking.status} />
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="mini-btn neutral"
                            onClick={() => setSelectedBooking(booking)}
                            title="View booking details"
                          >
                            <Eye size={13} />
                            Details
                          </button>
                          {canApprove ? (
                            <button
                              type="button"
                              className="mini-btn green"
                              onClick={() =>
                                handleBookingAction(booking, 'Confirmed')
                              }
                              title="Approve booking"
                            >
                              <Check size={13} />
                              Approve
                            </button>
                          ) : null}
                          {canComplete ? (
                            <button
                              type="button"
                              className="mini-btn blue"
                              onClick={() =>
                                handleBookingAction(booking, 'Completed')
                              }
                              title="Mark as completed"
                            >
                              <BadgeCheck size={13} />
                              Complete
                            </button>
                          ) : null}
                          {canReject ? (
                            <button
                              type="button"
                              className="mini-btn red"
                              onClick={() =>
                                handleBookingAction(booking, 'Cancelled')
                              }
                              title="Reject booking"
                            >
                              <X size={13} />
                              Reject
                            </button>
                          ) : null}
                          {!canApprove && !canComplete && !canReject ? (
                            <span className="action-none">No actions</span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {!filteredBookings.length ? (
                  <tr>
                    <td colSpan="8">
                      <div className="table-empty">
                        <Search size={24} />
                        <strong>No bookings match your filters</strong>
                        <span>Try a different status or clear the search field.</span>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => {
                            setStatusFilter('All')
                            setSearch('')
                          }}
                        >
                          Clear filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section> : null}

        {activeSection === 'services' ? <section className="panel services-manager">
          <div className="panel-head">
            <div>
              <h2>Service catalog</h2>
              <p>Add, edit or remove services. Changes appear on the home page instantly.</p>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleResetCatalog}
            >
              <RotateCcw size={14} />
              Reset catalog
            </button>
          </div>

          <div className="services-manager-grid">
            <div className="service-form-wrap" id="service-form">
              <div className="form-head">
                <span className="form-head-icon">
                  {editingId ? <Pencil size={18} /> : <Plus size={18} />}
                </span>
                <div>
                  <h3>{editingId ? 'Edit service' : 'Add a service'}</h3>
                  <p>
                    {editingId
                      ? 'Update the details and save your changes.'
                      : 'Create a new package for the AutoCare menu.'}
                  </p>
                </div>
              </div>

              <form className="service-form" onSubmit={handleServiceSubmit}>
                <div className="field">
                  <label htmlFor="service-title">Service name</label>
                  <input
                    id="service-title"
                    type="text"
                    value={serviceForm.title}
                    onChange={(event) =>
                      updateServiceField('title', event.target.value)
                    }
                    placeholder="e.g. Headlight Restoration"
                    aria-invalid={Boolean(serviceErrors.title)}
                  />
                  {serviceErrors.title ? (
                    <span className="field-error">{serviceErrors.title}</span>
                  ) : null}
                </div>

                <div className="form-row-2">
                  <div className="field">
                    <label htmlFor="service-category">Category</label>
                    <select
                      id="service-category"
                      value={serviceForm.category}
                      onChange={(event) =>
                        updateServiceField('category', event.target.value)
                      }
                    >
                      {SERVICE_CATEGORIES.filter(
                        (category) => category.id !== 'all',
                      ).map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="service-duration">Duration</label>
                    <input
                      id="service-duration"
                      type="text"
                      value={serviceForm.duration}
                      onChange={(event) =>
                        updateServiceField('duration', event.target.value)
                      }
                      placeholder="e.g. 60 min"
                      aria-invalid={Boolean(serviceErrors.duration)}
                    />
                    {serviceErrors.duration ? (
                      <span className="field-error">{serviceErrors.duration}</span>
                    ) : null}
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="service-description">Description</label>
                  <textarea
                    id="service-description"
                    rows="2"
                    value={serviceForm.description}
                    onChange={(event) =>
                      updateServiceField('description', event.target.value)
                    }
                    placeholder="What's included in this service?"
                    aria-invalid={Boolean(serviceErrors.description)}
                  />
                  {serviceErrors.description ? (
                    <span className="field-error">
                      {serviceErrors.description}
                    </span>
                  ) : null}
                </div>

                <div className="field">
                  <label htmlFor="service-image">Service image (optional)</label>
                  <input
                    id="service-image"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(event) =>
                      updateServiceField('imageFile', event.target.files?.[0] || null)
                    }
                  />
                  {serviceForm.image && !serviceForm.imageFile ? (
                    <span className="field-hint">Current image will be kept unless you select a new file.</span>
                  ) : null}
                </div>

                <div className="field">
                  <label htmlFor="service-badge">Badge (optional)</label>
                  <input
                    id="service-badge"
                    type="text"
                    value={serviceForm.badge}
                    onChange={(event) =>
                      updateServiceField('badge', event.target.value)
                    }
                    placeholder="e.g. Popular"
                  />
                </div>

                <div className="field">
                  <span className="field-label">Pricing by car tier</span>
                  <div className="price-inputs">
                    {[
                      { id: 'hatchback', label: 'Hatchback' },
                      { id: 'sedan', label: 'Sedan' },
                      { id: 'suv', label: 'SUV' },
                    ].map((tier) => (
                      <label className="price-input" key={tier.id}>
                        <span>{tier.label}</span>
                        <div>
                          <em>Rs</em>
                          <input
                            type="number"
                            min="0"
                            step="100"
                            value={serviceForm.prices[tier.id]}
                            onChange={(event) =>
                              updatePrice(tier.id, event.target.value)
                            }
                            placeholder="0"
                            aria-label={`${tier.label} price in rupees`}
                          />
                        </div>
                      </label>
                    ))}
                  </div>
                  {serviceErrors.prices ? (
                    <span className="field-error">{serviceErrors.prices}</span>
                  ) : null}
                </div>

                <div className="service-form-actions">
                  <button type="submit" className="btn btn-primary btn-sm">
                    {editingId ? (
                      <>
                        <Check size={14} />
                        Save changes
                      </>
                    ) : (
                      <>
                        <Plus size={14} />
                        Add service
                      </>
                    )}
                  </button>
                  {editingId ? (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={resetServiceForm}
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
              </form>
            </div>

            <div className="service-catalog">
              <div className="catalog-head">
                <span>
                  <Wrench size={14} />
                  {services.length} live services
                </span>
                <small>Home page catalog</small>
              </div>

              <div className="catalog-list">
                {services.map((service) => (
                  <div className="catalog-item" key={service.id}>
                    <div className="catalog-thumb">
                      <img
                        src={service.image}
                        alt=""
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                    <div className="catalog-info">
                      <strong>{service.title}</strong>
                      <span>
                        {CATEGORY_LABELS[service.category] || service.category} ·{' '}
                        {service.duration}
                      </span>
                    </div>
                    <span className="catalog-price">
                      {formatPrice(getStartingPrice(service))}
                    </span>
                    <div className="catalog-actions">
                      <button
                        type="button"
                        className="icon-action"
                        onClick={() => startEditing(service)}
                        aria-label={`Edit ${service.title}`}
                        title="Edit service"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        className="icon-action icon-action-danger"
                        onClick={() => handleDeleteService(service)}
                        aria-label={`Delete ${service.title}`}
                        title="Delete service"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}

                {!services.length ? (
                  <div className="catalog-empty">
                    <Wrench size={22} />
                    <p>No services in the catalog yet.</p>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={handleResetCatalog}
                    >
                      Restore defaults
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section> : null}

        {activeSection === 'users' ? <section className="panel admin-module-panel">
          <div className="panel-head"><div><h2>Registered customers</h2><p>Every customer account created on AutoCare, including profile and booking activity.</p></div><div className="admin-module-tools"><span className="module-count">{customers.length} registered</span><div className="admin-search"><Search size={15} /><input type="search" value={customerSearch} onChange={(event) => setCustomerSearch(event.target.value)} placeholder="Search customers…" aria-label="Search customers" /></div></div></div>
          {moduleError ? <p className="field-error">{moduleError}</p> : null}
          {moduleLoading ? <div className="module-loading">Loading registered customers…</div> : <div className="table-wrap"><table className="admin-table customers-table"><thead><tr><th>Customer</th><th>Contact</th><th>Bookings</th><th>Activity</th><th>Completed value</th><th>Registered</th></tr></thead><tbody>{filteredCustomers.map((customer) => <tr key={customer.id}><td><div className="customer-profile-cell"><span className="customer-avatar">{customer.profilePicture ? <img src={customer.profilePicture} alt="" /> : customer.name?.slice(0, 1).toUpperCase()}</span><div><strong>{customer.name}</strong><span>{customer.email}</span></div></div></td><td><span className="table-muted">{customer.phone || 'No phone on booking'}</span></td><td><strong>{customer.totalBookings}</strong><span className="table-substats">{customer.completed} completed · {customer.cancelled} cancelled</span></td><td><span className="table-substats">{customer.pending} pending · {customer.confirmed} confirmed</span></td><td className="price-cell">{formatPrice(customer.completedRevenue)}</td><td><span className="table-muted">{customer.registeredAt ? formatDate(customer.registeredAt) : '—'}</span></td></tr>)}{!filteredCustomers.length ? <tr><td colSpan="6"><div className="table-empty"><Users size={24} /><strong>No registered customers found</strong><span>New customer accounts will appear here.</span></div></td></tr> : null}</tbody></table></div>}
        </section> : null}

        {activeSection === 'reviews' ? <section className="panel admin-module-panel">
          <div className="panel-head">
            <div>
              <h2>Customer reviews</h2>
              <p>Review customer feedback and remove spam or inappropriate submissions.</p>
            </div>
            <span className="module-count">{reviews.length} reviews</span>
          </div>
          {moduleError ? <p className="field-error" role="alert">{moduleError}</p> : null}
          {moduleLoading ? (
            <div className="module-loading" role="status">Loading customer reviews…</div>
          ) : !moduleError && reviews.length === 0 ? (
            <div className="table-empty review-admin-empty">
              <MessageSquareQuote size={24} />
              <strong>No customer reviews yet</strong>
              <span>Customer reviews will appear here when submitted.</span>
            </div>
          ) : !moduleError ? (
            <div className="table-wrap">
              <table className="admin-table reviews-admin-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Rating</th>
                    <th>Service</th>
                    <th>Comment</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => {
                    const createdAt = review.createdAt ? String(review.createdAt) : ''
                    const date = createdAt ? new Date(createdAt) : null
                    const dateLabel = date && !Number.isNaN(date.getTime())
                      ? formatDate(date.toISOString().slice(0, 10))
                      : '—'
                    const rating = Number(review.rating)

                    return (
                      <tr key={review._id}>
                        <td><strong className="review-admin-name">{review.name || '—'}</strong></td>
                        <td>
                          <span className="review-admin-rating" aria-label={`${rating} out of 5 stars`}>
                            {Array.from({ length: 5 }, (_, index) => (
                              <Star
                                key={index}
                                size={14}
                                fill={index < rating ? 'currentColor' : 'none'}
                                aria-hidden="true"
                              />
                            ))}
                          </span>
                        </td>
                        <td><span className="table-muted">{review.serviceName || '—'}</span></td>
                        <td><p className="review-admin-comment">{review.comment || '—'}</p></td>
                        <td><span className="table-muted">{dateLabel}</span></td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-danger-outline btn-sm review-admin-delete"
                            onClick={() => handleDeleteReview(review)}
                            disabled={deletingReviewId === review._id}
                            aria-label={`Delete review from ${review.name || 'customer'}`}
                          >
                            <Trash2 size={13} />
                            {deletingReviewId === review._id ? 'Deleting…' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
        </section> : null}

        {activeSection === 'messages' ? <AdminMessages /> : null}
        {activeSection === 'about' ? <AdminAbout /> : null}

        {activeSection === 'reports' ? <section className="reports-stack">
          <div className="panel reports-toolbar"><div><span className="eyebrow"><BarChart3 size={13} /> Workshop analytics</span><h2>Reports & <span className="text-red">performance.</span></h2><p>Review booking activity, completed revenue and service demand.</p></div><div className="report-filters"><label>From<input type="date" value={reportRange.from} onChange={(event) => setReportRange((current) => ({ ...current, from: event.target.value }))} /></label><label>To<input type="date" value={reportRange.to} onChange={(event) => setReportRange((current) => ({ ...current, to: event.target.value }))} /></label><button type="button" className="btn btn-primary btn-sm" onClick={downloadReportCsv} disabled={!report?.exportData?.length}>Export CSV</button></div></div>
          {moduleError ? <p className="field-error">{moduleError}</p> : null}
          {moduleLoading ? <div className="module-loading">Loading analytics…</div> : report ? <><div className="report-stat-grid"><article className="stat-card"><span>Total bookings</span><strong>{report.summary.totalBookings}</strong><small>Selected period</small></article><article className="stat-card"><span>Completed revenue</span><strong className="stat-value-money">{formatPrice(report.summary.completedRevenue)}</strong><small>Completed services</small></article><article className="stat-card"><span>Estimated value</span><strong className="stat-value-money">{formatPrice(report.summary.estimatedValue)}</strong><small>All booking requests</small></article><article className="stat-card"><span>Cancelled</span><strong>{report.summary.Cancelled}</strong><small>Requests cancelled</small></article></div><div className="reports-grid"><div className="panel report-card"><h3>Status breakdown</h3>{report.statusBreakdown.map((item) => <div className="report-row" key={item.status}><span><StatusBadge status={item.status} /></span><strong>{item.count}</strong></div>)}</div><div className="panel report-card"><h3>Popular services</h3>{report.serviceBreakdown.length ? report.serviceBreakdown.slice(0, 6).map((item) => <div className="report-row" key={item.service}><span>{item.service}</span><strong>{item.bookings}</strong></div>) : <p className="table-muted">No service data for this period.</p>}</div></div><div className="panel report-card"><h3>Daily activity</h3><div className="daily-report-list">{report.dailyBookings.length ? report.dailyBookings.map((item) => <div className="report-row" key={item.date}><span>{formatDate(item.date)}</span><strong>{item.count} bookings · {formatPrice(item.revenue)}</strong></div>) : <p className="table-muted">No bookings for this period.</p>}</div></div></> : null}
        </section> : null}
      </div>

      {selectedBooking ? (
        <div className="modal-overlay admin-detail-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedBooking(null) }}>
          <section className="booking-modal admin-detail-modal" role="dialog" aria-modal="true" aria-labelledby="admin-booking-detail-title">
            <button type="button" className="modal-close" onClick={() => setSelectedBooking(null)} aria-label="Close booking details"><X size={18} /></button>
            <div className="modal-head">
              <div>
                <span className="eyebrow">Booking #{selectedBooking.id}</span>
                <h2 id="admin-booking-detail-title">Booking details</h2>
                <p>Complete customer, vehicle and service information.</p>
              </div>
              <StatusBadge status={selectedBooking.status} />
            </div>
            <div className="admin-detail-grid">
              <div className="admin-detail-block"><span>Customer</span><strong>{selectedBooking.name}</strong><small>{selectedBooking.email || 'No email available'}</small><small>{selectedBooking.phone}</small></div>
              <div className="admin-detail-block"><span>Vehicle</span><strong>{selectedBooking.model}</strong><small>{selectedBooking.carTypeLabel}</small></div>
              <div className="admin-detail-block"><span>Schedule</span><strong>{formatDate(selectedBooking.date)}</strong><small>{selectedBooking.time}</small></div>
              <div className="admin-detail-block"><span>Total amount</span><strong>{formatPrice(selectedBooking.amount)}</strong><small>{selectedBooking.status === 'Cancelled' ? 'Booking cancelled' : 'Estimated amount'}</small></div>
            </div>
            <div className="admin-detail-services">
              <h3>Selected services</h3>
              {(selectedBooking.services?.length ? selectedBooking.services : [{ serviceName: selectedBooking.serviceTitle, amount: selectedBooking.amount }]).map((service, index) => (
                <div className="admin-detail-service" key={`${service.serviceName}-${index}`}><span>{service.serviceName}</span><strong>{formatPrice(service.amount)}</strong></div>
              ))}
            </div>
            {selectedBooking.cancellationReason ? <div className="admin-cancellation-note"><strong>Cancellation reason</strong><p>{selectedBooking.cancellationReason}</p></div> : null}
          </section>
        </div>
      ) : null}

      {notice ? (
        <div className="toast" role="status">
          <CircleCheck size={17} />
          {notice}
        </div>
      ) : null}
      </div>
    </div>
  )
}

export default AdminDashboard
