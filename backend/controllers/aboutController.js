const AboutUs = require('../models/AboutUs')

async function getAboutContent(req, res) {
  const about = await AboutUs.findOne({ key: 'main' }).lean()
  res.json(about || new AboutUs().toObject())
}

async function updateAboutContent(req, res) {
  const { companyName, tagline, story, mission, vision, stats, teamMembers } = req.body || {}

  if ([companyName, tagline, story, mission, vision].some((value) => typeof value !== 'string' || !value.trim())) {
    return res.status(400).json({ message: 'Company name, tagline, story, mission and vision are required.' })
  }
  if (!stats || typeof stats !== 'object' || Array.isArray(stats)) {
    return res.status(400).json({ message: 'Company statistics are required.' })
  }
  if (!Array.isArray(teamMembers) || teamMembers.length > 20) {
    return res.status(400).json({ message: 'Team members must be a list of no more than 20 people.' })
  }

  const cleanStats = {}
  for (const field of ['yearsExperience', 'carsServiced', 'expertTechnicians', 'customerRating']) {
    const value = Number(stats[field])
    if (!Number.isFinite(value) || value < 0 || (field === 'customerRating' ? value > 5 : value > (field === 'carsServiced' ? 10000000 : field === 'yearsExperience' ? 100 : 1000))) {
      return res.status(400).json({ message: `Statistic "${field}" must be within its allowed range.` })
    }
    cleanStats[field] = value
  }

  const cleanTeam = []
  for (const member of teamMembers) {
    if (!member || typeof member.name !== 'string' || !member.name.trim() || typeof member.role !== 'string' || !member.role.trim()) {
      return res.status(400).json({ message: 'Each team member needs a name and role.' })
    }
    cleanTeam.push({
      name: member.name.trim(),
      role: member.role.trim(),
      bio: typeof member.bio === 'string' ? member.bio.trim() : '',
      photoUrl: typeof member.photoUrl === 'string' ? member.photoUrl.trim() : '',
    })
  }

  const about = await AboutUs.findOneAndUpdate(
    { key: 'main' },
    {
      $set: {
        companyName: companyName.trim(),
        tagline: tagline.trim(),
        story: story.trim(),
        mission: mission.trim(),
        vision: vision.trim(),
        stats: cleanStats,
        teamMembers: cleanTeam,
        updatedAt: new Date(),
      },
      $setOnInsert: { key: 'main' },
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  )

  res.json(about)
}

module.exports = { getAboutContent, updateAboutContent }
