import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { supabase } from '../../lib/supabase'
import { useAuthContext } from '../../contexts/AuthContext'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Button from '../../components/ui/Button'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle,
  FileText,
  Settings,
  Download,
  Filter,
  RefreshCw,
  Bell,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  CreditCard,
  UserCheck,
  Briefcase,
  Star,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'

interface AdminStats {
  totalRevenue: number
  monthlyRevenue: number
  dailyRevenue: number
  totalClients: number
  newClientsThisMonth: number
  totalReservations: number
  completedReservations: number
  pendingReservations: number
  cancelledReservations: number
  averageRevenuePerClient: number
  occupancyRate: number
  clientSatisfaction: number
}

const Financial: React.FC = () => {
  const { user, profile } = useAuthContext()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState('month')
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Mock data for charts
  const revenueData = [
    { name: 'Ene', revenue: 45000, expenses: 32000, profit: 13000 },
    { name: 'Feb', revenue: 52000, expenses: 35000, profit: 17000 },
    { name: 'Mar', revenue: 48000, expenses: 33000, profit: 15000 },
    { name: 'Abr', revenue: 61000, expenses: 38000, profit: 23000 },
    { name: 'May', revenue: 55000, expenses: 36000, profit: 19000 },
    { name: 'Jun', revenue: 67000, expenses: 41000, profit: 26000 },
  ]

  const clientsData = [
    { name: 'Nuevos', value: 45, color: '#338B85' },
    { name: 'Recurrentes', value: 120, color: '#5DC1B9' },
    { name: 'Inactivos', value: 25, color: '#94A3B8' },
  ]

  const servicesData = [
    { name: 'Masajes', bookings: 85, revenue: 25500 },
    { name: 'Faciales', bookings: 62, revenue: 18600 },
    { name: 'Manicure', bookings: 94, revenue: 14100 },
    { name: 'Pedicure', bookings: 71, revenue: 12775 },
    { name: 'Tratamientos', bookings: 38, revenue: 19000 },
  ]

  const alerts = [
    { id: 1, type: 'warning', message: 'Stock bajo en productos de masaje', time: '2 horas' },
    { id: 2, type: 'info', message: '5 reservas pendientes de confirmación', time: '30 min' },
    { id: 3, type: 'success', message: 'Meta mensual alcanzada al 95%', time: '1 hora' },
    { id: 4, type: 'error', message: 'Pago pendiente de proveedor vencido', time: '4 horas' },
  ]

  useEffect(() => {
    if (user) {
      fetchAdminStats()
    }
  }, [user, dateFilter])

  const fetchAdminStats = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Fetch comprehensive stats
      const today = new Date().toISOString().split('T')[0]
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

      // Revenue calculations
      const { data: allReservations } = await supabase
        .from('reservations')
        .select('total_amount, status, created_at')
        .eq('user_id', user.id)

      const { data: monthReservations } = await supabase
        .from('reservations')
        .select('total_amount')
        .eq('user_id', user.id)
        .gte('start_time', startOfMonth)

      const { data: todayReservations } = await supabase
        .from('reservations')
        .select('total_amount')
        .eq('user_id', user.id)
        .gte('start_time', today)

      // Client stats
      const { count: totalClients } = await supabase
        .from('clients')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)

      const { count: newClientsThisMonth } = await supabase
        .from('clients')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth)

      // Reservation stats
      const { count: totalReservations } = await supabase
        .from('reservations')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)

      const { count: completedReservations } = await supabase
        .from('reservations')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('status', 'completed')

      const { count: pendingReservations } = await supabase
        .from('reservations')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('status', 'pending')

      const { count: cancelledReservations } = await supabase
        .from('reservations')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('status', 'cancelled')

      // Calculate metrics
      const totalRevenue = allReservations?.reduce((sum, r) => sum + r.total_amount, 0) || 0
      const monthlyRevenue = monthReservations?.reduce((sum, r) => sum + r.total_amount, 0) || 0
      const dailyRevenue = todayReservations?.reduce((sum, r) => sum + r.total_amount, 0) || 0
      const averageRevenuePerClient = totalClients ? totalRevenue / totalClients : 0
      const occupancyRate = totalReservations ? (completedReservations || 0) / totalReservations * 100 : 0

      setStats({
        totalRevenue,
        monthlyRevenue,
        dailyRevenue,
        totalClients: totalClients || 0,
        newClientsThisMonth: newClientsThisMonth || 0,
        totalReservations: totalReservations || 0,
        completedReservations: completedReservations || 0,
        pendingReservations: pendingReservations || 0,
        cancelledReservations: cancelledReservations || 0,
        averageRevenuePerClient,
        occupancyRate,
        clientSatisfaction: 4.8 // Mock data
      })

      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching admin stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount)
  }

  const getChangeIndicator = (current: number, previous: number) => {
    if (current > previous) return { icon: ArrowUp, color: 'text-green-600', bg: 'bg-green-100' }
    if (current < previous) return { icon: ArrowDown, color: 'text-red-600', bg: 'bg-red-100' }
    return { icon: Minus, color: 'text-gray-600', bg: 'bg-gray-100' }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />
      default: return <Bell className="h-4 w-4 text-blue-600" />
    }
  }

  const getAlertBg = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-yellow-50 border-yellow-200'
      case 'error': return 'bg-red-50 border-red-200'
      case 'success': return 'bg-green-50 border-green-200'
      default: return 'bg-blue-50 border-blue-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-400 rounded-xl p-6 text-white">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Dashboard Ejecutivo</h1>
            <p className="text-primary-100">
              {profile?.company_name || 'Mi Empresa'} • Última actualización: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="day">Hoy</option>
              <option value="week">Esta Semana</option>
              <option value="month">Este Mes</option>
              <option value="year">Este Año</option>
            </select>
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchAdminStats}
              className="bg-white/20 hover:bg-white/30 border-white/30"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ingresos del Mes</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(stats?.monthlyRevenue || 0)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ArrowUp className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-sm font-medium text-green-600">+12.5%</span>
            <span className="text-sm text-gray-500 ml-2">vs mes anterior</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clientes Activos</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.totalClients || 0}</p>
            </div>
            <div className="bg-primary-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ArrowUp className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-sm font-medium text-green-600">+{stats?.newClientsThisMonth || 0}</span>
            <span className="text-sm text-gray-500 ml-2">nuevos este mes</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tasa de Ocupación</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.occupancyRate.toFixed(1) || 0}%</p>
            </div>
            <div className="bg-secondary-100 p-3 rounded-lg">
              <Activity className="h-6 w-6 text-secondary-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ArrowUp className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-sm font-medium text-green-600">+5.2%</span>
            <span className="text-sm text-gray-500 ml-2">vs mes anterior</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Satisfacción Cliente</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.clientSatisfaction || 0}/5</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ArrowUp className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-sm font-medium text-green-600">+0.3</span>
            <span className="text-sm text-gray-500 ml-2">vs mes anterior</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Análisis Financiero</h3>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-gray-400" />
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value, name) => [formatCurrency(Number(value)), name]} />
              <Bar dataKey="revenue" fill="#338B85" name="Ingresos" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#94A3B8" name="Gastos" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" fill="#5DC1B9" name="Utilidad" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Client Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Distribución de Clientes</h3>
            <PieChartIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={clientsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {clientsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            {clientsData.map((item, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm font-medium text-gray-900">{item.value}</span>
                </div>
                <p className="text-xs text-gray-500">{item.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services Performance & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Services Performance */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Rendimiento por Servicio</h3>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Ver Reporte
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Servicio</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Reservas</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Ingresos</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Tendencia</th>
                </tr>
              </thead>
              <tbody>
                {servicesData.map((service, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <Briefcase className="h-4 w-4 text-gray-400 mr-3" />
                        <span className="font-medium text-gray-900">{service.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{service.bookings}</td>
                    <td className="py-3 px-4 text-gray-700">{formatCurrency(service.revenue)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <ArrowUp className="h-4 w-4 text-green-600 mr-1" />
                        <span className="text-sm text-green-600">+{Math.floor(Math.random() * 20)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Alertas</h3>
            <Bell className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className={`p-4 rounded-lg border ${getAlertBg(alert.type)}`}>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3 mt-0.5">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-1">{alert.message}</p>
                    <p className="text-xs text-gray-500">Hace {alert.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Button variant="outline" className="w-full">
              Ver Todas las Alertas
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
            <FileText className="h-6 w-6 mb-2 text-primary-600" />
            <span className="text-sm">Generar Reporte</span>
          </Button>
          <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
            <Calendar className="h-6 w-6 mb-2 text-secondary-600" />
            <span className="text-sm">Ver Calendario</span>
          </Button>
          <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
            <Users className="h-6 w-6 mb-2 text-green-600" />
            <span className="text-sm">Gestionar Clientes</span>
          </Button>
          <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
            <CreditCard className="h-6 w-6 mb-2 text-blue-600" />
            <span className="text-sm">Facturación</span>
          </Button>
          <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
            <UserCheck className="h-6 w-6 mb-2 text-purple-600" />
            <span className="text-sm">Personal</span>
          </Button>
          <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
            <Settings className="h-6 w-6 mb-2 text-gray-600" />
            <span className="text-sm">Configuración</span>
          </Button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <span>Sistema Axendar v2.1.0</span>
            <span>•</span>
            <span>Soporte: soporte@reservaspro.com</span>
            <span>•</span>
            <span>Tel: +56 9 1234 5678</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Sistema operativo • Última copia de seguridad: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Financial