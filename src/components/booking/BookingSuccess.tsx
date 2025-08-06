import React from 'react'
import { CheckCircle } from 'lucide-react'
import Button from '../ui/Button'

interface BookingSuccessProps {
  onNewBooking: () => void
}

const BookingSuccess: React.FC<BookingSuccessProps> = ({ onNewBooking }) => {
  return (
    <div className="text-center space-y-6">
      <div className="flex flex-col items-center">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900">
          ¡Reserva Confirmada!
        </h2>
        <p className="mt-2 text-gray-600">
          Hemos enviado un correo electrónico con los detalles de tu reserva.
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
        <p>
          Por favor revisa tu bandeja de entrada para ver los detalles completos.
          Si no encuentras el correo, revisa tu carpeta de spam.
        </p>
      </div>

      <div className="pt-6">
        <Button
          onClick={onNewBooking}
          className="w-full justify-center"
        >
          Agendar Nuevo Servicio
        </Button>
      </div>
    </div>
  )
}

export default BookingSuccess
