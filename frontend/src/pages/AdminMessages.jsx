import { useEffect, useState } from 'react'
import {
  Check,
  CircleCheck,
  CircleX,
  Eye,
  Mail,
  MessageSquareText,
  RotateCcw,
  Send,
  X,
} from 'lucide-react'
import {
  fetchAdminContactMessages,
  getApiError,
  sendContactReply,
  updateContactMessageStatus,
} from '../lib/api'

function formatMessageDate(value) {
  const date = value ? new Date(value) : null
  if (!date || Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function AdminMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [updatingId, setUpdatingId] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [replySubject, setReplySubject] = useState('')
  const [replyBody, setReplyBody] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [replyError, setReplyError] = useState('')
  const [notice, setNotice] = useState('')
  const [filter, setFilter] = useState('All')
  const [viewingMessage, setViewingMessage] = useState(null)

  useEffect(() => {
    if (!notice) return undefined
    const timer = window.setTimeout(() => setNotice(null), 3600)
    return () => window.clearTimeout(timer)
  }, [notice])

  useEffect(() => {
    let active = true
    fetchAdminContactMessages()
      .then((result) => {
        if (!Array.isArray(result)) throw new Error('Contact messages returned by the server are invalid.')
        if (active) setMessages(result)
      })
      .catch((requestError) => {
        if (active) setError(getApiError(requestError, 'Unable to load contact messages.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [retryCount])

  const refresh = () => {
    setError('')
    setLoading(true)
    setRetryCount((count) => count + 1)
  }

  const openReply = (message) => {
    setReplyingTo(message)
    setReplySubject(`Re: ${message.subject || 'AutoCare enquiry'}`)
    setReplyBody('')
    setReplyError('')
  }

  const closeReply = () => {
    if (sendingReply) return
    setReplyingTo(null)
    setReplyError('')
  }

  const handleReplySubmit = async (event) => {
    event.preventDefault()
    if (!replyingTo || sendingReply) return
    setSendingReply(true)
    setReplyError('')
    try {
      const updated = await sendContactReply(replyingTo._id, {
        subject: replySubject.trim(),
        message: replyBody.trim(),
      })
      setMessages((current) => current.map((item) => item._id === updated._id ? updated : item))
      setReplyingTo(null)
      setNotice({ type: 'success', title: 'Reply sent', message: `Reply sent to ${updated.email}.` })
      try {
        const refreshed = await fetchAdminContactMessages()
        if (!Array.isArray(refreshed)) throw new Error('Contact messages returned by the server are invalid.')
        setMessages(refreshed)
      } catch (refreshError) {
        setNotice({
          type: 'error',
          title: 'Inbox refresh failed',
          message: `Your reply was sent, but the inbox could not be refreshed: ${getApiError(refreshError, 'Please refresh the page.')}`,
        })
      }
    } catch (requestError) {
      const errorMessage = getApiError(requestError, 'Unable to send the reply. Please try again.')
      setReplyError(errorMessage)
      setNotice({ type: 'error', title: 'Reply failed', message: errorMessage })
    } finally {
      setSendingReply(false)
    }
  }

  const handleSetStatus = async (message, status) => {
    if (updatingId) return
    setUpdatingId(message._id)
    setError('')
    try {
      const updated = await updateContactMessageStatus(message._id, status)
      setMessages((current) => current.map((item) => item._id === updated._id ? updated : item))
    } catch (requestError) {
      setError(getApiError(requestError, 'Could not update the message status.'))
    } finally {
      setUpdatingId('')
    }
  }

  const filteredMessages = messages.filter((message) => {
    if (filter === 'Replied') return message.status === 'Replied'
    if (filter === 'Pending') return message.status !== 'Replied'
    return true
  })

  const filterCounts = {
    All: messages.length,
    Pending: messages.filter((message) => message.status !== 'Replied').length,
    Replied: messages.filter((message) => message.status === 'Replied').length,
  }
  const hasViewingReply = Boolean(
    viewingMessage
    && (viewingMessage.status === 'Replied' || viewingMessage.replyMessage || viewingMessage.repliedAt),
  )

  return (
    <section className="panel admin-module-panel admin-messages-panel">
      <div className="panel-head">
        <div>
          <h2>Contact messages</h2>
          <p>Customer questions and enquiries sent through the Contact Us form.</p>
        </div>
        <span className="module-count">{messages.length} messages</span>
      </div>

      {error ? (
        <div className="admin-messages-error" role="alert">
          <p>{error}</p>
          {!loading ? (
            <button type="button" className="btn btn-ghost btn-sm" onClick={refresh}>
              <RotateCcw size={13} />
              Try again
            </button>
          ) : null}
        </div>
      ) : null}

      {notice ? (
        <div className={`toast admin-messages-toast${notice.type === 'success' ? ' toast-success' : ' toast-error'}`} role={notice.type === 'error' ? 'alert' : 'status'}>
          <span className="toast-icon">
            {notice.type === 'success' ? <CircleCheck size={17} /> : <CircleX size={17} />}
          </span>
          <div>
            <strong>{notice.title}</strong>
            <span>{notice.message}</span>
          </div>
        </div>
      ) : null}

      <div className="admin-message-filters" role="tablist" aria-label="Filter contact messages">
        {['All', 'Pending', 'Replied'].map((item) => (
          <button
            type="button"
            key={item}
            role="tab"
            aria-selected={filter === item}
            className={filter === item ? 'is-active' : ''}
            onClick={() => setFilter(item)}
          >
            {item}
            <span>{filterCounts[item]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="module-loading" role="status">Loading contact messages…</div>
      ) : null}

      {!loading && !error && filteredMessages.length === 0 ? (
        <div className="table-empty review-admin-empty">
          <MessageSquareText size={24} />
          <strong>{messages.length ? `No ${filter.toLowerCase()} messages` : 'No contact messages yet'}</strong>
          <span>{messages.length ? 'Try another filter to see more customer enquiries.' : 'New customer enquiries will appear here.'}</span>
        </div>
      ) : null}

      {!loading && !error && filteredMessages.length > 0 ? (
        <div className="table-wrap">
          <table className="admin-table admin-messages-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>Subject</th>
                <th>Message</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredMessages.map((message) => {
                const pending = message.status !== 'Replied'

                return (
                  <tr key={message._id} className={pending ? 'is-unread' : ''}>
                    <td><strong className="review-admin-name">{message.name || '—'}</strong></td>
                    <td>
                      <span className="admin-message-contact">
                        {message.email || '—'}
                      </span>
                      <a className="admin-message-contact" href={`tel:${encodeURIComponent(message.phone || '')}`}>
                        {message.phone || '—'}
                      </a>
                    </td>
                    <td><span className="table-muted">{message.subject || '—'}</span></td>
                    <td>
                      <button
                        type="button"
                        className="admin-message-view"
                        onClick={() => setViewingMessage(message)}
                        aria-label={`View message from ${message.name || 'customer'}`}
                      >
                        <Eye size={13} />
                        View details
                      </button>
                    </td>
                    <td><time className="table-muted" dateTime={message.createdAt || undefined}>{formatMessageDate(message.createdAt)}</time></td>
                    <td>
                      <span className={`admin-message-status${pending ? ' is-pending' : ' is-replied'}`}>
                        {pending ? 'Pending' : 'Replied'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-message-actions">
                        <button
                          type="button"
                          className="btn btn-primary btn-sm admin-message-reply"
                          onClick={() => openReply(message)}
                          aria-label={`Reply to ${message.name || 'customer'}`}
                        >
                          <Mail size={13} />
                          Reply
                        </button>
                        <button
                          type="button"
                          className="admin-message-toggle"
                          onClick={() => handleSetStatus(message, message.status === 'Unread' ? 'Read' : 'Unread')}
                          disabled={updatingId === message._id}
                        >
                          <Check size={12} />
                          {message.status === 'Unread' ? 'Mark read' : 'Mark unread'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      {viewingMessage ? (
        <div
          className="modal-overlay admin-reply-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setViewingMessage(null)
          }}
        >
          <section
            className="booking-modal admin-reply-modal admin-message-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-message-detail-title"
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => setViewingMessage(null)}
              aria-label="Close message details"
            >
              <X size={18} />
            </button>
            <div className="modal-head">
              <span className="eyebrow">{hasViewingReply ? 'Reply history' : 'Customer inquiry'}</span>
              <h2 id="admin-message-detail-title">{viewingMessage.subject || 'Contact enquiry'}</h2>
              <p>{viewingMessage.name || 'Customer'} · {viewingMessage.email || '—'}</p>
            </div>
            <div className="admin-message-detail-content">
              <article>
                <div className="admin-message-detail-heading">
                  <strong>Original inquiry</strong>
                  <time dateTime={viewingMessage.createdAt || undefined}>{formatMessageDate(viewingMessage.createdAt)}</time>
                </div>
                <p>{viewingMessage.message || 'No message content.'}</p>
              </article>
              {hasViewingReply ? (
                <article className="is-reply">
                  <div className="admin-message-detail-heading">
                    <strong>AutoCare reply</strong>
                    <time dateTime={viewingMessage.repliedAt || undefined}>{formatMessageDate(viewingMessage.repliedAt)}</time>
                  </div>
                  <p>{viewingMessage.replyMessage || 'Reply history is not available for this message.'}</p>
                </article>
              ) : null}
            </div>
            <div className="admin-reply-actions admin-message-detail-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setViewingMessage(null)}>Close</button>
              {viewingMessage.status !== 'Replied' ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    openReply(viewingMessage)
                    setViewingMessage(null)
                  }}
                >
                  <Mail size={14} />
                  Reply
                </button>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}

      {replyingTo ? (
        <div
          className="modal-overlay admin-reply-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeReply()
          }}
        >
          <section
            className="booking-modal admin-reply-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-reply-title"
          >
            <button
              type="button"
              className="modal-close"
              onClick={closeReply}
              disabled={sendingReply}
              aria-label="Close reply"
            >
              <X size={18} />
            </button>
            <div className="modal-head">
              <span className="eyebrow">Customer inquiry</span>
              <h2 id="admin-reply-title">Reply to {replyingTo.name}</h2>
              <p>Your reply will be sent directly to the customer by email.</p>
            </div>
            <form className="admin-reply-form" onSubmit={handleReplySubmit}>
              <div className="field">
                <label htmlFor="admin-reply-email">Customer email</label>
                <input id="admin-reply-email" type="email" value={replyingTo.email || ''} disabled />
              </div>
              <div className="field">
                <label htmlFor="admin-reply-subject">Subject</label>
                <input
                  id="admin-reply-subject"
                  value={replySubject}
                  onChange={(event) => setReplySubject(event.target.value)}
                  maxLength={160}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="admin-reply-message">Reply message</label>
                <textarea
                  id="admin-reply-message"
                  value={replyBody}
                  onChange={(event) => setReplyBody(event.target.value)}
                  rows={7}
                  maxLength={5000}
                  placeholder="Write your reply to the customer…"
                  required
                />
              </div>
              {replyError ? <p className="field-error" role="alert">{replyError}</p> : null}
              <div className="admin-reply-actions">
                <button type="button" className="btn btn-ghost" onClick={closeReply} disabled={sendingReply}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={sendingReply || !replyBody.trim()}>
                  <Send size={14} />
                  {sendingReply ? 'Sending…' : 'Send Email'}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </section>
  )
}

export default AdminMessages
