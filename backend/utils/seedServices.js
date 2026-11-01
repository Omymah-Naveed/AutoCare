const Service = require('../models/Service')

const image = 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=900&q=80'

const defaultServices = [
  {
    title: 'Premium Exterior Wash',
    category: 'car-care',
    description:
      'A pH-neutral foam wash followed by a hand dry and tyre shine. Safe on ceramic coatings, gentle on paint and finished with a streak-free glass clean.',
    duration: '45 min',
    prices: { hatchback: 1200, sedan: 1600, suv: 2200 },
    badge: 'Most booked',
    features: [
      'pH-neutral snow foam pre-wash',
      'Two-bucket hand wash with microfibre mitts',
      'Wheel and tyre cleaning with gloss shine',
      'Streak-free exterior glass clean',
      'Hand dry with plush drying towels',
    ],
    includedChecks: [
      'Paint condition walkaround before washing',
      'Trim and badge inspection for loose fittings',
      'Tyre pressure check and top-up',
      'Final gloss and water-spot inspection',
    ],
    warranty: '7-day AutoCare finish guarantee. If you spot water spots or missed areas, bring the car back and we re-wash that panel free of charge.',
  },
  {
    title: 'Interior Deep Detailing',
    category: 'car-care',
    description:
      'Steam cleaning, leather conditioning and an odour treatment for a cabin that feels factory fresh. Every crevice, vent and seat seam is treated by hand.',
    duration: '120 min',
    prices: { hatchback: 3500, sedan: 4500, suv: 6000 },
    badge: '',
    features: [
      'Hot steam extraction on seats and carpets',
      'Leather clean and conditioning treatment',
      'Dashboard, console and vent detailing',
      'Interior glass and mirror polish',
      'Odour neutralising cabin treatment',
    ],
    includedChecks: [
      'Cabin condition report before work begins',
      'Under-seat and boot debris removal',
      'Seat rail and belt anchor inspection',
      'Post-detail moisture check before handover',
    ],
    warranty: '14-day AutoCare detailing warranty. Any returning stain or odour within two weeks is treated again at no cost.',
  },
  {
    title: 'Ceramic Paint Protection',
    category: 'car-care',
    description:
      'A 9H ceramic coating applied after full paint preparation, with a gloss enhancer and twelve months of hydrophobic protection against Lahore sun, dust and rain.',
    duration: '240 min',
    prices: { hatchback: 18000, sedan: 24000, suv: 32000 },
    badge: 'Premium',
    features: [
      'Full decontamination wash and clay bar',
      'Single-stage machine paint preparation',
      '9H ceramic coating application',
      'Gloss enhancer and hydrophobic top coat',
      'Coating cure and inspection under studio light',
    ],
    includedChecks: [
      'Paint depth reading on every panel',
      'Swirl and defect mapping before coating',
      'Trim, glass and rubber masking',
      'Cured coating water-beading verification',
    ],
    warranty: '12-month coating warranty covering loss of hydrophobic performance under normal driving conditions. Annual inspection included.',
  },
  {
    title: 'Paint Correction & Polish',
    category: 'car-care',
    description:
      'Machine polishing that removes swirl marks, light scratches and oxidation, restoring depth and clarity to your paintwork without removing unnecessary clear coat.',
    duration: '180 min',
    prices: { hatchback: 8000, sedan: 11000, suv: 15000 },
    badge: '',
    features: [
      'Decontamination wash and clay treatment',
      'Paint depth measurement on all panels',
      'Machine compounding of swirls and scratches',
      'Refining polish for maximum gloss',
      'Panel wipe and sealant application',
    ],
    includedChecks: [
      'Defect inspection under LED correction lights',
      'Clear coat thickness safety check',
      'Edge and trim protection during polishing',
      'Before and after photo documentation',
    ],
    warranty: '30-day AutoCare polishing warranty. If holograms or buffer trails appear, we correct the affected panel free of charge.',
  },
  {
    title: 'Engine Oil & Filter Change',
    category: 'maintenance',
    description:
      'Genuine oil matched to your engine, a new filter and a complimentary 20-point inspection. Completed by a certified technician with a digital report.',
    duration: '60 min',
    prices: { hatchback: 4500, sedan: 6500, suv: 9000 },
    badge: 'Essential',
    features: [
      'Genuine OEM-grade engine oil',
      'New oil filter and sump plug washer',
      'Complimentary 20-point vehicle inspection',
      'Fluid level top-up and leak check',
      'Digital service report on your booking',
    ],
    includedChecks: [
      'Engine bay and underbody visual inspection',
      'Oil drain and filter housing check',
      'Battery and charging system test',
      'Post-service oil pressure and leak verification',
    ],
    warranty: '90-day AutoCare workmanship warranty on the oil and filter change, plus the manufacturer warranty on supplied parts.',
  },
  {
    title: 'Brake Inspection & Service',
    category: 'maintenance',
    description:
      'Pad and disc inspection, caliper cleaning and a brake fluid top-up so every stop feels confident. You get a written report before any replacement is recommended.',
    duration: '90 min',
    prices: { hatchback: 2500, sedan: 3500, suv: 5000 },
    badge: '',
    features: [
      'Front and rear pad thickness measurement',
      'Disc wear and scoring inspection',
      'Caliper cleaning and lubrication',
      'Brake fluid level check and top-up',
      'Road test and pedal feel verification',
    ],
    includedChecks: [
      'Wheel-off inspection on all four corners',
      'Brake line and hose condition check',
      'Handbrake travel and adjustment check',
      'Written pad and disc report before replacement',
    ],
    warranty: '90-day AutoCare workmanship warranty on every brake job we complete, including labour and fittings.',
  },
  {
    title: 'AC Service & Cabin Filter',
    category: 'maintenance',
    description:
      'Refrigerant recharge, a full system leak check and a fresh cabin filter for clean, cold air. Vent temperature is measured before and after the service.',
    duration: '75 min',
    prices: { hatchback: 3000, sedan: 4200, suv: 5800 },
    badge: '',
    features: [
      'Refrigerant recovery and recharge',
      'System leak detection and pressure test',
      'New cabin air filter fitted',
      'Condenser and vent cleaning',
      'Vent temperature performance test',
    ],
    includedChecks: [
      'Compressor and belt condition inspection',
      'Blower motor and airflow check',
      'Drain tube blockage inspection',
      'Before and after vent temperature reading',
    ],
    warranty: '90-day AutoCare warranty on the AC service. If cooling performance drops, we re-test and top up free of charge.',
  },
  {
    title: 'Wheel Alignment & Balancing',
    category: 'maintenance',
    description:
      'Laser alignment, wheel balancing and tyre pressure calibration that protects your tyres and keeps the steering straight at highway speed.',
    duration: '45 min',
    prices: { hatchback: 2000, sedan: 2800, suv: 3800 },
    badge: '',
    features: [
      'Four-wheel laser alignment',
      'Computerised wheel balancing',
      'Tyre pressure calibration with nitrogen option',
      'Suspension and steering visual check',
      'Printed alignment report',
    ],
    includedChecks: [
      'Tread depth measurement on all tyres',
      'Tie rod and ball joint play inspection',
      'Wheel runout and buckle check',
      'Post-adjustment road test',
    ],
    warranty: '14-day alignment warranty. If the steering pulls or the wheel is off-centre, we re-align free of charge.',
  },
]

async function seedServices() {
  if (await Service.exists()) return
  await Service.insertMany(defaultServices.map((service) => ({ ...service, image })))
  console.log('Default AutoCare services seeded.')
}

module.exports = seedServices
