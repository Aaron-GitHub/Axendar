import React, { useEffect, useState } from 'react'
import { Service } from '../../types'
import { supabaseAdmin } from '../../lib/supabase'
import { Clock, DollarSign } from 'lucide-react'

interface ServiceSelectionProps {
  selectedService: Service | null
  onSelect: (service: Service) => void
  userId: string
}

const ServiceSelection: React.FC<ServiceSelectionProps> = ({
  selectedService,
  onSelect,
  userId
}) => {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        // Obtener servicios públicos del usuario
        const { data, error } = await supabaseAdmin
          .from('services')
          .select('*')
          .eq('user_id', userId)
          .eq('active', true)
          .order('name')

        if (error) throw error
        setServices(data || [])
      } catch (error) {
        console.error('Error fetching services:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No hay servicios disponibles en este momento.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">
        Selecciona el servicio que deseas reservar
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => (
          <div
            key={service.id}
            onClick={() => onSelect(service)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all
              ${selectedService?.id === service.id
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 hover:border-primary-200 hover:bg-gray-50'
              }`}
          >
            <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
            <div className="mt-2 space-y-2">
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                <span>{service.duration} minutos</span>
              </div>
              <div className="flex items-center text-gray-600">
                <DollarSign className="h-4 w-4 mr-2" />
                <span>${service.price.toLocaleString()}</span>
              </div>
            </div>
            {service.description && (
              <p className="mt-2 text-sm text-gray-500">{service.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ServiceSelection
