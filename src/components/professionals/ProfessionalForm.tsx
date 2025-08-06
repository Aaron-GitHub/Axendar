import { useForm, useFieldArray} from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Professional } from '../../types'
import { useAuthContext } from '../../contexts/AuthContext'
import Button from '../ui/Button'
import { IconPlus, IconTrash } from '../ui/Icons'
import toast from 'react-hot-toast'

interface FormValues {
  name: string
  email: string
  phone?: string
  specialties: { value: string }[]
  hourly_rate: number
  available: boolean
}

const schema = yup.object().shape({
  name: yup.string().required('El nombre es requerido'),
  email: yup.string().email('Email inválido').required('El email es requerido'),
  phone: yup.string().nullable().optional(),
  specialties: yup.array().of(
    yup.object().shape({
      value: yup.string().required('La especialidad no puede estar vacía')
    })
  ).required().min(1, 'Debe agregar al menos una especialidad'),
  hourly_rate: yup.number().required('La tarifa por hora es requerida').min(0, 'La tarifa debe ser mayor o igual a 0'),
  available: yup.boolean().required().default(true)
}) as yup.ObjectSchema<FormValues>

interface ProfessionalFormProps {
  professional?: Professional | null
  onSubmit: (data: Professional) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
}

const ProfessionalForm: React.FC<ProfessionalFormProps> = ({ professional, onSubmit, onCancel, isSubmitting }) => {
  const { user } = useAuthContext()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: professional?.name || '',
      email: professional?.email || '',
      phone: professional?.phone || '',
      specialties: professional?.specialties ? professional.specialties.map(s => ({ value: s })) : [{ value: '' }],
      hourly_rate: professional?.hourly_rate || 0,
      available: professional?.available ?? true
    },
    mode: 'onChange'
  })

  const { fields, append, remove } = useFieldArray({
    name: 'specialties',
    control
  })

  const handleFormSubmit = async (data: FormValues) => {
    if (!user) {
      toast.error('Debes iniciar sesión para realizar esta acción')
      return
    }

    try {
      const professionalData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        specialties: data.specialties.map(s => s.value).filter(s => s.trim() !== ''),
        hourly_rate: data.hourly_rate,
        available: data.available,
        user_id: user.id,
        ...(professional?.id ? { id: professional.id } : {}),
        ...(professional ? {
          created_at: professional.created_at,
          updated_at: professional.updated_at
        } : {})
      } as Professional

      await onSubmit(professionalData)
    } catch (error: any) {
      console.error('Error in form submit:', error)
      // Los errores se manejan en el componente padre
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
          placeholder="Nombre completo del profesional"
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
          Tarifa por hora
        </label>
        <input
          {...register('hourly_rate')}
          type="number"
          min="0"
          step="0.01"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="0.00"
        />
        {errors.hourly_rate && (
          <p className="mt-1 text-sm text-red-600">{errors.hourly_rate.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Especialidades
        </label>
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <input
                {...register(`specialties.${index}.value`)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ej: Masajes, Terapia, etc."
              />
              <button
                type="button"
                onClick={() => remove(index)}
                className="inline-flex items-center p-2 border border-transparent rounded-md text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <IconTrash className="h-5 w-5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ value: '' })}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <IconPlus className="h-4 w-4 mr-2" />
            Agregar Especialidad
          </button>
        </div>
        {errors.specialties && (
          <p className="mt-1 text-sm text-red-600">{errors.specialties.message}</p>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            {...register('available')}
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label className="text-sm text-gray-700">
            Disponible para reservas
          </label>
        </div>
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
          {professional ? 'Actualizar Profesional' : 'Crear Profesional'}
        </Button>
      </div>
    </form>
  )
}

export default ProfessionalForm