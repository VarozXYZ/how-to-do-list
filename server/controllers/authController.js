const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { getDB, saveDB } = require('../config/db')

// Register new user
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' })
    }

    const db = getDB()

    // Check if user exists
    const existingUser = db.users.find(u => u.email === email || u.username === username)
    if (existingUser) {
      return res.status(400).json({ error: 'El usuario o email ya existe.' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const newUser = {
      id: db.nextUserId++,
      username,
      email,
      password: hashedPassword,
      bio: '',
      creativity: 50, // Default creativity level
      createdAt: new Date().toISOString()
    }

    db.users.push(newUser)
    saveDB(db)

    // Generate token
    const token = jwt.sign(
      { id: newUser.id, username, email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      message: 'Usuario creado exitosamente.',
      token,
      user: { id: newUser.id, username, email, bio: '' }
    })
  } catch (error) {
    console.error('Register error:', error.message)
    res.status(500).json({ error: `Error al crear el usuario: ${error.message}` })
  }
}

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios.' })
    }

    const db = getDB()

    // Find user (case-insensitive email comparison)
    const user = db.users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase())
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas.' })
    }

    // Validate user has required properties
    if (!user.password) {
      console.error('User found but missing password field:', user)
      return res.status(500).json({ error: 'Error en la base de datos del usuario.' })
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas.' })
    }

    // Validate JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set!')
      return res.status(500).json({ error: 'Error de configuración del servidor.' })
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Inicio de sesión exitoso.',
      token,
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        bio: user.bio,
        creativity: user.creativity || 50
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    console.error('Error stack:', error.stack)
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? `Error al iniciar sesión: ${error.message}` 
      : 'Error al iniciar sesión.'
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}

// Get current user
const getMe = (req, res) => {
  try {
    const db = getDB()
    const user = db.users.find(u => u.id === req.user.id)
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' })
    }
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      creativity: user.creativity || 50,
      createdAt: user.createdAt
    })
  } catch (error) {
    console.error('GetMe error:', error)
    res.status(500).json({ error: 'Error al obtener usuario.' })
  }
}

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { username, bio, creativity } = req.body
    const db = getDB()
    
    const userIndex = db.users.findIndex(u => u.id === req.user.id)
    if (userIndex === -1) {
      return res.status(404).json({ error: 'Usuario no encontrado.' })
    }

    if (username) {
      const existing = db.users.find(u => u.username === username && u.id !== req.user.id)
      if (existing) {
        return res.status(400).json({ error: 'El nombre de usuario ya existe.' })
      }
      db.users[userIndex].username = username
    }

    if (bio !== undefined) {
      db.users[userIndex].bio = bio
    }

    if (creativity !== undefined) {
      // Ensure creativity is between 0 and 100
      db.users[userIndex].creativity = Math.max(0, Math.min(100, Number(creativity)))
    }

    saveDB(db)

    const user = db.users[userIndex]
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      creativity: user.creativity || 50
    })
  } catch (error) {
    console.error('UpdateProfile error:', error)
    res.status(500).json({ error: 'Error al actualizar perfil.' })
  }
}

module.exports = { register, login, getMe, updateProfile }
