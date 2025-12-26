// Enhanced logging utility for backend operations

const getTimestamp = () => {
  return new Date().toISOString()
}

const formatDuration = (ms) => {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

const getUserInfo = (req) => {
  if (!req.user) return 'Anonymous'
  return `User[${req.user.id}](${req.user.username || req.user.email || 'unknown'})`
}

const log = {
  // Info logs - general information
  info: (message, context = {}) => {
    const timestamp = getTimestamp()
    console.log(`[${timestamp}] ℹ️  INFO: ${message}`, context && Object.keys(context).length > 0 ? context : '')
  },

  // Success logs - successful operations
  success: (message, context = {}) => {
    const timestamp = getTimestamp()
    console.log(`[${timestamp}] ✅ SUCCESS: ${message}`, context && Object.keys(context).length > 0 ? context : '')
  },

  // Warning logs - potential issues
  warn: (message, context = {}) => {
    const timestamp = getTimestamp()
    console.warn(`[${timestamp}] ⚠️  WARN: ${message}`, context && Object.keys(context).length > 0 ? context : '')
  },

  // Error logs - errors
  error: (message, error = null, context = {}) => {
    const timestamp = getTimestamp()
    const errorInfo = error ? {
      message: error.message,
      stack: error.stack,
      ...(error.status && { status: error.status }),
      ...(error.code && { code: error.code })
    } : {}
    console.error(`[${timestamp}] ❌ ERROR: ${message}`, {
      ...errorInfo,
      ...context
    })
  },

  // Operation start
  operationStart: (operation, req = null, context = {}) => {
    const timestamp = getTimestamp()
    const userInfo = req ? getUserInfo(req) : 'System'
    console.log(`[${timestamp}] 🚀 START: ${operation} | ${userInfo}`, context && Object.keys(context).length > 0 ? context : '')
    return Date.now() // Return start time for duration calculation
  },

  // Operation progress
  operationProgress: (operation, step, req = null, context = {}) => {
    const timestamp = getTimestamp()
    const userInfo = req ? getUserInfo(req) : 'System'
    console.log(`[${timestamp}] ⏳ PROGRESS: ${operation} → ${step} | ${userInfo}`, context && Object.keys(context).length > 0 ? context : '')
  },

  // Operation end
  operationEnd: (operation, startTime, req = null, context = {}) => {
    const timestamp = getTimestamp()
    const duration = formatDuration(Date.now() - startTime)
    const userInfo = req ? getUserInfo(req) : 'System'
    console.log(`[${timestamp}] ✨ END: ${operation} | ${userInfo} | Duration: ${duration}`, context && Object.keys(context).length > 0 ? context : '')
  },

  // API request
  apiRequest: (method, path, req = null, context = {}) => {
    const timestamp = getTimestamp()
    const userInfo = req ? getUserInfo(req) : 'Anonymous'
    console.log(`[${timestamp}] 📥 REQUEST: ${method} ${path} | ${userInfo}`, context && Object.keys(context).length > 0 ? context : '')
  },

  // API response
  apiResponse: (method, path, statusCode, req = null, context = {}) => {
    const timestamp = getTimestamp()
    const userInfo = req ? getUserInfo(req) : 'Anonymous'
    const emoji = statusCode >= 500 ? '❌' : statusCode >= 400 ? '⚠️' : statusCode >= 300 ? '↩️' : '✅'
    console.log(`[${timestamp}] ${emoji} RESPONSE: ${method} ${path} | Status: ${statusCode} | ${userInfo}`, context && Object.keys(context).length > 0 ? context : '')
  },

  // Database operation
  dbOperation: (operation, details = {}) => {
    const timestamp = getTimestamp()
    console.log(`[${timestamp}] 💾 DB: ${operation}`, details && Object.keys(details).length > 0 ? details : '')
  },

  // AI operation
  aiOperation: (operation, step, context = {}) => {
    const timestamp = getTimestamp()
    console.log(`[${timestamp}] 🤖 AI: ${operation} → ${step}`, context && Object.keys(context).length > 0 ? context : '')
  },

  // Waiting/loading state
  waiting: (what, context = {}) => {
    const timestamp = getTimestamp()
    console.log(`[${timestamp}] ⏳ WAITING: ${what}`, context && Object.keys(context).length > 0 ? context : '')
  }
}

module.exports = log

