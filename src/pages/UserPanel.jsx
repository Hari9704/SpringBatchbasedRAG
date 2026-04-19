import { useState } from 'react'
import {
  User, Mail, Shield, Bell, Key, Activity,
  Clock, FileText, MessageSquare, Camera, 
  Save, Edit3, CheckCircle, Star
} from 'lucide-react'

const userProfile = {
  name: 'Syama Prasad',
  email: 'syama@docintell.ai',
  role: 'Admin',
  joined: 'March 2026',
  avatar: 'SP',
  department: 'AI Engineering',
  phone: '+91 98765 43210',
  bio: 'Senior platform engineer specializing in RAG pipelines and intelligent document processing.',
}

const recentActivity = [
  { id: 1, action: 'Queried', target: 'Q3 Financial Report', time: '2 min ago', icon: MessageSquare, color: 'var(--color-primary)' },
  { id: 2, action: 'Uploaded', target: 'SLA_Agreement_2026.pdf', time: '15 min ago', icon: FileText, color: 'var(--color-accent)' },
  { id: 3, action: 'Reviewed', target: 'Compliance Guidelines v2', time: '1 hr ago', icon: CheckCircle, color: 'var(--color-success)' },
  { id: 4, action: 'Queried', target: 'Risk Assessment Q2', time: '3 hr ago', icon: MessageSquare, color: 'var(--color-primary)' },
  { id: 5, action: 'Edited feedback', target: 'Vendor Contract Batch', time: '5 hr ago', icon: Edit3, color: 'var(--color-warning)' },
]

const userStats = [
  { label: 'Documents Uploaded', value: '47', sub: 'This month', icon: FileText },
  { label: 'AI Queries', value: '128', sub: 'Last 30 days', icon: MessageSquare },
  { label: 'Feedback Given', value: '34', sub: '92% accepted', icon: Star },
  { label: 'Active Sessions', value: '2', sub: 'Desktop & Mobile', icon: Activity },
]

