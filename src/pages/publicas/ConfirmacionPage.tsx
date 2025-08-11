import React from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'

const ConfirmacionPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-primary-600" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            ¡Gracias por tu reserva!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Te hemos enviado un email con los detalles de tu cita.
            Nos pondremos en contacto contigo pronto.
          </p>
          <div className="mt-6">
            <Link
              to="/reservar"
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              ← Realizar otra reserva
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmacionPage
