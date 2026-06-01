import Icon from './Icon.jsx'

export default function KPICard({ icon, value, label, sub, iconBg, iconColor }) {
  return (
    <div className="kpi-card">
      <div
        className="kpi-icon"
        style={{ background: iconBg ?? 'var(--accent-light)', color: iconColor ?? 'var(--accent)' }}
      >
        <Icon name={icon} size={20} />
      </div>
      <div>
        <div className="kpi-value">{value ?? '—'}</div>
        <div className="kpi-label">{label}</div>
        {sub && <div className="kpi-sub">{sub}</div>}
      </div>
    </div>
  )
}
