import axios from 'axios'

// Relative base URL keeps local development and the unified Vercel deployment
// on the same `/api` endpoints. Vite proxies `/api` to the backend in dev.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('autocare.token.v1')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export function getApiError(error, fallback = 'Something went wrong. Please try again.') {
  return error.response?.data?.message || error.message || fallback
}

export function normalizeBooking(booking) {
  return {
    ...booking,
    user: booking.userId && typeof booking.userId === 'object' ? booking.userId : undefined,
    email: booking.userId?.email || booking.customerEmail || '',
    id: booking.bookingId,
    name: booking.customerName,
    serviceTitle: booking.serviceName,
    carType: booking.carSubType?.toLowerCase(),
    carTypeLabel: booking.carSubType,
    model: booking.carModel,
    time: booking.timeSlot,
  }
}

export function normalizeService(service) {
  return { ...service, id: service._id || service.id }
}

export async function fetchServices() {
  const { data } = await api.get('/services')
  return data.map(normalizeService)
}

export async function createBooking(payload) {
  const { data } = await api.post('/bookings', payload)
  return normalizeBooking(data)
}

export async function fetchSlotAvailability(date) {
  const { data } = await api.get('/bookings/slot-availability', { params: { date } })
  return data
}

export async function trackBookings(query) {
  const { data } = await api.get('/bookings/track', { params: { query } })
  return data.map(normalizeBooking)
}

export async function fetchProfile() {
  const { data } = await api.get('/users/profile')
  return data
}

export async function updateProfile({ name, profilePicture }) {
  const formData = new FormData()
  if (name) formData.append('name', name)
  if (profilePicture) formData.append('profilePicture', profilePicture)
  const { data } = await api.put('/users/profile', formData)
  return data
}

export async function fetchMyBookings() {
  const { data } = await api.get('/bookings/my-bookings')
  return data.map(normalizeBooking)
}

export async function cancelBooking(bookingId) {
  const { data } = await api.patch(`/bookings/${encodeURIComponent(bookingId)}/cancel`)
  return normalizeBooking(data)
}

export async function signup(payload) {
  const { data } = await api.post('/auth/signup', payload)
  return data
}

export async function login(payload) {
  const { data } = await api.post('/auth/login', payload)
  return data
}

export async function requestPasswordReset(email) {
  const { data } = await api.post('/auth/forgot-password', { email })
  return data
}

export async function resetPassword(token, password) {
  const { data } = await api.post('/auth/reset-password', { token, password })
  return data
}

export async function fetchNotifications() {
  const { data } = await api.get('/notifications')
  return data
}

export async function markNotificationRead(notificationId) {
  const { data } = await api.patch(`/notifications/${notificationId}/read`)
  return data
}

export async function markAllNotificationsRead() {
  const { data } = await api.patch('/notifications/read-all')
  return data
}

export async function fetchAdminBookings() {
  const { data } = await api.get('/bookings/admin/all')
  return data.map(normalizeBooking)
}

export async function fetchAdminCustomers() {
  const { data } = await api.get('/users/admin/customers')
  return data
}

export async function fetchAdminReport(params = {}) {
  const { data } = await api.get('/reports/admin/summary', { params })
  return data
}

export async function updateBookingStatus(bookingId, status, cancellationReason = '') {
  const { data } = await api.patch(`/bookings/${encodeURIComponent(bookingId)}/status`, { status, cancellationReason })
  return normalizeBooking(data)
}

export async function addService(service) {
  const { data } = await api.post('/services', service)
  return normalizeService(data)
}

export async function updateService(serviceId, updates) {
  const { data } = await api.put(`/services/${serviceId}`, updates)
  return normalizeService(data)
}

export async function deleteService(serviceId) {
  await api.delete(`/services/${serviceId}`)
}

export default api
