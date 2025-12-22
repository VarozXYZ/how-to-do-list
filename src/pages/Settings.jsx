import { useState } from 'react'
import Sidebar from '../components/layout/Sidebar'
import './Settings.css'

const Settings = () => {
  const [username, setUsername] = useState('Usuario')
  const [email, setEmail] = useState('usuario@ejemplo.com')
  const [bio, setBio] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [sounds, setSounds] = useState(true)
  const [creativity, setCreativity] = useState(50)
  const [personality, setPersonality] = useState('professional')

  const getCreativityLabel = (value) => {
    if (value < 33) return 'Preciso'
    if (value > 66) return 'Creativo'
    return 'Equilibrado'
  }

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <main className="settings-main">
        {/* Page Header */}
        <div className="settings-header">
          <h1 className="settings-title">Configuración de Perfil</h1>
          <p className="settings-subtitle">Gestiona tu cuenta y personaliza tu experiencia con la IA.</p>
        </div>

        <div className="settings-content">
          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar">
                <span>👤</span>
              </div>
              <button className="avatar-edit-btn">📷</button>
            </div>
            <div className="profile-info">
              <h2 className="profile-name">{username}</h2>
              <p className="profile-email">{email}</p>
              <span className="profile-badge">Free Plan</span>
            </div>
            <button className="change-photo-btn">
              <span>📤</span> Cambiar Foto
            </button>
          </div>

          {/* Personal Information */}
          <section className="settings-section">
            <div className="section-header-settings">
              <span>👤</span>
              <h3>Información Personal</h3>
            </div>
            <div className="section-card">
              <div className="form-grid">
                <div className="form-field">
                  <label>Nombre de usuario</label>
                  <div className="input-with-icon">
                    <span className="field-icon">👤</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Tu nombre"
                    />
                  </div>
                </div>
                <div className="form-field">
                  <label>Correo electrónico</label>
                  <div className="input-with-icon">
                    <span className="field-icon">✉️</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>
                <div className="form-field full-width">
                  <label>Biografía</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Cuéntanos un poco sobre ti..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* App Preferences */}
          <section className="settings-section">
            <div className="section-header-settings">
              <span>⚙️</span>
              <h3>Preferencias de la Aplicación</h3>
            </div>
            <div className="section-card no-padding">
              <div className="preference-item">
                <div className="preference-info">
                  <div className="preference-icon purple">🌙</div>
                  <div>
                    <p className="preference-title">Modo Oscuro</p>
                    <p className="preference-desc">Cambia la apariencia a tonos oscuros.</p>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="preference-item">
                <div className="preference-info">
                  <div className="preference-icon pink">🔔</div>
                  <div>
                    <p className="preference-title">Notificaciones Push</p>
                    <p className="preference-desc">Recibe alertas de tus tareas pendientes.</p>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="preference-item">
                <div className="preference-info">
                  <div className="preference-icon green">🔊</div>
                  <div>
                    <p className="preference-title">Efectos de Sonido</p>
                    <p className="preference-desc">Sonidos al completar tareas.</p>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={sounds}
                    onChange={(e) => setSounds(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </section>

          {/* AI Configuration */}
          <section className="settings-section">
            <div className="section-header-settings">
              <span>✨</span>
              <h3>Configuración de IA</h3>
            </div>
            <div className="section-card">
              {/* Creativity Slider */}
              <div className="ai-setting">
                <div className="slider-header">
                  <label>Nivel de Creatividad <span className="info-icon">ℹ️</span></label>
                  <span className="creativity-badge">{getCreativityLabel(creativity)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={creativity}
                  onChange={(e) => setCreativity(e.target.value)}
                  className="creativity-slider"
                />
                <div className="slider-labels">
                  <span>PRECISO</span>
                  <span>CREATIVO</span>
                </div>
              </div>

              {/* Personality Selector */}
              <div className="ai-setting">
                <label className="personality-label">Personalidad del Asistente</label>
                <div className="personality-grid">
                  <label className={`personality-option ${personality === 'friendly' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="personality"
                      value="friendly"
                      checked={personality === 'friendly'}
                      onChange={(e) => setPersonality(e.target.value)}
                    />
                    <div className="personality-icon orange">😊</div>
                    <span className="personality-name">Amigable</span>
                    <span className="personality-desc">Tono casual, usa emojis y es motivador.</span>
                  </label>
                  <label className={`personality-option ${personality === 'professional' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="personality"
                      value="professional"
                      checked={personality === 'professional'}
                      onChange={(e) => setPersonality(e.target.value)}
                    />
                    <div className="personality-icon blue">💼</div>
                    <span className="personality-name">Profesional</span>
                    <span className="personality-desc">Conciso, directo y enfocado en productividad.</span>
                  </label>
                  <label className={`personality-option ${personality === 'analytical' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="personality"
                      value="analytical"
                      checked={personality === 'analytical'}
                      onChange={(e) => setPersonality(e.target.value)}
                    />
                    <div className="personality-icon purple">🧠</div>
                    <span className="personality-name">Analítico</span>
                    <span className="personality-desc">Detallado, ofrece datos y contexto extra.</span>
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Footer Actions */}
          <div className="settings-footer">
            <button className="btn-logout">
              <span>🚪</span> Cerrar Sesión
            </button>
            <div className="footer-actions">
              <button className="btn-cancel-settings">Cancelar</button>
              <button className="btn-save-settings">
                <span>💾</span> Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Settings

