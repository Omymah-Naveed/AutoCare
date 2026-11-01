export const CAR_TYPES = [
  {
    id: 'hatchback',
    label: 'Hatchback',
    examples: '(e.g., Alto, Cultus, WagonR)',
    note: 'Compact cars',
  },
  {
    id: 'sedan',
    label: 'Sedan',
    examples: '(e.g., Civic, Corolla, City)',
    note: 'Sedans & executive cars',
  },
  {
    id: 'suv',
    label: 'SUV / Crossover',
    examples: '(e.g., Fortuner, Sportage, Tucson)',
    note: 'SUVs & crossovers',
  },
]

export const SERVICE_CATEGORIES = [
  { id: 'all', label: 'All Services' },
  { id: 'car-care', label: 'Car Care' },
  { id: 'maintenance', label: 'Maintenance' },
]

export const CATEGORY_LABELS = {
  'car-care': 'Car Care',
  maintenance: 'Maintenance',
}

export const TIME_SLOTS = [
  '09:00 AM',
  '10:30 AM',
  '12:00 PM',
  '01:30 PM',
  '03:00 PM',
  '04:30 PM',
  '06:00 PM',
]

export const BOOKING_STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled']

export const ADMIN_PASSCODE = 'admin123'

export const DEFAULT_SERVICES = [
  {
    id: 'premium-exterior-wash',
    title: 'Premium Exterior Wash',
    category: 'car-care',
    description:
      'pH-neutral foam wash, hand dry and tyre shine for a spotless, scratch-free finish.',
    image:
      'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=900&q=80',
    duration: '45 min',
    badge: 'Most booked',
    prices: { hatchback: 1200, sedan: 1600, suv: 2200 },
  },
  {
    id: 'interior-deep-detailing',
    title: 'Interior Deep Detailing',
    category: 'car-care',
    description:
      'Steam cleaning, leather conditioning and odour treatment for a cabin that feels new.',
    image:
      'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=900&q=80',
    duration: '120 min',
    badge: '',
    prices: { hatchback: 3500, sedan: 4500, suv: 6000 },
  },
  {
    id: 'ceramic-paint-protection',
    title: 'Ceramic Paint Protection',
    category: 'car-care',
    description:
      '9H ceramic coating with paint prep, gloss enhancer and 12-month protection.',
    image:
      'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=900&q=80',
    duration: '240 min',
    badge: 'Premium',
    prices: { hatchback: 18000, sedan: 24000, suv: 32000 },
  },
  {
    id: 'paint-correction-polish',
    title: 'Paint Correction & Polish',
    category: 'car-care',
    description:
      'Machine polishing that removes swirls, light scratches and oxidation.',
    image:
      'https://images.unsplash.com/photo-1552930294-6b595f4c2974?auto=format&fit=crop&w=900&q=80',
    duration: '180 min',
    badge: '',
    prices: { hatchback: 8000, sedan: 11000, suv: 15000 },
  },
  {
    id: 'engine-oil-filter-change',
    title: 'Engine Oil & Filter Change',
    category: 'maintenance',
    description:
      'Genuine oil, new filter and a complimentary 20-point vehicle inspection.',
    image:
      'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=900&q=80',
    duration: '60 min',
    badge: 'Essential',
    prices: { hatchback: 4500, sedan: 6500, suv: 9000 },
  },
  {
    id: 'brake-inspection-service',
    title: 'Brake Inspection & Service',
    category: 'maintenance',
    description:
      'Pad and disc inspection, cleaning and fluid top-up for confident stopping.',
    image:
      'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=900&q=80',
    duration: '90 min',
    badge: '',
    prices: { hatchback: 2500, sedan: 3500, suv: 5000 },
  },
  {
    id: 'ac-service-cabin-filter',
    title: 'AC Service & Cabin Filter',
    category: 'maintenance',
    description:
      'Gas recharge, system leak check and a fresh cabin filter for clean, cold air.',
    image:
      'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?auto=format&fit=crop&w=900&q=80',
    duration: '75 min',
    badge: '',
    prices: { hatchback: 3000, sedan: 4200, suv: 5800 },
  },
  {
    id: 'wheel-alignment-balancing',
    title: 'Wheel Alignment & Balancing',
    category: 'maintenance',
    description:
      'Laser alignment, wheel balancing and tyre pressure calibration.',
    image:
      'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=900&q=80',
    duration: '45 min',
    badge: '',
    prices: { hatchback: 2000, sedan: 2800, suv: 3800 },
  },
]

