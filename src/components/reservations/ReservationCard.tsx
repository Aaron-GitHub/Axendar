import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  X,
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
  FileText,
} from 'lucide-react';
import { Reservation } from '../../types/reservation.types';
import { hexToRgba } from '../../utils/color';
import { getStatusBadgeColor, getStatusLabel, type ReservationStatus } from '../../utils/statusUtils';
import { formatDate } from '../../utils/esCalendar';

const getStatusIcon = (status: ReservationStatus) => {
  switch (status) {
    case 'confirmed':
      return CheckCircle;
    case 'cancelled':
      return XCircle;
    case 'completed':
      return CheckCircle;
    case 'pending':
    default:
      return AlertCircle;
  }
};

const ReservationCard: React.FC<{
  reservation: Reservation & { time?: string; location?: string; modificationDeadline?: string | Date };
  onConfirm: (id: string) => void;
  onModify: (id: string) => void;
  onCancel: (id: string) => void;
}> = ({ reservation, onConfirm, onModify, onCancel }) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const status = (reservation.status as ReservationStatus) || 'pending';
  const StatusIcon = getStatusIcon(status);
  const canModify = reservation.status === 'confirmed' || reservation.status === 'pending';
  const canCancel = reservation.status === 'confirmed' || reservation.status === 'pending';

  // Branding colors (fallbacks if not provided)
  const primary = (reservation as any)?.branding?.booking_primary_color || '#338B85';
  
  const formatDeadline = (dateString: string | Date) => {
    const deadline = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    if (diffMs <= 0) return 'Expirado';
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays > 0) return `${diffDays} días`;
    const remainingHours = diffHours;
    const remainingMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (remainingHours > 0) return `${remainingHours}h ${remainingMinutes}m`;
    return `${remainingMinutes} minutos`;
  };

  console.log(reservation)

  // Ocultar acciones si ya expiró el límite de modificación
  const modificationDeadline = (reservation as any)?.modificationDeadline || (reservation as any)?.start_time;
  const isWithinDeadline = modificationDeadline ? new Date(modificationDeadline).getTime() > Date.now() : true;

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
        {/* Header */}
        <div
          className="p-4 text-white"
          style={{
            background: hexToRgba(primary, 1),
          }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold mb-1">{reservation.services?.name}</h3>
              <p className="text-white/90 text-sm">#{reservation.id}</p>
            </div>
            <div className={`px-3 py-1 rounded-full ${getStatusBadgeColor(status)} flex items-center space-x-1`}>
              <StatusIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{getStatusLabel(status)}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Main Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: hexToRgba(primary, 0.2) }}>
                  <Calendar className="w-4 h-4" style={{ color: primary }} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fecha</p>
                  <p className="font-semibold text-gray-700 capitalize">{formatDate(reservation.start_time)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: hexToRgba(primary, 0.2) }}>
                  <Clock className="w-4 h-4" style={{ color: primary }} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hora</p>
                  <p className="font-semibold text-gray-700">{reservation.time}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: hexToRgba(primary, 0.2) }}>
                  <MapPin className="w-4 h-4" style={{ color: primary }} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ubicación</p>
                  <p className="font-semibold text-gray-700">{reservation.location || '—'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: hexToRgba(primary, 0.2) }}>
                  <User className="w-4 h-4" style={{ color: primary }} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Profesional</p>
                  <p className="font-semibold text-gray-700">{reservation.professionals?.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: hexToRgba(primary, 0.2) }}>
                  <CreditCard className="w-4 h-4" style={{ color: primary }} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="font-semibold text-gray-700 text-lg">${reservation.services?.price?.toLocaleString('es-CL')}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: hexToRgba(primary, 0.2) }}>
                <FileText className="w-4 h-4" style={{ color: primary }} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Detalle Servicio</p>
                <p className="font-semibold text-gray-700">{reservation.services?.description}</p>
              </div>
            </div>

          {/* Price Breakdown */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
              <FileText className="w-4 h-4 mr-2" style={{ color: primary }} />
              Desglose de Costos
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Precio base</span>
                <span className="font-medium">${reservation.services?.price?.toLocaleString('es-CL')}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold text-gray-700">
                <span>Total</span>
                <span>${reservation.services?.price?.toLocaleString('es-CL')}</span>
              </div>
            </div>
          </div>

          {/* Modification Deadline */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-orange-800">
              <strong>Límite para modificaciones:</strong> {formatDeadline(reservation.modificationDeadline || reservation.start_time)}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
            {reservation.status === 'pending' && isWithinDeadline && (
              <button
                onClick={() => onConfirm(reservation.id)}
                className="flex items-center justify-center space-x-2 border-2 border-primary-600 text-primary-600 px-4 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
              >
                <CheckCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Confirmar</span>
              </button>
            )}

            {/*canModify && (
              <button
                onClick={() => onModify(reservation.id)}
                className="flex items-center justify-center space-x-2 border-2 border-yellow-500 text-yellow-500 px-4 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
              >
                <Edit3 className="w-4 h-4" />
                <span className="hidden sm:inline">Modificar</span>
              </button>
            )*/}
             {canCancel && isWithinDeadline && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="flex items-center justify-center space-x-2 border-2 text-red-500 px-4 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                style={{ borderColor: '#ef4444' }}
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Cancelar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">¿Cancelar Reserva?</h3>
              <p className="text-gray-600">Esta acción no se puede deshacer. ¿Estás seguro de que quieres cancelar tu reserva?</p>
            </div>
            <div className="flex space-x-3">
              <button onClick={() => setShowCancelModal(false)} className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">No, mantener</button>
              <button onClick={() => { onCancel(reservation.id); setShowCancelModal(false); }} className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors">Sí, cancelar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReservationCard;
