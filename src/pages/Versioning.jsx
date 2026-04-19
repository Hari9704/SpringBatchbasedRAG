import { useState } from 'react'
import { GitCompare, Clock, ArrowRight, Plus, Minus, FileText } from 'lucide-react'

const versions = [
  { id: 'v3', date: '2026-04-18', author: 'System', changes: '12% content updated', active: true },
  { id: 'v2', date: '2026-04-10', author: 'Admin', changes: 'Added risk section', active: false },
  { id: 'v1', date: '2026-03-28', author: 'Upload', changes: 'Initial version', active: false },
]

const diffLines = [
  { type: 'unchanged', text: 'QUARTERLY FINANCIAL REPORT — Q3 2026' },
  { type: 'unchanged', text: '' },
  { type: 'unchanged', text: 'Executive Summary' },
  { type: 'removed', text: 'Total revenue for Q3 increased by 8% year-over-year,' },
  { type: 'removed', text: 'reaching $12.8M. Operating margins held at 21.4%.' },
  { type: 'added', text: 'Total revenue for Q3 increased by 12% year-over-year,' },
  { type: 'added', text: 'reaching $14.2M. Operating margins improved to 23.5%,' },
  { type: 'added', text: 'driven by automation initiatives and cost optimization.' },
  { type: 'unchanged', text: '' },
  { type: 'unchanged', text: 'Key Highlights:' },
  { type: 'removed', text: '• Revenue: $12.8M (+8% YoY)' },
  { type: 'added', text: '• Revenue: $14.2M (+12% YoY)' },
  { type: 'removed', text: '• Operating Margin: 21.4% (+0.8%)' },
  { type: 'added', text: '• Operating Margin: 23.5% (+2.1%)' },
  { type: 'unchanged', text: '• New Clients: 47' },
  { type: 'unchanged', text: '• Client Retention: 96.8%' },
  { type: 'unchanged', text: '' },
  { type: 'added', text: 'Risk Factors:' },
  { type: 'added', text: '1. Supply chain disruptions in APAC region' },
  { type: 'added', text: '2. Regulatory changes in EU market' },
  { type: 'added', text: '3. Currency fluctuation exposure' },
  { type: 'added', text: '4. Cybersecurity threats (elevated)' },
]

export default function Versioning() {
  const [selectedV1, setSelectedV1] = useState('v2')
  const [selectedV2, setSelectedV2] = useState('v3')

  const added = diffLines.filter(l => l.type === 'added').length
  const removed = diffLines.filter(l => l.type === 'removed').length

  return (
    <div className="animate-fade-in" id="versioning-page">
      <div className="page-header">
        <h1>Document Versioning</h1>
        <p>Track document evolution and compare versions</p>
      </div>

      <div style={{ display: 'flex', gap: 'var(--spacing-lg)' }}>
        {/* Timeline */}
        <div style={{ width: 280, flexShrink: 0 }}>
          <div className="card">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={16} /> Version Timeline
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-md)' }}>
              Q3_Financial_Report.pdf
            </div>
            <div className="timeline">
              {versions.map((v, idx) => (
                <div className="timeline-item" key={v.id}>
                  <div className={`timeline-dot ${idx === 0 ? '' : 'inactive'}`}></div>
                  <div className="timeline-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.875rem' }}>{v.id}</span>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>{v.date}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{v.changes}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: 4 }}>By: {v.author}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Diff View */}
        <div style={{ flex: 1 }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
              <div className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <GitCompare size={16} /> Version Comparison
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <select
                  className="form-input"
                  style={{ width: 80, padding: '4px 8px', fontSize: '0.8125rem' }}
                  value={selectedV1}
                  onChange={e => setSelectedV1(e.target.value)}
                >
                  {versions.map(v => <option key={v.id} value={v.id}>{v.id}</option>)}
                </select>
                <ArrowRight size={16} style={{ color: 'var(--color-text-muted)' }} />
                <select
                  className="form-input"
                  style={{ width: 80, padding: '4px 8px', fontSize: '0.8125rem' }}
                  value={selectedV2}
                  onChange={e => setSelectedV2(e.target.value)}
                >
                  {versions.map(v => <option key={v.id} value={v.id}>{v.id}</option>)}
                </select>
              </div>
            </div>

            {/* Diff Summary */}
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
              <div style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', background: 'var(--color-success-bg)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Plus size={14} style={{ color: 'var(--color-success)' }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-success)' }}>{added} lines added</span>
              </div>
              <div style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', background: 'var(--color-error-bg)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Minus size={14} style={{ color: 'var(--color-error)' }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-error)' }}>{removed} lines removed</span>
              </div>
              <div style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', background: 'var(--color-info-bg)' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-info)' }}>20% content changed</span>
              </div>
            </div>

            {/* Diff Content */}
            <div style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-light)', overflow: 'auto', maxHeight: 480 }}>
              {diffLines.map((line, idx) => (
                <div key={idx} className={`diff-line ${line.type}`}>
                  <span style={{ display: 'inline-block', width: 20, textAlign: 'center', marginRight: 8, color: 'inherit', opacity: 0.6 }}>
                    {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                  </span>
                  {line.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
