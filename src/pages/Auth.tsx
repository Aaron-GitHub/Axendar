import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuthContext } from '../contexts/AuthContext'
import LoginForm from '../components/auth/LoginForm'
import RegisterForm from '../components/auth/RegisterForm'
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm'
import { Toaster } from 'react-hot-toast'

type AuthMode = 'login' | 'register' | 'forgot-password'

const Auth: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState<AuthMode>('login')
  const emailParam = searchParams.get('email')
  const fromOnboarding = searchParams.get('fromOnboarding') === 'true'

  useEffect(() => {
    // Si el usuario ya está autenticado, redirigir al dashboard
    if (user) {
      navigate('/app/dashboard')
    }
  }, [user, navigate])

  const handleToggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
  }

  const handleForgotPassword = () => {
    setMode('forgot-password')
  }

  const handleBackToLogin = () => {
    setMode('login')
  }

  switch (mode) {
    case 'register':
      return (
        <div>
          <Toaster position="top-right" />
          <div className="mb-1">
            <Link 
              to="/" 
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Link>
          </div>
          <RegisterForm onToggleMode={handleToggleMode} />
        </div>
      )
    case 'forgot-password':
      return (
        <div>
          <Toaster position="top-right" />
          <div className="mb-1">
            <Link 
              to="/" 
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Link>
          </div>
          <ForgotPasswordForm onBack={handleBackToLogin} />
        </div>
      )
    default:
      return (
        <div>
          <Toaster position="top-right" />
          <div className="mb-1">
            <Link 
              to="/" 
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Link>
          </div>
          <LoginForm
            onToggleMode={handleToggleMode}
            onForgotPassword={handleForgotPassword}
            initialEmail={emailParam}
            fromOnboarding={fromOnboarding}
          />
        </div>
      )
  }
}

export default Auth