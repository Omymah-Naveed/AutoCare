import { useCallback, useEffect, useState } from 'react'
import { CircleCheck } from 'lucide-react'
import './App.css'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import AdminDashboard from './pages/AdminDashboard'
import CustomerProfile from './pages/CustomerProfile'
import ForgotPassword from './pages/ForgotPassword'
import Home from './pages/Home'
import LoginSignup from './pages/LoginSignup'
import ResetPassword from './pages/ResetPassword'
import TrackBooking from './pages/TrackBooking'
import {
  cloneDefaultServices,
} from './lib/data'
import {
  addService as addServiceApi,
  createBooking as createBookingApi,
  deleteService as deleteServiceApi,
  fetchAdminBookings,
  fetchServices,
  getApiError,
  updateBookingStatus as updateBookingStatusApi,
  updateService as updateServiceApi,
} from './lib/api'

function App() {
  const getRoutePage = () => {
    const path = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/'
    if (path === '/admin-login' || path === '/admin') return 'admin'
    if (path === '/reset-password') return 'reset'
    if (path === '/forgot-password') return 'forgot'
    return 'home'
  }

  const [activePage, setActivePage] = useState(getRoutePage)
  const [services, setServices] = useState([])
  const [bookings, setBookings] = useState([])
  const [dataError, setDataError] = useState('')
  const [trackQuery, setTrackQuery] = useState('')
  const [resetToken] = useState(() => new URLSearchParams(window.location.search).get('token') || '')
  const [appNotice, setAppNotice] = useState('')
  const [user, setUser] = useState(() => {
    try {
      if (!window.localStorage.getItem('autocare.token.v1')) return null
      const stored = window.localStorage.getItem('autocare.user.v1')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    fetchServices()
      .then(setServices)
      .catch((error) => setDataError(getApiError(error, 'Unable to load services.')))
  }, [])

  useEffect(() => {
    try {
      if (user) {
        window.localStorage.setItem('autocare.user.v1', JSON.stringify(user))
      } else {
        window.localStorage.removeItem('autocare.user.v1')
      }
    } catch {
      // The app still works if browser storage is unavailable.
    }
  }, [user])

  useEffect(() => {
    if (!appNotice) return undefined
    const timer = window.setTimeout(() => setAppNotice(''), 3600)
    return () => window.clearTimeout(timer)
  }, [appNotice])

  const navigate = (page, target) => {
    if (page === 'track') setTrackQuery('')
    setActivePage(page)

    if (page === 'admin') {
      window.history.pushState({}, '', '/admin-login')
    } else if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/')
    }

    if (page === 'home' && target) {
      window.setTimeout(() => {
        document
          .getElementById(target)
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 120)
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const openTrackBooking = (bookingId) => {
    setTrackQuery(bookingId)
    setActivePage('track')
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/')
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const createBooking = (draft) => {
    return createBookingApi({
      customerName: draft.name,
      phone: draft.phone,
      carSubType: ({ hatchback: 'Hatchback', sedan: 'Sedan', suv: 'SUV' })[draft.carType],
      carModel: draft.model,
      serviceName: draft.serviceTitle,
      serviceId: draft.serviceId,
      services: draft.services,
      date: draft.date,
      timeSlot: draft.time,
      amount: draft.amount,
    })
  }

  const updateBookingStatus = async (bookingId, status, cancellationReason = '') => {
    const updated = await updateBookingStatusApi(bookingId, status, cancellationReason)
    setBookings((current) => current.map((booking) => booking.id === bookingId ? updated : booking))
    return updated
  }

  const addService = async (service) => {
    const created = await addServiceApi(service)
    setServices((current) => [created, ...current])
    return created
  }

  const updateService = async (serviceId, updates) => {
    const updated = await updateServiceApi(serviceId, updates)
    setServices((current) => current.map((service) => service._id === serviceId || service.id === serviceId ? updated : service))
    return updated
  }

  const deleteService = async (serviceId) => {
    await deleteServiceApi(serviceId)
    setServices((current) => current.filter((service) => service._id !== serviceId && service.id !== serviceId))
  }

  const resetServices = async () => {
    await Promise.all(services.map((service) => deleteServiceApi(service.id)))
    const defaults = cloneDefaultServices()
    const restored = await Promise.all(
      defaults.map((service) => addServiceApi(service)),
    )
    setServices(restored)
    return restored
  }

  const loadAdminBookings = async () => {
    const loaded = await fetchAdminBookings()
    setBookings(loaded)
    return loaded
  }

  const persistAuth = (account, token) => {
    window.localStorage.setItem('autocare.token.v1', token)
    setUser(account)
  }

  const handleAuthSuccess = (account, token) => {
    persistAuth(account, token)
    setAppNotice(`Welcome back, ${account.name || 'AutoCare customer'}!`)
    navigate('home')
  }

  const handleAdminAuthSuccess = (account, token) => {
    persistAuth(account, token)
    setAppNotice('Welcome to the AutoCare Admin Panel!')
  }

  const handleLogout = () => {
    window.localStorage.removeItem('autocare.token.v1')
    setUser(null)
    setAppNotice('You have been logged out successfully.')
    navigate('home')
  }

  const handleProfileUpdated = useCallback((account) => {
    setUser(account)
  }, [])

  useEffect(() => {
    const handlePopState = () => setActivePage(getRoutePage())
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return (
    <div className="app">
      {activePage !== 'admin' ? <Navbar
        activePage={activePage}
        onNavigate={navigate}
        user={user}
        onLogout={handleLogout}
      /> : null}

      <main className={`app-main${activePage === 'admin' ? ' admin-context' : ''}`}>
        {activePage === 'home' ? (
          <Home
            services={services}
            user={user}
            onCreateBooking={createBooking}
            onTrack={openTrackBooking}
            onNavigate={navigate}
          />
        ) : null}

        {dataError && activePage === 'home' ? (
          <div className="container api-error" role="alert">{dataError}</div>
        ) : null}

        {activePage === 'track' ? (
          <TrackBooking
            initialQuery={trackQuery}
            onBrowse={() => navigate('home', 'services')}
          />
        ) : null}

        {activePage === 'admin' ? (
          <AdminDashboard
            bookings={bookings}
            services={services}
            onUpdateStatus={updateBookingStatus}
            onAddService={addService}
            onUpdateService={updateService}
            onDeleteService={deleteService}
            onResetServices={resetServices}
            onNavigate={navigate}
            onLoadBookings={loadAdminBookings}
            user={user}
            onAuthSuccess={handleAdminAuthSuccess}
            onLogout={handleLogout}
          />
        ) : null}

        {activePage === 'auth' ? (
          <LoginSignup onSuccess={handleAuthSuccess} onNavigate={navigate} />
        ) : null}

        {activePage === 'forgot' ? <ForgotPassword onNavigate={navigate} /> : null}

        {activePage === 'reset' ? (
          <ResetPassword token={resetToken} onNavigate={navigate} />
        ) : null}

        {activePage === 'profile' && user ? (
          <CustomerProfile
            user={user}
            onProfileUpdated={handleProfileUpdated}
            onNavigate={navigate}
          />
        ) : null}
      </main>

      {activePage !== 'admin' ? <Footer onNavigate={navigate} /> : null}
      {appNotice ? <div className="toast toast-success app-auth-toast" role="status"><span className="toast-icon"><CircleCheck size={17} /></span><div><strong>{appNotice}</strong><span>{appNotice.includes('logged out') ? 'See you next time.' : 'Your account session is now active.'}</span></div></div> : null}
    </div>
  )
}

export default App
