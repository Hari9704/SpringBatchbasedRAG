import { useEffect, useMemo, useState } from 'react'
import {
  User, Bell, Key, Activity,
  Clock, FileText, MessageSquare, Camera,
  Save, Edit3, Star, AlertCircle,
} from 'lucide-react'
import { useUserWorkspace } from '../context/UserWorkspaceContext'
import { DEFAULT_USER_ID, fetchFeedback, fetchQueryHistory, fetchQueryStats } from '../lib/api'

function formatRelativeTime(dateText) {
  if (!dateText) {
    return 'Unknown'
  }

  const deltaInMinutes = Math.round((Date.now() - new Date(dateText).getTime()) / 60000)
  if (deltaInMinutes < 1) {
    return 'Just now'
  }

  if (deltaInMinutes < 60) {
    return `${deltaInMinutes} min ago`
  }

  const deltaInHours = Math.round(deltaInMinutes / 60)
  if (deltaInHours < 24) {
    return `${deltaInHours} hr ago`
  }

  return `${Math.round(deltaInHours / 24)} day ago`
}

export default function UserPanel() {
  const { documents, processedDocuments } = useUserWorkspace()
  const [editing, setEditing] = useState(false)
  const [tab, setTab] = useState('profile')
  const [queryHistory, setQueryHistory] = useState([])
  const [totalQueries, setTotalQueries] = useState(0)
  const [feedbackCount, setFeedbackCount] = useState(0)
  const [loadError, setLoadError] = useState('')
  const [profile, setProfile] = useState(() => ({
    name: sessionStorage.getItem('docintell-display-name') || 'User',
    email: 'you@example.com',
    role: 'User',
    joined: new Date().toLocaleString(undefined, { month: 'long', year: 'numeric' }),
    avatar: (sessionStorage.getItem('docintell-display-name') || 'U').slice(0, 2).toUpperCase(),
    department: 'Document intelligence',
    phone: '',
    bio: 'Manage your workspace preferences here. Profile sync with the auth service can be added later.',
  }))

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    batchComplete: true,
    queryResults: false,
    weeklyDigest: true,
  })

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      try {
        const [history, qStats, feedback] = await Promise.all([
          fetchQueryHistory(DEFAULT_USER_ID),
          fetchQueryStats(DEFAULT_USER_ID),
          fetchFeedback().catch(() => []),
        ])

        if (cancelled) {
          return
        }

        setQueryHistory(Array.isArray(history) ? history : [])
        setTotalQueries(Number(qStats?.totalQueries) || 0)
        setFeedbackCount(Array.isArray(feedback) ? feedback.length : 0)
        setLoadError('')
      } catch (error) {
        if (!cancelled) {
          setLoadError(error.message || 'Unable to load activity.')
        }
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [])

  const userStats = useMemo(() => ([
    {
      label: 'Documents',
      value: String(documents.length),
      sub: `${processedDocuments.length} ready for chat`,
      icon: FileText,
      accent: 'blue',
    },
    {
      label: 'AI queries (server)',
      value: String(totalQueries || queryHistory.length),
      sub: 'From query service',
      icon: MessageSquare,
      accent: 'green',
    },
    {
      label: 'Feedback given',
      value: String(feedbackCount),
      sub: 'Rows returned from /api/feedback',
      icon: Star,
      accent: 'orange',
    },
    {
      label: 'In-flight docs',
      value: String(documents.filter((d) => d.status && d.status !== 'PROCESSED' && d.status !== 'FAILED').length),
      sub: 'Upload or batch processing',
      icon: Activity,
      accent: 'violet',
    },
  ]), [documents, feedbackCount, processedDocuments.length, queryHistory.length, totalQueries])

  const recentActivity = useMemo(() => (
    queryHistory.slice(0, 6).map((row, index) => ({
      id: row.id ?? index,
      action: 'Queried',
      target: (row.question || '').slice(0, 80) + ((row.question || '').length > 80 ? '…' : ''),
      time: formatRelativeTime(row.timestamp),
      icon: MessageSquare,
      color: index % 3 === 0 ? 'var(--color-royal)' : index % 3 === 1 ? 'var(--color-primary)' : 'var(--color-accent)',
    }))
  ), [queryHistory])

  const handleSave = () => {
    sessionStorage.setItem('docintell-display-name', profile.name.trim() || 'User')
    setEditing(false)
  }

  return (
    <div className="animate-fade-in" id="user-panel">
      <div className="page-header">
        <h1>Profile</h1>
        <p>Your activity and preferences in one place.</p>
      </div>

      {loadError ? (
        <div className="status-card error" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <AlertCircle size={18} />
          <span>{loadError}</span>
        </div>
      ) : null}

      <div className="card user-portal-hero-card" style={{ marginBottom: 'var(--spacing-xl)', border: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{
            width: 80, height: 80, borderRadius: 'var(--radius-full)',
            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', fontWeight: 700, border: '3px solid rgba(255,255,255,0.4)',
            position: 'relative', color: 'white',
          }}
          >
            {profile.avatar}
            <button
              type="button"
              title="Avatar upload is not wired in this demo"
              style={{
                position: 'absolute', bottom: -2, right: -2,
                width: 24, height: 24, borderRadius: '50%',
                background: 'white', color: 'var(--color-royal)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: 'none', cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
              }}
              onClick={() => window.alert('Avatar upload is not enabled in this demo build.')}
            >
              <Camera size={12} />
            </button>
          </div>
          <div style={{ flex: 1, color: 'white' }}>
            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 4 }}>{profile.name}</h2>
            <p style={{ opacity: 0.9, fontSize: 'var(--font-size-base)' }}>{profile.department} · {profile.role}</p>
            <p style={{ opacity: 0.75, fontSize: 'var(--font-size-sm)', marginTop: 4 }}>Member since {profile.joined}</p>
          </div>
          <button
            className="btn"
            style={{ background: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.35)' }}
            onClick={() => setEditing(!editing)}
            id="edit-profile-btn"
            type="button"
          >
            <Edit3 size={16} /> {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
        {userStats.map((s) => {
          const Icon = s.icon
          const cardClass = s.accent === 'blue' ? 'stat-card-accent-blue'
            : s.accent === 'green' ? 'stat-card-accent-green'
              : s.accent === 'orange' ? 'stat-card-accent-warm'
                : 'stat-card-accent-violet'
          return (
            <div className={`stat-card ${cardClass}`} key={s.label}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="stat-label">{s.label}</span>
                <div style={{
                  width: 36, height: 36, borderRadius: 'var(--radius-md)',
                  background: 'rgba(255,255,255,0.65)', color: 'var(--color-deep-blue)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                >
                  <Icon size={18} />
                </div>
              </div>
              <div className="stat-value" style={{ fontSize: 'var(--font-size-2xl)' }}>{s.value}</div>
              <div className="stat-subtext">{s.sub}</div>
            </div>
          )
        })}
      </div>

      <div className="tabs">
        {['profile', 'activity', 'notifications', 'security'].map((t) => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)} id={`user-tab-${t}`} type="button">
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="card card-surface-blue">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={16} /> Personal information
          </div>
          <div className="grid-2" style={{ gap: 'var(--spacing-lg)' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={profile.name} disabled={!editing} onChange={(e) => setProfile({ ...profile, name: e.target.value, avatar: (e.target.value || 'U').slice(0, 2).toUpperCase() })} id="user-name" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" value={profile.email} disabled={!editing} onChange={(e) => setProfile({ ...profile, email: e.target.value })} id="user-email" />
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <input className="form-input" value={profile.department} disabled={!editing} onChange={(e) => setProfile({ ...profile, department: e.target.value })} id="user-dept" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={profile.phone} disabled={!editing} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} id="user-phone" />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Bio</label>
              <textarea className="form-input" value={profile.bio} disabled={!editing} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} id="user-bio" />
            </div>
          </div>
          {editing && (
            <div style={{ marginTop: 'var(--spacing-lg)', display: 'flex', gap: 'var(--spacing-sm)' }}>
              <button className="btn btn-primary" onClick={handleSave} id="save-profile-btn" type="button"><Save size={16} /> Save changes</button>
              <button className="btn btn-secondary" onClick={() => setEditing(false)} type="button">Cancel</button>
            </div>
          )}
        </div>
      )}

      {tab === 'activity' && (
        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={16} /> Recent queries
          </div>
          {recentActivity.length === 0 ? (
            <div className="empty-state compact">
              <MessageSquare size={28} />
              <div>No queries yet. Open AI Chat to run your first question.</div>
            </div>
          ) : (
            <div className="timeline">
              {recentActivity.map((a) => {
                const Icon = a.icon
                return (
                  <div className="timeline-item" key={a.id}>
                    <div className="timeline-dot" style={{ background: a.color, boxShadow: `0 0 0 2px white, 0 0 0 4px ${a.color}` }}></div>
                    <div className="timeline-content">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <Icon size={14} style={{ color: a.color }} />
                        <strong style={{ fontSize: 'var(--font-size-base)' }}>{a.action}</strong>
                        <span style={{ color: 'var(--color-text-secondary)' }}>{a.target}</span>
                      </div>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{a.time}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'notifications' && (
        <div className="card card-surface-mint">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={16} /> Notification preferences
          </div>
          {Object.entries(notifications).map(([key, val]) => {
            const labels = {
              emailAlerts: 'Email alerts',
              batchComplete: 'Batch job completion',
              queryResults: 'New query results',
              weeklyDigest: 'Weekly digest',
            }
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--color-border-light)' }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{labels[key]}</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                    Stored locally for this session (demo).
                  </div>
                </div>
                <button
                  type="button"
                  className="toggle-wrapper"
                  aria-pressed={val}
                  onClick={() => setNotifications({ ...notifications, [key]: !val })}
                >
                  <div className={`toggle ${val ? 'active' : ''}`}></div>
                </button>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'security' && (
        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Key size={16} /> Security
          </div>
          <div className="form-group">
            <label className="form-label">Current password</label>
            <input className="form-input" type="password" placeholder="Not connected in demo" id="current-pw" readOnly />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">New password</label>
              <input className="form-input" type="password" placeholder="Min 8 characters" id="new-pw" readOnly />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm password</label>
              <input className="form-input" type="password" placeholder="Repeat new password" id="confirm-pw" readOnly />
            </div>
          </div>
          <button
            className="btn btn-primary"
            style={{ marginTop: 'var(--spacing-md)' }}
            id="change-pw-btn"
            type="button"
            onClick={() => window.alert('Password updates are not wired to the auth API in this demo. Use the backend auth service directly when integrated.')}
          >
            <Key size={16} /> Update password
          </button>

          <div style={{ marginTop: 'var(--spacing-2xl)', paddingTop: 'var(--spacing-xl)', borderTop: '1px solid var(--color-border)' }}>
            <h4 style={{ marginBottom: 'var(--spacing-md)' }}>Sessions (sample)</h4>
            {[
              { device: 'This browser', ip: 'Current session', time: 'Now', current: true },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--color-border-light)' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 'var(--font-size-base)' }}>{s.device}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{s.ip} · {s.time}</div>
                </div>
                {s.current
                  ? <span className="badge badge-success"><span className="badge-dot"></span> Current</span>
                  : (
                    <button className="btn btn-sm btn-secondary" type="button" onClick={() => window.alert('Session revoke is a placeholder in this UI.')}>
                      Revoke
                    </button>
                  )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
