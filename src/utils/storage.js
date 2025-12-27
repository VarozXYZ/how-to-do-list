/**
 * LocalStorage utility functions for consistent data handling
 */

const TOKEN_KEY = 'token'
const USER_KEY = 'user'
const PREFERENCES_KEY = 'userPreferences'

/**
 * Stores authentication data (token and user) in localStorage
 * @param {string} token - JWT token
 * @param {object} user - User object
 */
export const storeAuth = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

/**
 * Removes authentication data from localStorage
 */
export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

/**
 * Gets the stored token from localStorage
 * @returns {string|null} The token or null if not found
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Gets the stored user from localStorage
 * @returns {object|null} The user object or null if not found
 */
export const getUser = () => {
  const user = localStorage.getItem(USER_KEY)
  return user ? JSON.parse(user) : null
}

/**
 * Updates the stored user in localStorage
 * @param {object} user - Updated user object
 */
export const updateUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

/**
 * Gets user preferences from localStorage
 * @returns {object} Preferences object (empty object if not found)
 */
export const getPreferences = () => {
  const prefs = localStorage.getItem(PREFERENCES_KEY)
  return prefs ? JSON.parse(prefs) : {}
}

/**
 * Sets user preferences in localStorage
 * @param {object} preferences - Preferences object to store
 */
export const setPreferences = (preferences) => {
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))
}

/**
 * Updates specific preference key in localStorage
 * @param {string} key - Preference key to update
 * @param {*} value - Value to set
 */
export const updatePreference = (key, value) => {
  const prefs = getPreferences()
  prefs[key] = value
  setPreferences(prefs)
}

