import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { marked } from 'marked'
import {
  Send, Upload, FileText, Brain, ChevronDown, Sparkles, BookOpen,
  Loader, AlertCircle, Copy, Check, Trash2, Key, RefreshCw,
} from 'lucide-react'
import { useUserWorkspace } from '../../context/UserWorkspaceContext'
import { DEFAULT_USER_ID, runQuery } from '../../lib/api'
import { getSettings } from '../../lib/localStore'
import { useToast } from '../../components/Toast'

marked.setOptions({ breaks: true, gfm: true })

const PROCESSING_STATUSES = new Set(['UPLOADED', 'VALIDATING', 'EXTRACTING', 'CLEANING', 'CHUNKING', 'EMBEDDING'])

function formatStatus(status) {
  if (!status) return 'unknown'
  return String(status).toLowerCase().replace(/_/g, ' ')
}

function getMessageKey(message, index) {
  return `${message.role}-${index}-${String(message.content).slice(0, 20)}`
}

function MarkdownContent({ content }) {
  const html = useMemo(() => {
    try {
      return marked.parse(String(content || ''))
    } catch {
      return `<p>${String(content || '')}</p>`
    }
  }, [content])

  return (
    <div
      className="markdown-body"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // clipboard not available
    }
  }
  return (
    <button
      className="chat-copy-btn"
      onClick={handleCopy}
      title="Copy message"
      type="button"
      aria-label="Copy"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  )
}

function TypingDots() {
  return (
    <div className="chat-message ai" style={{ padding: '14px 18px' }}>
      <div className="typing-dots">
        <span /><span /><span />
      </div>
    </div>
  )
}

