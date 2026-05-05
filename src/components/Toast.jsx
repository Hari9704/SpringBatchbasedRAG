import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

let toastIdCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((messageOrObj, type = 'info', duration = 3500) => {
    let message, t, d
    if (typeof messageOrObj === 'object' && messageOrObj !== null) {
      message = messageOrObj.message
      t = messageOrObj.type || 'info'
      d = messageOrObj.duration || 3500
    } else {
      message = messageOrObj
      t = type
      d = duration
    }
    const id = ++toastIdCounter
    setToasts((prev) => [...prev, { id, message, type: t }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, d)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        pointerEvents: 'none',
      }}>
        {toasts.map((toast) => {
          const iconProps = { size: 18, style: { flexShrink: 0 } }
          const icon = toast.type === 'success'
            ? <CheckCircle {...iconProps} style={{ ...iconProps.style, color: 'var(--color-success)' }} />
            : toast.type === 'error'
              ? <AlertCircle {...iconProps} style={{ ...iconProps.style, color: 'var(--color-error)' }} />
              : <Info {...iconProps} style={{ ...iconProps.style, color: 'var(--color-info)' }} />

          const borderColor = toast.type === 'success'
            ? 'rgba(16,185,129,0.25)'
            : toast.type === 'error'
              ? 'rgba(239,68,68,0.25)'
              : 'rgba(59,130,246,0.25)'

          return (
            <div
              key={toast.id}
              style={{
                pointerEvents: 'all',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'var(--color-bg-card)',
                border: `1px solid ${borderColor}`,
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                boxShadow: 'var(--shadow-lg)',
                minWidth: 260,
                maxWidth: 380,
                animation: 'fadeInUp 0.22s ease',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 500,
                color: 'var(--color-text-primary)',
              }}
            >
              {icon}
              <span style={{ flex: 1 }}>{toast.message}</span>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                  padding: 2,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
