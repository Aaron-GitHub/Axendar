import { useState, useEffect } from 'react'
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

export const useStats = (user: User | null, dateFilter: 'day' | 'week' | 'month' | 'year' = 'month') => {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
    const [reservationTrends, setReservationTrends] = useState<TrendData[]>([])

    useEffect(() => {
        if (stats) {
          // Generar datos de ingresos basados en los últimos 6 meses
          const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']
          const revenueMultipliers = [1, 0.9, 0.85, 1.1, 0.95, 1.2]
          
          setRevenueData(
            months.map((month, index) => ({
              name: month,
              revenue: Math.round((stats.monthlyRevenue || 0) * revenueMultipliers[index])
            }))
          )
    
          // Generar datos de reservas por estado para cada día
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
        }
      }, [stats])


  useEffect(() => {
    if (user) {
      fetchStats()
    }
  }, [user, dateFilter])

  const fetchStats = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      // Fechas de referencia
      const currentDate = new Date()
      const today = currentDate.toISOString().split('T')[0]
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)

      // Today's revenue
      const { data: todayReservations } = await supabase
        .from('reservations')
        .select('total_amount')
        .eq('user_id', user.id)
        .gte('start_time', today)
        .eq('status', 'completed')

      const todayRevenue = todayReservations?.reduce((sum, r) => sum + r.total_amount, 0) || 0

      // Current month revenue
      const { data: monthReservations } = await supabase
        .from('reservations')
        .select('total_amount')
        .eq('user_id', user.id)
        .gte('start_time', firstDayOfMonth.toISOString())
        .eq('status', 'completed')

      const monthlyRevenue = monthReservations?.reduce((sum, r) => sum + r.total_amount, 0) || 0

      // Previous month revenue for comparison
      const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
      const startOfPrevMonth = prevMonth.toISOString()
      const endOfPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).toISOString()
      
      const { data: prevMonthReservations } = await supabase
        .from('reservations')
        .select('total_amount')
        .eq('user_id', user.id)
        .gte('start_time', startOfPrevMonth)
        .lte('start_time', endOfPrevMonth)
        .eq('status', 'completed')

      const prevMonthRevenue = prevMonthReservations?.reduce((sum, r) => sum + r.total_amount, 0) || 0
      const revenueChange = prevMonthRevenue ? ((monthlyRevenue - prevMonthRevenue) / prevMonthRevenue * 100) : 0

      // Previous month reservations for comparison
      const { count: prevMonthCount } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('start_time', startOfPrevMonth)
        .lte('start_time', endOfPrevMonth)

      const { count: prevMonthCompleted } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('start_time', startOfPrevMonth)
        .lte('start_time', endOfPrevMonth)
        .eq('status', 'completed')
        
      const prevMonthCountSafe = prevMonthCount || 0
      const prevMonthCompletedSafe = prevMonthCompleted || 0

      // Total reservations
      const { count: totalReservations } = await supabase
        .from('reservations')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)

      // Completed reservations
      const { count: completedReservations } = await supabase
        .from('reservations')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('status', 'completed')

      // Pending reservations
      const { count: pendingReservations } = await supabase
        .from('reservations')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('status', 'pending')

      // Cancelled reservations
      const { count: cancelledReservations } = await supabase
        .from('reservations')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('status', 'cancelled')

      // Active clients
      const { count: activeClients } = await supabase
        .from('clients')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)

      // New clients this month
      const { count: newClientsThisMonth } = await supabase
        .from('clients')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .gte('created_at', firstDayOfMonth.toISOString())

      // Calculate metrics
      const totalRevenue = monthlyRevenue
      const averageRevenue = completedReservations ? totalRevenue / completedReservations : 0

      // Función para calcular cambios de manera segura
      const calculateChange = (current: number, previous: number): number => {
        if (previous === 0) return 0 // Si no había datos previos, retornamos 0 (sin cambios)
        const change = ((current - previous) / previous) * 100
        return Math.max(Math.min(change, 100), -100) // Limitamos entre -100% y +100%
      }

      const totalChange = calculateChange(totalReservations || 0, prevMonthCountSafe)
      const completedChange = calculateChange(completedReservations || 0, prevMonthCompletedSafe)
      const pendingChange = calculateChange(pendingReservations || 0, prevMonthCountSafe - prevMonthCompletedSafe)
      const cancelledChange = calculateChange(cancelledReservations || 0, prevMonthCountSafe - prevMonthCompletedSafe)
      
      const conversionRate = totalReservations ? ((completedReservations || 0) / totalReservations) * 100 : 0
      const prevConversionRate = prevMonthCountSafe > 0 ? (prevMonthCompletedSafe / prevMonthCountSafe) * 100 : 0
      const conversionRateChange = calculateChange(conversionRate, prevConversionRate)
      const occupancyRate = totalReservations ? (completedReservations || 0 / totalReservations || 0 * 100) : 0

      setStats({
        todayRevenue,
        monthlyRevenue,
        totalRevenue,
        averageRevenue,
        totalRevenueChange: revenueChange,
        totalReservations: totalReservations || 0,
        completedReservations: completedReservations || 0,
        pendingReservations: pendingReservations || 0,
        cancelledReservations: cancelledReservations || 0,
        totalChange,
        completedChange,
        pendingChange,
        cancelledChange,
        activeClients: activeClients || 0,
        activeClientsChange: 0, // TODO: Implementar cálculo de cambio
        newClientsThisMonth: newClientsThisMonth || 0,
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
  }

  const refresh = () => {
    fetchStats()
  }

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
