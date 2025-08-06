// src/services/bookingEmailService.ts
import { Service, Professional, Reservation } from '../types/reservation.types'
import { sendEmail } from './emailService'
import { supabase } from '../lib/supabase'

export const sendBookingConfirmationEmail = async (
  reservation: Reservation,
  service: Service,
  professional: Professional
) => {
  // Obtener información de la empresa
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_name, address, phone, website, logo_url')
    .eq('id', professional.user_id)
    .single()
  const formattedDate = new Date(reservation.date).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const formattedTime = new Date(reservation.date).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })

  const reservationDetails = `
    <div style="margin: 25px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef;">
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e9ecef; min-height: 36px;">
        <span style="color:#3a3a3a; font-weight: 800; font-size: 15px; flex: 0 0 120px;">Servicio:</span>
        <span style="color: #2c3e50; font-weight: 500; font-size: 15px; text-align: right; flex: 1; margin-left: 20px;">${service.name}</span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e9ecef; min-height: 36px;">
        <span style="color:#3a3a3a; font-weight: 800; font-size: 15px; flex: 0 0 120px;">Profesional:</span>
        <span style="color: #2c3e50; font-weight: 500; font-size: 15px; text-align: right; flex: 1; margin-left: 20px;">${professional.name}</span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e9ecef; min-height: 36px;">
        <span style="color:#3a3a3a; font-weight: 800; font-size: 15px; flex: 0 0 120px;">Fecha:</span>
        <span style="color: #2c3e50; font-weight: 500; font-size: 15px; text-align: right; flex: 1; margin-left: 20px;">${formattedDate}</span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e9ecef; min-height: 36px;">
        <span style="color:#3a3a3a; font-weight: 800; font-size: 15px; flex: 0 0 120px;">Hora:</span>
        <span style="color: #2c3e50; font-weight: 500; font-size: 15px; text-align: right; flex: 1; margin-left: 20px;">${formattedTime}</span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e9ecef; min-height: 36px;">
        <span style="color:#3a3a3a; font-weight: 800; font-size: 15px; flex: 0 0 120px;">Duración:</span>
        <span style="color: #2c3e50; font-weight: 500; font-size: 15px; text-align: right; flex: 1; margin-left: 20px;">${service.duration} minutos</span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; min-height: 36px;">
        <span style="color:#3a3a3a; font-weight: 800; font-size: 15px; flex: 0 0 120px;">Precio:</span>  
        <span style="color: #2c3e50; font-weight: 500; font-size: 15px; text-align: right; flex: 1; margin-left: 20px;">$${service.price}</span>
      </div>
    </div>
  `

  const companyInfo = `
    <div style="margin: 25px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef;">
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e9ecef; min-height: 36px;">
        <span style="color:#3a3a3a; font-weight: 800; font-size: 15px; flex: 0 0 120px;">Empresa:</span>
        <span style="color: #2c3e50; font-weight: 500; font-size: 15px; text-align: right; flex: 1; margin-left: 20px;">${profile?.company_name || 'No especificada'}</span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e9ecef; min-height: 36px;">
        <span style="color:#3a3a3a; font-weight: 800; font-size: 15px; flex: 0 0 120px;">Dirección:</span>
        <span style="color: #2c3e50; font-weight: 500; font-size: 15px; text-align: right; flex: 1; margin-left: 20px;">${profile?.address || 'No especificada'}</span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e9ecef; min-height: 36px;">
        <span style="color:#3a3a3a; font-weight: 800; font-size: 15px; flex: 0 0 120px;">Teléfono:</span>
        <span style="color: #2c3e50; font-weight: 500; font-size: 15px; text-align: right; flex: 1; margin-left: 20px;">${profile?.phone || 'No especificado'}</span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; min-height: 36px;">
        <span style="color:#3a3a3a; font-weight: 800; font-size: 15px; flex: 0 0 120px;">Sitio web:</span>
        <span style="color: #2c3e50; font-weight: 500; font-size: 15px; text-align: right; flex: 1; margin-left: 20px;">${profile?.website || 'No especificado'}</span>
      </div>
    </div>
  `

  return sendEmail(
    reservation.client_email,
    `Confirmación de tu Reserva en ${profile?.company_name || 'Axendar'}`,
    {
      title: '¡Tu reserva ha sido confirmada!',
      name: reservation.client_name,
      message: `Gracias por reservar con ${profile?.company_name || 'nosotros'}. A continuación encontrarás los detalles de tu cita:`,
      actionUrl: `${window.location.origin}/reservas/${reservation.id}`,
      actionText: 'Ver Detalles de la Reserva',
      sections: [
        {
          title: 'Detalles de la Reserva',
          content: `<div class="reservation-details">${reservationDetails}</div>`
        },
        {
          title: 'Información del Prestador',
          content: `<div class="company-info">${companyInfo}</div>`
        }
      ]
    }
  )
}

export const sendBookingReminderEmail = async (
  reservation: Reservation,
  service: Service,
  professional: Professional
) => {
  const formattedDate = new Date(reservation.date).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const formattedTime = new Date(reservation.date).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })

  const reminderDetails = `
    <div class="detail-row">
      <span class="detail-label">Servicio:</span>
      <span class="detail-value">${service.name}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Profesional:</span>
      <span class="detail-value">${professional.name}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Fecha:</span>
      <span class="detail-value">${formattedDate}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Hora:</span>
      <span class="detail-value">${formattedTime}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Duración:</span>
      <span class="detail-value">${service.duration} minutos</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Ubicación:</span>
      <span class="detail-value">${professional.location || 'Por confirmar'}</span>
    </div>
  `

  return sendEmail(
    reservation.client_email,
    'Recordatorio de tu Cita en Axendar',
    {
      title: 'Recordatorio de tu Cita',
      name: reservation.client_name,
      message: 'Te recordamos que tienes una cita programada para mañana. Por favor llega 5-10 minutos antes.',
      actionUrl: `${window.location.origin}/reservas/${reservation.id}`,
      actionText: 'Ver Detalles de la Cita',
      sections: [
        {
          title: 'Detalles de la Cita',
          content: `<div class="reminder-details">${reminderDetails}</div>`
        }
      ]
    }
  )
}

export const sendBookingCancellationEmail = async (
  reservation: Reservation,
  service: Service,
  professional: Professional
) => {
  const formattedDate = new Date(reservation.date).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const formattedTime = new Date(reservation.date).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })

  const cancellationDetails = `
    <div class="detail-row">
      <span class="detail-label">Servicio:</span>
      <span class="detail-value">${service.name}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Profesional:</span>
      <span class="detail-value">${professional.name}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Fecha:</span>
      <span class="detail-value">${formattedDate}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Hora:</span>
      <span class="detail-value">${formattedTime}</span>
    </div>
  `

  return sendEmail(
    reservation.client_email,
    'Cancelación de Reserva en Axendar',
    {
      title: 'Tu reserva ha sido cancelada',
      name: reservation.client_name,
      message: 'Tu reserva ha sido cancelada exitosamente. Si deseas reagendar, puedes hacerlo desde nuestra plataforma.',
      actionUrl: `${window.location.origin}/reservar`,
      actionText: 'Hacer Nueva Reserva',
      sections: [
        {
          title: 'Detalles de la Reserva Cancelada',
          content: `<div class="cancellation-details">${cancellationDetails}</div>`
        }
      ]
    }
  )
}
