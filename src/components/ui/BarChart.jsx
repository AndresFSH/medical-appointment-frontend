export default function BarChart({ items = [], color }) {
  const max = Math.max(...items.map(i => i.value), 1)
  return (
    <div className="bar-chart">
      {items.map((item, idx) => (
        <div key={idx} className="bar-row">
          <span className="bar-label">{item.label}</span>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{
                width: `${(item.value / max) * 100}%`,
                background: color ?? 'var(--accent)',
              }}
            />
          </div>
          <span className="bar-value">{item.value}</span>
        </div>
      ))}
    </div>
  )
}
