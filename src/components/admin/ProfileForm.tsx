
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import Button from '../ui/Button'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { User } from '../../types/index'
import { Building2 } from 'lucide-react'
import { useState } from 'react'

const schema = yup.object().shape({
  name: yup.string().required('El nombre es requerido'),
  email: yup.string().email('Email inválido').required('El email es requerido'),
  company_name: yup.string().required('El nombre de la empresa es requerido'),
  phone: yup.string().default(''),
  address: yup.string().default(''),
  website: yup.string().url('URL inválida').default(''),
  logo_url: yup.string().url('URL inválida').default(''),
  min_booking_hours: yup.number()
    .min(0, 'No puede ser negativo')
    .max(72, 'Máximo 72 horas')
    .required('La anticipación mínima para reservar es requerida')
    .default(4),
  min_cancel_hours: yup.number()
    .min(0, 'No puede ser negativo')
    .max(72, 'Máximo 72 horas')
    .required('La anticipación mínima para cancelar es requerida')
    .default(2)
}).required() as yup.ObjectSchema<ProfileFormData>

interface ProfileFormData {
  name: string
  email: string
  company_name: string
  phone: string
  address: string
  website: string
  logo_url: string
  min_booking_hours: number
  min_cancel_hours: number
}

interface ProfileFormProps {
  profile?: User
  onSave?: () => void
}

