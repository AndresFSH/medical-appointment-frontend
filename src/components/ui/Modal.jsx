import { useEffect } from 'react'
import Icon from './Icon.jsx'

/**
 * Modal — generic dialog
 * size: 'sm' | '' | 'lg'
 */
export default function Modal({ open, onClose, title, children, footer, size = '' }) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.() }}>
      <div className={`modal ${size ? `modal-${size}` : ''}`} role="dialog" aria-modal="true">
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Cerrar">
            <Icon name="close" size={16} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}