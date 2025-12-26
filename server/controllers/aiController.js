const { getDB, saveDB } = require('../config/db')
const { 
  generateTaskContent, 
  generateBasicTaskContent, 
  generateAdvancedTaskContent,
  generateContextQuestions,
  moderateContent, 
  isAiAvailable,
  creativityToTemperature
} = require('../config/ai')

// Generate AI content for a task
const generate = async (req, res) => {
  try {
    // Check if AI is available
    if (!isAiAvailable()) {
      return res.status(503).json({ 
        error: 'Servicio de IA no disponible.',
        reason: 'El servicio de IA no está configurado. Contacta al administrador.'
      })
    }

    const { title, description, userPrompt, cardId } = req.body
    const userId = req.user.id

    if (!title) {
      return res.status(400).json({ error: 'El título es obligatorio.' })
    }

    const db = getDB()

    // Step 1: Content moderation
    const moderationResult = await moderateContent(title, description, userPrompt)
    
    // Log the moderation attempt
    const moderationLog = {
      id: Date.now(),
      userId: userId,
      cardId: cardId || null,
      type: 'moderation',
      input: { title, description, userPrompt },
      output: moderationResult,
      timestamp: new Date().toISOString()
    }
    
    if (!db.aiLogs) db.aiLogs = []
    db.aiLogs.push(moderationLog)

    if (!moderationResult.approved) {
      saveDB(db)
      return res.status(400).json({ 
        error: 'Contenido no permitido', 
        reason: moderationResult.reason || 'El contenido no cumple con las políticas de uso.'
      })
    }

    // Step 2: Generate content
    const generatedContent = await generateTaskContent(title, description, userPrompt)

    // Log the generation
    const generationLog = {
      id: Date.now() + 1,
      userId: userId,
      cardId: cardId || null,
      type: 'generation',
      input: { title, description, userPrompt },
      output: generatedContent,
      timestamp: new Date().toISOString()
    }
    db.aiLogs.push(generationLog)

    // Step 3: Increment user's AI usage count
    const userIndex = db.users.findIndex(u => u.id === userId)
    if (userIndex !== -1) {
      if (!db.users[userIndex].aiUsageCount) {
        db.users[userIndex].aiUsageCount = 0
      }
      db.users[userIndex].aiUsageCount++
    }

    saveDB(db)

    res.json({ 
      success: true,
      content: generatedContent,
      usageCount: db.users[userIndex]?.aiUsageCount || 1
    })

  } catch (error) {
    console.error('AI Generate error:', error)
    
    // Check for API key issues
    if (error.message?.includes('API key') || error.status === 401) {
      return res.status(500).json({ error: 'Error de configuración del servicio de IA.' })
    }
    
    res.status(500).json({ error: 'Error al generar contenido con IA.' })
  }
}

// Get AI usage stats for current user
const getUsageStats = (req, res) => {
  try {
    const db = getDB()
    const user = db.users.find(u => u.id === req.user.id)
    
    res.json({
      aiUsageCount: user?.aiUsageCount || 0
    })
  } catch (error) {
    console.error('GetUsageStats error:', error)
    res.status(500).json({ error: 'Error al obtener estadísticas.' })
  }
}

// Get AI logs (admin only - for future use)
const getLogs = (req, res) => {
  try {
    const db = getDB()
    // For now, users can only see their own logs count
    const userLogs = (db.aiLogs || []).filter(log => log.userId === req.user.id)
    
    res.json({
      totalLogs: userLogs.length,
      // Don't expose full log content to regular users
    })
  } catch (error) {
    console.error('GetLogs error:', error)
    res.status(500).json({ error: 'Error al obtener logs.' })
  }
}

// Generate context questions for advanced mode
const generateQuestions = async (req, res) => {
  try {
    if (!isAiAvailable()) {
      return res.status(503).json({ 
        error: 'Servicio de IA no disponible.',
        reason: 'El servicio de IA no está configurado. Contacta al administrador.'
      })
    }

    const { title, description, userPrompt } = req.body
    const userId = req.user.id

    if (!title) {
      return res.status(400).json({ error: 'El título es obligatorio.' })
    }

    const db = getDB()

    // Step 1: Content moderation
    const moderationResult = await moderateContent(title, description, userPrompt)
    
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

    if (!moderationResult.approved) {
      saveDB(db)
      return res.status(400).json({ 
        error: 'Contenido no permitido', 
        reason: moderationResult.reason || 'El contenido no cumple con las políticas de uso.'
      })
    }

    // Step 2: Generate questions
    const questions = await generateContextQuestions(title, description, userPrompt)

    res.json({ 
      success: true,
      questions: questions
    })

  } catch (error) {
    console.error('AI Questions error:', error)
    
    if (error.message?.includes('API key') || error.status === 401) {
      return res.status(500).json({ error: 'Error de configuración del servicio de IA.' })
    }
    
    res.status(500).json({ error: 'Error al generar preguntas con IA.' })
  }
}

