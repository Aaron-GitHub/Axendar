import React, { useState, useEffect } from 'react'
import { Professional, Service } from '../../types'
import { supabase } from '../../lib/supabase'
import { useAuthContext } from '../../contexts/AuthContext'
import Button from '../ui/Button'
import toast from 'react-hot-toast'

interface ProfessionalServicesFormProps {
  professional: Professional
}

const ProfessionalServicesForm: React.FC<ProfessionalServicesFormProps> = ({
  professional,
}) => {
  const { user } = useAuthContext()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])

  // Cargar servicios y selecciones actuales
  useEffect(() => {
    const loadData = async () => {
      if (!user) return

      try {
        // Cargar todos los servicios del usuario
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('user_id', user.id)
          .order('name')

        if (servicesError) throw servicesError

        // Cargar servicios asignados al profesional
        const { data: assignedServices, error: assignedError } = await supabase
          .from('professional_services')
          .select('service_id')
          .eq('professional_id', professional.id)

        if (assignedError) throw assignedError

        setServices(servicesData || [])
        setSelectedServices(assignedServices?.map(as => as.service_id) || [])
      } catch (error) {
        console.error('Error loading services:', error)
        toast.error('Error al cargar los servicios')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user, professional.id])

  const handleToggleService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    try {
      // Eliminar todas las asignaciones existentes
      const { error: deleteError } = await supabase
        .from('professional_services')
        .delete()
        .eq('professional_id', professional.id)

      if (deleteError) throw deleteError

      // Crear nuevas asignaciones
      if (selectedServices.length > 0) {
        const { error: insertError } = await supabase
          .from('professional_services')
          .insert(
            selectedServices.map(serviceId => ({
              professional_id: professional.id,
              service_id: serviceId,
            }))
          )

        if (insertError) throw insertError
      }

      toast.success('Servicios actualizados exitosamente')
      toast.success('Servicios actualizados exitosamente')
    } catch (error) {
      console.error('Error saving services:', error)
      toast.error('Error al guardar los servicios')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {services.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No hay servicios disponibles.</p>
            <p className="text-sm text-gray-400 mt-2">
              Agrega servicios primero para poder asignarlos a los profesionales.
            </p>
          </div>
        ) : (
          services.map(service => (
            <div
              key={service.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all
                ${selectedServices.includes(service.id)
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-200 hover:bg-gray-50'
                }`}
              onClick={() => handleToggleService(service.id)}
            >
              <div className="flex items-start">
                <input
                  type="checkbox"
                  checked={selectedServices.includes(service.id)}
                  onChange={() => handleToggleService(service.id)}
                  className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
                  {service.description && (
                    <p className="mt-1 text-sm text-gray-500">{service.description}</p>
                  )}
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                    <span>{service.duration} minutos</span>
                    <span>${service.price}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-end pt-6">
        <Button
          type="button"
          onClick={handleSave}
          loading={saving}
          disabled={services.length === 0}
        >
          Guardar Cambios
        </Button>
      </div>
    </div>
  )
}

export default ProfessionalServicesForm
