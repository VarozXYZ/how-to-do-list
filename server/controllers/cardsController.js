const { getDB, saveDB } = require('../config/db')

// Get all cards for user
const getCards = (req, res) => {
  try {
    const db = getDB()
    const userCards = db.cards.filter(card => card.userId === req.user.id)

    // Add tag info to each card
    const cardsWithTags = userCards.map(card => {
      const tag = db.tags.find(t => t.id === card.tagId)
      return { ...card, tag }
    })

    res.json(cardsWithTags)
  } catch (error) {
    console.error('GetCards error:', error)
    res.status(500).json({ error: 'Error al obtener las tareas.' })
  }
}

// Create new card
const createCard = (req, res) => {
  try {
    const { title, description, tagId, aiPrompt, dueDate, dueTime, priority } = req.body

    if (!title) {
      return res.status(400).json({ error: 'El título es obligatorio.' })
    }

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

    db.cards.unshift(newCard) // Add to beginning
    saveDB(db)

    // Add tag info
    const tag = db.tags.find(t => t.id === newCard.tagId)
    res.status(201).json({ ...newCard, tag })
  } catch (error) {
    console.error('CreateCard error:', error)
    res.status(500).json({ error: 'Error al crear la tarea.' })
  }
}

// Update card
const updateCard = (req, res) => {
  try {
    const { id } = req.params
    const { title, description, tagId, completed, aiPrompt, dueDate, dueTime, priority } = req.body

    const db = getDB()
    const cardIndex = db.cards.findIndex(c => c.id === parseInt(id) && c.userId === req.user.id)

    if (cardIndex === -1) {
      return res.status(404).json({ error: 'Tarea no encontrada.' })
    }

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

    const card = db.cards[cardIndex]
    const tag = db.tags.find(t => t.id === card.tagId)
    res.json({ ...card, tag })
  } catch (error) {
    console.error('UpdateCard error:', error)
    res.status(500).json({ error: 'Error al actualizar la tarea.' })
  }
}

// Delete card
const deleteCard = (req, res) => {
  try {
    const { id } = req.params
    const cardId = parseInt(id, 10)
    
    if (isNaN(cardId)) {
      return res.status(400).json({ error: 'ID de tarea inválido.' })
    }

    const db = getDB()

    const cardIndex = db.cards.findIndex(c => {
      const cId = typeof c.id === 'string' ? parseInt(c.id, 10) : c.id
      return cId === cardId && c.userId === req.user.id
    })
    
    if (cardIndex === -1) {
      console.error(`Card not found: id=${cardId}, userId=${req.user.id}`)
      console.error('Available cards:', db.cards.filter(c => c.userId === req.user.id).map(c => ({ id: c.id, userId: c.userId })))
      return res.status(404).json({ error: 'Tarea no encontrada.' })
    }

    db.cards.splice(cardIndex, 1)
    saveDB(db)

    res.json({ message: 'Tarea eliminada.' })
  } catch (error) {
    console.error('DeleteCard error:', error)
    res.status(500).json({ error: 'Error al eliminar la tarea.' })
  }
}

// Toggle card completion
const toggleComplete = (req, res) => {
  try {
    const { id } = req.params
    const db = getDB()

    const cardIndex = db.cards.findIndex(c => c.id === parseInt(id) && c.userId === req.user.id)
    if (cardIndex === -1) {
      return res.status(404).json({ error: 'Tarea no encontrada.' })
    }

    db.cards[cardIndex].completed = !db.cards[cardIndex].completed
    saveDB(db)

    res.json({ completed: db.cards[cardIndex].completed })
  } catch (error) {
    console.error('ToggleComplete error:', error)
    res.status(500).json({ error: 'Error al actualizar la tarea.' })
  }
}

module.exports = { getCards, createCard, updateCard, deleteCard, toggleComplete }
