import React, { useState, useRef, useEffect } from 'react'
import { MoreVertical, Eye, Edit, XCircle, Send } from 'lucide-react'
import { Reservation } from '../../types'
import { ReservationStatus } from '../../utils/statusUtils'
import { toast } from 'react-hot-toast'

interface ReservationActionsProps {
  reservation: Reservation
  onViewDetails: (reservation: Reservation) => void
  onEdit: (reservation: Reservation) => void
  onStatusChange: (status: ReservationStatus) => void
}

const ReservationActions: React.FC<ReservationActionsProps> = ({
  reservation,
  onViewDetails,
  onEdit,
  onStatusChange
}) => {
  const [showMenu, setShowMenu] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (showMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const menuHeight = 200 // altura aproximada del menú
      const menuWidth = 192 // w-48 = 12rem = 192px
      
      // Determinar si el menú debe abrirse hacia arriba
      const shouldOpenUpward = rect.bottom + menuHeight > windowHeight
      
      // Calcular posición horizontal para evitar que se salga de la pantalla
      let left = rect.right - menuWidth
      if (left < 0) left = 0
      if (left + menuWidth > window.innerWidth) left = window.innerWidth - menuWidth
      
      setMenuPosition({
        top: shouldOpenUpward ? rect.top - menuHeight + window.scrollY : rect.bottom + window.scrollY,
        left
      })
    }
  }, [showMenu])

  const handleSendReminder = async () => {
    toast.success('Recordatorio enviado al cliente')
    setShowMenu(false)
  }

  return (
    <div className="inline-block">
      <button
        ref={buttonRef}
        onClick={() => setShowMenu(!showMenu)}
        className="p-3 sm:p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors touch-manipulation"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0"
            onClick={() => setShowMenu(false)}
            style={{ backgroundColor: 'transparent' }}
          ></div>
          <div 
            className="fixed w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5" 
            style={{ 
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
              zIndex: 9999,
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>

            <div className="py-1" role="menu">
              <button
                onClick={() => {
                  onViewDetails(reservation)
                  setShowMenu(false)
                }}
                className="group flex items-center w-full px-4 py-3 sm:py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 touch-manipulation"
              >
                <Eye className="mr-3 h-4 w-4" />
                Ver detalles
              </button>

              <button
                onClick={() => {
                  onEdit(reservation)
                  setShowMenu(false)
                }}
                className="group flex items-center w-full px-4 py-3 sm:py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 touch-manipulation"
              >
                <Edit className="mr-3 h-4 w-4" />
                Editar
              </button>

              {reservation.status !== 'cancelled' && (
                <button
                  onClick={() => {
                    onStatusChange('cancelled')
                    setShowMenu(false)
                  }}
                  className="group flex items-center w-full px-4 py-3 sm:py-2 text-sm text-red-600 hover:bg-red-50 touch-manipulation"
                >
                  <XCircle className="mr-3 h-4 w-4" />
                  Cancelar
                </button>
              )}

              {['confirmed', 'pending'].includes(reservation.status) && (
                <button
                  onClick={handleSendReminder}
                  className="group flex items-center w-full px-4 py-3 sm:py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 touch-manipulation"
                >
                  <Send className="mr-3 h-4 w-4" />
                  Enviar recordatorio
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ReservationActions
