import { useState, useEffect } from 'react'
import { authService } from '../services/api'

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated())
    setLoading(false)
  }, [])

  const login = async (userName: string, password: string) => {
    await authService.login(userName, password)
    setIsAuthenticated(true)
  }

  const logout = () => {
    authService.logout()
    setIsAuthenticated(false)
  }

  return { isAuthenticated, loading, login, logout }
}