export const HERO_IMAGE =
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=85'

export function formatPrice(amount) {
  return `Rs ${Number(amount || 0).toLocaleString('en-PK')}`
}

export function getStartingPrice(service) {
  return Math.min(...Object.values(service.prices || { hatchback: 0 }))
}

export function toISODate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatDate(isoDate, options = {}) {
  if (!isoDate) return '—'
  const date = new Date(`${isoDate}T00:00:00`)
  if (Number.isNaN(date.getTime())) return isoDate
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  })
}

export function addDays(date, days) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export function generateBookingId(bookings = []) {
  const used = new Set(bookings.map((booking) => booking.id))
  let id = `AC-${Math.floor(1000 + Math.random() * 9000)}`
  while (used.has(id)) {
    id = `AC-${Math.floor(1000 + Math.random() * 9000)}`
  }
  return id
}

export function cloneDefaultServices() {
  return DEFAULT_SERVICES.map((service) => ({
    ...service,
    prices: { ...service.prices },
  }))
}

export function createSeedBookings() {
  const now = new Date()

  return [
    {
      id: 'AC-1042',
      name: 'Ali Raza',
      phone: '0300 1234567',
      serviceId: 'premium-exterior-wash',
      serviceTitle: 'Premium Exterior Wash',
      category: 'car-care',
      carType: 'sedan',
      carTypeLabel: 'Sedan',
      model: 'Honda Civic 2022',
      date: toISODate(addDays(now, 1)),
      time: '10:30 AM',
      amount: 1600,
      status: 'Confirmed',
      createdAt: addDays(now, -2).toISOString(),
    },
    {
      id: 'AC-1087',
      name: 'Sana Malik',
      phone: '0321 7654321',
      serviceId: 'brake-inspection-service',
      serviceTitle: 'Brake Inspection & Service',
      category: 'maintenance',
      carType: 'suv',
      carTypeLabel: 'SUV / Crossover',
      model: 'Toyota Fortuner 2021',
      date: toISODate(addDays(now, 2)),
      time: '12:00 PM',
      amount: 5000,
      status: 'Pending',
      createdAt: addDays(now, -1).toISOString(),
    },
    {
      id: 'AC-1103',
      name: 'Hamza Sheikh',
      phone: '0333 4455667',
      serviceId: 'engine-oil-filter-change',
      serviceTitle: 'Engine Oil & Filter Change',
      category: 'maintenance',
      carType: 'hatchback',
      carTypeLabel: 'Hatchback',
      model: 'Suzuki Alto 2019',
      date: toISODate(addDays(now, -1)),
      time: '09:00 AM',
      amount: 4500,
      status: 'Completed',
      createdAt: addDays(now, -5).toISOString(),
    },
    {
      id: 'AC-1120',
      name: 'Zainab Khan',
      phone: '0345 9988776',
      serviceId: 'engine-oil-filter-change',
      serviceTitle: 'Engine Oil & Filter Change',
      category: 'maintenance',
      carType: 'sedan',
      carTypeLabel: 'Sedan',
      model: 'Honda City 2020',
      date: toISODate(addDays(now, 3)),
      time: '03:00 PM',
      amount: 6500,
      status: 'Cancelled',
      createdAt: addDays(now, -3).toISOString(),
    },
    {
      id: 'AC-1156',
      name: 'Bilal Ahmed',
      phone: '0301 2233445',
      serviceId: 'ac-service-cabin-filter',
      serviceTitle: 'AC Service & Cabin Filter',
      category: 'maintenance',
      carType: 'suv',
      carTypeLabel: 'SUV / Crossover',
      model: 'Kia Sportage 2023',
      date: toISODate(addDays(now, 4)),
      time: '04:30 PM',
      amount: 5800,
      status: 'Confirmed',
      createdAt: addDays(now, -1).toISOString(),
    },
  ]
}
