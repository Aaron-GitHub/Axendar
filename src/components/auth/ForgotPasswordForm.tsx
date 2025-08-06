import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useAuthContext } from '../../contexts/AuthContext'
import Button from '../ui/Button'
import logo from '../../assets/img/logo.png'
import { ArrowLeft } from 'lucide-react'

const schema = yup.object().shape({
  email: yup.string().email('Email inválido').required('Email es requerido'),
})

interface ForgotPasswordFormData {
  email: string
}

interface ForgotPasswordFormProps {
  onBack: () => void
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBack }) => {
  const { resetPassword } = useAuthContext()
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true)
    try {
      await resetPassword(data.email)
      setSent(true)
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <img src={logo} alt="Axendar" className="h-12 w-auto" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Correo Enviado</h2>
            <p className="mt-2 text-sm text-gray-600">
              Revisa tu bandeja de entrada para restablecer tu contraseña
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg text-center space-y-4">
            <div className="bg-green-100 p-4 rounded-lg">
              <p className="text-green-800">
                Se ha enviado un enlace de recuperación a tu correo electrónico.
              </p>
            </div>
            
            <Button
              onClick={onBack}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <img src={logo} alt="Axendar" className="h-12 w-auto" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Recuperar Contraseña</h2>
          <p className="mt-2 text-sm text-gray-600">
            Ingresa tu email para recibir un enlace de recuperación
          </p>
        </div>

        <form className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              autoComplete="email"
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="tu@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              Enviar Enlace de Recuperación
            </Button>
            
            <Button
              type="button"
              onClick={onBack}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Login
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ForgotPasswordForm