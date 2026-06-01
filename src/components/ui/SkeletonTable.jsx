export default function SkeletonTable({ rows = 5, cols = 5 }) {
  const widths = ['30%', '20%', '15%', '20%', '15%', '12%', '10%']
  return (
    <div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="skeleton-row">
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className="skeleton skeleton-cell"
              style={{ flex: widths[c] ? `0 0 ${widths[c]}` : 1, width: widths[c] ?? 'auto' }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}