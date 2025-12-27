import api from './api'
import { storeAuth, clearAuth, getUser, updateUser } from '../utils/storage'

// Login user
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password })
  const { token, user } = response.data
  
  storeAuth(token, user)
  
  return { token, user }
}

// Register user
export const register = async (username, email, password) => {
  const response = await api.post('/auth/register', { username, email, password })
  const { token, user } = response.data
  
  storeAuth(token, user)
  
  return { token, user }
}

// Logout user
export const logout = () => {
  clearAuth()
}

// Get current user from localStorage
export const getCurrentUser = () => {
  return getUser()
}

// Update profile
export const updateProfile = async (data) => {
  const response = await api.put('/auth/profile', data)
  updateUser(response.data)
  return response.data
}

// Update plan
export const updatePlan = async (plan) => {
  const response = await api.put('/auth/plan', { plan })
  updateUser(response.data)
  return response.data
}