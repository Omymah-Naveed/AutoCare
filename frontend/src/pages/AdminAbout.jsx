import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Building2,
  CircleCheck,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Users,
} from 'lucide-react'
import { fetchAboutContent, getApiError, updateAboutContent } from '../lib/api'

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

const STAT_FIELDS = [
  { key: 'yearsExperience', label: 'Years of experience', max: 100 },
  { key: 'carsServiced', label: 'Cars serviced', max: 10000000 },
  { key: 'expertTechnicians', label: 'Expert technicians', max: 1000 },
  { key: 'customerRating', label: 'Customer rating (out of 5)', max: 5, step: 0.1 },
]

function normalizeAbout(data) {
  return {
    ...EMPTY_ABOUT,
    ...data,
    stats: { ...EMPTY_ABOUT.stats, ...data.stats },
    teamMembers: Array.isArray(data.teamMembers)
      ? data.teamMembers.map((member) => ({ ...member, _key: member._id || `${member.name}-${member.role}` }))
      : [],
  }
}

function getPayload(form) {
  return {
    companyName: form.companyName,
    tagline: form.tagline,
    story: form.story,
    mission: form.mission,
    vision: form.vision,
    stats: Object.fromEntries(
      Object.entries(form.stats).map(([field, value]) => [field, Number(value) || 0]),
    ),
    teamMembers: form.teamMembers.map((member) => ({
      name: member.name,
      role: member.role,
      bio: member.bio,
      photoUrl: member.photoUrl,
    })),
  }
}

