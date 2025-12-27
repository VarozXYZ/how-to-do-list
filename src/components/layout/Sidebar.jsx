import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import './Sidebar.css'

const LOGO_LIGHT = 'https://res.cloudinary.com/diycpogap/image/upload/v1766521088/logo-white_p2msnm.png'
const LOGO_DARK = 'https://res.cloudinary.com/diycpogap/image/upload/v1766521136/logo-dark_hlp0ri.png'

const Sidebar = () => {
  const { user, logout } = useAuth()
  const { darkMode } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        {/* Branding */}
        <div className="sidebar-brand">
          <img 
            src={darkMode ? LOGO_DARK : LOGO_LIGHT} 
            alt="[How] ToDoList" 
            className="brand-logo"
          />
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">📋</span>
            <span className="nav-text">Mis tareas</span>
          </NavLink>
          <NavLink to="/completed" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">✔️</span>
            <span className="nav-text">Completadas</span>
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">⚙️</span>
            <span className="nav-text">Configuración</span>
          </NavLink>
          <NavLink to="/pricing" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">💎</span>
            <span className="nav-text">Planes</span>
          </NavLink>
        </nav>
      </div>

      {/* User Profile */}
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">
            <span>👤</span>
          </div>
          <div className="user-info">
            <p className="user-name">{user?.username || 'Usuario'}</p>
            <p className="user-plan">
              {user?.isAdmin ? 'Admin' : user?.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}
            </p>
          </div>
          <button 
            className="logout-btn"
            onClick={handleLogout}
            title="Cerrar sesión"
          >
            <img 
              src="https://res.cloudinary.com/diycpogap/image/upload/v1766517175/lougout_kcajlg.svg" 
              alt="Cerrar sesión"
              className="logout-icon"
            />
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
