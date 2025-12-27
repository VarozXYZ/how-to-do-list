const { getDB, saveDB } = require('../config/db')
const { 
  generateBasicTaskContent, 
  generateAdvancedTaskContent,
  generateContextQuestions,
  moderateContent, 
  isAiAvailable,
  creativityToTemperature
} = require('../config/ai')
const log = require('../utils/logger')

// Helper function for duration formatting
const formatDuration = (ms) => {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

// Get AI usage stats for current user
const getUsageStats = (req, res) => {
  const startTime = log.operationStart('Get AI Usage Stats', req)
  try {
    log.apiRequest('GET', '/api/ai/usage', req)
    log.operationProgress('Get AI Usage Stats', 'Loading database', req)
    const db = getDB()
    const user = db.users.find(u => u.id === req.user.id)
    
    const usageCount = user?.aiUsageCount || 0
    log.success('AI usage stats retrieved', { userId: req.user.id, usageCount })
    log.operationEnd('Get AI Usage Stats', startTime, req, { usageCount })
    log.apiResponse('GET', '/api/ai/usage', 200, req, { usageCount })
    
    res.json({
      aiUsageCount: usageCount
    })
  } catch (error) {
    log.error('Get AI Usage Stats failed', error, { userId: req.user.id })
    log.operationEnd('Get AI Usage Stats', startTime, req, { error: true })
    log.apiResponse('GET', '/api/ai/usage', 500, req)
    res.status(500).json({ error: 'Error al obtener estadísticas.' })
  }
}

// Get AI logs (admin only - for future use)
const getLogs = (req, res) => {
  const startTime = log.operationStart('Get AI Logs', req)
  try {
    log.apiRequest('GET', '/api/ai/logs', req)
    log.operationProgress('Get AI Logs', 'Loading database', req)
    const db = getDB()
    // For now, users can only see their own logs count
    const userLogs = (db.aiLogs || []).filter(log => log.userId === req.user.id)
    
    const totalLogs = userLogs.length
    log.success('AI logs retrieved', { userId: req.user.id, totalLogs })
    log.operationEnd('Get AI Logs', startTime, req, { totalLogs })
    log.apiResponse('GET', '/api/ai/logs', 200, req, { totalLogs })
    
    res.json({
      totalLogs: totalLogs,
      // Don't expose full log content to regular users
    })
  } catch (error) {
    log.error('Get AI Logs failed', error, { userId: req.user.id })
    log.operationEnd('Get AI Logs', startTime, req, { error: true })
    log.apiResponse('GET', '/api/ai/logs', 500, req)
    res.status(500).json({ error: 'Error al obtener logs.' })
  }
}

// Generate context questions for advanced mode
const generateQuestions = async (req, res) => {
  const startTime = log.operationStart('AI Generate Questions', req, { 
    title: req.body.title?.substring(0, 50),
    hasUserPrompt: !!req.body.userPrompt
  })

  try {
    log.apiRequest('POST', '/api/ai/questions', req)

    if (!isAiAvailable()) {
      log.warn('AI service not available', { userId: req.user.id })
      log.apiResponse('POST', '/api/ai/questions', 503, req)
      return res.status(503).json({ 
        error: 'Servicio de IA no disponible.',
        reason: 'El servicio de IA no está configurado. Contacta al administrador.'
      })
    }

    const { title, description, userPrompt } = req.body
    const userId = req.user.id

    if (!title) {
      log.warn('Missing title in request', { userId })
      log.apiResponse('POST', '/api/ai/questions', 400, req)
      return res.status(400).json({ error: 'El título es obligatorio.' })
    }

    log.operationProgress('AI Generate Questions', 'Loading database', req)
    const db = getDB()
    log.dbOperation('Database loaded', { userId })

    // Step 1: Content moderation
    log.operationProgress('AI Generate Questions', 'Content moderation', req, { 
      title: title.substring(0, 50),
      hasUserPrompt: !!userPrompt
    })
    log.waiting('AI moderation API response', { 
      title: title.substring(0, 50),
      userPromptLength: userPrompt?.length || 0
    })
    const moderationStart = Date.now()
    const moderationResult = await moderateContent(title, description, userPrompt)
    log.aiOperation('Moderation', 'Completed', { 
      approved: moderationResult.approved,
      duration: formatDuration(Date.now() - moderationStart)
    })
    
    const moderationLog = {
      id: Date.now(),
      userId: userId,
      type: 'moderation',
      input: { title, description, userPrompt },
      output: moderationResult,
      timestamp: new Date().toISOString()
    }
    
    if (!db.aiLogs) db.aiLogs = []
    db.aiLogs.push(moderationLog)
    log.dbOperation('Moderation log saved', { logId: moderationLog.id })

    if (!moderationResult.approved) {
      log.warn('Content not approved by moderation', { 
        userId, 
        reason: moderationResult.reason,
        title: title.substring(0, 50)
      })
      saveDB(db)
      log.apiResponse('POST', '/api/ai/questions', 400, req)
      return res.status(400).json({ 
        error: 'Contenido no permitido', 
        reason: moderationResult.reason || 'El contenido no cumple con las políticas de uso.'
      })
    }

    // Step 2: Generate questions
    log.operationProgress('AI Generate Questions', 'Generating context questions', req, { 
      title: title.substring(0, 50),
      hasUserPrompt: !!userPrompt
    })
    log.waiting('AI questions generation API response', { 
      title: title.substring(0, 50),
      userPromptLength: userPrompt?.length || 0
    })
    const questionsStart = Date.now()
    const questions = await generateContextQuestions(title, description, userPrompt)
    log.aiOperation('Questions Generation', 'Completed', { 
      questionsCount: questions.length,
      duration: formatDuration(Date.now() - questionsStart),
      questions: questions
    })

    log.success('AI Generate Questions completed', { 
      userId, 
      questionsCount: questions.length,
      questions: questions
    })
    log.operationEnd('AI Generate Questions', startTime, req, { 
      questionsCount: questions.length 
    })
    log.apiResponse('POST', '/api/ai/questions', 200, req, { 
      questionsCount: questions.length 
    })

    res.json({ 
      success: true,
      questions: questions
    })

  } catch (error) {
    log.error('AI Generate Questions failed', error, { 
      userId: req.user.id,
      title: req.body.title?.substring(0, 50)
    })
    log.operationEnd('AI Generate Questions', startTime, req, { error: true })
    log.apiResponse('POST', '/api/ai/questions', 500, req)
    
    if (error.message?.includes('API key') || error.status === 401) {
      return res.status(500).json({ error: 'Error de configuración del servicio de IA.' })
    }
    
    res.status(500).json({ error: 'Error al generar preguntas con IA.' })
  }
}

// Generate basic content (title + description only)
const generateBasic = async (req, res) => {
  const startTime = log.operationStart('AI Generate Basic', req, { 
    title: req.body.title?.substring(0, 50),
    cardId: req.body.cardId 
  })

  try {
    log.apiRequest('POST', '/api/ai/generate-basic', req)

    if (!isAiAvailable()) {
      log.warn('AI service not available', { userId: req.user.id })
      log.apiResponse('POST', '/api/ai/generate-basic', 503, req)
      return res.status(503).json({ 
        error: 'Servicio de IA no disponible.',
        reason: 'El servicio de IA no está configurado. Contacta al administrador.'
      })
    }

    const { title, description, cardId } = req.body
    const userId = req.user.id

    if (!title) {
      log.warn('Missing title in request', { userId })
      log.apiResponse('POST', '/api/ai/generate-basic', 400, req)
      return res.status(400).json({ error: 'El título es obligatorio.' })
    }

    log.operationProgress('AI Generate Basic', 'Loading database', req)
    const db = getDB()
    log.dbOperation('Database loaded', { userId, cardId })

    // Step 1: Content moderation
    log.operationProgress('AI Generate Basic', 'Content moderation', req, { title: title.substring(0, 50) })
    log.waiting('AI moderation API response', { title: title.substring(0, 50) })
    const moderationStart = Date.now()
    const moderationResult = await moderateContent(title, description, '')
    log.aiOperation('Moderation', 'Completed', { 
      approved: moderationResult.approved,
      duration: formatDuration(Date.now() - moderationStart)
    })
    
    const moderationLog = {
      id: Date.now(),
      userId: userId,
      cardId: cardId || null,
      type: 'moderation',
      input: { title, description, userPrompt: '' },
      output: moderationResult,
      timestamp: new Date().toISOString()
    }
    
    if (!db.aiLogs) db.aiLogs = []
    db.aiLogs.push(moderationLog)
    log.dbOperation('Moderation log saved', { logId: moderationLog.id })

    if (!moderationResult.approved) {
      log.warn('Content not approved by moderation', { 
        userId, 
        reason: moderationResult.reason,
        title: title.substring(0, 50)
      })
      saveDB(db)
      log.apiResponse('POST', '/api/ai/generate-basic', 400, req)
      return res.status(400).json({ 
        error: 'Contenido no permitido', 
        reason: moderationResult.reason || 'El contenido no cumple con las políticas de uso.'
      })
    }

    // Step 2: Get user's creativity and personality
    // For basic mode, use moderate temperature (0.5-0.9 range) for balanced responses
    log.operationProgress('AI Generate Basic', 'Loading user settings', req)
    const user = db.users.find(u => u.id === userId)
    const userCreativity = user?.creativity || 50
    const userPersonality = user?.personality || 'professional'
    const username = user?.username || null
    // Map creativity to 0.5-0.9 range for basic mode (balanced: useful but not too creative)
    const temperature = 0.5 + (userCreativity / 100) * 0.4
    log.info('User AI settings loaded (Basic Mode - Lower Temperature)', { 
      userId, 
      creativity: userCreativity, 
      personality: userPersonality,
      temperature: temperature.toFixed(2),
      username 
    })

    // Step 3: Generate content
    log.operationProgress('AI Generate Basic', 'Generating content', req, { 
      temperature: temperature.toFixed(2),
      personality: userPersonality
    })
    log.waiting('AI generation API response (basic mode)', { 
      title: title.substring(0, 50),
      temperature: temperature.toFixed(2)
    })
    const generationStart = Date.now()
    const generatedContent = await generateBasicTaskContent(title, description, temperature, userPersonality, username)
    log.aiOperation('Generation', 'Completed', { 
      mode: 'basic',
      contentLength: generatedContent.length,
      duration: formatDuration(Date.now() - generationStart)
    })

    // Log the generation
    const generationLog = {
      id: Date.now() + 1,
      userId: userId,
      cardId: cardId || null,
      type: 'generation',
      mode: 'basic',
      input: { title, description },
      output: generatedContent,
      timestamp: new Date().toISOString()
    }
    db.aiLogs.push(generationLog)
    log.dbOperation('Generation log saved', { logId: generationLog.id })

    // Step 4: Increment user's AI usage count
    log.operationProgress('AI Generate Basic', 'Updating usage count', req)
    const userIndex = db.users.findIndex(u => u.id === userId)
    if (userIndex !== -1) {
      if (!db.users[userIndex].aiUsageCount) {
        db.users[userIndex].aiUsageCount = 0
      }
      db.users[userIndex].aiUsageCount++
      log.info('AI usage count incremented', { 
        userId, 
        newCount: db.users[userIndex].aiUsageCount 
      })
    }

    saveDB(db)
    log.dbOperation('Database saved', { userId })

    log.success('AI Generate Basic completed', { 
      userId, 
      contentLength: generatedContent.length,
      usageCount: db.users[userIndex]?.aiUsageCount || 1
    })
    log.operationEnd('AI Generate Basic', startTime, req, { 
      contentLength: generatedContent.length 
    })
    log.apiResponse('POST', '/api/ai/generate-basic', 200, req, { 
      contentLength: generatedContent.length 
    })

    res.json({ 
      success: true,
      content: generatedContent,
      usageCount: db.users[userIndex]?.aiUsageCount || 1
    })

  } catch (error) {
    log.error('AI Generate Basic failed', error, { 
      userId: req.user.id,
      title: req.body.title?.substring(0, 50)
    })
    log.operationEnd('AI Generate Basic', startTime, req, { error: true })
    log.apiResponse('POST', '/api/ai/generate-basic', 500, req)
    
    if (error.message?.includes('API key') || error.status === 401) {
      return res.status(500).json({ error: 'Error de configuración del servicio de IA.' })
    }
    
    res.status(500).json({ error: 'Error al generar contenido con IA.' })
  }
}

// Generate advanced content (with questions answered)
const generateAdvanced = async (req, res) => {
  const startTime = log.operationStart('AI Generate Advanced', req, { 
    title: req.body.title?.substring(0, 50),
    cardId: req.body.cardId,
    hasAnswers: !!req.body.answers && Object.keys(req.body.answers).length > 0
  })

  try {
    log.apiRequest('POST', '/api/ai/generate-advanced', req)

    if (!isAiAvailable()) {
      log.warn('AI service not available', { userId: req.user.id })
      log.apiResponse('POST', '/api/ai/generate-advanced', 503, req)
      return res.status(503).json({ 
        error: 'Servicio de IA no disponible.',
        reason: 'El servicio de IA no está configurado. Contacta al administrador.'
      })
    }

    const { title, description, userPrompt, answers, cardId } = req.body
    const userId = req.user.id

    if (!title) {
      log.warn('Missing title in request', { userId })
      log.apiResponse('POST', '/api/ai/generate-advanced', 400, req)
      return res.status(400).json({ error: 'El título es obligatorio.' })
    }

    log.operationProgress('AI Generate Advanced', 'Loading database', req)
    const db = getDB()
    log.dbOperation('Database loaded', { userId, cardId })

    // Note: Content moderation was already done in the questions step, so we skip it here
    log.info('Skipping moderation - already done in questions step', { userId, title: title.substring(0, 50) })

    // Step 1: Get user's creativity and personality
    log.operationProgress('AI Generate Advanced', 'Loading user settings', req)
    const user = db.users.find(u => u.id === userId)
    const userCreativity = user?.creativity || 50
    const userPersonality = user?.personality || 'professional'
    const username = user?.username || null
    const temperature = creativityToTemperature(userCreativity)
    log.info('User AI settings loaded', { 
      userId, 
      creativity: userCreativity, 
      personality: userPersonality,
      temperature: temperature.toFixed(2),
      username 
    })

    // Step 3: Generate content with answers
    log.operationProgress('AI Generate Advanced', 'Generating content', req, { 
      temperature: temperature.toFixed(2),
      personality: userPersonality,
      answersCount: answers ? Object.keys(answers).length : 0
    })
    log.waiting('AI generation API response (advanced mode with thinking)', { 
      title: title.substring(0, 50),
      temperature: temperature.toFixed(2),
      answersCount: answers ? Object.keys(answers).length : 0
    })
    const generationStart = Date.now()
    const generatedContent = await generateAdvancedTaskContent(title, description, userPrompt, answers || {}, temperature, userPersonality, username)
    log.aiOperation('Generation', 'Completed', { 
      mode: 'advanced',
      contentLength: generatedContent.length,
      duration: formatDuration(Date.now() - generationStart)
    })

    // Log the generation
    const generationLog = {
      id: Date.now() + 1,
      userId: userId,
      cardId: cardId || null,
      type: 'generation',
      mode: 'advanced',
      input: { title, description, userPrompt, answers },
      output: generatedContent,
      timestamp: new Date().toISOString()
    }
    db.aiLogs.push(generationLog)
    log.dbOperation('Generation log saved', { logId: generationLog.id })

    // Step 4: Increment user's AI usage count
    log.operationProgress('AI Generate Advanced', 'Updating usage count', req)
    const userIndex = db.users.findIndex(u => u.id === userId)
    if (userIndex !== -1) {
      if (!db.users[userIndex].aiUsageCount) {
        db.users[userIndex].aiUsageCount = 0
      }
      db.users[userIndex].aiUsageCount++
      log.info('AI usage count incremented', { 
        userId, 
        newCount: db.users[userIndex].aiUsageCount 
      })
    }

    saveDB(db)
    log.dbOperation('Database saved', { userId })

    log.success('AI Generate Advanced completed', { 
      userId, 
      contentLength: generatedContent.length,
      usageCount: db.users[userIndex]?.aiUsageCount || 1
    })
    log.operationEnd('AI Generate Advanced', startTime, req, { 
      contentLength: generatedContent.length 
    })
    log.apiResponse('POST', '/api/ai/generate-advanced', 200, req, { 
      contentLength: generatedContent.length 
    })

    res.json({ 
      success: true,
      content: generatedContent,
      usageCount: db.users[userIndex]?.aiUsageCount || 1
    })

  } catch (error) {
    log.error('AI Generate Advanced failed', error, { 
      userId: req.user.id,
      title: req.body.title?.substring(0, 50)
    })
    log.operationEnd('AI Generate Advanced', startTime, req, { error: true })
    log.apiResponse('POST', '/api/ai/generate-advanced', 500, req)
    
    if (error.message?.includes('API key') || error.status === 401) {
      return res.status(500).json({ error: 'Error de configuración del servicio de IA.' })
    }
    
    res.status(500).json({ error: 'Error al generar contenido con IA.' })
  }
}

module.exports = { generateBasic, generateAdvanced, generateQuestions, getUsageStats, getLogs }

