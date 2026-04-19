import { useState } from 'react'
import { Search, FileText, Eye, Download, Filter, ChevronRight } from 'lucide-react'

const documents = [
  { id: 1, name: 'Q3_Financial_Report.pdf', type: 'PDF', size: '2.4 MB', date: '2026-04-18', version: 'v3', status: 'Processed', chunks: 23 },
  { id: 2, name: 'Compliance_Guidelines_v2.docx', type: 'DOCX', size: '1.1 MB', date: '2026-04-17', version: 'v2', status: 'Processed', chunks: 15 },
  { id: 3, name: 'SLA_Agreement_2026.pdf', type: 'PDF', size: '3.8 MB', date: '2026-04-16', version: 'v2', status: 'Processed', chunks: 42 },
  { id: 4, name: 'Vendor_Contracts.pdf', type: 'PDF', size: '5.2 MB', date: '2026-04-15', version: 'v1', status: 'Processed', chunks: 56 },
  { id: 5, name: 'Internal_Audit_Report.docx', type: 'DOCX', size: '1.8 MB', date: '2026-04-14', version: 'v4', status: 'Processed', chunks: 19 },
  { id: 6, name: 'Board_Meeting_Minutes.txt', type: 'TXT', size: '0.3 MB', date: '2026-04-13', version: 'v1', status: 'Processing', chunks: 0 },
  { id: 7, name: 'Risk_Assessment_Q2.pdf', type: 'PDF', size: '4.1 MB', date: '2026-04-12', version: 'v2', status: 'Processed', chunks: 38 },
  { id: 8, name: 'Policy_Update_April.docx', type: 'DOCX', size: '0.9 MB', date: '2026-04-11', version: 'v1', status: 'Processed', chunks: 11 },
]

const previewContent = `QUARTERLY FINANCIAL REPORT — Q3 2026

Executive Summary
Total revenue for Q3 increased by 12% year-over-year, 
reaching $14.2M. Operating margins improved to 23.5%, 
driven by automation initiatives and cost optimization.

Key Highlights:
• Revenue: $14.2M (+12% YoY)
• Operating Margin: 23.5% (+2.1%)
• New Clients: 47
• Client Retention: 96.8%

Risk Factors:
1. Supply chain disruptions in APAC region
2. Regulatory changes in EU market
3. Currency fluctuation exposure
4. Cybersecurity threats (elevated)

Recommendations:
- Increase hedging positions by 15%
- Accelerate digital transformation roadmap
- Expand compliance team by 3 FTEs`

export default function DocumentExplorer() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(documents[0])
  const [viewMode, setViewMode] = useState('raw')

  const filtered = documents.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="animate-fade-in" id="documents-page">
      <div className="page-header">
        <h1>Document Explorer</h1>
        <p>View and manage processed documents</p>
      </div>

      <div style={{ display: 'flex', gap: 'var(--spacing-lg)', height: 'calc(100vh - 180px)' }}>
        {/* Document List */}
        <div style={{ width: '55%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--spacing-md)' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                className="form-input"
                placeholder="Search documents..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 36 }}
                id="doc-search"
              />
            </div>
            <button className="btn btn-secondary">
              <Filter size={16} /> Filter
            </button>
          </div>

          <div className="card" style={{ flex: 1, overflow: 'auto', padding: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Size</th>
                  <th>Version</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(doc => (
                  <tr 
                    key={doc.id}
                    onClick={() => setSelected(doc)}
                    style={{
                      cursor: 'pointer',
                      background: selected?.id === doc.id ? 'var(--color-primary-lighter)' : undefined
                    }}
                    id={`doc-row-${doc.id}`}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileText size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 500, fontSize: '0.8125rem' }}>{doc.name}</div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>{doc.date} · {doc.chunks} chunks</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8125rem' }}>{doc.size}</td>
                    <td><span className="badge badge-info">{doc.version}</span></td>
                    <td>
                      <span className={`badge ${doc.status === 'Processed' ? 'badge-success' : 'badge-processing'}`}>
                        <span className="badge-dot"></span>
                        {doc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Preview Panel */}
        <div style={{ width: '45%', display: 'flex', flexDirection: 'column' }}>
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {selected ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)', paddingBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--color-border-light)' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{selected.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{selected.type} · {selected.size} · {selected.version}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-sm btn-secondary" onClick={() => setViewMode('raw')} style={viewMode === 'raw' ? { background: 'var(--color-primary-lighter)', color: 'var(--color-primary)' } : {}}>
                      Raw Text
                    </button>
                    <button className="btn btn-sm btn-secondary" onClick={() => setViewMode('structured')} style={viewMode === 'structured' ? { background: 'var(--color-primary-lighter)', color: 'var(--color-primary)' } : {}}>
                      Structured
                    </button>
                  </div>
                </div>
                <div style={{ flex: 1, overflow: 'auto', fontFamily: 'Consolas, Monaco, monospace', fontSize: '0.8125rem', lineHeight: 1.7, color: 'var(--color-text-secondary)', whiteSpace: 'pre-wrap', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md)' }}>
                  {viewMode === 'raw' ? previewContent : (
                    <div>
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>📊 Extracted Data</div>
                        <table style={{ width: '100%', fontSize: '0.75rem' }}>
                          <tbody>
                            <tr><td style={{ fontWeight: 600, padding: '4px 8px', width: 140 }}>Revenue</td><td style={{ padding: '4px 8px' }}>$14.2M</td></tr>
                            <tr><td style={{ fontWeight: 600, padding: '4px 8px' }}>Op. Margin</td><td style={{ padding: '4px 8px' }}>23.5%</td></tr>
                            <tr><td style={{ fontWeight: 600, padding: '4px 8px' }}>New Clients</td><td style={{ padding: '4px 8px' }}>47</td></tr>
                            <tr><td style={{ fontWeight: 600, padding: '4px 8px' }}>Retention</td><td style={{ padding: '4px 8px' }}>96.8%</td></tr>
                            <tr><td style={{ fontWeight: 600, padding: '4px 8px' }}>Risk Level</td><td style={{ padding: '4px 8px' }}>⚠️ Moderate</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 'var(--spacing-md)' }}>
                  <button className="btn btn-primary btn-sm"><Eye size={14} /> View Full</button>
                  <button className="btn btn-secondary btn-sm"><Download size={14} /> Export</button>
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                Select a document to preview
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
