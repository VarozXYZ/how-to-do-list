import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { getAiStats } from '../services/ai'
import { getPreferences, setPreferences } from '../utils/storage'
import './Settings.css'

const Settings = () => {
  const { user, logout, updateProfile } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const navigate = useNavigate()
  
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  // Preferences (stored in localStorage for now)
  const [notifications, setNotifications] = useState(true)
  const [sounds, setSounds] = useState(true)
  const [creativity, setCreativity] = useState(50)
  const [personality, setPersonality] = useState('professional')
  
  // AI Usage stats
  const [aiUsageCount, setAiUsageCount] = useState(0)
  const [aiLimit, setAiLimit] = useState(null)
  const [aiRemaining, setAiRemaining] = useState(null)
  
  // About Me info popover
  const [showAboutMeInfo, setShowAboutMeInfo] = useState(false)
  const aboutMeInfoRef = useRef(null)

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (aboutMeInfoRef.current && !aboutMeInfoRef.current.contains(event.target)) {
        const infoButton = event.target.closest('.info-btn')
        if (!infoButton) {
          setShowAboutMeInfo(false)
        }
      }
    }

    if (showAboutMeInfo) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showAboutMeInfo])

  // Load user data and preferences on mount
  useEffect(() => {
    if (user) {
      setUsername(user.username || '')
      setEmail(user.email || '')
      setBio(user.bio || '')
      // Load creativity from user (stored in DB) or default to 50
      setCreativity(user.creativity ?? 50)
      // Load personality from user (stored in DB) or default to professional
      setPersonality(user.personality ?? 'professional')
    }
    
    // Load preferences from localStorage (darkMode is handled by ThemeContext)
    const prefs = getPreferences()
    setNotifications(prefs.notifications ?? true)
    setSounds(prefs.sounds ?? true)
    // Only use localStorage values if user doesn't have them in DB
    if (!user?.creativity) {
      setCreativity(prefs.creativity ?? 50)
    }
    if (!user?.personality) {
      setPersonality(prefs.personality ?? 'professional')
    }
    
    // Fetch AI usage stats
    const fetchAiStats = async () => {
      try {
        const stats = await getAiStats()
        setAiUsageCount(stats.aiUsageCount || 0)
        setAiLimit(stats.limit || null)
        setAiRemaining(stats.remaining !== null ? stats.remaining : null)
      } catch (error) {
        console.error('Error fetching AI stats:', error)
      }
    }
    fetchAiStats()
  }, [user])

  const getCreativityLabel = (value) => {
    if (value < 33) return 'Preciso'
    if (value > 66) return 'Creativo'
    return 'Equilibrado'
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage({ type: '', text: '' })
    
    try {
      // Save profile, creativity and personality to backend
      await updateProfile({ username, bio, creativity, personality })
      
      // Save preferences to localStorage (darkMode is saved by ThemeContext)
      const currentPrefs = getPreferences()
      const prefs = { ...currentPrefs, notifications, sounds }
      setPreferences(prefs)
      
      setMessage({ type: 'success', text: '¡Cambios guardados correctamente!' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Error al guardar los cambios' })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset to original values
    if (user) {
      setUsername(user.username || '')
      setEmail(user.email || '')
      setBio(user.bio || '')
    }
    setMessage({ type: '', text: '' })
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <main className="settings-main">
        {/* Page Header */}
        <div className="settings-header">
          <h1 className="settings-title">Configuración de perfil</h1>
          <p className="settings-subtitle">Gestiona tu cuenta y personaliza tu experiencia con la IA.</p>
        </div>

        <div className="settings-content">
          {/* Message Alert */}
          {message.text && (
            <div className={`settings-alert ${message.type}`}>
              {message.type === 'success' ? '✅' : '❌'} {message.text}
            </div>
          )}

          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar">
                <span>👤</span>
              </div>
              <button className="avatar-edit-btn">📷</button>
            </div>
            <div className="profile-info">
              <h2 className="profile-name">{username || 'Usuario'}</h2>
              <p className="profile-email">{email}</p>
              <span className={`profile-badge ${user?.plan === 'pro' ? 'profile-badge-pro' : ''}`}>
                <span>{user?.isAdmin ? 'Admin' : user?.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}</span>
              </span>
            </div>
            <button className="change-photo-btn">
              <span>📤</span> Cambiar foto
            </button>
          </div>

          {/* Personal Information */}
          <section className="settings-section">
            <div className="section-header-settings">
              <span>👤</span>
              <h3>Información personal</h3>
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
                      disabled
                      className="disabled"
                      title="El email no se puede cambiar"
                    />
                  </div>
                </div>
                <div className="form-field full-width">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', position: 'relative' }}>
                    <label>Sobre mí</label>
                    <button
                      type="button"
                      className="info-btn"
                      onClick={() => setShowAboutMeInfo(!showAboutMeInfo)}
                      style={{
                        background: 'var(--bg-hover)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        color: 'var(--accent-primary)',
                        padding: '0.25rem 0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '24px',
                        height: '24px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--accent-primary)'
                        e.currentTarget.style.color = '#fff'
                        e.currentTarget.style.transform = 'scale(1.1)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--bg-hover)'
                        e.currentTarget.style.color = 'var(--accent-primary)'
                        e.currentTarget.style.transform = 'scale(1)'
                      }}
                    >
                      ℹ️
                    </button>
                    {showAboutMeInfo && (
                      <div 
                        ref={aboutMeInfoRef}
                        className="about-me-info-popover"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="popover-header">
                          <span>💡 Sobre mí</span>
                          <button 
                            className="popover-close"
                            onClick={() => setShowAboutMeInfo(false)}
                          >
                            ✕
                          </button>
                        </div>
                        <div className="popover-content">
                          <p>Escribe información sobre ti que pueda ser útil para las generaciones de IA.</p>
                          <p><strong>Ejemplos:</strong></p>
                          <ul>
                            <li>Si eres intolerante a la lactosa y sueles crear recetas</li>
                            <li>Si tienes preferencias dietéticas específicas</li>
                            <li>Si trabajas mejor en ciertos momentos del día</li>
                            <li>Cualquier información relevante para tus tareas</li>
                          </ul>
                          <p className="popover-note">La IA usará esta información solo cuando sea relevante para la tarea. No la forzará si no aplica.</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Ej: Intolerante a la lactosa, prefiero recetas vegetarianas, trabajo mejor por las mañanas..."
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
              <h3>Preferencias de la aplicación</h3>
            </div>
            <div className="section-card no-padding">
              <div className="preference-item">
                <div className="preference-info">
                  <div className="preference-icon purple">🌙</div>
                  <div>
                    <p className="preference-title">Modo oscuro</p>
                    <p className="preference-desc">Cambia la apariencia a tonos oscuros.</p>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={(e) => toggleDarkMode(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="preference-item">
                <div className="preference-info">
                  <div className="preference-icon pink">🔔</div>
                  <div>
                    <p className="preference-title">Notificaciones push</p>
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
                    <p className="preference-title">Efectos de sonido</p>
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
              {/* AI Usage Stats */}
              <div className="ai-usage-stats">
                <div className="ai-usage-icon">🤖</div>
                <div className="ai-usage-info">
                  <p className="ai-usage-label">Generaciones de IA utilizadas</p>
                  <div className="ai-usage-details">
                    <span className="ai-usage-count">{aiUsageCount}</span>
                    {aiLimit !== null && (
                      <>
                        <span className="ai-usage-limit">/ {aiLimit}</span>
                        {aiRemaining !== null && (
                          <span className="ai-usage-remaining">({aiRemaining} restantes)</span>
                        )}
                      </>
                    )}
                    {aiLimit === null && (
                      <span className="ai-usage-unlimited">Ilimitado</span>
                    )}
                  </div>
                  {user?.plan && (
                    <p className="ai-plan-badge">
                      Plan: {user.isAdmin ? 'Admin' : user.plan === 'pro' ? 'Pro' : 'Free'}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="ai-divider"></div>
              
              {/* Creativity Slider */}
              <div className="ai-setting">
                <div className="slider-header">
                  <label>Nivel de creatividad <span className="info-icon">ℹ️</span></label>
                  <span className="creativity-badge">{getCreativityLabel(creativity)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={creativity}
                  onChange={(e) => setCreativity(Number(e.target.value))}
                  className="creativity-slider"
                />
                <div className="slider-labels">
                  <span>PRECISO</span>
                  <span>CREATIVO</span>
                </div>
              </div>

              {/* Personality Selector */}
              <div className="ai-setting">
                <label className="personality-label">Personalidad del asistente</label>
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
            <button className="btn-logout" onClick={handleLogout}>
              <span>🚪</span> Cerrar sesión
            </button>
            <div className="footer-actions">
              <button className="btn-cancel-settings" onClick={handleCancel}>Cancelar</button>
              <button className="btn-save-settings" onClick={handleSave} disabled={saving}>
                <span>💾</span> {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Settings
