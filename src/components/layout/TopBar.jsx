import { useLocation } from 'react-router-dom'
import { useApp } from '../../context/AppContext.jsx'
import Icon from '../ui/Icon.jsx'
import { NAV_ITEMS } from '../../utils/constants.js'

export default function TopBar({ onMenuClick }) {
  const { theme, toggleTheme } = useApp()
  const location = useLocation()

  const current = NAV_ITEMS.find(item =>
    item.path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(item.path)
  )

  return (
    <header className="topbar">
      {/* Mobile hamburger */}
      <button
        className="btn btn-ghost btn-icon mobile-menu"
        onClick={onMenuClick}
        aria-label="Menú"
        style={{ display: 'none' }}
      >
        <Icon name="menu" size={18} />
      </button>

      <span className="topbar-title">{current?.label ?? 'UMO'}</span>

      <div className="topbar-spacer" />

      {/* Theme toggle */}
      <button
        className="btn btn-ghost btn-icon"
        onClick={toggleTheme}
        aria-label="Cambiar tema"
        title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
      >
        <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} />
      </button>

      <div className="topbar-divider" />

      {/* Avatar */}
      <div className="topbar-avatar" title="Usuario">
        AD
      </div>
    </header>
  )
}