import { set } from "date-fns"
import { createContext, useContext, useState, useEffect } from "react"
import type { ReactNode } from "react"

interface User {
  _id: string
  loading: boolean
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  login: (user: User, token: string) => void
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true) 

  // Lúc mount, check localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = (userData: User, token: string) => {
    setUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))
    localStorage.setItem("access_token", token)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("access_token")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}