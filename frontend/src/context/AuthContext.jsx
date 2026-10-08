import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      setUser(JSON.parse(stored))
    }
    setLoading(false)
  }, [])

  const login = async (email, password, role) => {
    const { data } = await api.post('/auth/login', { email, password, role })
    persistSession(data)
    return data
  }

  const registerPatient = async (payload) => {
    const { data } = await api.post('/auth/register/patient', payload)
    persistSession(data)
    return data
  }

  const registerDoctor = async (payload) => {
    const { data } = await api.post('/auth/register/doctor', payload)
    persistSession(data)
    return data
  }

  const persistSession = (data) => {
    const sessionUser = { id: data.user_id, name: data.name, role: data.role }
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    localStorage.setItem('user', JSON.stringify(sessionUser))
    setUser(sessionUser)
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, registerPatient, registerDoctor, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
