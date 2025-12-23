import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Container, Card, Form, InputGroup, Button, OverlayTrigger, Tooltip } from 'react-bootstrap'
import './Login.css'

const Register = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
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
                Crea tu cuenta y empieza a ser productivo
              </p>
            </div>

            {/* Form */}
            <Form>
              <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">
                  Nombre completo
                </Form.Label>
                <InputGroup>
                  <InputGroup.Text className="input-icon">
                    <span>👤</span>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Tu nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
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
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input"
                  />
                </InputGroup>
              </Form.Group>

              <Button type="submit" className="btn-login w-100 mt-3">
                Crear cuenta <span className="ms-2">→</span>
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
