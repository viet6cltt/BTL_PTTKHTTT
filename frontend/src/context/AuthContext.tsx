import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api, AuthResponse, UserRole } from '../api'

interface User {
  userId: number
  role: UserRole
  fullName: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<AuthResponse>
  logout: () => void
  isLoading: boolean
  updateUserFullName: (fullName: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }
    setIsLoading(false)
  }, [])

  async function login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.login(email, password)
    const newUser: User = {
      userId: response.userId,
      role: response.role,
      fullName: response.fullName,
    }
    localStorage.setItem('token', response.accessToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    setUser(newUser)
    return response
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  function updateUserFullName(fullName: string) {
    if (user) {
      const updatedUser = { ...user, fullName }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, updateUserFullName }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
