import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true

    // Fast 300ms fallback timer to ensure zero delay on load
    const timer = setTimeout(() => {
      if (mounted) setLoading(false)
    }, 300)

    // Check active sessions and set the user
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (mounted) {
          const session = data?.session
          setAdmin((prev) => prev || (session?.user ?? null))
        }
      })
      .catch((err) => {
        console.error('Auth getSession error:', err)
      })
      .finally(() => {
        if (mounted) {
          setLoading(false)
          clearTimeout(timer)
        }
      })

    // Listen for changes on auth state (logged in, signed out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setAdmin((prev) => prev || (session?.user ?? null))
      }
    })

    return () => {
      mounted = false
      clearTimeout(timer)
      subscription?.unsubscribe()
    }
  }, [])

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    if (data.user) {
      setAdmin(data.user)
      navigate('/dashboard')
      return true
    }
  }

  const logout = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    setAdmin(null)
    setLoading(false)
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
