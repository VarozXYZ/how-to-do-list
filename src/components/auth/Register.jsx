import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Container, Card, Form, InputGroup, Button, OverlayTrigger, Tooltip, Alert } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import ThemeToggle from '../common/ThemeToggle'
import './Login.css'

const LOGO_LIGHT = 'https://res.cloudinary.com/diycpogap/image/upload/v1766521088/logo-white_p2msnm.png'
const LOGO_DARK = 'https://res.cloudinary.com/diycpogap/image/upload/v1766521136/logo-dark_hlp0ri.png'

const Register = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register } = useAuth()
  const { darkMode } = useTheme()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      setError('Por favor, completa todos los campos.')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)

    try {
      await register(username, email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la cuenta. Inténtalo de nuevo.')
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
                Crea tu cuenta y empieza a ser productivo
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
                  Nombre de usuario
                </Form.Label>
                <InputGroup>
                  <InputGroup.Text className="input-icon">
                    <span>👤</span>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Tu nombre de usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="form-input"
                    disabled={loading}
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">
                  Correo electrónico
                </Form.Label>
                <InputGroup>
                  <InputGroup.Text className="input-icon">
                    <span>✉️</span>
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
                <Form.Label className="form-label-custom">
                  Contraseña
                </Form.Label>
                <InputGroup>
                  <InputGroup.Text className="input-icon">
                    <span>🔒</span>
                  </InputGroup.Text>
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
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

              <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">
                  Confirmar contraseña
                </Form.Label>
                <InputGroup>
                  <InputGroup.Text className="input-icon">
                    <span>🔒</span>
                  </InputGroup.Text>
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Repite tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input"
                    disabled={loading}
                  />
                </InputGroup>
              </Form.Group>

              <Button 
                type="submit" 
                className="btn-login w-100 mt-3"
                disabled={loading}
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
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

              {/* Login link */}
              <p className="text-center mt-4 mb-0 register-text">
                ¿Ya tienes una cuenta?{' '}
                <Link to="/login" className="register-link">Inicia sesión</Link>
              </p>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  )
}

export default Register
