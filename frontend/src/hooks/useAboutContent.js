import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchAboutContent, getApiError } from '../lib/api'

const EMPTY_ABOUT = {
  companyName: 'AutoCare',
  tagline: 'Smart Service, Smoother Drives.',
  story: 'We are a car-only care studio built around transparent advice, skilled hands, and service that respects your time.',
  mission: 'Make dependable car care straightforward, transparent, and convenient for every driver.',
  vision: 'Set a higher standard for the way drivers experience vehicle care.',
  stats: {
    yearsExperience: 0,
    carsServiced: 0,
    expertTechnicians: 0,
    customerRating: 0,
  },
  teamMembers: [],
}

function useAboutContent() {
  const [about, setAbout] = useState(EMPTY_ABOUT)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [requestId, setRequestId] = useState(0)
  const hasLoaded = useRef(false)

  const refresh = useCallback(() => {
    setError('')
    if (!hasLoaded.current) setLoading(true)
    setRequestId((current) => current + 1)
  }, [])

  useEffect(() => {
    let active = true
    let latestRequestId = 0

    const loadAbout = async () => {
      const currentRequestId = ++latestRequestId
      try {
        const result = await fetchAboutContent()
        if (!result || typeof result !== 'object') {
          throw new Error('About information returned by the server is invalid.')
        }
        if (active && currentRequestId === latestRequestId) {
          setAbout({
            ...EMPTY_ABOUT,
            ...result,
            stats: { ...EMPTY_ABOUT.stats, ...result.stats },
            teamMembers: Array.isArray(result.teamMembers) ? result.teamMembers : [],
          })
          hasLoaded.current = true
          setError('')
        }
      } catch (requestError) {
        if (active && currentRequestId === latestRequestId && !hasLoaded.current) {
          setError(getApiError(requestError, 'Unable to load About AutoCare.'))
        }
      } finally {
        if (active && currentRequestId === latestRequestId) setLoading(false)
      }
    }

    const handleAboutUpdate = () => loadAbout()
    const handleStorage = (event) => {
      if (event.key === 'autocare.about.updatedAt') loadAbout()
    }
    const handleFocus = () => loadAbout()
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') loadAbout()
    }, 15000)

    window.addEventListener('autocare:about-updated', handleAboutUpdate)
    window.addEventListener('storage', handleStorage)
    window.addEventListener('focus', handleFocus)
    loadAbout()

    return () => {
      active = false
      window.clearInterval(timer)
      window.removeEventListener('autocare:about-updated', handleAboutUpdate)
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('focus', handleFocus)
    }
  }, [requestId])

  return { about, loading, error, refresh }
}

export default useAboutContent
