import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuthContext } from '../contexts/AuthContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useStats } from '../hooks/useStats'
import {
  Calendar, CheckSquare, Clock,  X
} from 'lucide-react'

const Dashboard: React.FC = () => {
  const { user, profile } = useAuthContext()
  const { stats, loading, revenueData, reservationTrends } = useStats(user?.id ? user : null)
  
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  const formatChange = (value: number | undefined | null): string => {
    if (value === undefined || value === null || !isFinite(value)) return '0%'
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const statCards = [
    {
      name: 'Total Reservas',
      value: (stats?.totalReservations || 0).toString(),
      icon: Calendar,
      color: 'bg-blue-500',
      change: formatChange(stats?.totalChange),
      changeType: (stats?.totalChange || 0) >= 0 ? 'positive' : 'negative'
    },
    {
      name: 'Reservas Completadas',
      value: (stats?.completedReservations || 0).toString(),
      icon: CheckSquare,
      color: 'bg-green-500',
      change: formatChange(stats?.completedChange),
      changeType: (stats?.completedChange || 0) >= 0 ? 'positive' : 'negative'
    },
    {
      name: 'Reservas Pendientes',
      value: (stats?.pendingReservations || 0).toString(),
      icon: Clock,
      color: 'bg-yellow-500',
      change: formatChange(stats?.pendingChange),
      changeType: (stats?.pendingChange || 0) >= 0 ? 'positive' : 'negative'
    },
    {
      name: 'Reservas Canceladas',
      value: (stats?.cancelledReservations || 0).toString(),
      icon: X,
      color: 'bg-red-500',
      change: formatChange(stats?.cancelledChange),
      changeType: (stats?.cancelledChange || 0) >= 0 ? 'positive' : 'negative'
    }
  ]

  return (
    <div className="space-y-8 p-4 sm:p-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-400 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          ¡Bienvenido de vuelta! 👋
        </h1>
        <p className="text-primary-100">
          Aquí tienes un resumen de tu negocio <b>{profile?.company_name}</b> hoy
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className={`${card.color} bg-opacity-10 p-3 rounded-lg`}>
                {React.createElement(card.icon, { className: `h-6 w-6 ${card.color.replace('bg-', 'text-')}` })}
              </div>
              <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full
                ${card.changeType === 'positive' ? 'bg-green-100 text-green-800' : 
                  card.changeType === 'negative' ? 'bg-red-100 text-red-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                {card.change}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-600 mt-4">{card.name}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
            <p className="text-xs text-gray-500 mt-2">vs mes anterior</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 sm:mt-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Ingresos Mensuales</h3>
            <div className="text-sm text-gray-500">
              Total: ${stats?.monthlyRevenue?.toLocaleString()}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={revenueData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 11 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 11 }}
                tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
              />
              <Tooltip 
                formatter={(value) => [`$${Number(value as number).toLocaleString()}`, 'Ingresos']}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  padding: '0.5rem 0.75rem'
                }}
              />
              <Bar 
                dataKey="revenue" 
                fill="#338B85"
                radius={[6, 6, 0, 0]}
                maxBarSize={36}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Reservations Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Estado de Reservas</h3>
            <div className="text-sm text-gray-500">
              Total: {stats?.totalReservations?.toLocaleString()} reservas
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={reservationTrends} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 11 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 11 }}
              />
              <Tooltip 
                formatter={(value, name) => [Number(value as number).toLocaleString(), name as string]}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  padding: '0.5rem 0.75rem'
                }}
              />
              <Bar dataKey="pending" fill="#FCD34D" name="Pendientes" radius={[6, 6, 0, 0]} />
              <Bar dataKey="completed" fill="#34D399" name="Completadas" radius={[6, 6, 0, 0]} />
              <Bar dataKey="cancelled" fill="#F87171" name="Canceladas" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default Dashboard