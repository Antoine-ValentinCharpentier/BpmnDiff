import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import keycloak from '../keycloak'

interface AuthContextType {
  isAuthenticated: boolean
  logout: () => void
  getToken: () => string | undefined
  userInfo?: Keycloak.KeycloakTokenParsed
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    keycloak
      .init({ onLoad: 'login-required' })
      .then((authenticated) => {
        setIsAuthenticated(authenticated)
        setInitialized(true)
      })
      .catch((err) => {
        console.error('Keycloak init error', err)
      })
  }, [])

  const logout = () => keycloak.logout()
  const getToken = () => keycloak.token
  const userInfo = keycloak.tokenParsed

  // TODO : Loading page
  if (!initialized) return <p>Loading...</p>

  return (
    <AuthContext.Provider value={{ isAuthenticated, logout, getToken, userInfo }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
