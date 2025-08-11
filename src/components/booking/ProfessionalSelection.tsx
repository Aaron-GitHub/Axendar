import React, { useEffect, useState } from 'react'
import { Professional, Service } from '../../types'
import { supabaseAdmin } from '../../lib/supabase'
import { Mail, Phone } from 'lucide-react'
import { hexToRgba } from '../../utils/color'

interface ProfessionalSelectionProps {
  selectedService: Service
  selectedProfessional: Professional | null
  onSelect: (professional: Professional) => void
  userId: string
  profile_color: string
}

const ProfessionalSelection: React.FC<ProfessionalSelectionProps> = ({
  selectedService,
  selectedProfessional,
  onSelect,
  userId,
  profile_color
}) => {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        // Obtener profesionales públicos asociados al servicio y al usuario
        const { data, error } = await supabaseAdmin
          .from('professionals')
          .select('*, professional_services!inner(*)')
          .eq('user_id', userId)
          .eq('available', true)
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
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md`}
            onMouseEnter={() => setHoveredId(professional.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={(() => {
              const isSelected = selectedProfessional?.id === professional.id
              const isHover = hoveredId === professional.id
              if (isSelected) {
                return { borderColor: profile_color, backgroundColor: hexToRgba(profile_color, 0.15) }
              }
              if (isHover) {
                return { borderColor: profile_color }
              }
              return { borderColor: '#e5e7eb' }
            })()}
          >
            <div className="flex items-start space-x-4">
              {professional.avatar_url ? (
                <img
                  src={professional.avatar_url}
                  alt={professional.name}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: hexToRgba(profile_color, 0.15), color: profile_color }}>
                  <span className="font-medium text-lg" style={{ color: profile_color }}>
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
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: hexToRgba(profile_color, 0.15), color: profile_color }}
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
