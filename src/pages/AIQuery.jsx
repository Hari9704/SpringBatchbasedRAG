import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, BookOpen, Zap, ChevronDown } from 'lucide-react'

const sampleMessages = [
  {
    role: 'user',
    content: 'What are the key risks mentioned in the Q3 Financial Report?'
  },
  {
    role: 'ai',
    content: `Based on the Q3 Financial Report (v3), there are **4 key risk factors** identified:

1. **Supply chain disruptions** in the APAC region — potential delays in service delivery
2. **Regulatory changes** in the EU market — new compliance requirements expected in Q4
3. **Currency fluctuation exposure** — USD/EUR volatility impacting international contracts
4. **Cybersecurity threats (elevated)** — increased attack vectors post-digital expansion

The report recommends increasing hedging positions by 15% and expanding the compliance team by 3 FTEs to mitigate these risks.`,
    confidence: 94,
    sources: [
      { chunk: 'Q3_Financial_Report.pdf — Chunk #18', relevance: 97 },
      { chunk: 'Q3_Financial_Report.pdf — Chunk #19', relevance: 94 },
      { chunk: 'Risk_Assessment_Q2.pdf — Chunk #7', relevance: 82 },
    ]
  }
]

export default function AIQuery() {
  const [messages, setMessages] = useState(sampleMessages)
  const [input, setInput] = useState('')
  const [reasoning, setReasoning] = useState(true)
  const [deepAnalysis, setDeepAnalysis] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    setMessages(prev => [...prev, { role: 'user', content: input }])
    const query = input
    setInput('')
    
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: `I've analyzed the relevant documents for your query: "${query}"\n\nBased on the retrieved context from 3 document chunks, here is my analysis:\n\n• The query relates to content found across multiple processed documents\n• Key findings have been cross-referenced for accuracy\n• Confidence level is high based on semantic similarity scores\n\nWould you like me to break down my reasoning process?`,
        confidence: 89,
        sources: [
          { chunk: 'Document_Chunk_A — Relevance Match', relevance: 91 },
          { chunk: 'Document_Chunk_B — Context Match', relevance: 87 },
        ]
      }])
    }, 1500)
  }

  return (
    <div className="animate-fade-in" id="query-page">
      <div className="page-header">
        <h1>AI Query Interface</h1>
        <p>Ask questions about your documents using RAG-powered AI</p>
      </div>

      <div style={{ display: 'flex', gap: 'var(--spacing-lg)' }}>
        {/* Chat Area */}
        <div style={{ flex: 1 }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Toggles */}
            <div style={{ display: 'flex', gap: 'var(--spacing-xl)', padding: 'var(--spacing-md) var(--spacing-lg)', borderBottom: '1px solid var(--color-border-light)', background: 'var(--color-bg)' }}>
              <div className="toggle-wrapper" onClick={() => setReasoning(!reasoning)}>
                <div className={`toggle ${reasoning ? 'active' : ''}`}></div>
                <span className="toggle-label">✅ Reasoning Mode</span>
              </div>
              <div className="toggle-wrapper" onClick={() => setDeepAnalysis(!deepAnalysis)}>
                <div className={`toggle ${deepAnalysis ? 'active' : ''}`}></div>
                <span className="toggle-label">✅ Deep Analysis Mode</span>
              </div>
            </div>

            {/* Messages */}
            <div className="chat-messages" style={{ height: 420 }}>
              {messages.map((msg, idx) => (
                <div key={idx}>
                  <div className={`chat-message ${msg.role}`}>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                  </div>
                  {msg.confidence && (
                    <div style={{ alignSelf: 'flex-start', marginTop: 8, padding: '0 4px' }}>
                      <div className="confidence-bar" style={{ width: 220 }}>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                          Confidence: {msg.confidence}%
                        </span>
                        <div className="confidence-bar-track">
                          <div
                            className={`confidence-bar-fill ${msg.confidence >= 90 ? 'high' : msg.confidence >= 70 ? 'medium' : 'low'}`}
                            style={{ width: `${msg.confidence}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="chat-input-area">
              <input
                className="chat-input"
                placeholder="Ask a question about your documents..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                id="query-input"
              />
              <button className="btn btn-primary" onClick={handleSend} id="query-send">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Source Chunks Panel */}
        <div style={{ width: 300, flexShrink: 0 }}>
          <div className="card">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={16} /> Source Chunks
            </div>
            {messages.filter(m => m.sources).slice(-1).map((msg, mi) => (
              <div key={mi} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {msg.sources.map((src, si) => (
                  <div key={si} style={{
                    padding: '10px 12px', borderRadius: 'var(--radius-md)',
                    background: 'var(--color-bg)', border: '1px solid var(--color-border-light)'
                  }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 500, marginBottom: 4 }}>{src.chunk}</div>
                    <div className="confidence-bar">
                      <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Relevance</span>
                      <div className="confidence-bar-track">
                        <div
                          className={`confidence-bar-fill ${src.relevance >= 90 ? 'high' : src.relevance >= 70 ? 'medium' : 'low'}`}
                          style={{ width: `${src.relevance}%` }}
                        ></div>
                      </div>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 600 }}>{src.relevance}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="card" style={{ marginTop: 'var(--spacing-md)' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={16} /> Quick Actions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>🔍 Explain Answer</button>
              <button className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>📊 Analyze Deeper</button>
              <button className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>📄 Find Similar Docs</button>
              <button className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>💾 Save Response</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
