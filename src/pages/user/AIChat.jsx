import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, Upload, FileText, Brain, ChevronDown, Sparkles, BookOpen, Loader, AlertCircle } from 'lucide-react'
import { useUserWorkspace } from '../../context/UserWorkspaceContext'
import { DEFAULT_USER_ID, runQuery } from '../../lib/api'

const PROCESSING_STATUSES = new Set(['UPLOADED', 'VALIDATING', 'EXTRACTING', 'CLEANING', 'CHUNKING', 'EMBEDDING'])

function formatStatus(status) {
  return status.toLowerCase().replace(/_/g, ' ')
}

function getMessageKey(message, index) {
  return `${message.role}-${index}-${message.content.slice(0, 20)}`
}

export default function AIChat() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [reasoning, setReasoning] = useState(false)
  const [showDocPicker, setShowDocPicker] = useState(false)
  const [sending, setSending] = useState(false)
  const [chatError, setChatError] = useState('')
  const {
    documents,
    processedDocuments,
    selectedDocument,
    selectDocument,
    latestJobsByDocumentId,
    loading,
    workspaceError,
  } = useUserWorkspace()

  const currentDocument = useMemo(() => {
    if (selectedDocument?.status === 'PROCESSED') {
      return selectedDocument
    }

    return processedDocuments[0] || null
  }, [processedDocuments, selectedDocument])

  const pendingDocuments = documents.filter((document) => PROCESSING_STATUSES.has(document.status))

  useEffect(() => {
    setMessages([])
    setInput('')
    setChatError('')
  }, [currentDocument?.id])

  const handleSend = async () => {
    const question = input.trim()
    if (!question || !currentDocument || sending) {
      return
    }

    const userMessage = { role: 'user', content: question }
    setMessages((previous) => [...previous, userMessage])
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

      setMessages((previous) => [
        ...previous,
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
      setMessages((previous) => [
        ...previous,
        { role: 'error', content: message },
      ])
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  if (loading) {
    return (
      <div className="animate-fade-in" id="ai-chat-loading">
        <div className="page-header">
          <h1>AI Chat</h1>
          <p>Loading your document workspace.</p>
        </div>
        <div className="card empty-state">
          <Loader size={24} className="spin" />
          <div>Loading your documents and chat context...</div>
        </div>
      </div>
    )
  }

  if (!documents.length) {
    return (
      <div className="animate-fade-in" id="ai-chat-gate">
        <div className="page-header">
          <h1>AI Chat</h1>
          <p>Chat with your documents using RAG-powered AI.</p>
        </div>
        <div className="card empty-state">
          <Upload size={36} />
          <h2>Upload a document first</h2>
          <p>
            You need to upload and process at least one document before the chatbot can answer from your knowledge base.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/app/upload')} type="button">
            <Upload size={18} /> Upload Your First Document
          </button>
        </div>
      </div>
    )
  }

  if (!processedDocuments.length) {
    return (
      <div className="animate-fade-in" id="ai-chat-pending">
        <div className="page-header">
          <h1>AI Chat</h1>
          <p>Chat will unlock as soon as at least one document finishes processing.</p>
        </div>

        {workspaceError ? (
          <div className="status-card error" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <AlertCircle size={18} />
            <span>{workspaceError}</span>
          </div>
        ) : null}

        <div className="card">
          <div className="card-title">Documents still processing</div>
          {pendingDocuments.map((document) => {
            const job = latestJobsByDocumentId[document.id]
            return (
              <div key={document.id} className="list-row">
                <div>
                  <div style={{ fontWeight: 600 }}>{document.name}</div>
                  <div className="inline-muted">{job?.currentStep || formatStatus(document.status)}</div>
                </div>
                <span className="badge badge-processing">
                  <Loader size={12} className="spin" /> {formatStatus(document.status)}
                </span>
              </div>
            )
          })}

          {documents.some((document) => document.status === 'FAILED') ? (
            <div className="status-card error" style={{ marginTop: 'var(--spacing-lg)' }}>
              <AlertCircle size={18} />
              <span>One or more documents failed. Reprocess them from My Documents if needed.</span>
            </div>
          ) : null}

          <div style={{ display: 'flex', gap: 12, marginTop: 'var(--spacing-lg)', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/app/upload')} type="button">
              <Upload size={18} /> Upload Another Document
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/app/documents')} type="button">
              <FileText size={18} /> View Documents
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in" id="ai-chat">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1>AI Chat</h1>
          <p>Ask questions about a processed document and get RAG-backed answers.</p>
        </div>
        <div className="toggle-wrapper" onClick={() => setReasoning((value) => !value)}>
          <div className={`toggle ${reasoning ? 'active' : ''}`}></div>
          <span className="toggle-label"><Brain size={14} /> Reasoning</span>
        </div>
      </div>

      {(workspaceError || chatError) ? (
        <div className="status-card error" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <AlertCircle size={18} />
          <span>{workspaceError || chatError}</span>
        </div>
      ) : null}

      {pendingDocuments.length > 0 ? (
        <div className="status-card" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <Loader size={16} className="spin" />
          <span>{pendingDocuments.length} other document(s) are still processing in the background.</span>
        </div>
      ) : null}

      <div className="card" style={{ marginBottom: 'var(--spacing-md)', padding: '12px var(--spacing-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => setShowDocPicker((visible) => !visible)}>
          <FileText size={18} style={{ color: 'var(--color-primary)' }} />
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 600 }}>{currentDocument?.name}</span>
            <span className="inline-muted" style={{ marginLeft: 8 }}>{currentDocument?.chunks || 0} chunks</span>
          </div>
          <ChevronDown size={18} style={{ color: 'var(--color-text-muted)', transform: showDocPicker ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </div>
        {showDocPicker ? (
          <div className="document-picker">
            {processedDocuments.map((document) => (
              <button
                key={document.id}
                className={`document-picker-option ${currentDocument?.id === document.id ? 'active' : ''}`}
                onClick={() => {
                  selectDocument(document.id)
                  setShowDocPicker(false)
                }}
                type="button"
              >
                <FileText size={16} />
                <span style={{ fontWeight: currentDocument?.id === document.id ? 600 : 500 }}>{document.name}</span>
                <span className="inline-muted" style={{ marginLeft: 'auto' }}>{document.chunks || 0} chunks</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="chat-container">
          <div className="chat-messages" style={{ minHeight: 420 }}>
            {messages.length === 0 ? (
              <div className="empty-state compact" style={{ minHeight: 320 }}>
                <Sparkles size={42} />
                <h3>Start a conversation</h3>
                <p>Ask anything about {currentDocument?.name}.</p>
              </div>
            ) : null}

            {messages.map((message, index) => (
              <div key={getMessageKey(message, index)} className={`chat-message ${message.role === 'error' ? 'ai error' : message.role}`}>
                <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
                {message.role === 'ai' && message.sources?.length ? (
                  <div className="chat-sources">
                    <div className="chat-sources-title">
                      <BookOpen size={12} /> Sources · Confidence: {message.confidence ?? '--'}%
                    </div>
                    {message.sources.map((source, sourceIndex) => (
                      <div key={`${source.chunk}-${sourceIndex}`} className="chat-source-row">
                        <span>{source.chunk}</span>
                        <span style={{ fontWeight: 600 }}>
                          {typeof source.relevance === 'number' ? `${source.relevance}%` : source.relevance}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}

            {sending ? (
              <div className="chat-message ai">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Loader size={16} className="spin" />
                  <span>Retrieving relevant chunks and drafting an answer...</span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="chat-input-area">
            <input
              className="chat-input"
              placeholder={`Ask about ${currentDocument?.name}...`}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
              id="chat-input"
            />
            <button className="btn btn-primary" onClick={handleSend} disabled={!input.trim() || sending} id="chat-send" type="button">
              {sending ? <Loader size={18} className="spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
