import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Container, Card, Form, InputGroup, Button, OverlayTrigger, Tooltip } from 'react-bootstrap'
import './Login.css'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="login-background">
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Card className="login-card">
          <Card.Body>
            {/* Header */}
            <div className="text-center mb-4">
              <h1 className="login-title">
                <span className="text-blue">[How]</span>ToDoList
              </h1>
              <p className="login-subtitle">
                Productividad inteligente, potenciada por IA
              </p>
            </div>

            {/* Form */}
            <Form>
              <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">
                  Correo Electrónico o Usuario
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

              <Button type="submit" className="btn-login w-100 mt-3">
                Iniciar Sesión <span className="ms-2">→</span>
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
