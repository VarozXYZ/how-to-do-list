const { getDB, saveDB } = require('../config/db')
const log = require('../utils/logger')

// Get all cards for user
const getCards = (req, res) => {
  const startTime = log.operationStart('Get Cards', req)
  try {
    log.apiRequest('GET', '/api/cards', req)
    log.operationProgress('Get Cards', 'Loading database', req)
    const db = getDB()
    const userCards = db.cards.filter(card => card.userId === req.user.id)
    log.dbOperation('Cards filtered', { userId: req.user.id, cardsCount: userCards.length })

    // Add tag info to each card
    log.operationProgress('Get Cards', 'Enriching cards with tag info', req)
    const cardsWithTags = userCards.map(card => {
      const tag = db.tags.find(t => t.id === card.tagId)
      return { ...card, tag }
    })

    log.success('Cards retrieved', { userId: req.user.id, cardsCount: cardsWithTags.length })
    log.operationEnd('Get Cards', startTime, req, { cardsCount: cardsWithTags.length })
    log.apiResponse('GET', '/api/cards', 200, req, { cardsCount: cardsWithTags.length })

    res.json(cardsWithTags)
  } catch (error) {
    log.error('Get Cards failed', error, { userId: req.user.id })
    log.operationEnd('Get Cards', startTime, req, { error: true })
    log.apiResponse('GET', '/api/cards', 500, req)
    res.status(500).json({ error: 'Error al obtener las tareas.' })
  }
}

// Create new card
const createCard = (req, res) => {
  const startTime = log.operationStart('Create Card', req, { 
    title: req.body.title?.substring(0, 50)
  })
  try {
    log.apiRequest('POST', '/api/cards', req)
    const { title, description, tagId, aiPrompt, dueDate, dueTime, priority } = req.body

    if (!title) {
      log.warn('Missing title in request', { userId: req.user.id })
      log.apiResponse('POST', '/api/cards', 400, req)
      return res.status(400).json({ error: 'El título es obligatorio.' })
    }

    log.operationProgress('Create Card', 'Loading database', req)
    const db = getDB()

    const newCard = {
      id: db.nextCardId++,
      userId: req.user.id,
      title,
      description: description || '',
      tagId: tagId || 'marketing',
      priority: priority || 'baja', // alta, media, baja
      completed: false,
      aiPrompt: aiPrompt || '',
      dueDate: dueDate || null,
      dueTime: dueTime || null,
      createdAt: new Date().toISOString()
    }

    log.operationProgress('Create Card', 'Saving card to database', req, { 
      cardId: newCard.id,
      tagId: newCard.tagId,
      priority: newCard.priority
    })
    db.cards.unshift(newCard) // Add to beginning
    saveDB(db)
    log.dbOperation('Card created and saved', { cardId: newCard.id, userId: req.user.id })

    // Add tag info
    const tag = db.tags.find(t => t.id === newCard.tagId)
    log.success('Card created successfully', { 
      cardId: newCard.id, 
      userId: req.user.id,
      title: title.substring(0, 50)
    })
    log.operationEnd('Create Card', startTime, req, { cardId: newCard.id })
    log.apiResponse('POST', '/api/cards', 201, req, { cardId: newCard.id })

    res.status(201).json({ ...newCard, tag })
  } catch (error) {
    log.error('Create Card failed', error, { userId: req.user.id, title: req.body.title?.substring(0, 50) })
    log.operationEnd('Create Card', startTime, req, { error: true })
    log.apiResponse('POST', '/api/cards', 500, req)
    res.status(500).json({ error: 'Error al crear la tarea.' })
  }
}

// Update card
const updateCard = (req, res) => {
  const startTime = log.operationStart('Update Card', req, { cardId: req.params.id })
  try {
    log.apiRequest('PUT', `/api/cards/${req.params.id}`, req)
    const { id } = req.params
    const { title, description, tagId, completed, aiPrompt, dueDate, dueTime, priority } = req.body

    log.operationProgress('Update Card', 'Loading database', req)
    const db = getDB()
    const cardIndex = db.cards.findIndex(c => c.id === parseInt(id) && c.userId === req.user.id)

    if (cardIndex === -1) {
      log.warn('Card not found for update', { cardId: id, userId: req.user.id })
      log.apiResponse('PUT', `/api/cards/${id}`, 404, req)
      return res.status(404).json({ error: 'Tarea no encontrada.' })
    }

    log.operationProgress('Update Card', 'Updating card fields', req, { 
      cardId: id,
      fieldsToUpdate: Object.keys(req.body).filter(k => req.body[k] !== undefined)
    })

    // Update fields
    if (title !== undefined) db.cards[cardIndex].title = title
    if (description !== undefined) db.cards[cardIndex].description = description
    if (tagId !== undefined) db.cards[cardIndex].tagId = tagId
    if (completed !== undefined) db.cards[cardIndex].completed = completed
    if (aiPrompt !== undefined) db.cards[cardIndex].aiPrompt = aiPrompt
    if (dueDate !== undefined) db.cards[cardIndex].dueDate = dueDate
    if (dueTime !== undefined) db.cards[cardIndex].dueTime = dueTime
    if (priority !== undefined) db.cards[cardIndex].priority = priority

    saveDB(db)
    log.dbOperation('Card updated and saved', { cardId: id, userId: req.user.id })

    const card = db.cards[cardIndex]
    const tag = db.tags.find(t => t.id === card.tagId)
    log.success('Card updated successfully', { cardId: id, userId: req.user.id })
    log.operationEnd('Update Card', startTime, req, { cardId: id })
    log.apiResponse('PUT', `/api/cards/${id}`, 200, req, { cardId: id })

    res.json({ ...card, tag })
  } catch (error) {
    log.error('Update Card failed', error, { userId: req.user.id, cardId: req.params.id })
    log.operationEnd('Update Card', startTime, req, { error: true })
    log.apiResponse('PUT', `/api/cards/${req.params.id}`, 500, req)
    res.status(500).json({ error: 'Error al actualizar la tarea.' })
  }
}

