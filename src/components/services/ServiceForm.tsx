import React from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { supabase } from '../../lib/supabase'
import { useAuthContext } from '../../contexts/AuthContext'
import { Service } from '../../types'
import Button from '../ui/Button'
import toast from 'react-hot-toast'

const schema = yup.object().shape({
  name: yup.string().required('El nombre es requerido'),
  description: yup.string().nullable().default(null),
  duration: yup.number().min(1, 'La duración debe ser mayor a 0').required('La duración es requerida'),
  price: yup.number().min(0, 'El precio no puede ser negativo').required('El precio es requerido'),
  active: yup.boolean().default(true),
  is_public: yup.boolean().default(false),
})

type ServiceFormData = yup.InferType<typeof schema>

interface ServiceFormProps {
  service?: Service | null
  onSubmit: () => void
  onCancel: () => void
  isSubmitting: boolean
}

const ServiceForm: React.FC<ServiceFormProps> = ({ service, onSubmit: onSubmitProp, onCancel, isSubmitting }) => {
  const { user } = useAuthContext()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: service?.name || '',
      description: service?.description || '',
      duration: service?.duration || 30,
      price: service?.price || 0,
      active: service?.active ?? true,
      is_public: service?.is_public ?? false
    }
  })

  const handleFormSubmit: SubmitHandler<ServiceFormData> = async (data) => {
    if (!user) return

    try {
      const serviceData = {
        name: data.name,
        description: data.description || null,
        duration: data.duration,
        price: data.price,
        active: data.active,
        is_public: data.is_public,
        user_id: user.id
      } 

      let error
      if (service) {
        const { error: updateError } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', service.id)
        error = updateError
      } else {  
        const { error: insertError } = await supabase
          .from('services')
          .insert(serviceData)
        error = insertError
      }

      if (error) throw error

      toast.success(service ? 'Servicio actualizado exitosamente' : 'Servicio creado exitosamente')
      onSubmitProp()
    } catch (error: any) {
      console.error('Error saving service:', error)
      if (error.code === '23505') {
        toast.error('Ya existe un servicio con ese nombre')
      } else {
        toast.error('Error al guardar el servicio')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nombre
        </label>
        <input
          {...register('name')}
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="Nombre del servicio"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción (Opcional)
        </label>
        <textarea
          {...register('description')}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="Descripción del servicio"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Duración (minutos)
        </label>
        <input
          {...register('duration')}
          type="number"
          min="1"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="30"
        />
        {errors.duration && (
          <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Precio
        </label>
        <input
          {...register('price')}
          type="number"
          min="0"
          step="0.01"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="0.00"
        />
        {errors.price && (
          <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
        )}
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            {...register('active')}
            type="checkbox"
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm font-medium text-gray-700">Servicio Activo</span>
        </label>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            {...register('is_public')}
            type="checkbox"
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm font-medium text-gray-700">Servicio Público</span>
          <span className="text-xs text-gray-500">(visible en la web sin autenticación)</span>
        </label>
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
          {service ? 'Actualizar Servicio' : 'Crear Servicio'}
        </Button>
      </div>
    </form>
  )
}

export default ServiceForm