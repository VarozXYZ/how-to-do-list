const { getDB, saveDB } = require('../config/db')

// Get all tags (default + user's custom)
const getTags = (req, res) => {
  try {
    const db = getDB()
    
    // Get default tags and user's custom tags
    let tags = db.tags.filter(tag => tag.isDefault || tag.userId === req.user.id)

    // Get user's favorite tag ID
    const user = db.users.find(u => u.id === req.user.id)
    const favoriteTagId = user?.favoriteTagId || null

    // Add isFavorite property to each tag
    tags = tags.map(tag => ({
      ...tag,
      isFavorite: tag.id === favoriteTagId
    }))

    res.json(tags)
  } catch (error) {
    console.error('GetTags error:', error)
    res.status(500).json({ error: 'Error al obtener las etiquetas.' })
  }
}

// Create custom tag
const createTag = (req, res) => {
  try {
    const { name, color, borderColor, textColor } = req.body

    if (!name || !color) {
      return res.status(400).json({ error: 'Nombre y color son obligatorios.' })
    }

    const db = getDB()
    const tagId = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()

    const newTag = {
      id: tagId,
      userId: req.user.id,
      name,
      color,
      borderColor: borderColor || color,
      textColor: textColor || '#333333',
      isDefault: false
    }

    db.tags.push(newTag)
    saveDB(db)

    res.status(201).json(newTag)
  } catch (error) {
    console.error('CreateTag error:', error)
    res.status(500).json({ error: 'Error al crear la etiqueta.' })
  }
}

// Delete custom tag
const deleteTag = (req, res) => {
  try {
    const { id } = req.params
    const db = getDB()

    const tagIndex = db.tags.findIndex(t => t.id === id)
    if (tagIndex === -1) {
      return res.status(404).json({ error: 'Etiqueta no encontrada.' })
    }

    const tag = db.tags[tagIndex]
    // Allow deleting default tags, but only if user owns cards with that tag or it's their own tag
    if (!tag.isDefault && tag.userId !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta etiqueta.' })
    }

    // Find first available tag to use as fallback
    const fallbackTag = db.tags.find(t => t.id !== id)
    const fallbackTagId = fallbackTag?.id || 'marketing'
    
    // Update cards using this tag to use the fallback tag
    db.cards.forEach((card, index) => {
      if (card.tagId === id && card.userId === req.user.id) {
        db.cards[index].tagId = fallbackTagId
      }
    })

    // Delete the tag
    db.tags.splice(tagIndex, 1)
    saveDB(db)

    res.json({ message: 'Etiqueta eliminada.' })
  } catch (error) {
    console.error('DeleteTag error:', error)
    res.status(500).json({ error: 'Error al eliminar la etiqueta.' })
  }
}

// Toggle favorite tag
const toggleFavoriteTag = (req, res) => {
  try {
    const { id } = req.params
    const db = getDB()

    const tag = db.tags.find(t => t.id === id)
    if (!tag) {
      return res.status(404).json({ error: 'Etiqueta no encontrada.' })
    }

    // Check if user can access this tag (must be default tag or user's own tag)
    if (!tag.isDefault && tag.userId !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para acceder a esta etiqueta.' })
    }

    // Find user and toggle favorite
    const userIndex = db.users.findIndex(u => u.id === req.user.id)
    if (userIndex === -1) {
      return res.status(404).json({ error: 'Usuario no encontrado.' })
    }

    const user = db.users[userIndex]
    const isCurrentlyFavorite = user.favoriteTagId === id

    // Toggle favorite: if currently favorite, remove it; otherwise, set it
    if (isCurrentlyFavorite) {
      db.users[userIndex].favoriteTagId = null
    } else {
      db.users[userIndex].favoriteTagId = id
    }

    saveDB(db)

    res.json({ 
      tagId: id,
      isFavorite: !isCurrentlyFavorite,
      message: !isCurrentlyFavorite ? 'Etiqueta marcada como favorita.' : 'Etiqueta desmarcada como favorita.' 
    })
  } catch (error) {
    console.error('ToggleFavoriteTag error:', error)
    res.status(500).json({ error: 'Error al actualizar la etiqueta favorita.' })
  }
}

module.exports = { getTags, createTag, deleteTag, toggleFavoriteTag }
