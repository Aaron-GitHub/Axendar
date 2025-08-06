import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { supabase } from '../../lib/supabase'
import { useAuthContext } from '../../contexts/AuthContext'
import { Reservation, Client, Professional, Service } from '../../types'
import Button from '../ui/Button'
import toast from 'react-hot-toast'

const schema = yup.object().shape({
  client_id: yup.string().required('Cliente es requerido'),
  professional_id: yup.string().required('Profesional es requerido'),
  service_id: yup.string().required('Servicio es requerido'),
  start_time: yup.string().required('Fecha y hora de inicio es requerida'),
  notes: yup.string(),
  status: yup.string().oneOf(['pending', 'confirmed', 'completed', 'cancelled']).required()
})

interface ReservationFormData {
  client_id: string
  professional_id: string
  service_id: string
  start_time: string
  notes: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
}

interface ReservationFormProps {
  reservation?: Reservation | null
  clients: Client[]
  professionals: Professional[]
  services: Service[]
  onSubmit: () => void
  onCancel: () => void
}

const ReservationForm: React.FC<ReservationFormProps> = ({
  reservation,
  clients,
  professionals,
  services,
  onSubmit,
  onCancel
}) => {
  const { user } = useAuthContext()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<ReservationFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      client_id: reservation?.client_id || '',
      professional_id: reservation?.professional_id || '',
      service_id: reservation?.service_id || '',
      start_time: reservation ? new Date(reservation.start_time).toISOString().slice(0, 16) : '',
      notes: reservation?.notes || '',
      status: reservation?.status || 'pending'
    }
  })

  const selectedServiceId = watch('service_id')
  const selectedService = services.find(s => s.id === selectedServiceId)

  const handleFormSubmit = async (data: ReservationFormData) => {
    if (!user) return

    setLoading(true)
    try {
      const startTime = new Date(data.start_time)
      const endTime = new Date(startTime.getTime() + (selectedService?.duration || 60) * 60000)

      const reservationData = {
        client_id: data.client_id,
        professional_id: data.professional_id,
        service_id: data.service_id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: data.status,
        notes: data.notes || null,
        total_amount: selectedService?.price || 0,
        user_id: user.id
      }

      let error
      if (reservation) {
        const { error: updateError } = await supabase
          .from('reservations')
          .update(reservationData)
          .eq('id', reservation.id)
        error = updateError
      } else {
        const { error: insertError } = await supabase
          .from('reservations')
          .insert(reservationData)
        error = insertError
      }

      if (error) throw error

      toast.success(reservation ? 'Reserva actualizada exitosamente' : 'Reserva creada exitosamente')
      onSubmit()
    } catch (error) {
      console.error('Error saving reservation:', error)
      toast.error('Error al guardar la reserva')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cliente
          </label>
          <select
            {...register('client_id')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Seleccionar cliente</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.name} - {client.email}
              </option>
            ))}
          </select>
          {errors.client_id && (
            <p className="mt-1 text-sm text-red-600">{errors.client_id.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profesional
          </label>
          <select
            {...register('professional_id')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Seleccionar profesional</option>
            {professionals.filter(p => p.available).map(professional => (
              <option key={professional.id} value={professional.id}>
                {professional.name} - {professional.email}
              </option>
            ))}
          </select>
          {errors.professional_id && (
            <p className="mt-1 text-sm text-red-600">{errors.professional_id.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Servicio
          </label>
          <select
            {...register('service_id')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Seleccionar servicio</option>
            {services.map(service => (
              <option key={service.id} value={service.id}>
                {service.name} - ${service.price} ({service.duration} min)
              </option>
            ))}
          </select>
          {errors.service_id && (
            <p className="mt-1 text-sm text-red-600">{errors.service_id.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <select
            {...register('status')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmada</option>
            <option value="completed">Completada</option>
            <option value="cancelled">Cancelada</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fecha y Hora de Inicio
        </label>
        <input
          {...register('start_time')}
          type="datetime-local"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        />
        {errors.start_time && (
          <p className="mt-1 text-sm text-red-600">{errors.start_time.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notas (Opcional)
        </label>
        <textarea
          {...register('notes')}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="Notas adicionales sobre la reserva..."
        />
      </div>

      {selectedService && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Resumen del Servicio</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Duración:</span>
              <span className="ml-2 font-medium">{selectedService.duration} minutos</span>
            </div>
            <div>
              <span className="text-gray-600">Precio:</span>
              <span className="ml-2 font-medium">${selectedService.price}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={loading}
        >
          {reservation ? 'Actualizar Reserva' : 'Crear Reserva'}
        </Button>
      </div>
    </form>
  )
}

export default ReservationForm