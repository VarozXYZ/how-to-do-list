const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { getDB, saveDB } = require('../config/db')
const log = require('../utils/logger')

// Register new user
const register = async (req, res) => {
  const startTime = log.operationStart('Register User', null, { 
    email: req.body.email,
    username: req.body.username
  })
  try {
    log.apiRequest('POST', '/api/auth/register', null)
    const { username, email, password } = req.body

    // Validation
    if (!username || !email || !password) {
      log.warn('Missing required fields in registration', { hasUsername: !!username, hasEmail: !!email, hasPassword: !!password })
      log.apiResponse('POST', '/api/auth/register', 400, null)
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' })
    }

    if (password.length < 6) {
      log.warn('Password too short in registration', { email, passwordLength: password.length })
      log.apiResponse('POST', '/api/auth/register', 400, null)
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' })
    }

    log.operationProgress('Register User', 'Loading database', null)
    const db = getDB()

    // Check if user exists
    log.operationProgress('Register User', 'Checking if user exists', null, { email, username })
    const existingUser = db.users.find(u => u.email === email || u.username === username)
    if (existingUser) {
      log.warn('User already exists', { email, username, existingUserId: existingUser.id })
      log.apiResponse('POST', '/api/auth/register', 400, null)
      return res.status(400).json({ error: 'El usuario o email ya existe.' })
    }

    // Hash password
    log.operationProgress('Register User', 'Hashing password', null)
    log.waiting('Password hashing', { email })
    const hashStart = Date.now()
    const hashedPassword = await bcrypt.hash(password, 10)
    log.info('Password hashed', { email, duration: `${Date.now() - hashStart}ms` })

    // Create user
    const newUser = {
      id: db.nextUserId++,
      username,
      email,
      password: hashedPassword,
      bio: '',
      creativity: 50, // Default creativity level
      personality: 'professional', // Default personality
      plan: 'free', // Default plan: free
      isAdmin: false, // Default: not admin
      createdAt: new Date().toISOString()
    }

    log.operationProgress('Register User', 'Saving user to database', null, { userId: newUser.id })
    db.users.push(newUser)
    saveDB(db)
    log.dbOperation('User created and saved', { userId: newUser.id, email, username })

    // Generate token
    log.operationProgress('Register User', 'Generating JWT token', null)
    const token = jwt.sign(
      { id: newUser.id, username, email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    log.success('User registered successfully', { userId: newUser.id, email, username })
    log.operationEnd('Register User', startTime, null, { userId: newUser.id })
    log.apiResponse('POST', '/api/auth/register', 201, null, { userId: newUser.id })

    res.status(201).json({
      message: 'Usuario creado exitosamente.',
      token,
      user: { 
        id: newUser.id, 
        username, 
        email, 
        bio: '',
        plan: 'free',
        isAdmin: false
      }
    })
  } catch (error) {
    log.error('Register User failed', error, { email: req.body.email, username: req.body.username })
    log.operationEnd('Register User', startTime, null, { error: true })
    log.apiResponse('POST', '/api/auth/register', 500, null)
    res.status(500).json({ error: `Error al crear el usuario: ${error.message}` })
  }
}

// Login user
const login = async (req, res) => {
  const startTime = log.operationStart('Login User', null, { email: req.body.email })
  try {
    log.apiRequest('POST', '/api/auth/login', null)
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      log.warn('Missing credentials in login', { hasEmail: !!email, hasPassword: !!password })
      log.apiResponse('POST', '/api/auth/login', 400, null)
      return res.status(400).json({ error: 'Email y contraseña son obligatorios.' })
    }

    log.operationProgress('Login User', 'Loading database', null)
    const db = getDB()

    // Find user (case-insensitive email comparison)
    log.operationProgress('Login User', 'Finding user', null, { email })
    const user = db.users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase())
    if (!user) {
      log.warn('User not found for login', { email })
      log.apiResponse('POST', '/api/auth/login', 401, null)
      return res.status(401).json({ error: 'Credenciales inválidas.' })
    }

    // Validate user has required properties
    if (!user.password) {
      log.error('User found but missing password field', null, { userId: user.id, email })
      log.apiResponse('POST', '/api/auth/login', 500, null)
      return res.status(500).json({ error: 'Error en la base de datos del usuario.' })
    }

    // Check password
    log.operationProgress('Login User', 'Validating password', null, { userId: user.id })
    log.waiting('Password comparison', { userId: user.id })
    const compareStart = Date.now()
    const validPassword = await bcrypt.compare(password, user.password)
    log.info('Password comparison completed', { userId: user.id, valid: validPassword, duration: `${Date.now() - compareStart}ms` })
    
    if (!validPassword) {
      log.warn('Invalid password for login', { userId: user.id, email })
      log.apiResponse('POST', '/api/auth/login', 401, null)
      return res.status(401).json({ error: 'Credenciales inválidas.' })
    }

    // Validate JWT_SECRET
    if (!process.env.JWT_SECRET) {
      log.error('JWT_SECRET is not set!', null, { userId: user.id })
      log.apiResponse('POST', '/api/auth/login', 500, null)
      return res.status(500).json({ error: 'Error de configuración del servidor.' })
    }

    // Generate token
    log.operationProgress('Login User', 'Generating JWT token', null, { userId: user.id })
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    log.success('User logged in successfully', { userId: user.id, email, username: user.username })
    log.operationEnd('Login User', startTime, null, { userId: user.id })
    log.apiResponse('POST', '/api/auth/login', 200, null, { userId: user.id })

    res.json({
      message: 'Inicio de sesión exitoso.',
      token,
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        bio: user.bio,
        creativity: user.creativity || 50,
        personality: user.personality || 'professional',
        plan: user.plan || 'free',
        isAdmin: user.isAdmin || false
      }
    })
  } catch (error) {
    log.error('Login User failed', error, { email: req.body.email })
    log.operationEnd('Login User', startTime, null, { error: true })
    log.apiResponse('POST', '/api/auth/login', 500, null)
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
  const startTime = log.operationStart('Get Current User', req)
  try {
    log.apiRequest('GET', '/api/auth/me', req)
    log.operationProgress('Get Current User', 'Loading database', req)
    const db = getDB()
    const user = db.users.find(u => u.id === req.user.id)
    if (!user) {
      log.warn('User not found', { userId: req.user.id })
      log.apiResponse('GET', '/api/auth/me', 404, req)
      return res.status(404).json({ error: 'Usuario no encontrado.' })
    }
    log.success('User retrieved', { userId: user.id, username: user.username })
    log.operationEnd('Get Current User', startTime, req, { userId: user.id })
    log.apiResponse('GET', '/api/auth/me', 200, req, { userId: user.id })
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      creativity: user.creativity || 50,
      personality: user.personality || 'professional',
      plan: user.plan || 'free',
      isAdmin: user.isAdmin || false,
      createdAt: user.createdAt
    })
  } catch (error) {
    log.error('Get Current User failed', error, { userId: req.user.id })
    log.operationEnd('Get Current User', startTime, req, { error: true })
    log.apiResponse('GET', '/api/auth/me', 500, req)
    res.status(500).json({ error: 'Error al obtener usuario.' })
  }
}