function AdminAbout() {
  const [form, setForm] = useState(EMPTY_ABOUT)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [dirty, setDirty] = useState(false)
  const [saveState, setSaveState] = useState('saved')
  const [retry, setRetry] = useState(0)
  const revision = useRef(0)

  useEffect(() => {
    let active = true
    fetchAboutContent()
      .then((data) => {
        if (!data || typeof data !== 'object') throw new Error('About information returned by the server is invalid.')
        if (active) {
          setForm(normalizeAbout(data))
          setDirty(false)
          setSaveState('saved')
        }
      })
      .catch((error) => {
        if (active) setLoadError(getApiError(error, 'Unable to load About AutoCare.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [retry])

  const isValid = Boolean(
    form.companyName.trim()
    && form.tagline.trim()
    && form.story.trim()
    && form.mission.trim()
    && form.vision.trim()
    && form.teamMembers.every((member) => member.name.trim() && member.role.trim()),
  )

  const save = useCallback(async () => {
    if (!dirty || !isValid) return
    const requestRevision = revision.current
    setSaveState('saving')
    setSaveError('')
    try {
      const saved = await updateAboutContent(getPayload(form))
      if (requestRevision === revision.current) {
        setForm(normalizeAbout(saved))
        setDirty(false)
        setSaveState('saved')
      }
    } catch (error) {
      if (requestRevision === revision.current) {
        setSaveState('error')
        setSaveError(getApiError(error, 'Unable to save About AutoCare.'))
      }
    }
  }, [dirty, form, isValid])

  useEffect(() => {
    if (!dirty || loading || !isValid) return undefined
    const timer = window.setTimeout(save, 900)
    return () => window.clearTimeout(timer)
  }, [dirty, form, isValid, loading, save])

  const edit = (updater) => {
    revision.current += 1
    setForm((current) => updater(current))
    setDirty(true)
    setSaveError('')
    setSaveState('unsaved')
  }

  const updateText = (field, value) => edit((current) => ({ ...current, [field]: value }))
  const updateStat = (field, value) => edit((current) => ({
    ...current,
    stats: { ...current.stats, [field]: value },
  }))

  const updateTeamMember = (index, field, value) => edit((current) => ({
    ...current,
    teamMembers: current.teamMembers.map((member, memberIndex) => (
      memberIndex === index ? { ...member, [field]: value } : member
    )),
  }))

  const addTeamMember = () => edit((current) => ({
    ...current,
    teamMembers: [...current.teamMembers, {
      _key: `new-${Date.now()}-${current.teamMembers.length}`,
      name: '',
      role: '',
      bio: '',
      photoUrl: '',
    }],
  }))

  const removeTeamMember = (index) => edit((current) => ({
    ...current,
    teamMembers: current.teamMembers.filter((_, memberIndex) => memberIndex !== index),
  }))

  if (loading) {
    return <section className="panel module-loading" role="status">Loading About AutoCare…</section>
  }

  if (loadError) {
    return (
      <section className="panel admin-about-load-error" role="alert">
        <p>{loadError}</p>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => {
            setLoading(true)
            setLoadError('')
            setRetry((value) => value + 1)
          }}
        >
          <RotateCcw size={14} /> Try again
        </button>
      </section>
    )
  }

  return (
    <section className="admin-about-editor">
      <div className="panel admin-about-savebar">
        <div>
          <span className={`admin-about-save-state is-${saveState}`} role="status">
            {!isValid && dirty ? 'Complete required fields to save' : saveState === 'saving' ? 'Saving changes…' : saveState === 'saved' ? 'All changes saved' : saveState === 'error' ? 'Save failed' : saveState === 'unsaved' ? 'Unsaved changes' : 'Complete required fields to save'}
          </span>
          <p>Changes save automatically after a short pause. You can also save them now.</p>
          {saveError ? <span className="admin-about-save-error" role="alert">{saveError}</span> : null}
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={save} disabled={!dirty || !isValid || saveState === 'saving'}>
          <Save size={14} /> Save now
        </button>
      </div>

      <section className="panel admin-about-section">
        <div className="panel-head">
          <div>
            <span className="eyebrow"><Building2 size={13} /> Company profile</span>
            <h2>Company information</h2>
            <p>Tell customers who you are and what makes your service different.</p>
          </div>
        </div>
        <div className="admin-about-fields">
          <div className="field">
            <label htmlFor="about-company-name">Company name</label>
            <input id="about-company-name" value={form.companyName} maxLength={100} onChange={(event) => updateText('companyName', event.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="about-tagline">Tagline</label>
            <input id="about-tagline" value={form.tagline} maxLength={180} onChange={(event) => updateText('tagline', event.target.value)} />
          </div>
          <div className="field admin-about-field-wide">
            <label htmlFor="about-story">Company story</label>
            <textarea id="about-story" value={form.story} maxLength={4000} rows={5} onChange={(event) => updateText('story', event.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="about-mission">Mission statement</label>
            <textarea id="about-mission" value={form.mission} maxLength={2000} rows={4} onChange={(event) => updateText('mission', event.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="about-vision">Vision statement</label>
            <textarea id="about-vision" value={form.vision} maxLength={2000} rows={4} onChange={(event) => updateText('vision', event.target.value)} />
          </div>
        </div>
      </section>

      <section className="panel admin-about-section">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Measured experience</span>
            <h2>Key statistics</h2>
            <p>Use verified numbers; values update on the customer About page.</p>
          </div>
        </div>
        <div className="admin-about-stats">
          {STAT_FIELDS.map(({ key, label, max, step = 1 }) => (
            <div className="field" key={key}>
              <label htmlFor={`about-stat-${key}`}>{label}</label>
              <input
                id={`about-stat-${key}`}
                type="number"
                min="0"
                max={max}
                step={step}
                value={form.stats[key]}
                onChange={(event) => updateStat(key, event.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="panel admin-about-section">
        <div className="panel-head">
          <div>
            <span className="eyebrow"><Users size={13} /> The people behind AutoCare</span>
            <h2>Team members</h2>
            <p>Add, update, or remove people shown on the public About page.</p>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={addTeamMember} disabled={form.teamMembers.length >= 20}>
            <Plus size={14} /> Add member
          </button>
        </div>
        {form.teamMembers.length ? (
          <div className="admin-about-team-list">
            {form.teamMembers.map((member, index) => (
              <article className="admin-about-team-card" key={member._key}>
                <div className="admin-about-team-card-head">
                  <strong>Team member {index + 1}</strong>
                  <button type="button" className="admin-about-remove" onClick={() => removeTeamMember(index)} aria-label={`Remove ${member.name || `team member ${index + 1}`}`}>
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
                <div className="admin-about-fields">
                  <div className="field">
                    <label htmlFor={`about-team-name-${index}`}>Name</label>
                    <input id={`about-team-name-${index}`} value={member.name} maxLength={100} onChange={(event) => updateTeamMember(index, 'name', event.target.value)} required />
                  </div>
                  <div className="field">
                    <label htmlFor={`about-team-role-${index}`}>Role</label>
                    <input id={`about-team-role-${index}`} value={member.role} maxLength={100} onChange={(event) => updateTeamMember(index, 'role', event.target.value)} required />
                  </div>
                  <div className="field admin-about-field-wide">
                    <label htmlFor={`about-team-photo-${index}`}>Photo URL <span>(optional)</span></label>
                    <input id={`about-team-photo-${index}`} type="url" value={member.photoUrl || ''} maxLength={2000} onChange={(event) => updateTeamMember(index, 'photoUrl', event.target.value)} placeholder="https://…" />
                  </div>
                  <div className="field admin-about-field-wide">
                    <label htmlFor={`about-team-bio-${index}`}>Short bio <span>(optional)</span></label>
                    <textarea id={`about-team-bio-${index}`} value={member.bio || ''} maxLength={1000} rows={3} onChange={(event) => updateTeamMember(index, 'bio', event.target.value)} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="admin-about-empty-team">
            <Users size={20} />
            <span>No team members added yet.</span>
          </div>
        )}
      </section>

      {saveState === 'saved' && !dirty ? (
        <p className="admin-about-saved-note"><CircleCheck size={14} /> Your latest changes are live on the customer About page.</p>
      ) : null}
    </section>
  )
}

export default AdminAbout
