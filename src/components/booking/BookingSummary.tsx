import React from 'react'
import { Service, Professional } from '../../types'
import { Clock, DollarSign, Calendar, User, Mail, Phone, MessageSquare } from 'lucide-react'

interface BookingSummaryProps {
  service: Service
  professional: Professional
  date: Date
  time: string
  clientData: {
    name: string
    email: string
    phone: string | null
    notes: string | null
  }
  onConfirm: () => Promise<void>
  isSubmitting: boolean
}

const BookingSummary: React.FC<BookingSummaryProps> = ({
  service,
  professional,
  date,
  time,
  clientData,
  onConfirm,
  isSubmitting
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
          Resumen de tu reserva
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          Por favor revisa los detalles antes de confirmar
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Servicio */}
        <div className="p-3 sm:p-6 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Detalles del Servicio</h3>
          <div className="space-y-3">
            <div className="flex items-center text-gray-700">
              <div className="w-28 sm:w-40 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-gray-400" />
                <span className="text-xs sm:text-sm">Servicio:</span>
              </div>
              <span className="font-medium">{service.name}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <div className="w-28 sm:w-40 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-gray-400" />
                <span className="text-xs sm:text-sm">Duración:</span>
              </div>
              <span>{service.duration} minutos</span>
            </div>
            <div className="flex items-center text-gray-700">
              <div className="w-28 sm:w-40 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-gray-400" />
                <span className="text-xs sm:text-sm">Precio:</span>
              </div>
              <span>${service.price.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Fecha y Hora */}
        <div className="p-3 sm:p-6 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Fecha y Hora</h3>
          <div className="space-y-3">
            <div className="flex items-center text-gray-700">
              <div className="w-28 sm:w-40 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                <span className="text-xs sm:text-sm">Fecha:</span>
              </div>
              <span>
                {date.toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="flex items-center text-gray-700">
              <div className="w-28 sm:w-40 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-gray-400" />
                <span className="text-xs sm:text-sm">Hora:</span>
              </div>
              <span>{time}</span>
            </div>
          </div>
        </div>

        {/* Profesional */}
        <div className="p-3 sm:p-6 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Profesional</h3>
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
            <div>
              <p className="font-medium text-gray-900">{professional.name}</p>
              {professional.specialties && (
                <p className="text-sm text-gray-500">{professional.specialties}</p>
              )}
            </div>
          </div>
        </div>

        {/* Datos del Cliente */}
        <div className="p-3 sm:p-6">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Tus Datos</h3>
          <div className="space-y-3">
            <div className="flex items-center text-gray-700">
              <div className="w-28 sm:w-40 flex items-center">
                <User className="h-5 w-5 mr-2 text-gray-400" />
                <span className="text-xs sm:text-sm">Nombre:</span>
              </div>
              <span>{clientData.name}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <div className="w-28 sm:w-40 flex items-center">
                <Mail className="h-5 w-5 mr-2 text-gray-400" />
                <span className="text-xs sm:text-sm">Email:</span>
              </div>
              <span>{clientData.email}</span>
            </div>
            {clientData.phone && (
              <div className="flex items-center text-gray-700">
                <div className="w-28 sm:w-40 flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="text-xs sm:text-sm">Teléfono:</span>
                </div>
                <span>{clientData.phone}</span>
              </div>
            )}
            {clientData.notes && (
              <div className="flex items-start text-gray-700">
                <div className="w-28 sm:w-40 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="text-xs sm:text-sm">Notas:</span>
                </div>
                <span className="flex-1">{clientData.notes}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-primary-800">
            Al confirmar la reserva, recibirás un email con los detalles y las instrucciones para el día de tu cita.
          </p>
        </div>

        <button
          onClick={onConfirm}
          disabled={isSubmitting}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Confirmando...
            </>
          ) : (
            'Confirmar Reserva'
          )}
        </button>
      </div>
    </div>
  )
}

export default BookingSummary