// Update user profile
const updateProfile = async (req, res) => {
  const startTime = log.operationStart('Update Profile', req)
  try {
    log.apiRequest('PUT', '/api/auth/profile', req)
    const { username, bio, creativity, personality } = req.body
    log.operationProgress('Update Profile', 'Loading database', req)
    const db = getDB()
    
    const userIndex = db.users.findIndex(u => u.id === req.user.id)
    if (userIndex === -1) {
      log.warn('User not found for profile update', { userId: req.user.id })
      log.apiResponse('PUT', '/api/auth/profile', 404, req)
      return res.status(404).json({ error: 'Usuario no encontrado.' })
    }

    const fieldsToUpdate = []
    if (username) {
      log.operationProgress('Update Profile', 'Checking username availability', req, { username })
      const existing = db.users.find(u => u.username === username && u.id !== req.user.id)
      if (existing) {
        log.warn('Username already exists', { username, userId: req.user.id })
        log.apiResponse('PUT', '/api/auth/profile', 400, req)
        return res.status(400).json({ error: 'El nombre de usuario ya existe.' })
      }
      db.users[userIndex].username = username
      fieldsToUpdate.push('username')
    }

    if (bio !== undefined) {
      db.users[userIndex].bio = bio
      fieldsToUpdate.push('bio')
    }

    if (creativity !== undefined) {
      // Ensure creativity is between 0 and 100
      const oldCreativity = db.users[userIndex].creativity || 50
      db.users[userIndex].creativity = Math.max(0, Math.min(100, Number(creativity)))
      fieldsToUpdate.push(`creativity: ${oldCreativity} → ${db.users[userIndex].creativity}`)
    }

    if (personality !== undefined) {
      // Validate personality value
      const validPersonalities = ['friendly', 'professional', 'analytical']
      if (validPersonalities.includes(personality)) {
        const oldPersonality = db.users[userIndex].personality || 'professional'
        db.users[userIndex].personality = personality
        fieldsToUpdate.push(`personality: ${oldPersonality} → ${personality}`)
      }
    }

    log.operationProgress('Update Profile', 'Saving profile changes', req, { fieldsToUpdate })
    saveDB(db)
    log.dbOperation('Profile updated and saved', { userId: req.user.id, fieldsUpdated: fieldsToUpdate })

    const user = db.users[userIndex]
    log.success('Profile updated successfully', { 
      userId: user.id, 
      fieldsUpdated: fieldsToUpdate 
    })
    log.operationEnd('Update Profile', startTime, req, { userId: user.id, fieldsUpdated: fieldsToUpdate })
    log.apiResponse('PUT', '/api/auth/profile', 200, req, { userId: user.id })
    
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      creativity: user.creativity || 50,
      personality: user.personality || 'professional',
      plan: user.plan || 'free',
      isAdmin: user.isAdmin || false
    })
  } catch (error) {
    log.error('Update Profile failed', error, { userId: req.user.id })
    log.operationEnd('Update Profile', startTime, req, { error: true })
    log.apiResponse('PUT', '/api/auth/profile', 500, req)
    res.status(500).json({ error: 'Error al actualizar perfil.' })
  }
}

