import { NavLink } from 'react-router-dom'
import './Sidebar.css'

const Sidebar = () => {
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
            <span className="nav-icon">✓</span>
            <span className="nav-text">Mis Tareas</span>
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
            <p className="user-name">Usuario</p>
            <p className="user-plan">Free Plan</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar

