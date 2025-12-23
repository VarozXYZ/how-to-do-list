import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Sidebar.css'

const Sidebar = () => {
  const { user, logout } = useAuth()
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
            src="https://res.cloudinary.com/diycpogap/image/upload/v1766428693/logo_e2ytv1.png" 
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
            <p className="user-plan">Free Plan</p>
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
