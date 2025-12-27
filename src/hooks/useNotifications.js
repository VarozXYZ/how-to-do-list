import { useState, useEffect } from 'react'
import { getNotifications } from '../services/notifications'

export const useNotifications = () => {
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchUnreadCount = async () => {
    try {
      const data = await getNotifications()
      setUnreadCount(data.unreadCount || 0)
    } catch (error) {
      console.error('Error fetching notification count:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUnreadCount()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    
    return () => clearInterval(interval)
  }, [])

  return { unreadCount, loading, refresh: fetchUnreadCount }
}