export default function AIChat() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [reasoning, setReasoning] = useState(false)
  const [showDocPicker, setShowDocPicker] = useState(false)
  const [sending, setSending] = useState(false)
  const [chatError, setChatError] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const {
    documents,
    processedDocuments,
    selectedDocument,
    selectDocument,
    latestJobsByDocumentId,
    loading,
    workspaceError,
    refreshWorkspace,
  } = useUserWorkspace()

  const currentDocument = useMemo(() => {
    if (selectedDocument?.status === 'PROCESSED') return selectedDocument
    return processedDocuments[0] || null
  }, [processedDocuments, selectedDocument])

  const pendingDocuments = documents.filter(
    (d) => PROCESSING_STATUSES.has(d.status) || d.status === 'FAILED',
  )

  useEffect(() => {
    setMessages([])
    setInput('')
    setChatError('')
  }, [currentDocument?.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  const settings = getSettings()
  const hasApiKey = Boolean(settings.apiKey)

  const handleSend = useCallback(async () => {
    const question = input.trim()
    if (!question || !currentDocument || sending) return

    if (!hasApiKey) {
      setChatError('No API key configured. Go to Settings → API Keys to add your Gemini or OpenAI key.')
      return
    }

    setMessages((prev) => [...prev, { role: 'user', content: question }])
    setInput('')
    setSending(true)
    setChatError('')

    try {
      const response = await runQuery({
        userId: DEFAULT_USER_ID,
        documentId: currentDocument.id,
        question,
        reasoning,
      })

      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: response.answer,
          confidence: response.confidence,
          sources: response.sources || [],
        },
      ])
    } catch (error) {
      const message = error.message || 'Unable to send your query right now.'
      setChatError(message)
      setMessages((prev) => [...prev, { role: 'error', content: message }])
    } finally {
      setSending(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [input, currentDocument, sending, hasApiKey, reasoning])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClearChat = () => {
    setMessages([])
    setChatError('')
    addToast({ message: 'Chat cleared', type: 'info', duration: 2000 })
  }

  const suggestedQuestions = useMemo(() => {
    if (!currentDocument) return []
    return [
      `Summarize the key points of this document`,
      `What are the main topics covered?`,
      `List the most important findings or conclusions`,
    ]
  }, [currentDocument])

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="page-header"><h1>AI Chat</h1><p>Loading your workspace…</p></div>
        <div className="card empty-state"><Loader size={24} className="spin" /><div>Loading documents…</div></div>
      </div>
    )
  }

  if (!documents.length) {
    return (
      <div className="animate-fade-in">
        <div className="page-header"><h1>AI Chat</h1><p>Chat with your documents using AI.</p></div>
        {workspaceError && (
          <div className="status-card error" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <AlertCircle size={18} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>API Error</div>
              <div className="inline-muted" style={{ marginTop: 4 }}>{workspaceError}</div>
            </div>
          </div>
        )}
        <div className="card empty-state">
          <div className="empty-state-icon-wrap"><Upload size={32} /></div>
          <h2>No documents yet</h2>
          <p>Upload a document to start chatting with your knowledge base.</p>
          <button className="btn btn-primary" onClick={() => navigate('/app/upload')} type="button">
            <Upload size={18} /> Upload Your First Document
          </button>
        </div>
      </div>
    )
  }

  if (!processedDocuments.length) {
    return (
      <div className="animate-fade-in">
        <div className="page-header"><h1>AI Chat</h1><p>Chat will unlock when a document finishes processing.</p></div>
        <div className="card">
          <div className="card-title">Documents processing…</div>
          {pendingDocuments.map((doc) => {
            const job = latestJobsByDocumentId[doc.id]
            return (
              <div key={doc.id} className="list-row">
                <div>
                  <div style={{ fontWeight: 600 }}>{doc.name}</div>
                  <div className="inline-muted">{job?.currentStep || formatStatus(doc.status)}</div>
                </div>
                <span className={`badge ${doc.status === 'FAILED' ? 'badge-error' : 'badge-processing'}`}>
                  {doc.status === 'FAILED' ? <AlertCircle size={12} /> : <Loader size={12} className="spin" />}
                  {formatStatus(doc.status)}
                </span>
              </div>
            )
          })}
          <div style={{ display: 'flex', gap: 12, marginTop: 'var(--spacing-lg)', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/app/upload')} type="button">
              <Upload size={18} /> Upload Another
            </button>
            <button className="btn btn-secondary" onClick={() => refreshWorkspace({ silent: true })} type="button">
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in" id="ai-chat" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 'var(--spacing-md)' }}>
        <div>
          <h1>AI Chat</h1>
          <p>Ask questions about your documents — powered by {getSettings().provider === 'openai' ? 'OpenAI' : 'Google Gemini'}.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {messages.length > 0 && (
            <button className="btn btn-sm btn-secondary" onClick={handleClearChat} type="button" title="Clear conversation">
              <Trash2 size={14} /> Clear
            </button>
          )}
          <div
            className="toggle-wrapper"
            onClick={() => setReasoning((v) => !v)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setReasoning((v) => !v)}
          >
            <div className={`toggle ${reasoning ? 'active' : ''}`} />
            <span className="toggle-label"><Brain size={14} /> Reasoning</span>
          </div>
        </div>
      </div>

      {/* API Key Warning */}
      {!hasApiKey && (
        <div className="status-card" style={{ marginBottom: 'var(--spacing-md)', background: 'var(--color-warning-bg)', borderColor: 'rgba(245,158,11,0.3)', color: '#92400e' }}>
          <Key size={18} />
          <div style={{ flex: 1 }}>
            <strong>API key required to use AI Chat.</strong>
            <span style={{ marginLeft: 8 }}>Add your Gemini or OpenAI key in</span>
            <button
              className="btn btn-sm"
              style={{ marginLeft: 8, background: '#f59e0b', color: 'white', padding: '2px 10px' }}
              onClick={() => navigate('/app/settings')}
              type="button"
            >
              Settings → API Keys
            </button>
          </div>
        </div>
      )}

      {/* Error banner */}
      {(workspaceError || chatError) && (
        <div className="status-card error" style={{ marginBottom: 'var(--spacing-md)' }}>
          <AlertCircle size={18} />
          <div style={{ flex: 1 }}>
            <span>{workspaceError || chatError}</span>
            {(chatError || '').includes('API key') && (
              <button
                className="btn btn-sm btn-secondary"
                style={{ marginLeft: 12 }}
                onClick={() => navigate('/app/settings')}
                type="button"
              >
                <Key size={13} /> Open Settings
              </button>
            )}
          </div>
          <button className="btn btn-sm btn-secondary" onClick={() => setChatError('')} type="button">Dismiss</button>
        </div>
      )}

      {pendingDocuments.length > 0 && (
        <div className="status-card" style={{ marginBottom: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)' }}>
          <Loader size={14} className="spin" />
          <span>{pendingDocuments.length} document(s) still processing in the background.</span>
        </div>
      )}

      {/* Document Picker */}
      <div className="card" style={{ marginBottom: 'var(--spacing-md)', padding: '10px var(--spacing-lg)' }}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
          onClick={() => setShowDocPicker((v) => !v)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setShowDocPicker((v) => !v)}
        >
          <div className="chat-doc-icon"><FileText size={16} /></div>
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 600, fontSize: 'var(--font-size-base)' }}>{currentDocument?.name}</span>
            <span className="inline-muted" style={{ marginLeft: 8 }}>{currentDocument?.chunks || 0} chunks</span>
          </div>
          <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Ready</span>
          <ChevronDown size={16} style={{ color: 'var(--color-text-muted)', transform: showDocPicker ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </div>
        {showDocPicker && (
          <div className="document-picker">
            {processedDocuments.map((doc) => (
              <button
                key={doc.id}
                className={`document-picker-option ${currentDocument?.id === doc.id ? 'active' : ''}`}
                onClick={() => { selectDocument(doc.id); setShowDocPicker(false) }}
                type="button"
              >
                <FileText size={14} />
                <span style={{ flex: 1, textAlign: 'left', fontWeight: currentDocument?.id === doc.id ? 600 : 500 }}>{doc.name}</span>
                <span className="inline-muted">{doc.chunks || 0} chunks</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="card chat-card">
        <div className="chat-messages" ref={messagesEndRef}>
          {messages.length === 0 ? (
            <div className="chat-empty">
              <div className="chat-empty-icon"><Sparkles size={36} /></div>
              <h3>Start a conversation</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 16 }}>
                Ask anything about <strong>{currentDocument?.name}</strong>
              </p>
              <div className="suggested-questions">
                {suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    className="suggested-question"
                    onClick={() => { setInput(q); inputRef.current?.focus() }}
                    type="button"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div
                  key={getMessageKey(message, index)}
                  className={`chat-message ${message.role === 'error' ? 'ai error-msg' : message.role}`}
                >
                  {message.role === 'ai' && (
                    <div className="chat-avatar ai-avatar">
                      <Sparkles size={12} />
                    </div>
                  )}
                  {message.role === 'user' && (
                    <div className="chat-avatar user-avatar">U</div>
                  )}
                  <div className="chat-bubble">
                    {message.role === 'ai'
                      ? <MarkdownContent content={message.content} />
                      : <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
                    }
                    {message.role === 'ai' && message.sources?.length > 0 && (
                      <div className="chat-sources">
                        <div className="chat-sources-title">
                          <BookOpen size={11} /> Sources · Confidence: {message.confidence ?? '--'}%
                        </div>
                        {message.sources.map((source, si) => (
                          <div key={`${source.chunk}-${si}`} className="chat-source-row">
                            <span className="source-name">{source.chunk}</span>
                            {source.preview && <span className="source-preview">{source.preview}</span>}
                            <span className="source-score">{source.relevance}%</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {message.role === 'ai' && <CopyButton text={message.content} />}
                  </div>
                </div>
              ))}
              {sending && <TypingDots />}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="chat-input-area">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder={hasApiKey ? `Ask about ${currentDocument?.name}…` : 'Add your API key in Settings to start chatting'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending || !hasApiKey}
            rows={1}
            id="chat-input"
            style={{ resize: 'none', overflowY: 'auto', maxHeight: 120 }}
          />
          <button
            className="btn btn-primary chat-send-btn"
            onClick={handleSend}
            disabled={!input.trim() || sending || !hasApiKey}
            id="chat-send"
            type="button"
            title="Send (Enter)"
          >
            {sending ? <Loader size={18} className="spin" /> : <Send size={18} />}
          </button>
        </div>
        <div className="chat-input-hint">
          Press <kbd>Enter</kbd> to send · <kbd>Shift+Enter</kbd> for new line
          {reasoning && <span className="reasoning-hint"> · <Brain size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> Reasoning mode on</span>}
        </div>
      </div>
    </div>
  )
}
