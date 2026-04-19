import { useState } from 'react'
import { FileText, Search, Trash2, RefreshCw, Eye, CheckCircle, Loader, Clock } from 'lucide-react'

const initialDocs = [
  { id: 1, name: 'Q3_Financial_Report.pdf', type: 'PDF', size: '2.4 MB', status: 'Ready', chunks: 23, uploaded: '2 min ago', version: 'v3' },
  { id: 2, name: 'Compliance_Guidelines_v2.docx', type: 'DOCX', size: '1.1 MB', status: 'Ready', chunks: 15, uploaded: '1 hr ago', version: 'v2' },
  { id: 3, name: 'SLA_Agreement_2026.pdf', type: 'PDF', size: '3.8 MB', status: 'Ready', chunks: 42, uploaded: '3 hr ago', version: 'v2' },
  { id: 4, name: 'Vendor_Contract_Draft.pdf', type: 'PDF', size: '1.7 MB', status: 'Processing', chunks: 0, uploaded: '5 min ago', version: 'v1' },
  { id: 5, name: 'HR_Policy_2026.docx', type: 'DOCX', size: '0.8 MB', status: 'Ready', chunks: 11, uploaded: '1 day ago', version: 'v1' },
]

export default function MyDocuments() {
  const [docs, setDocs] = useState(initialDocs)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = docs.filter(d => d.name.toLowerCase().includes(search.toLowerCase()))

  const handleDelete = (id) => {
    setDocs(docs.filter(d => d.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  return (
    <div className="animate-fade-in" id="my-documents">
      <div className="page-header">
        <h1>My Documents</h1>
        <p>Your personal document library</p>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 'var(--spacing-xl)' }}>
        <div className="input-with-icon" style={{ flex: 1 }}>
          <Search size={18} className="input-icon" />
          <input className="form-input" placeholder="Search your documents..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
          <FileText size={16} /> {docs.filter(d => d.status === 'Ready').length} ready · {docs.filter(d => d.status === 'Processing').length} processing
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--spacing-lg)' }}>
        {/* Document List */}
        <div style={{ flex: 1 }}>
          {filtered.map(doc => (
            <div key={doc.id} className="card" style={{
              marginBottom: 12, cursor: 'pointer',
              borderLeft: selected?.id === doc.id ? '4px solid var(--color-primary)' : '4px solid transparent',
              transition: 'all 0.2s'
            }} onClick={() => setSelected(doc)}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: doc.type === 'PDF' ? 'var(--color-primary-lighter)' : 'var(--color-info-bg)', color: doc.type === 'PDF' ? 'var(--color-primary)' : 'var(--color-info)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-base)' }}>{doc.name}</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                      {doc.type} · {doc.size} · {doc.version} · {doc.uploaded}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {doc.status === 'Ready' ? (
                    <span className="badge badge-success"><CheckCircle size={12} /> Ready · {doc.chunks} chunks</span>
                  ) : (
                    <span className="badge badge-processing"><Loader size={12} /> Processing</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div style={{ width: 320 }}>
            <div className="card">
              <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-lg)', background: 'var(--color-primary-lighter)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--spacing-md)' }}>
                  <FileText size={28} />
                </div>
                <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600 }}>{selected.name}</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 'var(--font-size-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Type</span>
                  <span className="badge badge-info">{selected.type}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Size</span>
                  <span>{selected.size}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Status</span>
                  <span className={`badge ${selected.status === 'Ready' ? 'badge-success' : 'badge-processing'}`}>{selected.status}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Chunks</span>
                  <span>{selected.chunks}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Version</span>
                  <span>{selected.version}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 'var(--spacing-lg)' }}>
                <button className="btn btn-sm btn-secondary" style={{ flex: 1 }}><Eye size={14} /> View</button>
                <button className="btn btn-sm btn-secondary" style={{ flex: 1 }}><RefreshCw size={14} /> Reprocess</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(selected.id)}><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
