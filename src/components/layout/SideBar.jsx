import { NavLink, useLocation } from 'react-router-dom'
import Icon from '../ui/Icon.jsx'
import { NAV_ITEMS } from '../../utils/constants.js'

export default function Sidebar({ open, onClose }) {
  const location = useLocation()

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${open ? 'visible' : ''}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Icon name="stethoscope" size={18} color="#fff" />
          </div>
          <div>
            <div className="sidebar-logo-name">UMO</div>
            <div className="sidebar-logo-sub">Consultorios</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => {
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path)

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon name={item.icon} size={16} />
                <span>{item.label}</span>
                {isActive && <span className="sidebar-nav-dot" />}
              </NavLink>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-footer-text">UMO v1.0 © 2026</div>
        </div>
      </aside>
    </>
  )
}
