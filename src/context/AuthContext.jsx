import { createContext, useState, useContext, useEffect } from 'react'
import * as authService from '../services/auth'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is already logged in on app load
  useEffect(() => {
    const loadUser = async () => {
      const savedUser = authService.getCurrentUser()
      if (savedUser) {
        // Set user from localStorage first (for immediate display)
        setUser(savedUser)
        
        // Then fetch fresh data from backend to ensure plan and other data is up to date
        try {
          const freshUser = await authService.getMe()
          setUser(freshUser)
        } catch (error) {
          // If backend call fails, keep using localStorage data
          console.error('Error fetching user from backend:', error)
        }
      }
      setLoading(false)
    }
    
    loadUser()
  }, [])

  // Login function
  const login = async (email, password) => {
    const { user } = await authService.login(email, password)
    setUser(user)
    return user
  }

  // Register function
  const register = async (username, email, password) => {
    const { user } = await authService.register(username, email, password)
    setUser(user)
    return user
  }

  // Logout function
  const logout = () => {
    authService.logout()
    setUser(null)
  }

  // Update user profile
  const updateProfile = async (data) => {
    const updatedUser = await authService.updateProfile(data)
    setUser(updatedUser)
    return updatedUser
  }

  // Update user plan
  const updatePlan = async (plan) => {
    const updatedUser = await authService.updatePlan(plan)
    setUser(updatedUser)
    return updatedUser
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    updatePlan
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
