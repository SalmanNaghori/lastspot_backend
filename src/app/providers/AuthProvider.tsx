import React, { createContext, useContext, useEffect, useState } from 'react'
import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase } from '@/core/supabase/client'
import type { UserRole } from '@/features/auth/types'

interface AuthContextType {
  session: Session | null
  user: User | null
  role: UserRole | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  role: null,
  loading: true,
  signOut: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const fetchSessionAndRole = async () => {
      try {
        // Enforce custom Remember Me logic
        const localSession = localStorage.getItem('activity_admin_session')
        const activeSession = sessionStorage.getItem('activity_admin_session')
        
        // Bypass custom logout logic if we are actively recovering a password
        const isRecovery = window.location.hash.includes('type=recovery') || window.location.pathname.includes('/reset-password')

        if (!localSession && !activeSession && !isRecovery) {
          // If no custom session exists, but Supabase has a session,
          // it means Remember Me was false and the tab was closed.
          const { data } = await supabase.auth.getSession()
          if (data.session) {
            await supabase.auth.signOut()
          }
          if (mounted) {
            setSession(null)
            setUser(null)
            setRole(null)
            setLoading(false)
          }
          return
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError

        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
        }

        if (session?.user) {
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single()

          if (!roleError && roleData && mounted) {
            setRole(roleData.role as UserRole)
          } else if (mounted) {
             setRole(null)
          }
        } else if (mounted) {
          setRole(null)
        }
      } catch (error) {
        console.error('Error fetching session:', error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchSessionAndRole()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, newSession: Session | null) => {
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          if (mounted) setLoading(true)
        }

        if (mounted) {
          setSession(newSession)
          setUser(newSession?.user ?? null)
        }

        if (newSession?.user) {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', newSession.user.id)
            .single()

          if (roleData && mounted) {
            setRole(roleData.role as UserRole)
          } else if (mounted) {
             setRole(null)
          }
        } else if (mounted) {
          setRole(null)
        }
        
        if (mounted) setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, user, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