// Update user plan (admin only or for upgrading)
const updatePlan = async (req, res) => {
  const startTime = log.operationStart('Update Plan', req)
  try {
    log.apiRequest('PUT', '/api/auth/plan', req)
    const { plan } = req.body
    const userId = req.user.id
    
    // Validate plan value
    const validPlans = ['free', 'pro']
    if (!validPlans.includes(plan)) {
      log.warn('Invalid plan value', { plan, userId })
      log.apiResponse('PUT', '/api/auth/plan', 400, req)
      return res.status(400).json({ error: 'Plan inválido. Planes válidos: free, pro' })
    }

    log.operationProgress('Update Plan', 'Loading database', req)
    const db = getDB()
    
    const userIndex = db.users.findIndex(u => u.id === userId)
    if (userIndex === -1) {
      log.warn('User not found for plan update', { userId })
      log.apiResponse('PUT', '/api/auth/plan', 404, req)
      return res.status(404).json({ error: 'Usuario no encontrado.' })
    }

    const oldPlan = db.users[userIndex].plan || 'free'
    db.users[userIndex].plan = plan
    
    log.operationProgress('Update Plan', 'Saving plan change', req, { oldPlan, newPlan: plan })
    saveDB(db)
    log.dbOperation('Plan updated and saved', { userId, oldPlan, newPlan: plan })

    const user = db.users[userIndex]
    log.success('Plan updated successfully', { 
      userId: user.id, 
      oldPlan, 
      newPlan: plan 
    })
    log.operationEnd('Update Plan', startTime, req, { userId: user.id, oldPlan, newPlan: plan })
    log.apiResponse('PUT', '/api/auth/plan', 200, req, { userId: user.id })
    
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      plan: user.plan,
      isAdmin: user.isAdmin || false
    })
  } catch (error) {
    log.error('Update Plan failed', error, { userId: req.user.id })
    log.operationEnd('Update Plan', startTime, req, { error: true })
    log.apiResponse('PUT', '/api/auth/plan', 500, req)
    res.status(500).json({ error: 'Error al actualizar plan.' })
  }
}

module.exports = { register, login, getMe, updateProfile, updatePlan }
