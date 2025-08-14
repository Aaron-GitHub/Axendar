import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, User2, Briefcase } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Professional } from '../types'
import { useToast } from '../hooks/useToast'
import ProfessionalForm from '../components/professionals/ProfessionalForm'
import ProfessionalSchedule from '../components/professionals/ProfessionalSchedule'
import ProfessionalBlocks from '../components/professionals/ProfessionalBlocks'
import ProfessionalServicesForm from '../components/professionals/ProfessionalServicesForm'
import Button from '../components/ui/Button'
import { useAuthContext } from '../contexts/AuthContext'
import { PLAN_LIMITS } from '../constants/plans'

export default function ProfessionalDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const { showToast } = useToast()
  const [professional, setProfessional] = useState<Professional | null>(null)
  const [, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('datos')

  const tabs = [
    { id: 'datos', label: 'Datos Personales', icon: User2 },
    { id: 'servicios', label: 'Servicios', icon: Briefcase },
    { id: 'horarios', label: 'Horarios', icon: () => (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
    { id: 'bloqueos', label: 'Bloqueos', icon: () => (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )}
  ]

  useEffect(() => {
    if (id) {
      fetchProfessional()
    } else {
      setLoading(false)
    }
  }, [id])

  const fetchProfessional = async () => {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setProfessional(data)
    } catch (error) {
      console.error('Error fetching professional:', error)
      showToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudo cargar el profesional'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: Professional) => {
    if (!user) return

    setSaving(true)
    try {
      if (id) {
        // Actualizar profesional existente
        const { error } = await supabase
          .from('professionals')
          .update({
            ...data,
            user_id: user.id,
          })
          .eq('id', id)

        if (error) throw error

        await fetchProfessional()
      } else {
        // Crear nuevo profesional con validación de límite por plan
        // 1) Obtener plan del perfil
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('subscription_plan')
          .eq('id', user.id)
          .single()

        if (profileError) throw profileError

        const plan = profile?.subscription_plan as 'free' | 'basic' | 'premium' | 'enterprise' | undefined
        if (!plan) {
          showToast({ type: 'error', title: 'Error', message: 'No se pudo determinar tu plan.' })
          setSaving(false)
          return
        }

        const limit = PLAN_LIMITS[plan]

        // 2) Contar profesionales actuales
        const { count, error: countError } = await supabase
          .from('professionals')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)

        if (countError) throw countError

        if (typeof count === 'number' && count >= limit) {
          const limitText = limit === Number.POSITIVE_INFINITY ? 'ilimitado' : limit
          showToast({
            type: 'error',
            title: 'Límite alcanzado',
            message: `Tu plan (${plan}) permite hasta ${limitText} profesionales.`
          })
          setSaving(false)
          return
        }

        // 3) Insertar
        const { data: newProfessional, error } = await supabase
          .from('professionals')
          .insert([
            {
              ...data,
              user_id: user.id,
            },
          ])
          .select()
          .single()

        if (error) throw error

        // Redirigir a la página de edición
        navigate(`/app/professionals/${newProfessional.id}`)
      }

      showToast({
        type: 'success',
        title: 'Éxito',
        message: id ? 'Profesional actualizado' : 'Profesional creado'
      })
    } catch (error) {
      console.error('Error saving professional:', error)
      showToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudo guardar el profesional'
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/app/professionals')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {id ? 'Editar Profesional' : 'Nuevo Profesional'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                {id ? 'Modifica los datos del profesional' : 'Crea un nuevo profesional'}
              </p>
            </div>
          </div>
          <User2 className="h-8 w-8 text-gray-400 hidden sm:block" />
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Columna Principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Datos del Profesional */}
            <div className="space-y-6">
              {/* Tabs */}
              <div className="border-b border-gray-200 -mx-4 px-4 sm:mx-0 sm:px-0">
                <nav className="-mb-px flex space-x-4 md:space-x-8 overflow-x-auto whitespace-nowrap no-scrollbar" aria-label="Tabs">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex-none whitespace-nowrap py-3 px-2 md:py-4 md:px-1 border-b-2 font-medium text-sm flex items-center space-x-2
                        ${activeTab === tab.id
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                      `}
                    >
                      <tab.icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="bg-white shadow rounded-lg p-4 sm:p-6">
                {(id && !professional) ? (
                  null
                ) : (
                  <>
                    {activeTab === 'datos' && (
                      <ProfessionalForm
                        professional={professional}
                        onSubmit={handleSubmit}
                        onCancel={() => navigate('/app/professionals')}
                        isSubmitting={saving}
                      />
                    )}

                    {id && activeTab === 'servicios' && (
                      <ProfessionalServicesForm
                        professional={professional as Professional}
                      />
                    )}

                    {id && activeTab === 'horarios' && (
                      <ProfessionalSchedule
                        professional={professional as Professional}
                      />
                    )}

                    {id && activeTab === 'bloqueos' && (
                      <ProfessionalBlocks
                        professional={professional as Professional}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Columna Lateral */}
          {professional && (
            <div className="space-y-6">
              {/* Información Básica */}
              <div className="bg-white shadow rounded-lg p-4 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Profesional</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Nombre</h4>
                    <p className="mt-1 text-sm text-gray-900">{professional.name}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Email</h4>
                    <p className="mt-1 text-sm text-gray-900">{professional.email}</p>
                  </div>
                  {professional.phone && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Teléfono</h4>
                      <p className="mt-1 text-sm text-gray-900">{professional.phone}</p>
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Especialidades</h4>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {professional.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Tarifa por Hora</h4>
                    <p className="mt-1 text-sm text-gray-900">
                      ${professional.hourly_rate.toLocaleString('es-CL')}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Estado</h4>
                    <span
                      className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        professional.available
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {professional.available ? 'Disponible' : 'No Disponible'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
