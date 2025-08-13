import React, { useEffect, useMemo, useState } from 'react'
import BookingStepper from '../../components/booking/BookingStepper'
import type { BookingData } from '../../components/booking/BookingStepper'
import { useNavigate, useParams } from 'react-router-dom'
import { supabaseAdmin } from '../../lib/supabase'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import type { User } from '../../types/index'
import { hexToRgba } from '../../utils/color'

const ReservarPage: React.FC = () => {
  const navigate = useNavigate()
  const { userId } = useParams<{ userId: string }>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userData, setUserData] = useState<User | null>(null)
  const [bookingDetails, setBookingDetails] = useState<{
    service?: { name: string }
    professional?: { name: string }
    date?: Date
    time?: string
  }>({})
  const [branding, setBranding] = useState<{ booking_primary_color?: string; booking_accent_color?: string } | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setError('ID de usuario no proporcionado')
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (error) throw error
        if (!data) throw new Error('Usuario no encontrado')

        setUserData(data)
      } catch (err) {
        console.error('Error fetching user data:', err)
        setError(err instanceof Error ? err.message : 'Error al cargar datos del usuario')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [userId])

  useEffect(() => {
    const fetchBranding = async () => {
      if (!userId) return
      try {
        const { data, error } = await supabaseAdmin
          .from('profile_settings')
          .select('booking_primary_color, booking_accent_color')
          .eq('user_id', userId)
          .maybeSingle()
        if (error) throw error
        setBranding(data || null)
      } catch (e) {
        console.error('Error fetching branding settings:', e)
        setBranding(null)
      }
    }
    fetchBranding()
  }, [userId])

  const brandingStyle = useMemo(() => {
    const primary = branding?.booking_primary_color || '#338B85'
    const accent = branding?.booking_accent_color || '#14b8a6'
    return {
      ['--booking-primary' as any]: primary,
      ['--booking-accent' as any]: accent
    } as React.CSSProperties
  }, [branding])

  const handleComplete = (_bookingData: BookingData) => {
    // No hacer nada aquí, el BookingStepper ya maneja la visualización del éxito
  }

  const handleCancel = () => {
    // Volver a la página de inicio
    navigate('/', { replace: true })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !userData || !userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || 'Error al cargar los datos'}
          </h2>
          <p className="text-gray-600 mb-4">
            No se pudo cargar la página de reservas
          </p>
          <button
            onClick={() => navigate('/', { replace: true })}
            className="text-primary-600 hover:text-primary-700"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" style={brandingStyle}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Columna de información de la empresa */}
          <div className="bg-white shadow sm:rounded-lg p-4 lg:col-span-1">
            <div className="flex flex-col items-center mb-8">
              {userData.logo_url ? (
                <img
                  src={userData.logo_url}
                  alt={userData.company_name}
                  className="max-w-64 max-h-64 object-contain mb-4"
                />
              ) : (
                <div className="w-32 h-32 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: hexToRgba(branding?.booking_primary_color || '#338B85', 0.25) }}>
                  <span className="text-4xl font-bold"
                    style={{ color: branding?.booking_primary_color || '#338B85' }}>
                    {userData.company_name?.[0]?.toUpperCase() || 'E'}
                  </span>
                </div>
              )}
              <h1 className="text-3xl font-bold text-gray-900 text-center">
                {userData.company_name}
              </h1>
            </div>

            <div className="space-y-2 mb-8">
              {userData.address && (
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-gray-400 mt-1 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-gray-600">{userData.address}</p>
                </div>
              )}
              {userData.phone && (
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <p className="text-gray-600">{userData.phone}</p>
                </div>
              )}
              {userData.website && (
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <a href={userData.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary-700"
                    style={{ color: branding?.booking_primary_color || '#338B85' }}
                  >
                    {userData.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}

              <div className="mt-6 p-3 bg-blue-50 rounded-md">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Información importante</h4>
                <ul className="space-y-1 text-sm text-blue-700">
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Agenda con {userData.min_booking_hours || 0} horas de antelación
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancela con {userData.min_cancel_hours || 0} horas de antelación
                  </li>
                </ul>
              </div>
            </div>

            {/* Aquí irá el resumen de la reserva cuando se vaya seleccionando */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen de tu reserva</h3>
              <div className="space-y-2 text-sm text-gray-600">
                {bookingDetails.service && (
                  <p>Servicio: <span className="font-medium">{bookingDetails.service.name}</span></p>
                )}
                {bookingDetails.professional && (
                  <p>Profesional: <span className="font-medium">{bookingDetails.professional.name}</span></p>
                )}
                {bookingDetails.date && (
                  <p>Fecha: <span className="font-medium">
                    {bookingDetails.date.toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span></p>
                )}
                {bookingDetails.time && (
                  <p>Hora: <span className="font-medium">{bookingDetails.time}</span></p>
                )}
              </div>
            </div>
          </div>

          {/* Columna del stepper */}
          <div className="bg-white shadow sm:rounded-lg p-2 sm:p-6 lg:col-span-2">
            <BookingStepper
              userId={userId}
              onComplete={handleComplete}
              onCancel={handleCancel}
              onDetailsChange={setBookingDetails}
              profile_color={branding?.booking_primary_color || '#338B85'}
            />
          </div>
        </div>
        <div className="mt-10">
          <div className="mx-auto max-w-3xl rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-wide text-primary-600 font-semibold">Impulsado por Axendar</p>
                <h3 className="mt-1 text-base sm:text-lg font-semibold text-gray-900">¿Te gustaría tener una página como esta para tus reservas?</h3>
                <p className="mt-1 text-sm text-gray-500">Crea tu agenda online gratis y comienza a recibir reservas online.</p>
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <a
                  href={`https://axendar.com/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  Crear mi agenda gratis
                </a>
              </div>
            </div>
          </div>
          <p className="text-center mt-3 text-xs text-gray-500">Axendar es la plataforma para agendar, gestionar clientes y mostrar tus servicios.</p>
        </div>
      </div>
    </div>
  )
}

export default ReservarPage
