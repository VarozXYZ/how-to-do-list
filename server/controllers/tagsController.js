const { getDB, saveDB } = require('../config/db')

// Get all tags (default + user's custom)
const getTags = (req, res) => {
  try {
    const db = getDB()
    
    // Get default tags and user's custom tags
    const tags = db.tags.filter(tag => tag.isDefault || tag.userId === req.user.id)

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
    if (tag.isDefault) {
      return res.status(400).json({ error: 'No se pueden eliminar las etiquetas por defecto.' })
    }
    if (tag.userId !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta etiqueta.' })
    }

    // Update cards using this tag to use the first default tag
    db.cards.forEach((card, index) => {
      if (card.tagId === id && card.userId === req.user.id) {
        db.cards[index].tagId = 'marketing'
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

module.exports = { getTags, createTag, deleteTag }
