import Icon from './Icon.jsx'

export default function EmptyState({ icon = 'search', title = 'Sin resultados', sub, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon name={icon} size={24} />
      </div>
      <div className="empty-state-title">{title}</div>
      {sub   && <p className="empty-state-sub">{sub}</p>}
      {action && action}
    </div>
  )
}