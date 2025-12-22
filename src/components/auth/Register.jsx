import { useState } from 'react'
import { Container, Card, Form, InputGroup, Button } from 'react-bootstrap'
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
              <div className="login-icon-wrapper mx-auto mb-3">
                <span className="login-icon">✦</span>
              </div>
              <h1 className="login-title">
                <span className="text-purple">[How]</span> ToDoList
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
                  Correo Electrónico
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
                  Confirmar Contraseña
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
                Crear Cuenta <span className="ms-2">→</span>
              </Button>

              {/* Login link */}
              <p className="text-center mt-4 mb-0 register-text">
                ¿Ya tienes una cuenta?{' '}
                <a href="#" className="register-link">Inicia Sesión</a>
              </p>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  )
}

export default Register
