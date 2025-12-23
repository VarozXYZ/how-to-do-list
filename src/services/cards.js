import api from './api'

// Get all cards for the logged-in user
export const getCards = async () => {
  const response = await api.get('/cards')
  return response.data
}

// Create a new card
export const createCard = async (cardData) => {
  const response = await api.post('/cards', cardData)
  return response.data
}

// Update a card
export const updateCard = async (id, cardData) => {
  const response = await api.put(`/cards/${id}`, cardData)
  return response.data
}

// Delete a card
export const deleteCard = async (id) => {
  const response = await api.delete(`/cards/${id}`)
  return response.data
}

// Toggle card completion
export const toggleCardComplete = async (id) => {
  const response = await api.patch(`/cards/${id}/toggle`)
  return response.data
}