const ProfileForm: React.FC<ProfileFormProps> = ({ profile, onSave }) => {
  const { user } = useAuth()
  const [logoPreview, setLogoPreview] = useState<string | null>(profile?.logo_url || null)
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<ProfileFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: profile?.name || '',
      email: profile?.email || '',
      company_name: profile?.company_name || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
      website: profile?.website || '',
      logo_url: profile?.logo_url || '',
      min_booking_hours: profile?.min_booking_hours || 4,
      min_cancel_hours: profile?.min_cancel_hours || 2
    }
  })

  const handleLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    try {
      // Validar tamaño y tipo
      if (file.size > 5 * 1024 * 1024) {
        toast.error('El archivo debe ser menor a 5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        toast.error('El archivo debe ser una imagen')
        return
      }

      // Crear nombre único basado en user_id
      const fileExt = file.name.split('.').pop()
      const fileName = `logo-${user.id}.${fileExt}`

      // Subir a storage local
      const { error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      // Obtener URL pública
      const { data: urlData } = await supabase.storage.from('company-logos').createSignedUrl(fileName, 31536000) // 1 año
      const publicUrl = urlData?.signedUrl || ''
      console.log('URL generada:', publicUrl)

      // Actualizar preview y form
      setLogoPreview(publicUrl)
      setValue('logo_url', publicUrl)

      // Actualizar solo el logo en el perfil
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          logo_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      toast.success('Logo actualizado correctamente')
      onSave?.()
    } catch (error) {
      console.error('Error uploading logo:', error)
      toast.error('Error al subir el logo')
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...data,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      toast.success('Perfil actualizado correctamente')
      onSave?.()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Error al actualizar el perfil')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      <div className="space-y-10">
       

        {/* Sección de Datos Personales */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Datos Personales</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nombre
          </label>
          <input
            type="text"
            {...register('name')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            {...register('email')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

          </div>
        </div>

        {/* Sección de Datos de Empresa */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          {profile && (
            <div className={`mb-6 flex items-center justify-between rounded-lg p-4 border ${
              profile.subscription_plan === 'enterprise' ? 'bg-purple-50 border-purple-200' :
              profile.subscription_plan === 'premium' ? 'bg-blue-50 border-yellow-200' :
              profile.subscription_plan === 'basic' ? 'bg-green-50 border-green-200' :
              'bg-gray-50 border-gray-200'
            }`}>
              <div>
                <h3 className={`text-sm font-medium ${
                  profile.subscription_plan === 'enterprise' ? 'text-purple-900' :
                  profile.subscription_plan === 'premium' ? 'text-yellow-900' :
                  profile.subscription_plan === 'basic' ? 'text-green-900' :
                  'text-gray-900'
                }`}>Plan Actual</h3>
                <p className={`mt-1 text-sm ${
                  profile.subscription_plan === 'enterprise' ? 'text-purple-700' :
                  profile.subscription_plan === 'premium' ? 'text-yellow-700' :
                  profile.subscription_plan === 'basic' ? 'text-green-700' :
                  'text-gray-500'
                }`}>
                  {profile.subscription_plan ? (
                    profile.subscription_plan.charAt(0).toUpperCase() + profile.subscription_plan.slice(1)
                  ) : (
                    'Free'
                  )}
                </p>
              </div>
              {profile.subscription_end && (
                <div className="text-right">
                  <h3 className={`text-sm font-medium ${
                  profile.subscription_plan === 'enterprise' ? 'text-purple-900' :
                  profile.subscription_plan === 'premium' ? 'text-yellow-900' :
                  profile.subscription_plan === 'basic' ? 'text-green-900' :
                  'text-gray-900'
                }`}>Válido hasta</h3>
                  <p className={`mt-1 text-sm ${
                    profile.subscription_plan === 'enterprise' ? 'text-purple-700' :
                    profile.subscription_plan === 'premium' ? 'text-yellow-700' :
                    profile.subscription_plan === 'basic' ? 'text-green-700' :
                    'text-gray-500'
                  }`}>
                    {new Date(profile.subscription_end).toLocaleDateString('es-ES')}
                  </p>
                </div>
              )}
            </div>
          )}
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Datos de Empresa</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nombre de la Empresa
          </label>
          <input
            type="text"
            {...register('company_name')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
          {errors.company_name && (
            <p className="mt-1 text-sm text-red-600">{errors.company_name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Teléfono
          </label>
          <input
            type="tel"
            {...register('phone')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Dirección
          </label>
          <input
            type="text"
            {...register('address')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Sitio Web
          </label>
          <input
            type="url"
            {...register('website')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
          {errors.website && (
            <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Logo de la empresa
          </label>
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="h-20 w-48 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="h-full w-full object-contain" />
                ) : (
                  <Building2 className="h-8 w-8 text-gray-400" />
                )}
              </div>
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
                id="company-logo"
              />
              <label
                htmlFor="company-logo"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer"
              >
                {logoPreview ? 'Cambiar logo' : 'Subir logo'}
              </label>
              <p className="mt-1 text-sm text-gray-500">
                PNG, JPG o GIF hasta 5MB
              </p>
            </div>
          </div>
          <input type="hidden" {...register('logo_url')} />
          {errors.logo_url && (
            <p className="mt-1 text-sm text-red-600">{errors.logo_url.message}</p>
          )}
        </div>


          </div>
        </div>

         {/* Sección de Configuración de Reservas */}
         <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuración de Reservas</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Anticipación mínima para reservar (horas)
              </label>
              <input
                type="number"
                min="0"
                max="72"
                {...register('min_booking_hours')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              {errors.min_booking_hours && (
                <p className="mt-1 text-sm text-red-600">{errors.min_booking_hours.message}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">Ejemplo: 4 horas significa que los clientes deben reservar con al menos 4 horas de anticipación</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Anticipación mínima para cancelar (horas)
              </label>
              <input
                type="number"
                min="0"
                max="72"
                {...register('min_cancel_hours')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              {errors.min_cancel_hours && (
                <p className="mt-1 text-sm text-red-600">{errors.min_cancel_hours.message}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">Ejemplo: 2 horas significa que los clientes pueden cancelar hasta 2 horas antes de la cita</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6 mt-6 border-t border-gray-200">
        <Button
          type="submit"
          loading={isSubmitting}
        >
          Guardar Cambios
        </Button>
      </div>
    </form>
  )
}
export default ProfileForm