export default function UserPanel() {
  const [editing, setEditing] = useState(false)
  const [tab, setTab] = useState('profile')
  const [profile, setProfile] = useState(userProfile)
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    batchComplete: true,
    queryResults: false,
    weeklyDigest: true,
  })

  const handleSave = () => {
    setEditing(false)
  }

  return (
    <div className="animate-fade-in" id="user-panel">
      <div className="page-header">
        <h1>User Panel</h1>
        <p>Manage your profile, preferences, and activity</p>
      </div>

      {/* User Hero Card */}
      <div className="card" style={{ marginBottom: 'var(--spacing-xl)', background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)', color: 'white', border: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{
            width: 80, height: 80, borderRadius: 'var(--radius-full)',
            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', fontWeight: 700, border: '3px solid rgba(255,255,255,0.4)',
            position: 'relative'
          }}>
            {profile.avatar}
            <div style={{
              position: 'absolute', bottom: -2, right: -2,
              width: 24, height: 24, borderRadius: '50%',
              background: 'white', color: 'var(--color-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer'
            }}>
              <Camera size={12} />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 4 }}>{profile.name}</h2>
            <p style={{ opacity: 0.85, fontSize: 'var(--font-size-base)' }}>{profile.department} · {profile.role}</p>
            <p style={{ opacity: 0.7, fontSize: 'var(--font-size-sm)', marginTop: 4 }}>Member since {profile.joined}</p>
          </div>
          <button className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)' }}
            onClick={() => setEditing(!editing)} id="edit-profile-btn">
            <Edit3 size={16} /> {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
        {userStats.map((s, i) => {
          const Icon = s.icon
          return (
            <div className="stat-card" key={i}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="stat-label">{s.label}</span>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: i % 2 === 0 ? 'var(--color-primary-lighter)' : 'var(--color-success-bg)', color: i % 2 === 0 ? 'var(--color-primary)' : 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} />
                </div>
              </div>
              <div className="stat-value" style={{ fontSize: 'var(--font-size-2xl)' }}>{s.value}</div>
              <div className="stat-subtext" style={{ color: 'var(--color-accent)' }}>{s.sub}</div>
            </div>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['profile', 'activity', 'notifications', 'security'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)} id={`user-tab-${t}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'profile' && (
        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={16} /> Personal Information
          </div>
          <div className="grid-2" style={{ gap: 'var(--spacing-lg)' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={profile.name} disabled={!editing} onChange={e => setProfile({...profile, name: e.target.value})} id="user-name" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" value={profile.email} disabled={!editing} onChange={e => setProfile({...profile, email: e.target.value})} id="user-email" />
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <input className="form-input" value={profile.department} disabled={!editing} onChange={e => setProfile({...profile, department: e.target.value})} id="user-dept" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={profile.phone} disabled={!editing} onChange={e => setProfile({...profile, phone: e.target.value})} id="user-phone" />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Bio</label>
              <textarea className="form-input" value={profile.bio} disabled={!editing} onChange={e => setProfile({...profile, bio: e.target.value})} id="user-bio" />
            </div>
          </div>
          {editing && (
            <div style={{ marginTop: 'var(--spacing-lg)', display: 'flex', gap: 'var(--spacing-sm)' }}>
              <button className="btn btn-primary" onClick={handleSave} id="save-profile-btn"><Save size={16} /> Save Changes</button>
              <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          )}
        </div>
      )}

      {tab === 'activity' && (
        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={16} /> Recent Activity
          </div>
          <div className="timeline">
            {recentActivity.map(a => {
              const Icon = a.icon
              return (
                <div className="timeline-item" key={a.id}>
                  <div className="timeline-dot" style={{ background: a.color, boxShadow: `0 0 0 2px white, 0 0 0 4px ${a.color}` }}></div>
                  <div className="timeline-content">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
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
        </div>
      )}

      {tab === 'notifications' && (
        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={16} /> Notification Preferences
          </div>
          {Object.entries(notifications).map(([key, val]) => {
            const labels = {
              emailAlerts: 'Email Alerts',
              batchComplete: 'Batch Job Completion',
              queryResults: 'New Query Results',
              weeklyDigest: 'Weekly Digest Report',
            }
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--color-border-light)' }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{labels[key]}</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                    {key === 'emailAlerts' && 'Receive email notifications for important events'}
                    {key === 'batchComplete' && 'Get notified when Spring Batch jobs finish'}
                    {key === 'queryResults' && 'Alert when AI generates new query responses'}
                    {key === 'weeklyDigest' && 'Summary of weekly platform activity'}
                  </div>
                </div>
                <div className="toggle-wrapper" onClick={() => setNotifications({...notifications, [key]: !val})}>
                  <div className={`toggle ${val ? 'active' : ''}`}></div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'security' && (
        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Key size={16} /> Security Settings
          </div>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input className="form-input" type="password" placeholder="Enter current password" id="current-pw" />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input className="form-input" type="password" placeholder="Min 8 characters" id="new-pw" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input className="form-input" type="password" placeholder="Repeat new password" id="confirm-pw" />
            </div>
          </div>
          <button className="btn btn-primary" style={{ marginTop: 'var(--spacing-md)' }} id="change-pw-btn"><Key size={16} /> Update Password</button>

          <div style={{ marginTop: 'var(--spacing-2xl)', paddingTop: 'var(--spacing-xl)', borderTop: '1px solid var(--color-border)' }}>
            <h4 style={{ marginBottom: 'var(--spacing-md)' }}>Active Sessions</h4>
            {[
              { device: 'Windows Desktop — Chrome', ip: '192.168.1.10', time: 'Now', current: true },
              { device: 'Android Phone — Mobile App', ip: '192.168.1.22', time: '3 hr ago', current: false },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--color-border-light)' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 'var(--font-size-base)' }}>{s.device}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>IP: {s.ip} · {s.time}</div>
                </div>
                {s.current
                  ? <span className="badge badge-success"><span className="badge-dot"></span> Current</span>
                  : <button className="btn btn-sm btn-secondary">Revoke</button>
                }
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
