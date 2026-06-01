/**
 * Badge — visual status indicator
 * variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'accent'
 */
export default function Badge({ variant = 'neutral', children, dot = true }) {
  return (
    <span className={`badge badge-${variant}`}>
      {dot && <span className="badge-dot" />}
      {children}
    </span>
  )
}