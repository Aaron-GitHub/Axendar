import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { User } from '@supabase/supabase-js'

export interface Stats {
  todayRevenue: number
  monthlyRevenue: number
  totalRevenue: number
  averageRevenue: number
  totalRevenueChange: number
  totalReservations: number
  completedReservations: number
  pendingReservations: number
  cancelledReservations: number
  totalChange: number
  completedChange: number
  pendingChange: number
  cancelledChange: number
  activeClients: number
  activeClientsChange: number
  newClientsThisMonth: number
  conversionRate: number
  conversionRateChange: number
  occupancyRate: number
  clientSatisfaction: number
}

interface RevenueData {
  name: string
  revenue: number
}

interface TrendData {
  name: string
  pending: number
  completed: number
  cancelled: number
}

export const useStats = (user: User | null) => {
  // Estados
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [reservationTrends, setReservationTrends] = useState<TrendData[]>([])

  // Referencias
  const initialLoadRef = useRef(false)

  // Funciones auxiliares
  const calculateChange = useCallback((current: number, previous: number): number => {
    if (previous === 0) return 0
    const change = ((current - previous) / previous) * 100
    return Math.max(Math.min(change, 100), -100)
  }, [])

  // Función para generar datos de tendencia
  const generateTrendData = useCallback(() => {
    if (!stats) return

    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']
    const revenueMultipliers = [1, 0.9, 0.85, 1.1, 0.95, 1.2]
    
    setRevenueData(
      months.map((month, index) => ({
        name: month,
        revenue: Math.round((stats.monthlyRevenue || 0) * revenueMultipliers[index])
      }))
    )

    const days = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom']
    const pendingMultipliers = [0.2, 0.15, 0.18, 0.2, 0.25, 0.3, 0.15]
    const completedMultipliers = [0.15, 0.2, 0.25, 0.15, 0.2, 0.3, 0.2]
    const cancelledMultipliers = [0.1, 0.08, 0.12, 0.1, 0.15, 0.2, 0.1]
    
    setReservationTrends(
      days.map((day, index) => ({
        name: day,
        pending: Math.round((stats.pendingReservations || 0) * pendingMultipliers[index]),
        completed: Math.round((stats.completedReservations || 0) * completedMultipliers[index]),
        cancelled: Math.round((stats.cancelledReservations || 0) * cancelledMultipliers[index])
      }))
    )
  }, [stats])

  const fetchStats = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      // Fechas de referencia
      const currentDate = new Date()
      const today = currentDate.toISOString().split('T')[0]
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
      const startOfPrevMonth = prevMonth.toISOString()

      // Consulta consolidada para reservas
      const { data: reservationsStats } = await supabase
        .from('reservations')
        .select(`
          status,
          total_amount,
          start_time
        `)
        .eq('user_id', user.id)

      // Procesar datos de reservas
      const stats = reservationsStats?.reduce((acc, r) => {
        const isToday = r.start_time.startsWith(today)
        const isThisMonth = r.start_time >= firstDayOfMonth.toISOString()
        const isPrevMonth = r.start_time >= startOfPrevMonth && r.start_time < firstDayOfMonth.toISOString()
        const isCompleted = r.status === 'completed'

        // Actualizar contadores
        if (isToday && isCompleted) acc.todayRevenue += r.total_amount
        if (isThisMonth && isCompleted) acc.monthlyRevenue += r.total_amount
        if (isPrevMonth && isCompleted) acc.prevMonthRevenue += r.total_amount

        // Contadores del mes actual
        if (isThisMonth) {
          acc.thisMonthTotal++
          if (r.status === 'completed') acc.thisMonthCompleted++
          if (r.status === 'pending') acc.thisMonthPending++
          if (r.status === 'cancelled') acc.thisMonthCancelled++
        }

        // Contadores del mes anterior
        if (isPrevMonth) {
          acc.prevMonthTotal++
          if (r.status === 'completed') acc.prevMonthCompleted++
        }

        // Contadores totales
        acc.totalReservations++
        if (r.status === 'completed') acc.completedReservations++
        if (r.status === 'pending') acc.pendingReservations++
        if (r.status === 'cancelled') acc.cancelledReservations++

        return acc
      }, {
        todayRevenue: 0,
        monthlyRevenue: 0,
        prevMonthRevenue: 0,
        thisMonthTotal: 0,
        thisMonthCompleted: 0,
        thisMonthPending: 0,
        thisMonthCancelled: 0,
        prevMonthTotal: 0,
        prevMonthCompleted: 0,
        totalReservations: 0,
        completedReservations: 0,
        pendingReservations: 0,
        cancelledReservations: 0
      })

      // Consulta consolidada para clientes
      const { data: clientStats } = await supabase
        .from('clients')
        .select('created_at')
        .eq('user_id', user.id)

      const clientCounts = clientStats?.reduce((acc, client) => {
        acc.activeClients++
        if (client.created_at >= firstDayOfMonth.toISOString()) {
          acc.newClientsThisMonth++
        }
        return acc
      }, { activeClients: 0, newClientsThisMonth: 0 })

      // Calculate metrics
      const totalRevenue = stats?.monthlyRevenue || 0
      const averageRevenue = stats?.completedReservations ? totalRevenue / stats.completedReservations : 0

      const totalChange = calculateChange(stats?.thisMonthTotal || 0, stats?.prevMonthTotal || 0)
      const completedChange = calculateChange(stats?.thisMonthCompleted || 0, stats?.prevMonthCompleted || 0)
      const pendingChange = calculateChange(
        stats?.thisMonthPending || 0,
        ((stats?.prevMonthTotal || 0) - (stats?.prevMonthCompleted || 0))
      )
      const cancelledChange = calculateChange(
        stats?.thisMonthCancelled || 0,
        ((stats?.prevMonthTotal || 0) - (stats?.prevMonthCompleted || 0))
      )
      
      const conversionRate = stats?.totalReservations ? 
        ((stats?.completedReservations || 0) / stats.totalReservations) * 100 : 0
      const prevConversionRate = (stats?.prevMonthTotal || 0) > 0 ? 
        ((stats?.prevMonthCompleted || 0) / (stats?.prevMonthTotal || 0)) * 100 : 0
      const conversionRateChange = calculateChange(conversionRate, prevConversionRate)
      const occupancyRate = stats?.totalReservations ? (stats.completedReservations || 0 / stats.totalReservations || 0 * 100) : 0

      setStats({
        todayRevenue: stats?.todayRevenue || 0,
        monthlyRevenue: stats?.monthlyRevenue || 0,
        totalRevenue,
        averageRevenue,
        totalRevenueChange: calculateChange(stats?.monthlyRevenue || 0, stats?.prevMonthRevenue || 0),
        totalReservations: stats?.totalReservations || 0,
        completedReservations: stats?.completedReservations || 0,
        pendingReservations: stats?.pendingReservations || 0,
        cancelledReservations: stats?.cancelledReservations || 0,
        totalChange,
        completedChange,
        pendingChange,
        cancelledChange,
        activeClients: clientCounts?.activeClients || 0,
        activeClientsChange: 0, // TODO: Implementar cálculo de cambio
        newClientsThisMonth: clientCounts?.newClientsThisMonth || 0,
        conversionRate,
        conversionRateChange,
        occupancyRate,
        clientSatisfaction: 4.8 // TODO: Implementar cálculo real
      })

      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error fetching stats:', err)
      setError(err instanceof Error ? err : new Error('Error desconocido al obtener estadísticas'))
    } finally {
      setLoading(false)
    }
  }, [user, calculateChange])

  // Efecto para actualizar datos de tendencia cuando cambian las estadísticas
  useEffect(() => {
    generateTrendData()
  }, [generateTrendData])

  // Efecto único para carga inicial y suscripción
  useEffect(() => {
    if (!user?.id) return

    // Carga inicial solo una vez
    if (!initialLoadRef.current) {
      initialLoadRef.current = true
      fetchStats()
    }

    // Suscripción en tiempo real a cambios en reservas y clientes
    const reservationsSubscription = supabase
      .channel('dashboard_reservations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Reservation change detected, updating stats...')
          fetchStats()
        }
      )
      .subscribe()

    const clientsSubscription = supabase
      .channel('dashboard_clients_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Client change detected, updating stats...')
          fetchStats()
        }
      )
      .subscribe()

    return () => {
      reservationsSubscription.unsubscribe()
      clientsSubscription.unsubscribe()
    }
  }, [user?.id, fetchStats])

  // Efecto único para carga inicial y suscripción
  useEffect(() => {
    if (!user?.id) return

    // Carga inicial solo una vez
    if (!initialLoadRef.current) {
      initialLoadRef.current = true
      fetchStats()
    }

    // Suscripción en tiempo real a cambios en reservas y clientes
    const reservationsSubscription = supabase
      .channel('dashboard_reservations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Reservation change detected, updating stats...')
          fetchStats()
        }
      )
      .subscribe()

    const clientsSubscription = supabase
      .channel('dashboard_clients_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Client change detected, updating stats...')
          fetchStats()
        }
      )
      .subscribe()

    return () => {
      reservationsSubscription.unsubscribe()
      clientsSubscription.unsubscribe()
    }
  }, [user?.id, fetchStats])

  // Efecto para actualizar datos de tendencia
  useEffect(() => {
    generateTrendData()
  }, [generateTrendData])

  // Función para refrescar los datos manualmente
  const refresh = useCallback(() => {
    fetchStats()
  }, [fetchStats])

  // Efecto para carga inicial y suscripciones
  useEffect(() => {
    if (!user?.id) return

    // Carga inicial solo una vez
    if (!initialLoadRef.current) {
      initialLoadRef.current = true
      fetchStats()
    }

    // Suscripción a cambios en reservas
    const reservationsSubscription = supabase
      .channel('dashboard_reservations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Reservation change detected, updating stats...')
          fetchStats()
        }
      )
      .subscribe()

    // Suscripción a cambios en clientes
    const clientsSubscription = supabase
      .channel('dashboard_clients_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Client change detected, updating stats...')
          fetchStats()
        }
      )
      .subscribe()

    // Limpieza de suscripciones
    return () => {
      reservationsSubscription.unsubscribe()
      clientsSubscription.unsubscribe()
    }
  }, [user?.id, fetchStats])

  return {
    stats,
    loading,
    error,
    lastUpdated,
    revenueData,
    reservationTrends,
    refresh
  }
}
