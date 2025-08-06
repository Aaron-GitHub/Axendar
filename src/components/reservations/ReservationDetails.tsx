import React from 'react'
import { Reservation } from '../../types'
import { getStatusBadgeColor, getStatusLabel } from '../../utils/statusUtils'
import moment from 'moment'
import Button from '../ui/Button'
import { Edit } from 'lucide-react'

interface ReservationDetailsProps {
  reservation: Reservation
  onEdit?: () => void
  onClose?: () => void
}

const ReservationDetails: React.FC<ReservationDetailsProps> = ({
  reservation,
  onEdit,
  onClose
}) => {
  const statusColor = getStatusBadgeColor(reservation.status)
  const statusLabel = getStatusLabel(reservation.status)

  return (
    <div className="space-y-6">
      {/* Encabezado con estado y acciones */}
      <div className="flex justify-between items-start">
        <div>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}
          >
            {statusLabel}
          </span>
        </div>
        {onEdit && (
          <Button
            onClick={onEdit}
            variant="outline"
            className="inline-flex items-center"
          >
            <Edit className="-ml-1 mr-2 h-5 w-5" />
            Editar
          </Button>
        )}
      </div>

      {/* Información del cliente */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Cliente</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Nombre</p>
              <p className="mt-1 text-sm text-gray-900">{reservation.clients?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="mt-1 text-sm text-gray-900">{reservation.clients?.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Teléfono</p>
              <p className="mt-1 text-sm text-gray-900">{reservation.clients?.phone || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detalles de la reserva */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Detalles de la Reserva</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Servicio</p>
              <p className="mt-1 text-sm text-gray-900">{reservation.services?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Profesional</p>
              <p className="mt-1 text-sm text-gray-900">{reservation.professionals?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Fecha y Hora</p>
              <p className="mt-1 text-sm text-gray-900">
                {moment(reservation.start_time).format('DD/MM/YYYY HH:mm')} - 
                {moment(reservation.end_time).format('HH:mm')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Duración</p>
              <p className="mt-1 text-sm text-gray-900">
                {moment(reservation.end_time).diff(moment(reservation.start_time), 'minutes')} minutos
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notas */}
      {reservation.notes && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notas</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-900 whitespace-pre-wrap">{reservation.notes}</p>
          </div>
        </div>
      )}

      {/* Botón de cerrar */}
      {onClose && (
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} variant="outline">
            Cerrar
          </Button>
        </div>
      )}
    </div>
  )
}

export default ReservationDetails
