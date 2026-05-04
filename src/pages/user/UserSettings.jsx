import { useEffect, useMemo, useState } from 'react'
import { Settings, Key, Bell, Brain, FileText, Save, Eye, EyeOff, CheckCircle, ExternalLink } from 'lucide-react'
import { useUserWorkspace } from '../../context/UserWorkspaceContext'
import { getSettings, saveSettings } from '../../lib/localStore'
import { MODELS } from '../../lib/gemini'
import { useToast } from '../../components/Toast'

export default function UserSettings() {
  const { addToast } = useToast()
  const [tab, setTab] = useState('apikeys')
  const [queryMode, setQueryMode] = useState('basic')
  const [defaultDoc, setDefaultDoc] = useState('')
  const [notifications, setNotifications] = useState({
    batchComplete: true,
    queryResults: false,
    weeklyDigest: true,
  })
  const [saved, setSaved] = useState(false)

  const [provider, setProvider] = useState('gemini')
  const [model, setModel] = useState('gemini-1.5-flash')
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [keyTested, setKeyTested] = useState(null)
  const [testing, setTesting] = useState(false)

  const { processedDocuments, selectedDocumentId, selectDocument } = useUserWorkspace()

  const availableDocs = useMemo(
    () => processedDocuments.map((d) => ({ id: d.id, name: d.name })),
    [processedDocuments],
  )

  useEffect(() => {
    const s = getSettings()
    setProvider(s.provider || 'gemini')
    setModel(s.model || 'gemini-1.5-flash')
    setApiKey(s.apiKey || '')
    setQueryMode(s.queryMode || 'basic')
  }, [])

  useEffect(() => {
    if (selectedDocumentId && availableDocs.some((d) => d.id === selectedDocumentId)) {
      setDefaultDoc(String(selectedDocumentId))
    } else {
      setDefaultDoc(availableDocs[0] ? String(availableDocs[0].id) : '')
    }
  }, [availableDocs, selectedDocumentId])

  const handleSaveApiKey = () => {
    saveSettings({ provider, model, apiKey })
    setSaved(true)
    addToast({ message: 'API key saved successfully!', type: 'success' })
    setTimeout(() => setSaved(false), 2000)
  }

  const handleTestKey = async () => {
    if (!apiKey) return
    setTesting(true)
    setKeyTested(null)
    try {
      if (provider === 'gemini') {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: 'Say "OK"' }] }] }),
          }
        )
        if (res.ok) {
          setKeyTested(true)
          addToast({ message: 'Gemini API key is valid!', type: 'success' })
        } else {
          const err = await res.json().catch(() => ({}))
          setKeyTested(false)
          addToast({ message: err?.error?.message || 'Invalid API key', type: 'error' })
        }
      } else {
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${apiKey}` },
        })
        if (res.ok) {
          setKeyTested(true)
          addToast({ message: 'OpenAI API key is valid!', type: 'success' })
        } else {
          setKeyTested(false)
          addToast({ message: 'Invalid OpenAI API key', type: 'error' })
        }
      }
    } catch {
      setKeyTested(false)
      addToast({ message: 'Network error. Check your connection.', type: 'error' })
    } finally {
      setTesting(false)
    }
  }

  const handleProviderChange = (p) => {
    setProvider(p)
    setModel(MODELS[p][0].id)
    setKeyTested(null)
  }

  const handleSavePreferences = () => {
    if (defaultDoc) selectDocument(Number(defaultDoc))
    saveSettings({ queryMode })
    addToast({ message: 'Preferences saved!', type: 'success' })
  }

  const tabs = [
    { id: 'apikeys', label: 'API Keys', icon: Key },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  return (
    <div className="animate-fade-in" id="user-settings">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Configure your AI model, API keys, and workspace preferences.</p>
      </div>

      <div className="tabs">
        {tabs.map((t) => {
          const Icon = t.icon
          return (
            <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)} type="button">
              <Icon size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
              {t.label}
            </button>
          )
        })}
      </div>

      {tab === 'apikeys' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>

          {/* Provider Selection */}
          <div className="card">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Brain size={16} /> AI Provider &amp; Model
            </div>

            <div className="form-group">
              <label className="form-label">Provider</label>
              <div style={{ display: 'flex', gap: 12 }}>
                {['gemini', 'openai'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleProviderChange(p)}
                    style={{
                      flex: 1, padding: '14px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                      border: `2px solid ${provider === p ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      background: provider === p ? 'var(--color-primary-lighter)' : 'transparent',
                      fontWeight: provider === p ? 700 : 500,
                      transition: 'all 0.2s',
                    }}
                  >
                    {p === 'gemini' ? '🔮 Google Gemini' : '🤖 OpenAI'}
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 4, fontWeight: 400 }}>
                      {p === 'gemini' ? 'Free tier available' : 'Pay-per-token'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Model</label>
              <select className="form-input" value={model} onChange={(e) => setModel(e.target.value)}>
                {(MODELS[provider] || []).map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>API Key</span>
                <a
                  href={provider === 'gemini' ? 'https://aistudio.google.com/app/apikey' : 'https://platform.openai.com/api-keys'}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  Get {provider === 'gemini' ? 'Gemini' : 'OpenAI'} API key <ExternalLink size={11} />
                </a>
              </label>
              <div style={{ position: 'relative', display: 'flex', gap: 8 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    className="form-input"
                    type={showKey ? 'text' : 'password'}
                    placeholder={`Enter your ${provider === 'gemini' ? 'Gemini' : 'OpenAI'} API key…`}
                    value={apiKey}
                    onChange={(e) => { setApiKey(e.target.value); setKeyTested(null) }}
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((v) => !v)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 0 }}
                  >
                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  type="button"
                  onClick={handleTestKey}
                  disabled={!apiKey || testing}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {testing ? <><span className="spin" style={{ display: 'inline-block' }}>⟳</span> Testing…</> : 'Test Key'}
                </button>
              </div>
              {keyTested === true && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, color: 'var(--color-success)', fontSize: 'var(--font-size-sm)' }}>
                  <CheckCircle size={14} /> API key is valid and working
                </div>
              )}
              {keyTested === false && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, color: 'var(--color-error)', fontSize: 'var(--font-size-sm)' }}>
                  ✗ Invalid API key — check and try again
                </div>
              )}
            </div>
          </div>

          {/* How to get a key card */}
          <div className="card" style={{ background: 'var(--color-primary-lighter)', border: '1px solid rgba(249,115,22,0.2)' }}>
            <div className="card-title" style={{ color: 'var(--color-primary-dark)' }}>🚀 Getting Started (Recommended: Gemini)</div>
            <ol style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              <li>Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Google AI Studio →</a></li>
              <li>Click <strong>"Create API Key"</strong> (free account required)</li>
              <li>Copy the key and paste it above</li>
              <li>Click <strong>"Test Key"</strong> to verify it works</li>
              <li>Click <strong>"Save API Key"</strong> and start chatting!</li>
            </ol>
            <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(249,115,22,0.1)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-xs)', color: 'var(--color-primary-dark)' }}>
              💡 Gemini 1.5 Flash is free with generous limits — perfect for getting started.
            </div>
          </div>

          <button className="btn btn-primary" onClick={handleSaveApiKey} type="button" style={{ alignSelf: 'flex-start' }}>
            <Key size={16} /> {saved ? 'Saved!' : 'Save API Key'}
          </button>
        </div>
      )}

      {tab === 'preferences' && (
        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Settings size={16} /> Query Preferences
          </div>

          <div style={{ marginBottom: 'var(--spacing-xl)' }}>
            <label className="form-label">Default Query Mode</label>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { id: 'basic', label: 'Basic', desc: 'Quick answers with source references.', color: 'var(--color-primary)' },
                { id: 'reasoning', label: '🧠 Reasoning', desc: 'Detailed step-by-step breakdown.', color: 'var(--color-accent)' },
              ].map((mode) => (
                <div
                  key={mode.id}
                  style={{
                    flex: 1, minWidth: 200, padding: '16px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                    border: `2px solid ${queryMode === mode.id ? mode.color : 'var(--color-border)'}`,
                    background: queryMode === mode.id ? (mode.id === 'basic' ? 'var(--color-primary-lighter)' : 'var(--color-success-bg)') : 'transparent',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => setQueryMode(mode.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{mode.label}</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{mode.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label"><FileText size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Default Document</label>
            <select className="form-input" value={defaultDoc} onChange={(e) => setDefaultDoc(e.target.value)} disabled={availableDocs.length === 0}>
              {availableDocs.length === 0 && <option value="">No processed documents yet</option>}
              {availableDocs.map((doc) => <option key={doc.id} value={doc.id}>{doc.name}</option>)}
            </select>
          </div>

          <button className="btn btn-primary" onClick={handleSavePreferences} type="button">
            <Save size={16} /> Save Preferences
          </button>
        </div>
      )}

      {tab === 'notifications' && (
        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={16} /> Notification Preferences
          </div>
          {Object.entries(notifications).map(([key, value]) => {
            const labels = {
              batchComplete: { title: 'Batch Job Completion', desc: 'Notify when document processing finishes.' },
              queryResults: { title: 'New Query Results', desc: 'Alert when AI generates a response.' },
              weeklyDigest: { title: 'Weekly Digest', desc: 'Weekly summary of your activity.' },
            }
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--color-border-light)' }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{labels[key].title}</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{labels[key].desc}</div>
                </div>
                <div className="toggle-wrapper" onClick={() => setNotifications({ ...notifications, [key]: !value })}>
                  <div className={`toggle ${value ? 'active' : ''}`} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
