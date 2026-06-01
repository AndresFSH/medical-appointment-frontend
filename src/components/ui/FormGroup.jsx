export default function FormGroup({ label, required, hint, error, children, colSpan }) {
  const cls = [
    'form-group',
    colSpan === 2 ? 'col-span-2' : '',
    colSpan === 3 ? 'col-span-3' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={cls}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span style={{ color: 'var(--danger)', marginLeft: 2 }}>*</span>}
        </label>
      )}
      {children}
      {hint  && !error && <span className="form-hint">{hint}</span>}
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}