import api from './api'

// Login user
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password })
  const { token, user } = response.data
  
  // Store token and user in localStorage
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
  
  return { token, user }
}

// Register user
export const register = async (username, email, password) => {
  const response = await api.post('/auth/register', { username, email, password })
  const { token, user } = response.data
  
  // Store token and user in localStorage
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
  
  return { token, user }
}

// Logout user
export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

// Get current user from localStorage
export const getCurrentUser = () => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

// Update profile
export const updateProfile = async (data) => {
  const response = await api.put('/auth/profile', data)
  // Update localStorage
  localStorage.setItem('user', JSON.stringify(response.data))
  return response.data
}
