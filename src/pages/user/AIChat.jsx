import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, Send, Upload, FileText, Brain, ChevronDown, Sparkles, BookOpen } from 'lucide-react'

const availableDocs = [
  { id: 1, name: 'Q3_Financial_Report.pdf', chunks: 23 },
  { id: 2, name: 'Compliance_Guidelines_v2.docx', chunks: 15 },
  { id: 3, name: 'SLA_Agreement_2026.pdf', chunks: 42 },
]

const mockResponses = {
  default: {
    answer: 'Based on the document analysis, I found the following key insights from the selected document. The RAG pipeline retrieved 3 relevant chunks with high semantic similarity, cross-referenced across multiple sections to ensure accuracy.',
    sources: [
      { chunk: 'Section 3.2 — Risk Assessment', relevance: 97 },
      { chunk: 'Section 5.1 — Financial Summary', relevance: 91 },
      { chunk: 'Appendix A — Supporting Data', relevance: 84 },
    ],
    confidence: 94,
  }
}

export default function AIChat() {
  const navigate = useNavigate()
  const [hasDocuments] = useState(availableDocs.length > 0) // In real app, fetch from API
  const [selectedDoc, setSelectedDoc] = useState(availableDocs[0]?.id || null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [reasoning, setReasoning] = useState(false)
  const [showDocPicker, setShowDocPicker] = useState(false)

  // NO DOCUMENT → NO CHAT GATE
  if (!hasDocuments) {
    return (
      <div className="animate-fade-in" id="ai-chat-gate">
        <div className="page-header">
          <h1>AI Chat</h1>
          <p>Chat with your documents using RAG-powered AI</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
          <div style={{ width: 80, height: 80, borderRadius: 'var(--radius-full)', background: 'var(--color-primary-lighter)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--spacing-lg)', fontSize: 36 }}>
            <Upload size={36} />
          </div>
          <h2 style={{ marginBottom: 8 }}>Upload a Document First</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-xl)', maxWidth: 400, margin: '0 auto var(--spacing-xl)' }}>
            You need to upload and process at least one document before you can start an AI conversation. The system uses your documents as the knowledge base.
          </p>
          <button className="btn btn-primary" style={{ padding: '14px 32px', fontSize: 16 }} onClick={() => navigate('/app/upload')}>
            <Upload size={18} /> Upload Your First Document
          </button>
        </div>
      </div>
    )
  }

  const handleSend = () => {
    if (!input.trim()) return
    const userMsg = { role: 'user', content: input }
    const resp = mockResponses.default
    const aiMsg = {
      role: 'ai', content: resp.answer,
      sources: resp.sources, confidence: resp.confidence,
      reasoning: reasoning
    }
    setMessages([...messages, userMsg, aiMsg])
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const currentDoc = availableDocs.find(d => d.id === selectedDoc)

  return (
    <div className="animate-fade-in" id="ai-chat">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1>AI Chat</h1>
          <p>Chat with your documents using RAG-powered AI</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Reasoning Toggle */}
          <div className="toggle-wrapper" onClick={() => setReasoning(!reasoning)}>
            <div className={`toggle ${reasoning ? 'active' : ''}`}></div>
            <span className="toggle-label"><Brain size={14} /> Reasoning</span>
          </div>
        </div>
      </div>

      {/* Document Selector */}
      <div className="card" style={{ marginBottom: 'var(--spacing-md)', padding: '12px var(--spacing-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => setShowDocPicker(!showDocPicker)}>
          <FileText size={18} style={{ color: 'var(--color-primary)' }} />
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 600 }}>{currentDoc?.name}</span>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginLeft: 8 }}>{currentDoc?.chunks} chunks</span>
          </div>
          <ChevronDown size={18} style={{ color: 'var(--color-text-muted)', transform: showDocPicker ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </div>
        {showDocPicker && (
          <div style={{ marginTop: 12, borderTop: '1px solid var(--color-border-light)', paddingTop: 12 }}>
            {availableDocs.map(doc => (
              <div key={doc.id} style={{
                padding: '10px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                background: selectedDoc === doc.id ? 'var(--color-primary-lighter)' : 'transparent',
                marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10,
                transition: 'background 0.15s'
              }} onClick={() => { setSelectedDoc(doc.id); setShowDocPicker(false) }}>
                <FileText size={16} style={{ color: selectedDoc === doc.id ? 'var(--color-primary)' : 'var(--color-text-muted)' }} />
                <span style={{ fontWeight: selectedDoc === doc.id ? 600 : 400 }}>{doc.name}</span>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginLeft: 'auto' }}>{doc.chunks} chunks</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="chat-container">
          <div className="chat-messages" style={{ minHeight: 400 }}>
            {messages.length === 0 && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                <Sparkles size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
                <h3 style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>Start a conversation</h3>
                <p style={{ fontSize: 'var(--font-size-sm)' }}>Ask anything about {currentDoc?.name}</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.role}`}>
                <div>{msg.content}</div>
                {msg.role === 'ai' && msg.sources && (
                  <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                      <BookOpen size={12} /> Sources · Confidence: {msg.confidence}%
                    </div>
                    {msg.sources.map((s, j) => (
                      <div key={j} style={{ fontSize: 'var(--font-size-xs)', padding: '4px 0', display: 'flex', justifyContent: 'space-between' }}>
                        <span>📄 {s.chunk}</span>
                        <span style={{ color: s.relevance >= 90 ? 'var(--color-accent)' : 'var(--color-warning)' }}>{s.relevance}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="chat-input-area">
            <input
              className="chat-input"
              placeholder={`Ask about ${currentDoc?.name}...`}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              id="chat-input"
            />
            <button className="btn btn-primary" onClick={handleSend} disabled={!input.trim()} id="chat-send">
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
