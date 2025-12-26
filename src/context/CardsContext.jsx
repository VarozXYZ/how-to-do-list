import { createContext, useState, useContext, useEffect } from 'react'
import * as cardsService from '../services/cards'
import * as tagsService from '../services/tags'

const CardsContext = createContext(null)

export const CardsProvider = ({ children }) => {
  const [cards, setCards] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch cards and tags on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [cardsData, tagsData] = await Promise.all([
          cardsService.getCards(),
          tagsService.getTags()
        ])
        setCards(cardsData)
        setTags(tagsData)
        setError(null)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Error al cargar los datos')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Add a new card
  const addCard = async (cardData) => {
    try {
      const newCard = await cardsService.createCard(cardData)
      setCards([newCard, ...cards])
      return newCard
    } catch (err) {
      console.error('Error creating card:', err)
      throw err
    }
  }

  // Delete a card
  const deleteCard = async (id) => {
    try {
      await cardsService.deleteCard(id)
      setCards(cards.filter(card => card.id !== id))
    } catch (err) {
      console.error('Error deleting card:', err)
      throw err
    }
  }

  // Toggle card completion
  const toggleComplete = async (id) => {
    try {
      const result = await cardsService.toggleCardComplete(id)
      setCards(cards.map(card =>
        card.id === id ? { ...card, completed: result.completed } : card
      ))
    } catch (err) {
      console.error('Error toggling card:', err)
      throw err
    }
  }

  // Update a card
  const updateCard = async (id, updatedData) => {
    try {
      const updatedCard = await cardsService.updateCard(id, updatedData)
      setCards(cards.map(card =>
        card.id === id ? updatedCard : card
      ))
      return updatedCard
    } catch (err) {
      console.error('Error updating card:', err)
      throw err
    }
  }

  // Add a new tag
  const addTag = async (tagData) => {
    try {
      const newTag = await tagsService.createTag(tagData)
      setTags([...tags, newTag])
      return newTag.id
    } catch (err) {
      console.error('Error creating tag:', err)
      throw err
    }
  }

  // Delete a tag
  const deleteTag = async (tagId) => {
    try {
      await tagsService.deleteTag(tagId)
      
      // Find first available tag to use as fallback
      const fallbackTag = tags.find(t => t.id !== tagId) || tags[0]
      const fallbackTagId = fallbackTag?.id || 'marketing'
      
      // Update local state - assign cards to fallback tag
      setCards(cards.map(card => 
        card.tagId === tagId ? { ...card, tagId: fallbackTagId } : card
      ))
      setTags(tags.filter(tag => tag.id !== tagId))
      return true
    } catch (err) {
      console.error('Error deleting tag:', err)
      throw err
    }
  }

  // Check if tag is a default one
  const isDefaultTag = (tagId) => {
    const tag = tags.find(t => t.id === tagId)
    return tag?.isDefault || false
  }

  // Get tag by ID
  const getTagById = (tagId) => {
    return tags.find(tag => tag.id === tagId) || tags[0]
  }

  // Computed values
  const activeCards = cards.filter(card => !card.completed)
  const completedCards = cards.filter(card => card.completed)

  const value = {
    cards,
    activeCards,
    completedCards,
    tags,
    loading,
    error,
    addCard,
    updateCard,
    deleteCard,
    toggleComplete,
    addTag,
    deleteTag,
    isDefaultTag,
    getTagById
  }

  return (
    <CardsContext.Provider value={value}>
      {children}
    </CardsContext.Provider>
  )
}

export const useCards = () => {
  const context = useContext(CardsContext)
  if (!context) {
    throw new Error('useCards must be used within a CardsProvider')
  }
  return context
}
