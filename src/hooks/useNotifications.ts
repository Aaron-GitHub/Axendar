import { useState, useEffect, useMemo, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { User } from '@supabase/supabase-js'

export interface Notification {
  id: number
  title: string
  message: string
  type: 'success' | 'warning' | 'error' | 'info'
  time: string
  unread: boolean
  url?: string // Optional URL for navigation
}

export const useNotifications = (user: User | null) => {
  const location = useLocation()
  const [professionalsWithoutServices, setProfessionalsWithoutServices] = useState<string[]>([])
  const [professionalsWithoutSchedules, setProfessionalsWithoutSchedules] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Define routes that should trigger notification refresh
  const shouldRefreshOnRoute = useCallback((pathname: string) => {
    const refreshRoutes = [
      '/app/professionals',
      '/app/services'
    ]
    return refreshRoutes.some(route => pathname.startsWith(route))
  }, [])

  // Function to check for professionals issues (can be called manually or automatically)
  const checkProfessionalsIssues = useCallback(async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      // Get all professionals for this user
      const { data: professionals, error: profError } = await supabase
        .from('professionals')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('available', true)

      if (profError) throw profError

      if (!professionals || professionals.length === 0) {
        setProfessionalsWithoutServices([])
        setProfessionalsWithoutSchedules([])
        setLoading(false)
        return
      }

      // Check professionals with services
      const { data: professionalsWithServices, error: servicesError } = await supabase
        .from('professional_services')
        .select('professional_id')
        .in('professional_id', professionals.map((p: any) => p.id))

      if (servicesError) throw servicesError

      const professionalsWithServicesIds = new Set(
        professionalsWithServices?.map((ps: any) => ps.professional_id) || []
      )

      // Check professionals with working schedules
      const { data: professionalsWithSchedules, error: schedulesError } = await supabase
        .from('professional_schedules')
        .select('professional_id')
        .in('professional_id', professionals.map((p: any) => p.id))
        .eq('is_working', true)

      if (schedulesError) throw schedulesError

      const professionalsWithSchedulesIds = new Set(
        professionalsWithSchedules?.map((ps: any) => ps.professional_id) || []
      )

      // Find professionals without services
      const professionalsWithoutServicesNames = professionals
        .filter((prof: any) => !professionalsWithServicesIds.has(prof.id))
        .map((prof: any) => prof.name)

      // Find professionals without schedules
      const professionalsWithoutSchedulesNames = professionals
        .filter((prof: any) => !professionalsWithSchedulesIds.has(prof.id))
        .map((prof: any) => prof.name)

      setProfessionalsWithoutServices(professionalsWithoutServicesNames)
      setProfessionalsWithoutSchedules(professionalsWithoutSchedulesNames)
    } catch (error) {
      console.error('Error checking professionals issues:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Initial load and intelligent route-based refresh
  useEffect(() => {
    // Always load on first mount or user change
    if (user?.id) {
      checkProfessionalsIssues()
    }
  }, [user?.id, checkProfessionalsIssues])

  // Smart refresh on relevant route changes
  useEffect(() => {
    if (user?.id && shouldRefreshOnRoute(location.pathname)) {
      checkProfessionalsIssues()
    }
  }, [location.pathname, user?.id, shouldRefreshOnRoute, checkProfessionalsIssues])

  // Generate notifications including professionals without services and schedules
  const notifications = useMemo((): Notification[] => {
    const realNotifications: Notification[] = []

    // Add notification for professionals without services
    if (professionalsWithoutServices.length > 0) {
      const professionalNotification: Notification = {
        id: 999,
        title: `${professionalsWithoutServices.length === 1 ? 'Profesional' : 'Profesionales'} sin servicios`,
        message: professionalsWithoutServices.length === 1 
          ? `${professionalsWithoutServices[0]} no tiene servicios asignados`
          : `${professionalsWithoutServices.length} profesionales no tienen servicios asignados: ${professionalsWithoutServices.slice(0, 2).join(', ')}${professionalsWithoutServices.length > 2 ? ' y otros...' : ''}`,
        type: 'warning',
        time: 'Ahora',
        unread: true,
        url: '/app/professionals'
      }
      realNotifications.push(professionalNotification)
    }

    // Add notification for professionals without schedules
    if (professionalsWithoutSchedules.length > 0) {
      const scheduleNotification: Notification = {
        id: 998,
        title: `${professionalsWithoutSchedules.length === 1 ? 'Profesional' : 'Profesionales'} sin horarios`,
        message: professionalsWithoutSchedules.length === 1 
          ? `${professionalsWithoutSchedules[0]} no tiene horarios configurados`
          : `${professionalsWithoutSchedules.length} profesionales no tienen horarios configurados: ${professionalsWithoutSchedules.slice(0, 2).join(', ')}${professionalsWithoutSchedules.length > 2 ? ' y otros...' : ''}`,
        type: 'warning',
        time: 'Ahora',
        unread: true,
        url: '/app/professionals'
      }
      realNotifications.push(scheduleNotification)
    }

    // TODO: Add other real notifications here (reservations, payments, etc.)

    return realNotifications
  }, [professionalsWithoutServices, professionalsWithoutSchedules])

  const unreadCount = notifications.filter(n => n.unread).length

  return {
    notifications,
    unreadCount,
    loading,
    professionalsWithoutServices,
    professionalsWithoutSchedules,
    refreshNotifications: checkProfessionalsIssues // Manual refresh function
  }
}
