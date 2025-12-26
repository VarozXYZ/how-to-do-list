const jwt = require('jsonwebtoken')
const log = require('../utils/logger')

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      log.warn('Auth middleware: No token provided', { path: req.path, method: req.method })
      return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    log.info('Auth middleware: Token validated', { userId: decoded.id, path: req.path, method: req.method })
    next()
  } catch (error) {
    log.error('Auth middleware: Token validation failed', error, { path: req.path, method: req.method })
    res.status(401).json({ error: 'Token inválido o expirado.' })
  }
}

module.exports = auth