// Delete card
const deleteCard = (req, res) => {
  const startTime = log.operationStart('Delete Card', req, { cardId: req.params.id })
  try {
    log.apiRequest('DELETE', `/api/cards/${req.params.id}`, req)
    const { id } = req.params
    const cardId = parseInt(id, 10)
    
    if (isNaN(cardId)) {
      log.warn('Invalid card ID in request', { id, userId: req.user.id })
      log.apiResponse('DELETE', `/api/cards/${id}`, 400, req)
      return res.status(400).json({ error: 'ID de tarea inválido.' })
    }

    log.operationProgress('Delete Card', 'Loading database', req)
    const db = getDB()

    const cardIndex = db.cards.findIndex(c => {
      const cId = typeof c.id === 'string' ? parseInt(c.id, 10) : c.id
      return cId === cardId && c.userId === req.user.id
    })
    
    if (cardIndex === -1) {
      log.warn('Card not found for deletion', { 
        cardId, 
        userId: req.user.id,
        availableCards: db.cards.filter(c => c.userId === req.user.id).map(c => ({ id: c.id, userId: c.userId }))
      })
      log.apiResponse('DELETE', `/api/cards/${id}`, 404, req)
      return res.status(404).json({ error: 'Tarea no encontrada.' })
    }

    log.operationProgress('Delete Card', 'Removing card from database', req, { cardId })
    db.cards.splice(cardIndex, 1)
    saveDB(db)
    log.dbOperation('Card deleted and saved', { cardId, userId: req.user.id })

    log.success('Card deleted successfully', { cardId, userId: req.user.id })
    log.operationEnd('Delete Card', startTime, req, { cardId })
    log.apiResponse('DELETE', `/api/cards/${id}`, 200, req, { cardId })

    res.json({ message: 'Tarea eliminada.' })
  } catch (error) {
    log.error('Delete Card failed', error, { userId: req.user.id, cardId: req.params.id })
    log.operationEnd('Delete Card', startTime, req, { error: true })
    log.apiResponse('DELETE', `/api/cards/${req.params.id}`, 500, req)
    res.status(500).json({ error: 'Error al eliminar la tarea.' })
  }
}

// Toggle card completion
const toggleComplete = (req, res) => {
  const startTime = log.operationStart('Toggle Card Complete', req, { cardId: req.params.id })
  try {
    log.apiRequest('PATCH', `/api/cards/${req.params.id}/toggle`, req)
    const { id } = req.params
    log.operationProgress('Toggle Card Complete', 'Loading database', req)
    const db = getDB()

    const cardIndex = db.cards.findIndex(c => c.id === parseInt(id) && c.userId === req.user.id)
    if (cardIndex === -1) {
      log.warn('Card not found for toggle', { cardId: id, userId: req.user.id })
      log.apiResponse('PATCH', `/api/cards/${id}/toggle`, 404, req)
      return res.status(404).json({ error: 'Tarea no encontrada.' })
    }

    const previousState = db.cards[cardIndex].completed
    db.cards[cardIndex].completed = !db.cards[cardIndex].completed
    const newState = db.cards[cardIndex].completed
    
    log.operationProgress('Toggle Card Complete', 'Saving updated state', req, { 
      cardId: id,
      previousState,
      newState
    })
    saveDB(db)
    log.dbOperation('Card completion toggled and saved', { cardId: id, newState })

    log.success('Card completion toggled', { cardId: id, userId: req.user.id, completed: newState })
    log.operationEnd('Toggle Card Complete', startTime, req, { cardId: id, completed: newState })
    log.apiResponse('PATCH', `/api/cards/${id}/toggle`, 200, req, { completed: newState })

    res.json({ completed: newState })
  } catch (error) {
    log.error('Toggle Card Complete failed', error, { userId: req.user.id, cardId: req.params.id })
    log.operationEnd('Toggle Card Complete', startTime, req, { error: true })
    log.apiResponse('PATCH', `/api/cards/${req.params.id}/toggle`, 500, req)
    res.status(500).json({ error: 'Error al actualizar la tarea.' })
  }
}

module.exports = { getCards, createCard, updateCard, deleteCard, toggleComplete }
