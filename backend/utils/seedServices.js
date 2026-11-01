const Service = require('../models/Service')

const defaultServices = [
  ['Premium Exterior Wash', 'car-care', 'pH-neutral foam wash, hand dry and tyre shine for a spotless finish.', '45 min', { hatchback: 1200, sedan: 1600, suv: 2200 }, 'Most booked'],
  ['Interior Deep Detailing', 'car-care', 'Steam cleaning, leather conditioning and odour treatment for a fresh cabin.', '120 min', { hatchback: 3500, sedan: 4500, suv: 6000 }, ''],
  ['Ceramic Paint Protection', 'car-care', '9H ceramic coating with paint prep, gloss enhancer and 12-month protection.', '240 min', { hatchback: 18000, sedan: 24000, suv: 32000 }, 'Premium'],
  ['Paint Correction & Polish', 'car-care', 'Machine polishing that removes swirls, light scratches and oxidation.', '180 min', { hatchback: 8000, sedan: 11000, suv: 15000 }, ''],
  ['Engine Oil & Filter Change', 'maintenance', 'Genuine oil, new filter and a complimentary 20-point vehicle inspection.', '60 min', { hatchback: 4500, sedan: 6500, suv: 9000 }, 'Essential'],
  ['Brake Inspection & Service', 'maintenance', 'Pad and disc inspection, cleaning and fluid top-up for confident stopping.', '90 min', { hatchback: 2500, sedan: 3500, suv: 5000 }, ''],
  ['AC Service & Cabin Filter', 'maintenance', 'Gas recharge, system leak check and a fresh cabin filter for clean, cold air.', '75 min', { hatchback: 3000, sedan: 4200, suv: 5800 }, ''],
  ['Wheel Alignment & Balancing', 'maintenance', 'Laser alignment, wheel balancing and tyre pressure calibration.', '45 min', { hatchback: 2000, sedan: 2800, suv: 3800 }, ''],
]

const image = 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=900&q=80'

async function seedServices() {
  if (await Service.exists()) return
  await Service.insertMany(defaultServices.map(([title, category, description, duration, prices, badge]) => ({
    title,
    category,
    description,
    duration,
    prices,
    badge,
    image,
  })))
  console.log('Default AutoCare services seeded.')
}

module.exports = seedServices
