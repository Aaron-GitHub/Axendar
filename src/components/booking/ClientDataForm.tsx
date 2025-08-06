import React from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Service, Professional } from '../../types'
import Button from '../ui/Button'

interface ClientDataFormProps {
  selectedService: Service
  selectedProfessional: Professional
  selectedDate: Date
  selectedTime: string
  onSubmit: (data: ClientFormData) => void
}

export interface ClientFormData {
  name: string
  email: string
  phone: string | null
  notes: string | null
}

const schema = yup.object().shape({
  name: yup.string().required('El nombre es requerido'),
  email: yup.string().email('Email inválido').required('El email es requerido'),
  phone: yup.string().nullable().default(null),
  notes: yup.string().nullable().default(null)
})

const ClientDataForm: React.FC<ClientDataFormProps> = ({
  selectedService,
  selectedProfessional,
  selectedDate,
  selectedTime,
  onSubmit
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ name: string; email: string; phone: string | null; notes: string | null }>({
    resolver: yupResolver(schema)
  })

  const onSubmitForm = handleSubmit((data: ClientFormData) => {
    onSubmit(data)
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Datos del cliente
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Por favor ingresa tus datos para completar la reserva
        </p>
      </div>

      

      <form onSubmit={onSubmitForm} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre completo
          </label>
          <input
            type="text"
            id="name"
            {...register('name')}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
            placeholder="Tu nombre completo"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            {...register('email')}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
            placeholder="tu.email@ejemplo.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono (opcional)
          </label>
          <input
            type="tel"
            id="phone"
            {...register('phone')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="+56 9 1234 5678"
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Notas adicionales (opcional)
          </label>
          <textarea
            id="notes"
            {...register('notes')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Cualquier información adicional que necesitemos saber"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-6">
          <Button
            type="submit"
          >
            Continuar con la Reserva
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ClientDataForm
