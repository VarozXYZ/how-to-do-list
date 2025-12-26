import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Container, Card, Form, InputGroup, Button, OverlayTrigger, Tooltip, Alert } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import ThemeToggle from '../common/ThemeToggle'
import './Login.css'

const LOGO_LIGHT = 'https://res.cloudinary.com/diycpogap/image/upload/v1766521088/logo-white_p2msnm.png'
const LOGO_DARK = 'https://res.cloudinary.com/diycpogap/image/upload/v1766521136/logo-dark_hlp0ri.png'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const { darkMode } = useTheme()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!email || !password) {
      setError('Por favor, completa todos los campos.')
      return
    }

    setLoading(true)

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      console.error('Login error details:', err)
      let errorMessage = 'Error al iniciar sesión. Inténtalo de nuevo.'
      
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        errorMessage = 'No se puede conectar al servidor. Asegúrate de que el servidor esté ejecutándose en http://localhost:3001'
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
        // Show details in development mode
        if (err.response.data.details && import.meta.env.DEV) {
          console.error('Server error details:', err.response.data.details)
        }
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-background">
      <div className="auth-theme-toggle-wrapper">
        <ThemeToggle />
      </div>
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Card className="login-card">
          <Card.Body>
            {/* Header */}
            <div className="text-center mb-4">
              <img 
                src={darkMode ? LOGO_DARK : LOGO_LIGHT} 
                alt="[How] ToDoList" 
                className="auth-logo"
              />
              <p className="login-subtitle">
                Productividad inteligente, potenciada por IA
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="danger" className="mb-3" onClose={() => setError('')} dismissible>
                {error}
              </Alert>
            )}

            {/* Form */}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">
                  Correo electrónico
                </Form.Label>
                <InputGroup>
                  <InputGroup.Text className="input-icon">
                    <span>👤</span>
                  </InputGroup.Text>
                  <Form.Control
                    type="email"
                    placeholder="nombre@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    disabled={loading}
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <Form.Label className="form-label-custom mb-0">
                    Contraseña
                  </Form.Label>
                  <a href="#" className="forgot-password-link">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <InputGroup className="mt-2">
                  <InputGroup.Text className="input-icon">
                    <span>🔒</span>
                  </InputGroup.Text>
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    disabled={loading}
                  />
                  <InputGroup.Text 
                    className="input-icon-right"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ cursor: 'pointer' }}
                  >
                    <span>{showPassword ? '🙈' : '👁'}</span>
                  </InputGroup.Text>
                </InputGroup>
              </Form.Group>

              <Button 
                type="submit" 
                className="btn-login w-100 mt-3"
                disabled={loading}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'} 
                {!loading && <span className="ms-2">→</span>}
              </Button>

              {/* Divider */}
              <div className="divider-container my-4">
                <span className="divider-line"></span>
                <span className="divider-text">O continúa con</span>
                <span className="divider-line"></span>
              </div>

              {/* Social buttons (disabled - coming soon) */}
              <div className="d-flex gap-3">
                <OverlayTrigger
                  placement="bottom"
                  overlay={<Tooltip>Próximamente</Tooltip>}
                >
                  <span className="flex-fill">
                    <Button 
                      variant="outline-secondary" 
                      className="btn-social w-100"
                      disabled
                    >
                      <span className="me-2">🔵</span> Google
                    </Button>
                  </span>
                </OverlayTrigger>
                <OverlayTrigger
                  placement="bottom"
                  overlay={<Tooltip>Próximamente</Tooltip>}
                >
                  <span className="flex-fill">
                    <Button 
                      variant="outline-secondary" 
                      className="btn-social w-100"
                      disabled
                    >
                      <span className="me-2">🍎</span> Apple
                    </Button>
                  </span>
                </OverlayTrigger>
              </div>

              {/* Register link */}
              <p className="text-center mt-4 mb-0 register-text">
                ¿No tienes una cuenta?{' '}
                <Link to="/register" className="register-link">Regístrate</Link>
              </p>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  )
}

export default Login
