import api from './api'

// Generate AI content for a task
export const generateContent = async (title, description, userPrompt, cardId = null) => {
  const response = await api.post('/ai/generate', {
    title,
    description,
    userPrompt,
    cardId
  })
  return response.data
}

// Get AI usage statistics
export const getAiStats = async () => {
  const response = await api.get('/ai/stats')
  return response.data
}

