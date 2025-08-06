import React, { createContext, useContext, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

interface OnboardingUser {
  id: string
  email: string
  isTemporary: true
}

interface OnboardingProfile {
  id: string
  company_name: string | null
  phone: string | null
  address: string | null
  selected_plan: string | null
}

interface OnboardingAuthContextType {
  user: OnboardingUser | null
  profile: OnboardingProfile | null
  loading: boolean
  signUp: (email: string, password: string, name: string, companyName?: string, selectedPlan?: string) => Promise<void>
  startTemporarySession: () => void
  endTemporarySession: () => void
}

const OnboardingAuthContext = createContext<OnboardingAuthContextType | undefined>(undefined)

export const OnboardingAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<OnboardingUser | null>(null)
  const [profile, setProfile] = useState<OnboardingProfile | null>(null)
  const [loading] = useState(false)
  const { signUp: authSignUp } = useAuth()

  const signUp = async (email: string, password: string, name: string, companyName?: string, selectedPlan?: string) => {
    // Registrar el usuario usando el método de autenticación base
    await authSignUp(email, password, name, companyName)
    
    // Si hay un plan seleccionado, actualizarlo en el perfil
    if (selectedPlan) {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single()

      if (userProfile) {
        await supabase
          .from('profiles')
          .update({ selected_plan: selectedPlan })
          .eq('id', userProfile.id)
      }
    }
  }

  const startTemporarySession = () => {
    setUser({
      id: 'temp-' + Date.now(),
      email: 'temporary@session.com',
      isTemporary: true
    })
    setProfile({
      id: 'temp-' + Date.now(),
      company_name: null,
      phone: null,
      address: null,
      selected_plan: null
    })
  }

  const endTemporarySession = () => {
    setUser(null)
    setProfile(null)
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    startTemporarySession,
    endTemporarySession
  }

  return (
    <OnboardingAuthContext.Provider value={value}>
      {children}
    </OnboardingAuthContext.Provider>
  )
}

export const useOnboardingAuth = () => {
  const context = useContext(OnboardingAuthContext)
  if (context === undefined) {
    throw new Error('useOnboardingAuth must be used within an OnboardingAuthProvider')
  }
  return context
}
