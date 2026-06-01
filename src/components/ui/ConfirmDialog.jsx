import Modal from './Modal.jsx'
import Icon  from './Icon.jsx'

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Eliminar', loading }) {
  return (
    <Modal open={open} onClose={onClose} title="" size="sm">
      <div style={{ textAlign: 'center', padding: '4px 0 8px' }}>
        <div className="confirm-icon-wrap" style={{ background: 'var(--danger-bg)' }}>
          <Icon name="alert" size={24} color="var(--danger)" />
        </div>
        <div className="confirm-title">{title ?? '¿Confirmar acción?'}</div>
        {message && <p className="confirm-message">{message}</p>}
      </div>
      <div className="modal-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
        <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
          Cancelar
        </button>
        <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
          {loading ? 'Eliminando…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}