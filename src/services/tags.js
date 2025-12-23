import api from './api'

// Get all tags (default + user's custom)
export const getTags = async () => {
  const response = await api.get('/tags')
  return response.data
}

// Create a custom tag
export const createTag = async (tagData) => {
  const response = await api.post('/tags', tagData)
  return response.data
}

// Delete a custom tag
export const deleteTag = async (id) => {
  const response = await api.delete(`/tags/${id}`)
  return response.data
}

