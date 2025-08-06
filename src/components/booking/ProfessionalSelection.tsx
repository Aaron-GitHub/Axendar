import React, { useEffect, useState } from 'react'
import { Professional, Service } from '../../types'
import { supabase } from '../../lib/supabase'
import { Mail, Phone } from 'lucide-react'

interface ProfessionalSelectionProps {
  selectedService: Service
  selectedProfessional: Professional | null
  onSelect: (professional: Professional) => void
  userId: string
}

const ProfessionalSelection: React.FC<ProfessionalSelectionProps> = ({
  selectedService,
  selectedProfessional,
  onSelect,
  userId
}) => {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        // Obtener profesionales públicos asociados al servicio y al usuario
        const { data, error } = await supabase
          .from('professionals')
          .select('*, professional_services!inner(*)')
          .eq('user_id', userId)
          .eq('professional_services.service_id', selectedService.id)
          .order('name')

        if (error) throw error
        setProfessionals(data || [])
      } catch (error) {
        console.error('Error fetching professionals:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfessionals()
  }, [selectedService.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (professionals.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No hay profesionales disponibles en este momento.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Selecciona el profesional
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Para el servicio: <span className="font-medium">{selectedService.name}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {professionals.map((professional) => (
          <div
            key={professional.id}
            onClick={() => onSelect(professional)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all
              ${selectedProfessional?.id === professional.id
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 hover:border-primary-200 hover:bg-gray-50'
              }`}
          >
            <div className="flex items-start space-x-4">
              {professional.avatar_url ? (
                <img
                  src={professional.avatar_url}
                  alt={professional.name}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 font-medium text-lg">
                    {professional.name.charAt(0)}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{professional.name}</h3>
                {professional.specialties && professional.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {professional.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-2 space-y-1">
                  {professional.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>{professional.email}</span>
                    </div>
                  )}
                  {professional.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{professional.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProfessionalSelection
