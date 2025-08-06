import React from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { supabase } from '../../lib/supabase'
import { useAuthContext } from '../../contexts/AuthContext'
import { Client } from '../../types'
import Button from '../ui/Button'
import toast from 'react-hot-toast'

const schema = yup.object().shape({
  name: yup.string().required('Nombre es requerido'),
  email: yup.string().email('Email inválido').required('Email es requerido'),
  phone: yup.string().nullable().optional(),
  address: yup.string().nullable().optional(),
}) as yup.ObjectSchema<ClientFormData>

interface ClientFormData {
  name: string
  email: string
  phone?: string
  address?: string
}

interface ClientFormProps {
  client?: Client | null
  onSubmit: () => void
  onCancel: () => void
  isSubmitting: boolean
}

const ClientForm: React.FC<ClientFormProps> = ({ client, onSubmit, onCancel, isSubmitting }) => {
  const { user } = useAuthContext()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: client?.name || '',
      email: client?.email || '',
      phone: client?.phone || '',
      address: client?.address || '',
    }
  })

  const handleFormSubmit = async (data: ClientFormData) => {
    if (!user) return

    try {
      const clientData = {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        address: data.address || null,
        user_id: user.id
      }

      let error
      if (client) {
        const { error: updateError } = await supabase
          .from('clients')
          .update(clientData)
          .eq('id', client.id)
        error = updateError
      } else {
        const { error: insertError } = await supabase
          .from('clients')
          .insert(clientData)
        error = insertError
      }

      if (error) throw error

      toast.success(client ? 'Cliente actualizado exitosamente' : 'Cliente creado exitosamente')
      onSubmit()
    } catch (error: any) {
      console.error('Error saving client:', error)
      if (error.code === '23505') {
        toast.error('Ya existe un cliente con ese email')
      } else {
        toast.error('Error al guardar el cliente')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nombre Completo
        </label>
        <input
          {...register('name')}
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="Nombre completo del cliente"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          {...register('email')}
          type="email"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="email@ejemplo.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Teléfono (Opcional)
        </label>
        <input
          {...register('phone')}
          type="tel"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="+56 9 1234 5678"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dirección (Opcional)
        </label>
        <textarea
          {...register('address')}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="Dirección completa del cliente"
        />
      </div>

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
          loading={isSubmitting}
        >
          {client ? 'Actualizar Cliente' : 'Crear Cliente'}
        </Button>
      </div>
    </form>
  )
}

export default ClientForm