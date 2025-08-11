import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { User } from '@supabase/supabase-js'
import { User as AppUser } from '../types/index'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

// Tipos para mensajes del canal de autenticación
type AuthMessage = 
  | { type: 'SIGNED_OUT' }
  | { type: 'PROFILE_UPDATED', payload: { profile: AppUser } }

// Canal de comunicación entre pestañas
const authChannel = typeof BroadcastChannel !== 'undefined' 
  ? new BroadcastChannel('auth_channel')
  : null

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const navigate = useNavigate()
  
  // Referencia para limpiar el listener del canal
  const channelCleanupRef = useRef<(() => void) | null>(null)

  const handleSessionError = () => {
    // Limpiar estado
    setUser(null)
    setProfile(null)
    setLoading(false)
    setInitialized(true)
    
    // Limpiar token
    localStorage.removeItem('sb-' + import.meta.env.VITE_SUPABASE_PROJECT_REF + '-auth-token')
    
    // Notificar y redirigir
    //toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.')
    if (!location.pathname.startsWith('/auth') && !location.pathname.startsWith('/onboarding')) {
      navigate('/')
    }
  }

  useEffect(() => {
    let isMounted = true
    
    const verifySession = async () => {
      if (!initialized) {
        setLoading(true)
      }
      try {
        // Skip auth check for onboarding path
        if (location.pathname.startsWith('/onboarding')) {
          setUser(null)
          setProfile(null)
          setLoading(false)
          setInitialized(true)
          return
        }

        // Verificar sesión actual
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError || !session?.user) {
          handleSessionError()
          return
        }

        if (!isMounted) return

        // Actualizar estado con la sesión válida
        setUser(session.user)
        await fetchProfile(session.user.id)
        
      } catch (error) {
        console.error('Error verifying session:', error)
        if (isMounted) {
          handleSessionError()
        }
      } finally {
        if (isMounted) {
          setLoading(false)
          setInitialized(true)
        }
      }
    }

    // Siempre verificar sesión al montar el componente
    verifySession()

    // Configurar listener del canal de broadcast
    if (authChannel) {
      const handleAuthMessage = (event: MessageEvent) => {
        const message = event.data as AuthMessage
        if (!isMounted) return
        
        // Manejar mensajes de forma síncrona
        requestAnimationFrame(() => {
          switch (message.type) {
            case 'SIGNED_OUT':
              handleSessionError()
              break
            case 'PROFILE_UPDATED':
              if ('payload' in message && message.payload.profile) {
                setProfile(message.payload.profile)
              }
              break
          }
        })
      }

      authChannel.addEventListener('message', handleAuthMessage)
      channelCleanupRef.current = () => {
        authChannel.removeEventListener('message', handleAuthMessage)
      }
    }

    // Verificar sesión periódicamente
    const sessionCheckInterval = setInterval(verifySession, 5 * 60 * 1000) // Cada 5 minutos

    return () => {
      isMounted = false
      clearInterval(sessionCheckInterval)
      if (channelCleanupRef.current) {
        channelCleanupRef.current()
      }
    }
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        // Si el perfil no existe
        if (error.code === 'PGRST116') {
          console.log('Perfil no encontrado, creando uno nuevo...')
          // Intentar crear un perfil básico
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                email: session.user.email,
                name: session.user.email?.split('@')[0] || 'Usuario',
              })
              .select()
              .single()

            if (insertError) {
              throw insertError
            }
            
            setProfile(newProfile)
            return
          }
        }
        
        // Error de JWT o sesión
        if (error.code === 'PGRST301' || error.message.includes('JWT')) {
          handleSessionError()
          return
        }
        
        throw error
      }
      
      setProfile(data)
      
      // Notificar a otras pestañas sobre el cambio de perfil
      if (authChannel) {
        authChannel.postMessage({ 
          type: 'PROFILE_UPDATED', 
          payload: { profile: data } 
        } as AuthMessage)
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error)
      if (error.code === 'PGRST116') {
        toast.error('No se pudo crear el perfil automáticamente')
      } else {
        toast.error('Error al cargar el perfil')
      }
      // Si hay un error al cargar el perfil, no debemos bloquear la app
      setProfile(null)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)

      console.log(session?.user?.id);

      await fetchProfile(session?.user?.id ?? '')
      toast.success('¡Bienvenido de vuelta!')
    } catch (error: any) {
      toast.error(error.message || 'Error al iniciar sesión')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, name: string, companyName?: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email,
            name,
            company_name: companyName,
          })

        if (profileError) throw profileError
      }

      toast.success('Cuenta creada exitosamente')
    } catch (error: any) {
      toast.error(error.message || 'Error al crear la cuenta')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    let timeoutId: NodeJS.Timeout

    try {
      // Creamos una promesa que se resuelve con el signOut o con un timeout
      const signOutPromise = supabase.auth.signOut()
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('Tiempo de espera agotado'))
        }, 5000) // 5 segundos de timeout
      })

      // Intentamos el signOut con timeout
      await Promise.race([signOutPromise, timeoutPromise])
        .catch((error) => {
          console.error('Error en signOut:', error)
          // No lanzamos el error, continuamos con el logout local
        })
        .finally(() => {
          clearTimeout(timeoutId)
        })
    } catch (error) {
      console.error('Error en signOut:', error)
      // No lanzamos el error, continuamos con el logout local
    } finally {
      // Siempre limpiamos el estado local y redirigimos
      try {
        // Limpieza local
        setUser(null)
        setProfile(null)
        localStorage.removeItem('sb-' + import.meta.env.VITE_SUPABASE_PROJECT_REF + '-auth-token')
        
        // Notificar a otras pestañas
        if (authChannel) {
          authChannel.postMessage({ type: 'SIGNED_OUT' })
        }

        // Navegación y notificación
        navigate('/')
        toast.success('Sesión cerrada')
      } catch (error: any) {
        console.error('Error en limpieza local:', error)
        // Último intento de redirección
        window.location.href = '/'
      }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error
      toast.success('Correo de recuperación enviado')
    } catch (error: any) {
      toast.error(error.message || 'Error al enviar correo de recuperación')
      throw error
    }
  }

  return {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }
}