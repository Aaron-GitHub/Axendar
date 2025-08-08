import { supabase } from '../lib/supabase'
import { sendBookingConfirmationEmail } from './bookingEmailService'
import { Reservation } from '../types/reservation.types'

export interface CreateBookingData {
  service_id: string
  professional_id: string
  client_name: string
  client_email: string
  client_phone: string | null
  notes: string | null
  date: Date
  time: string
  status: 'pending' | 'confirmed' | 'cancelled'
  user_id: string // ID del usuario dueño del servicio
}

export const createBooking = async (data: CreateBookingData) => {
  // Validar que el servicio pertenezca al usuario correcto
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('id')
    .eq('id', data.service_id)
    .eq('user_id', data.user_id)
    .single()

  if (serviceError) throw serviceError
  if (!service) throw new Error('Service not found')

  // Validar que el profesional pertenezca al usuario y esté asignado al servicio
  const { data: professional, error: professionalError } = await supabase
    .from('professionals')
    .select('id, professional_services!inner(*)')
    .eq('id', data.professional_id)
    .eq('user_id', data.user_id)
    .eq('professional_services.service_id', data.service_id)
    .single()

  if (professionalError) throw professionalError
  if (!professional) throw new Error('Professional not found or not assigned to service')
  try {
    // Buscar cliente por email globalmente
    const { data: existingClient, error: clientSearchError } = await supabase
      .from('clients')
      .select('id, name, email, phone')
      .eq('email', data.client_email)
      .maybeSingle() // Usar maybeSingle en lugar de single para evitar error si no existe

    if (clientSearchError) {
      throw clientSearchError
    }

    let clientId: string

    if (!existingClient) {
      // Crear nuevo cliente global (sin user_id)
      const { data: newClient, error: createClientError } = await supabase
        .from('clients')
        .insert({
          name: data.client_name,
          email: data.client_email,
          phone: data.client_phone
        })
        .select('id')
        .single()

      if (createClientError) throw createClientError
      if (!newClient) throw new Error('Error creating client')
      
      clientId = newClient.id
    } else {
      // Actualizar información del cliente si es necesario
      if (existingClient.name !== data.client_name || existingClient.phone !== data.client_phone) {
        const { error: updateError } = await supabase
          .from('clients')
          .update({
            name: data.client_name,
            phone: data.client_phone
          })
          .eq('id', existingClient.id)

        if (updateError) throw updateError
      }
      
      clientId = existingClient.id
    }

    // Obtener la duración y precio del servicio
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('duration, price')
      .eq('id', data.service_id)
      .single()

    if (serviceError) throw serviceError
    if (!service) throw new Error('Service not found')

    // Crear la reserva
    const startTime = new Date(data.date)
    const [hours, minutes] = data.time.split(':')
    startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)

    // Calcular end_time sumando la duración del servicio
    const endTime = new Date(startTime.getTime() + service.duration * 60000) // duración en minutos * 60000 ms

    const { data: newReservation, error: createReservationError } = await supabase
      .from('reservations')
      .insert({
        client_id: clientId,
        professional_id: data.professional_id,
        service_id: data.service_id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: data.status,
        notes: data.notes,
        total_amount: service.price,
        user_id: data.user_id, // Agregar el user_id a la reserva
      })
      .select('id')
      .single()

    if (createReservationError) throw createReservationError
    if (!newReservation) throw new Error('Error creating reservation')

    // Obtener los datos completos del servicio y profesional para el correo
    const { data: serviceData, error: serviceDataError } = await supabase
      .from('services')
      .select('*')
      .eq('id', data.service_id)
      .single()

    if (serviceDataError) throw serviceDataError
    if (!serviceData) throw new Error('Service not found')

    const { data: professionalData, error: professionalDataError } = await supabase
      .from('professionals')
      .select('*')
      .eq('id', data.professional_id)
      .single()

    if (professionalDataError) throw professionalDataError
    if (!professionalData) throw new Error('Professional not found')

    // Enviar correo de confirmación
    const reservation: Reservation = {
      id: newReservation.id,
      client_id: clientId,
      professional_id: data.professional_id,
      service_id: data.service_id,
      start_time: startTime,
      end_time: endTime,
      status: data.status,
      notes: data.notes,
      total_amount: service.price,
      user_id: data.user_id,
      client_name: data.client_name,
      client_email: data.client_email,
      date: startTime
    }

    await sendBookingConfirmationEmail(reservation, serviceData, professionalData)

    return {
      success: true,
      data: newReservation,
    }
  } catch (error) {
    console.error('Error creating booking:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

export const getAvailableTimeSlots = async (
  professionalId: string,
  date: Date,
  serviceId: string,
  userId: string
) => {
  try {
    // Obtener el servicio para saber su duración
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('duration')
      .eq('id', serviceId)
      .eq('user_id', userId)
      .single()

    if (serviceError) throw serviceError
    if (!service) throw new Error('Service not found')

    // Validar que el profesional pertenezca al usuario y esté asignado al servicio
    // Obtener el perfil del usuario para el min_booking_hours
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('min_booking_hours')
      .eq('id', userId)
      .single()

    if (profileError) throw profileError

    const { data: professional, error: professionalError } = await supabase
      .from('professionals')
      .select('id, professional_services!inner(*)')
      .eq('id', professionalId)
      .eq('user_id', userId)
      .eq('professional_services.service_id', serviceId)
      .single()

    if (professionalError) throw professionalError
    if (!professional) throw new Error('Professional not found or not assigned to service')

    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    // Obtener los horarios laborales para el día de la semana
    const dayOfWeek = date.getDay()
    const { data: schedules, error: schedulesError } = await supabase
      .from('professional_schedules')
      .select('*')
      .eq('professional_id', professionalId)
      .eq('day_of_week', dayOfWeek)
      .eq('is_working', true)
      .order('start_time')

    if (schedulesError) throw schedulesError
    if (!schedules || schedules.length === 0) {
      return {
        success: true,
        data: [], // No hay horarios laborales para este día
      }
    }

    // Obtener los bloqueos para este día
    const { data: blocks, error: blocksError } = await supabase
      .from('professional_blocks')
      .select('*')
      .eq('professional_id', professionalId)
      .lte('start_date', endOfDay.toISOString())
      .gte('end_date', startOfDay.toISOString())

    if (blocksError) throw blocksError

    // Obtener las reservas existentes
    const { data: existingReservations, error: reservationsError } = await supabase
      .from('reservations')
      .select('start_time, end_time')
      .eq('professional_id', professionalId)
      .gte('start_time', startOfDay.toISOString())
      .lte('start_time', endOfDay.toISOString())
      .neq('status', 'cancelled')

    if (reservationsError) throw reservationsError

    const slots: string[] = []
    const slotDuration = service.duration

    try {
      // Para cada horario laboral del día
      for (const schedule of schedules) {
        const [startHour, startMinute] = schedule.start_time.split(':').map(Number)
        const [endHour, endMinute] = schedule.end_time.split(':').map(Number)

        // Convertir horarios a minutos totales para facilitar el cálculo
        const startTimeInMinutes = startHour * 60 + startMinute
        const endTimeInMinutes = endHour * 60 + endMinute

        // Generar slots dentro del horario laboral
        for (
          let currentMinute = startTimeInMinutes;
          currentMinute <= endTimeInMinutes - slotDuration;
          currentMinute += slotDuration
        ) {
          const hour = Math.floor(currentMinute / 60)
          const minute = currentMinute % 60
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
          const slotDate = new Date(date)
          slotDate.setHours(hour, minute, 0, 0)
          const slotEnd = new Date(slotDate.getTime() + service.duration * 60000)
            
          // Validar el tiempo mínimo de antelación según el perfil
          const now = new Date()
          const minBookingTime = profile?.min_booking_hours || 0
          
          // Calcular la fecha mínima requerida desde ahora
          const minTimeRequired = new Date()
          minTimeRequired.setTime(now.getTime() + (minBookingTime * 60 * 60 * 1000))
          
          // Resetear los segundos y milisegundos para una comparación más precisa
          minTimeRequired.setSeconds(0, 0)
          
          // Si el slot es anterior al tiempo mínimo requerido, saltarlo
          if (date.getTime() === now.setHours(0,0,0,0) && slotDate.getTime() < minTimeRequired.getTime()) {
            continue
          }

          // Verificar si el slot está dentro de algún bloqueo
          const isBlocked = blocks?.some(block => {
            const blockStart = new Date(block.start_date)
            const blockEnd = new Date(block.end_date)
            return (
              (slotDate >= blockStart && slotDate < blockEnd) ||
              (slotEnd > blockStart && slotEnd <= blockEnd)
            )
          })

          if (isBlocked) continue

          // Verificar si el slot está disponible (no hay reservas)
          const isAvailable = !existingReservations?.some(reservation => {
            const reservationStart = new Date(reservation.start_time)
            const reservationEnd = new Date(reservation.end_time)
            return (
              (slotDate >= reservationStart && slotDate < reservationEnd) ||
              (slotEnd > reservationStart && slotEnd <= reservationEnd)
            )
          })

          if (isAvailable) {
            slots.push(timeString)
          }
        }
      }

      return {
        success: true,
        data: slots.sort(),
      }
    } catch (error) {
      console.error('Error generating time slots:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al generar horarios disponibles'
      }
    }
  } catch (error) {
    console.error('Error getting available time slots:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
