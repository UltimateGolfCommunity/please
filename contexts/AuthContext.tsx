'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'
import { UserProfile } from '@/lib/database.types'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  signUp: (email: string, password: string, profileData: Partial<UserProfile>) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    // Only create client on the client side
    if (typeof window !== 'undefined') {
      setSupabase(createClient())
    }
  }, [])

  useEffect(() => {
    if (!supabase) return

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setLoading(false)
    }, 5000) // 5 second timeout

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchProfile(session.user.id)
        }
        
        setLoading(false)
        clearTimeout(timeoutId)
      } catch (error) {
        console.error('Error getting initial session:', error)
        setLoading(false)
        clearTimeout(timeoutId)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        try {
          setSession(session)
          setUser(session?.user ?? null)
          
          if (session?.user) {
            await fetchProfile(session.user.id)
          } else {
            setProfile(null)
          }
          
          setLoading(false)
          clearTimeout(timeoutId)
        } catch (error) {
          console.error('Error in auth state change:', error)
          setLoading(false)
          clearTimeout(timeoutId)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeoutId)
    }
  }, [supabase])

  const fetchProfile = async (userId: string) => {
    if (!supabase) return
    
    try {
      // Fetch user profile with related data
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) {
        console.error('Error fetching profile:', profileError)
        // Profile might not exist yet, try to create it
        if (profileError.code === 'PGRST116' || profileError.code === 'PGRST116') {
          console.log('Profile not found, creating default profile')
          await createDefaultProfile(userId)
        }
        return
      }

      // Fetch user's tee times
      const { data: teeTimes } = await supabase
        .from('tee_times')
        .select('*')
        .eq('creator_id', userId)
        .eq('status', 'active')

      // Fetch user's groups
      const { data: groups } = await supabase
        .from('group_members')
        .select(`
          *,
          group:golf_groups(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')

      // Fetch user's connections count
      const { count: connectionsCount } = await supabase
        .from('user_connections')
        .select('*', { count: 'exact', head: true })
        .eq('requester_id', userId)
        .eq('status', 'accepted')

      // Fetch recent group messages
      const { data: groupMessages } = await supabase
        .from('group_messages')
        .select(`
          *,
          sender:user_profiles!sender_id(*)
        `)
        .in('group_id', groups?.map((g: any) => g.group_id) || [])
        .order('created_at', { ascending: false })
        .limit(10)

      // Fetch user badges
      const { data: userBadges } = await supabase
        .from('user_badges')
        .select(`
          *,
          badge:badges(*)
        `)
        .eq('user_id', userId)
        .order('earned_at', { ascending: false })

      // Fetch user achievements
      const { data: userAchievements } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .order('last_updated', { ascending: false })

      // Combine all data
      const enrichedProfile = {
        ...profileData,
        tee_times: teeTimes || [],
        groups: groups || [],
        connections_count: connectionsCount || 0,
        tee_times_count: teeTimes?.length || 0,
        groups_count: groups?.length || 0,
        group_messages: groupMessages || [],
        current_group: groups?.[0]?.group || null,
        badges: userBadges || [],
        achievements: userAchievements || []
      }

      setProfile(enrichedProfile)
    } catch (error) {
      console.error('Error fetching profile:', error)
      // Try to create a default profile
      await createDefaultProfile(userId)
    }
  }

  const createDefaultProfile = async (userId: string) => {
    if (!supabase || !user) return
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([
          {
            id: userId,
            email: user.email || '',
            username: user.email?.split('@')[0] || 'golfer',
            first_name: user.user_metadata?.first_name || null,
            last_name: user.user_metadata?.last_name || null,
            bio: null,
            handicap: null,
            home_course: null,
            location: null
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Error creating profile:', error)
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error creating profile:', error)
    }
  }

  const signUp = async (email: string, password: string, profileData: Partial<UserProfile>) => {
    if (!supabase) throw new Error('Supabase client not initialized')
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: profileData
        }
      })

      if (error) throw error

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase!
          .from('user_profiles')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              first_name: profileData.first_name || '',
              last_name: profileData.last_name || '',
              full_name: profileData.full_name || '',
              username: profileData.username || email.split('@')[0],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ])

        if (profileError) {
          console.warn('Profile creation failed:', profileError)
        }
      }
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase client not initialized')
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
    } catch (error) {
      console.error('Signin error:', error)
      throw error
    }
  }

  const signOut = async () => {
    if (!supabase) throw new Error('Supabase client not initialized')
    
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Signout error:', error)
      throw error
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in')
    if (!supabase) throw new Error('Supabase client not initialized')

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()

      if (error) throw error

      if (data && data[0]) {
        setProfile(data[0])
      }
    } catch (error) {
      console.error('Profile update error:', error)
      throw error
    }
  }

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
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
