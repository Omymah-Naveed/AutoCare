import { useEffect, useRef, useState } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { fetchNotifications, getApiError, markAllNotificationsRead, markNotificationRead } from '../lib/api'

function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [error, setError] = useState('')
  const ref = useRef(null)

  const load = async () => {
    try {
      const data = await fetchNotifications()
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
      setError('')
    } catch (requestError) {
      setError(getApiError(requestError, 'Unable to load notifications.'))
    }
  }

  useEffect(() => {
    // Load the user's notification state when the authenticated shell mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
    const timer = window.setInterval(load, 30000)
    const close = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('pointerdown', close)
    }
  }, [])

  const markRead = async (notification) => {
    if (!notification.isRead) {
      await markNotificationRead(notification._id)
      setNotifications((current) => current.map((item) => item._id === notification._id ? { ...item, isRead: true } : item))
      setUnreadCount((count) => Math.max(0, count - 1))
    }
  }

  const markAllRead = async () => {
    await markAllNotificationsRead()
    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })))
    setUnreadCount(0)
  }

  return (
    <div className="notification-bell-wrap" ref={ref}>
      <button type="button" className={`notification-bell${open ? ' is-open' : ''}`} onClick={() => setOpen((value) => !value)} aria-label="Notifications" aria-expanded={open}>
        <Bell size={17} />
        {unreadCount ? <span className="notification-count">{unreadCount > 9 ? '9+' : unreadCount}</span> : null}
      </button>
      {open ? (
        <div className="notification-panel">
          <div className="notification-panel-head"><div><strong>Notifications</strong><small>{unreadCount ? `${unreadCount} unread` : 'All caught up'}</small></div>{unreadCount ? <button type="button" onClick={markAllRead}><CheckCheck size={14} /> Read all</button> : null}</div>
          {error ? <p className="notification-error">{error}</p> : null}
          {notifications.length ? <div className="notification-list">{notifications.map((notification) => <button type="button" className={`notification-item${notification.isRead ? '' : ' is-unread'}`} key={notification._id} onClick={() => markRead(notification)}><span className="notification-dot" /><span><strong>{notification.message}</strong><small>Booking #{notification.bookingId} · {new Date(notification.createdAt).toLocaleDateString('en-GB')}</small></span></button>)}</div> : <div className="notification-empty"><Bell size={22} /><span>No notifications yet.</span></div>}
        </div>
      ) : null}
    </div>
  )
}

export default NotificationBell
