import { useApp } from '../../context/AppContext.jsx'
import Icon from './Icon.jsx'

const ICONS = {
  success: { name: 'check',  color: 'var(--success)' },
  error:   { name: 'close',  color: 'var(--danger)'  },
  warning: { name: 'alert',  color: 'var(--warning)'  },
  info:    { name: 'info',   color: 'var(--info)'     },
}

export default function ToastContainer() {
  const { toasts, removeToast } = useApp()
  if (!toasts.length) return null
  return (
    <div className="toast-container">
      {toasts.map(t => {
        const ic = ICONS[t.type] ?? ICONS.info
        return (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span className="toast-icon"><Icon name={ic.name} size={16} color={ic.color} /></span>
            <span className="toast-msg">{t.message}</span>
            <button className="btn btn-ghost btn-icon" style={{ marginLeft: 'auto' }} onClick={() => removeToast(t.id)}>
              <Icon name="close" size={13} />
            </button>
          </div>
        )
      })}
    </div>
  )
}