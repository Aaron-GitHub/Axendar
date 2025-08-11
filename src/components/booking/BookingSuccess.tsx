import React from 'react'
import { CheckCircle } from 'lucide-react'
import Button from '../ui/Button'
import { hexToRgba } from '../../utils/color'

interface BookingSuccessProps {
  onNewBooking: () => void
  profile_color: string
}

const BookingSuccess: React.FC<BookingSuccessProps> = ({ onNewBooking, profile_color }) => {
  return (
    <div className="text-center space-y-6">
      <div className="flex flex-col items-center">
        <CheckCircle className="w-16 h-16 mb-4" style={{ color: profile_color }} />
        <h2 className="text-2xl font-semibold text-gray-900">
          ¡Reserva Confirmada!
        </h2>
        <p className="mt-2 text-gray-600">
          Hemos enviado un correo electrónico con los detalles de tu reserva.
        </p>
      </div>

      <div className="rounded-lg p-4 text-sm" style={{ backgroundColor: hexToRgba(profile_color, 0.1), border: `1px solid ${profile_color}`, color: profile_color }}>
        <p>
          Por favor revisa tu bandeja de entrada para ver los detalles completos.
          Si no encuentras el correo, revisa tu carpeta de spam.
        </p>
      </div>

      <div className="pt-6">
        <Button
          onClick={onNewBooking}
          className="w-full justify-center"
          style={{ backgroundColor: profile_color, borderColor: profile_color }}
        >
          Agendar Nuevo Servicio
        </Button>
      </div>
    </div>
  )
}

export default BookingSuccess
