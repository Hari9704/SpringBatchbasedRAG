import { useState } from 'react'
import { Settings, Key, Bell, Brain, FileText, Save } from 'lucide-react'

const availableDocs = [
  { id: 1, name: 'Q3_Financial_Report.pdf' },
  { id: 2, name: 'Compliance_Guidelines_v2.docx' },
  { id: 3, name: 'SLA_Agreement_2026.pdf' },
]

export default function UserSettings() {
  const [tab, setTab] = useState('preferences')
  const [queryMode, setQueryMode] = useState('basic')
  const [defaultDoc, setDefaultDoc] = useState(1)
  const [notifications, setNotifications] = useState({
    batchComplete: true,
    queryResults: false,
    weeklyDigest: true,
  })
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="animate-fade-in" id="user-settings">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Configure your workspace preferences</p>
      </div>

      <div className="tabs">
        {['preferences', 'password', 'notifications'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'preferences' && (
        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Settings size={16} /> Query Preferences
          </div>

          {/* Query Mode */}
          <div style={{ marginBottom: 'var(--spacing-xl)' }}>
            <label className="form-label">Default Query Mode</label>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{
                flex: 1, padding: '16px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                border: `2px solid ${queryMode === 'basic' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: queryMode === 'basic' ? 'var(--color-primary-lighter)' : 'transparent',
                transition: 'all 0.2s'
              }} onClick={() => setQueryMode('basic')}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>⚡ Basic</div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Quick answers with source references</div>
              </div>
              <div style={{
                flex: 1, padding: '16px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                border: `2px solid ${queryMode === 'reasoning' ? 'var(--color-accent)' : 'var(--color-border)'}`,
                background: queryMode === 'reasoning' ? 'var(--color-success-bg)' : 'transparent',
                transition: 'all 0.2s'
              }} onClick={() => setQueryMode('reasoning')}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}><Brain size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Reasoning</div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Detailed step-by-step breakdown</div>
              </div>
            </div>
          </div>

          {/* Default Document */}
          <div className="form-group">
            <label className="form-label"><FileText size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Default Document</label>
            <select className="form-input" value={defaultDoc} onChange={e => setDefaultDoc(Number(e.target.value))}>
              {availableDocs.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 6 }}>This document will be pre-selected when you start an AI Chat.</p>
          </div>

          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={16} /> {saved ? '✅ Saved!' : 'Save Preferences'}
          </button>
        </div>
      )}

      {tab === 'password' && (
        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Key size={16} /> Change Password
          </div>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input className="form-input" type="password" placeholder="Enter current password" />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input className="form-input" type="password" placeholder="Min 8 characters" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input className="form-input" type="password" placeholder="Repeat new password" />
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleSave}>
            <Key size={16} /> {saved ? '✅ Updated!' : 'Update Password'}
          </button>
        </div>
      )}

      {tab === 'notifications' && (
        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={16} /> Notification Preferences
          </div>
          {Object.entries(notifications).map(([key, val]) => {
            const labels = {
              batchComplete: { title: 'Batch Job Completion', desc: 'Get notified when your document processing finishes' },
              queryResults: { title: 'New Query Results', desc: 'Alert when AI generates responses' },
              weeklyDigest: { title: 'Weekly Digest', desc: 'Summary of your weekly activity' },
            }
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--color-border-light)' }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{labels[key].title}</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{labels[key].desc}</div>
                </div>
                <div className="toggle-wrapper" onClick={() => setNotifications({...notifications, [key]: !val})}>
                  <div className={`toggle ${val ? 'active' : ''}`}></div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