// Generate basic content (title + description only)
const generateBasic = async (req, res) => {
  try {
    if (!isAiAvailable()) {
      return res.status(503).json({ 
        error: 'Servicio de IA no disponible.',
        reason: 'El servicio de IA no está configurado. Contacta al administrador.'
      })
    }

    const { title, description, cardId } = req.body
    const userId = req.user.id

    if (!title) {
      return res.status(400).json({ error: 'El título es obligatorio.' })
    }

    const db = getDB()

    // Step 1: Content moderation
    const moderationResult = await moderateContent(title, description, '')
    
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

    if (!moderationResult.approved) {
      saveDB(db)
      return res.status(400).json({ 
        error: 'Contenido no permitido', 
        reason: moderationResult.reason || 'El contenido no cumple con las políticas de uso.'
      })
    }

    // Step 2: Get user's creativity and convert to temperature
    const user = db.users.find(u => u.id === userId)
    const userCreativity = user?.creativity || 50
    const temperature = creativityToTemperature(userCreativity)

    // Step 3: Generate content
    const generatedContent = await generateBasicTaskContent(title, description, temperature)

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

    // Step 3: Increment user's AI usage count
    const userIndex = db.users.findIndex(u => u.id === userId)
    if (userIndex !== -1) {
      if (!db.users[userIndex].aiUsageCount) {
        db.users[userIndex].aiUsageCount = 0
      }
      db.users[userIndex].aiUsageCount++
    }

    saveDB(db)

    res.json({ 
      success: true,
      content: generatedContent,
      usageCount: db.users[userIndex]?.aiUsageCount || 1
    })

  } catch (error) {
    console.error('AI Generate Basic error:', error)
    
    if (error.message?.includes('API key') || error.status === 401) {
      return res.status(500).json({ error: 'Error de configuración del servicio de IA.' })
    }
    
    res.status(500).json({ error: 'Error al generar contenido con IA.' })
  }
}

// Generate advanced content (with questions answered)
const generateAdvanced = async (req, res) => {
  try {
    if (!isAiAvailable()) {
      return res.status(503).json({ 
        error: 'Servicio de IA no disponible.',
        reason: 'El servicio de IA no está configurado. Contacta al administrador.'
      })
    }

    const { title, description, userPrompt, answers, cardId } = req.body
    const userId = req.user.id

    if (!title) {
      return res.status(400).json({ error: 'El título es obligatorio.' })
    }

    const db = getDB()

    // Step 1: Content moderation
    const moderationResult = await moderateContent(title, description, userPrompt)
    
    const moderationLog = {
      id: Date.now(),
      userId: userId,
      cardId: cardId || null,
      type: 'moderation',
      input: { title, description, userPrompt },
      output: moderationResult,
      timestamp: new Date().toISOString()
    }
    
    if (!db.aiLogs) db.aiLogs = []
    db.aiLogs.push(moderationLog)

    if (!moderationResult.approved) {
      saveDB(db)
      return res.status(400).json({ 
        error: 'Contenido no permitido', 
        reason: moderationResult.reason || 'El contenido no cumple con las políticas de uso.'
      })
    }

    // Step 2: Get user's creativity and convert to temperature
    const user = db.users.find(u => u.id === userId)
    const userCreativity = user?.creativity || 50
    const temperature = creativityToTemperature(userCreativity)

    // Step 3: Generate content with answers
    const generatedContent = await generateAdvancedTaskContent(title, description, userPrompt, answers || {}, temperature)

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

    // Step 3: Increment user's AI usage count
    const userIndex = db.users.findIndex(u => u.id === userId)
    if (userIndex !== -1) {
      if (!db.users[userIndex].aiUsageCount) {
        db.users[userIndex].aiUsageCount = 0
      }
      db.users[userIndex].aiUsageCount++
    }

    saveDB(db)

    res.json({ 
      success: true,
      content: generatedContent,
      usageCount: db.users[userIndex]?.aiUsageCount || 1
    })

  } catch (error) {
    console.error('AI Generate Advanced error:', error)
    
    if (error.message?.includes('API key') || error.status === 401) {
      return res.status(500).json({ error: 'Error de configuración del servicio de IA.' })
    }
    
    res.status(500).json({ error: 'Error al generar contenido con IA.' })
  }
}

module.exports = { generate, generateBasic, generateAdvanced, generateQuestions, getUsageStats, getLogs }

