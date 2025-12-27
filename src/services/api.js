import axios from 'axios'
import { getToken, clearAuth } from '../utils/storage'

// Use relative URL in development (Vite proxy) or absolute in production
const API_URL = import.meta.env.DEV ? '/api' : 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_URL
})

// Add token to every request if it exists
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 errors (token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
