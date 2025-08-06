export type ReservationStatus = 'completed' | 'confirmed' | 'cancelled' | 'pending'

export const getStatusColor = (status: ReservationStatus): string => {
  switch (status) {
    case 'completed':
      return '#22c55e' // verde
    case 'confirmed':
      return '#3b82f6' // azul
    case 'cancelled':
      return '#ef4444' // rojo
    case 'pending':
      return '#f59e0b' // amarillo
    default:
      return '#6b7280' // gris
  }
}

export const getStatusLabel = (status: ReservationStatus): string => {
  switch (status) {
    case 'completed':
      return 'Completada'
    case 'confirmed':
      return 'Confirmada'
    case 'cancelled':
      return 'Cancelada'
    case 'pending':
      return 'Pendiente'
    default:
      return 'Desconocido'
  }
}

export const getStatusBadgeColor = (status: ReservationStatus): string => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'confirmed':
      return 'bg-blue-100 text-blue-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
