import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import ConfirmationModal from '../components/ui/ConfirmationModal'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { supabase } from '../lib/supabase'
import { useOnboardingAuth } from '../contexts/OnboardingAuthContext'
import Button from '../components/ui/Button'
import logo from '../assets/img/logo.png'
import icono from '../assets/img/icono.png'
import { 
  Building2, 
  Calendar, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Users,
  Briefcase,
  Clock,
  Star,
  Target,
  Zap,
  Trash,
  Plus,
  HeartHandshake,
  Sparkles
} from 'lucide-react'
import toast from 'react-hot-toast'
import { PlanSelectionStep } from "../components/onboarding/PlanSelectionStep";

const steps = [
  {
    id: 1,
    title: 'Bienvenido a Axendar',
    subtitle: 'Comienza tu prueba gratuita',
    icon: HeartHandshake,
    color: 'bg-primary-500'
  },
  {
    id: 2,
    title: 'Elige tu Plan',
    subtitle: 'Selecciona el plan que mejor se adapte a ti',
    icon: Star,
    color: 'bg-yellow-500'
  },
  {
    id: 3,
    title: 'Información de tu Empresa',
    subtitle: 'Personaliza tu experiencia',
    icon: Building2,
    color: 'bg-primary-500'
  },
  {
    id: 4,
    title: 'Configura tu Primer Cliente',
    subtitle: 'Comienza a gestionar tu base de datos',
    icon: Users,
    color: 'bg-secondary-400'
  },
  {
    id: 5,
    title: 'Crea tu Primer Servicio',
    subtitle: 'Define lo que ofreces',
    icon: Briefcase,
    color: 'bg-green-500'
  },
  {
    id: 6,
    title: '¡Todo Listo!',
    subtitle: 'Tu sistema está configurado',
    icon: CheckCircle,
    color: 'bg-purple-500'
  }
]

// Schemas for each step
const planSchema = yup.object().shape({
  selectedPlan: yup.string().required('Debes seleccionar un plan')
})

const step3Schema = yup.object().shape({
  name: yup.string().required('Nombre completo es requerido'),
  email: yup.string().email('Email inválido').required('Email es requerido'),
  password: yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres').required('Contraseña es requerida'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Las contraseñas deben coincidir')
    .required('Confirmar contraseña es requerido'),
  companyName: yup.string().required('Nombre de empresa es requerido')
})

const step4Schema = yup.object().shape({
  professional_name: yup.string().required('Nombre del profesional es requerido'),
  professional_email: yup.string().email('Email inválido').required('Email es requerido'),
  professional_phone: yup.string().required('Teléfono es requerido'),
  specialties: yup.array().of(
    yup.object().shape({
      value: yup.string().required('Especialidad es requerida')
    })
  ).min(1, 'Agrega al menos una especialidad')
})

const step5Schema = yup.object().shape({
  service_name: yup.string().required('Nombre del servicio es requerido'),
  service_duration: yup.number().min(15, 'Mínimo 15 minutos').required('Duración es requerida'),
  service_price: yup.number().min(1, 'Precio debe ser mayor a 0').required('Precio es requerido')
})

const Onboarding: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, startTemporarySession } = useOnboardingAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [showEmailExistsModal, setShowEmailExistsModal] = useState(false)
  const [emailInUse, setEmailInUse] = useState('')
  const [selectedPlan, setSelectedPlan] = useState(() => {
    const planFromUrl = searchParams.get('plan')
    return planFromUrl === 'basic' || planFromUrl === 'pro' ? planFromUrl : ''
  })

  useEffect(() => {
    // Iniciar sesión temporal al montar el componente
    if (!user) {
      startTemporarySession()
    }

    // Si hay un plan preseleccionado, avanzar al siguiente paso después de la bienvenida
    const planFromUrl = searchParams.get('plan')
    if (currentStep === 1 && (planFromUrl === 'basic' || planFromUrl === 'pro')) {
      nextStep()
    }
  }, [user, startTemporarySession, currentStep, searchParams])

  // Plan Selection Form
  const planForm = useForm({
    resolver: yupResolver(planSchema),
    defaultValues: {
      selectedPlan: ''
    }
  })

  // Step 3 Form
  const step3Form = useForm({
    resolver: yupResolver(step3Schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      companyName: ''
    }
  })

  // Step 4 Form
  const step4Form = useForm({
    resolver: yupResolver(step4Schema),
    defaultValues: {
      professional_name: '',
      professional_email: '',
      professional_phone: '',
      specialties: [{ value: '' }]
    }
  })

  // Step 5 Form
  const step5Form = useForm({
    resolver: yupResolver(step5Schema),
    defaultValues: {
      service_name: '',
      service_duration: 60,
      service_price: 15000
    }
  })



  const handleStep3Submit = async (data: any) => {
    // Include selected plan in the registration data
    const registrationData = {
      ...data,
      selectedPlan: selectedPlan
    }
    try {
      // Verificar si el email ya existe en la tabla profiles
      const { data: existingUsers, error: queryError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', data.email)

      if (queryError) {
        console.error('Error al verificar email:', queryError)
        throw new Error('Error al verificar el email')
      }

      if (existingUsers && existingUsers.length > 0) {
        setEmailInUse(data.email)
        setShowEmailExistsModal(true)
        return
      }

      // Si llegamos aquí, el email no existe y podemos continuar
    localStorage.setItem('onboarding_profile', JSON.stringify({
      name: data.name,
      email: data.email,
      password: data.password,
      companyName: data.companyName
    }))
      
      setCompletedSteps([...completedSteps, 3])
      setCurrentStep(4)
      toast.success('Datos guardados correctamente')
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Error al guardar los datos')
    }
  }

  const handleStep4Submit = async (data: any) => {
    setLoading(true)
    try {
      // Validar datos requeridos
      if (!data.professional_name || !data.professional_email) {
        throw new Error('Nombre y email del profesional son requeridos')
      }

      // Guardar datos temporalmente
      const professionalData = {
        professional_name: data.professional_name.trim(),
        professional_email: data.professional_email.trim(),
        professional_phone: data.professional_phone?.trim() || '',
        specialties: data.specialties?.map((s: any) => s.value).filter(Boolean) || [],
      }

      console.log('Guardando datos del profesional:', professionalData)
      localStorage.setItem('onboarding_professional', JSON.stringify(professionalData))
      
      setCompletedSteps([...completedSteps, 4])
      setCurrentStep(5)
      toast.success('Datos guardados correctamente')
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Error al guardar los datos')
    } finally {
      setLoading(false)
    }
  }

  const handleStep5Submit = async (data: any) => {
    setLoading(true)
    try {
      // Validar datos requeridos
      if (!data.service_name || !data.service_duration || !data.service_price) {
        throw new Error('Todos los campos del servicio son requeridos')
      }

      // Guardar datos temporalmente
      const serviceData = {
        service_name: data.service_name.trim(),
        service_duration: Number(data.service_duration),
        service_price: Number(data.service_price)
      }

      console.log('Guardando datos del servicio:', serviceData)
      localStorage.setItem('onboarding_service', JSON.stringify(serviceData))
      
      setCompletedSteps([...completedSteps, 5])
      setCurrentStep(6);
      
      toast.success('Datos guardados correctamente')
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Error al guardar los datos')
    } finally {
      setLoading(false)
      handleFinish();
    }
  }

  const handleFinish = async () => {
    setLoading(true)
    try {
      // Obtener y validar datos del perfil
      const profileData = JSON.parse(localStorage.getItem('onboarding_profile') || '{}')
      if (!profileData.email || !profileData.name) {
        throw new Error('Datos del perfil incompletos')
      }

      // Obtener y validar datos del profesional
      const professionalData = JSON.parse(localStorage.getItem('onboarding_professional') || '{}')
      if (!professionalData.professional_name || !professionalData.professional_email) {
        throw new Error('Datos del profesional incompletos')
      }

      // Obtener datos del servicio
      const serviceData = JSON.parse(localStorage.getItem('onboarding_service') || '{}')

      // 1. Crear usuario
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: profileData.email,
        password: profileData.password,
      })

      if (signUpError) throw signUpError
      if (!signUpData.user) throw new Error('No se pudo crear el usuario')

      // 2. Crear/actualizar perfil con toda la información
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: signUpData.user.id,
          email: profileData.email,
          name: profileData.name,
          company_name: profileData.companyName,
        })

      if (profileError) throw profileError

      // 2. Guardar el profesional
      const professionalPayload = {
        name: professionalData.professional_name,
        email: professionalData.professional_email,
        phone: professionalData.professional_phone || '',
        specialties: professionalData.specialties || [],
        user_id: signUpData.user.id,
      }

      console.log('Professional data from storage:', professionalData)
      console.log('Professional payload:', professionalPayload)

      const { data: professional, error: professionalError } = await supabase
        .from('professionals')
        .insert(professionalPayload)
        .select()
        .single()

      if (professionalError) {
        console.error('Professional Error:', professionalError)
        throw new Error('Error al crear el profesional')
      }

      if (!professional) {
        throw new Error('No se pudo obtener el profesional creado')
      }

      // 3. Guardar el servicio y asociarlo al profesional
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .insert({
          name: serviceData.service_name,
          description: serviceData.service_name,
          duration: serviceData.service_duration,
          price: serviceData.service_price,
          created_at: new Date().toISOString(),
          user_id: signUpData.user.id,
        })
        .select()
        .single()

      if (serviceError) {
        console.error('Service Error:', serviceError)
        throw new Error('Error al crear el servicio')
      }

      if (!service) {
        throw new Error('No se pudo obtener el servicio creado')
      }

      //4 . Guardar la relacion entre el profesional y el servicio
      const { error: professional_serviceError } = await supabase
        .from('professional_services')
        .insert({
          service_id: service.id,
          professional_id: professional.id,
          created_at: new Date().toISOString(),
        })

      if (professional_serviceError) {
        console.error('Professional Service Error:', professional_serviceError)
        throw new Error('Error al crear el servicio')
      }
      
      localStorage.removeItem('onboarding_profile')
      localStorage.removeItem('onboarding_professional')
      localStorage.removeItem('onboarding_service')
      
      navigate(`/auth?fromOnboarding=true&email=${encodeURIComponent(signUpData.user.email || '')}`)
      toast.success('¡Registro completado! Por favor verifica tu correo e inicia sesión')
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Hubo un error al completar el registro')
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    navigate('/auth')
  }

  const nextStep = () => {
    const nextStepIndex = steps.findIndex(step => step.id === currentStep) + 1

    console.log('Next step index:', nextStepIndex)
    console.log('Steps length:', steps.length)

    if (nextStepIndex < steps.length) {
      // Solo marcar como completado si no está en la lista
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep])
      }
      setCurrentStep(steps[nextStepIndex].id)
    }
  }

  const prevStep = () => {
    const prevStepIndex = steps.findIndex(step => step.id === currentStep) - 1
    if (prevStepIndex >= 0) {
      // Remover el paso actual de completados al retroceder
      setCompletedSteps(completedSteps.filter(step => step !== currentStep))
      setCurrentStep(steps[prevStepIndex].id)
    }
  }

  const renderProgressBar = () => {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center gap-4">
        {steps.map((step, index) => {
          const StepIcon = step.icon
          const isCompleted = completedSteps.includes(step.id)
          const isCurrent = currentStep === step.id
          // Un paso es accesible si los pasos anteriores están completados
          const currentStepIndex = steps.findIndex(s => s.id === currentStep)
          const isAccessible = index <= currentStepIndex || isCompleted || completedSteps.includes(step.id)

          return (
            <div key={step.id} className="flex flex-col items-center relative">
              {/* Línea conectora entre pasos */}
              {index < steps.length - 1 && (
                <div className={`absolute left-[50%] w-[calc(200%+1rem)] h-0.5 top-6 -z-10 ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                isCompleted 
                  ? 'bg-green-500 text-white' 
                  : isCurrent 
                    ? `${step.color} text-white shadow-lg scale-110` 
                    : isAccessible
                      ? 'bg-gray-200 text-gray-600'
                      : 'bg-gray-100 text-gray-400'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  <StepIcon className="h-6 w-6" />
                )}
              </div>
              <span className={`text-xs mt-2 text-center max-w-20 ${
                isCurrent ? 'text-gray-900 font-medium' : 'text-gray-500'
              }`}>
                {step.title.split(' ')[0]}
              </span>
            </div>
          )
        })}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div 
            className="bg-gradient-to-r from-primary-500 to-secondary-400 h-2 rounded-full transition-all duration-500"
            style={{ 
              width: `${(steps.findIndex(step => step.id === currentStep) / (steps.length - 1)) * 100}%` 
            }}
          />
        </div>
      </div>
    )
  }
  // Logo upload moved to admin/profile page


  const renderWelcomeStep = () => {
    return (
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className={`w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center`}>
              <img src={icono} alt="Icono" className="w-12 h-12" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Bienvenido a Axendar</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Estás a punto de comenzar tu viaje hacia una gestión más eficiente de tu negocio. 
            Configuraremos tu cuenta en unos simples pasos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-primary-50 rounded-lg">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 mx-auto mb-3">
              <Clock className="h-5 w-5 text-primary-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">5 minutos</h3>
            <p className="text-sm text-gray-600">Configuración rápida y sencilla</p>
          </div>

          <div className="p-4 bg-secondary-50 rounded-lg">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary-100 mx-auto mb-3">
              <Calendar className="h-5 w-5 text-secondary-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">30 días</h3>
            <p className="text-sm text-gray-600">Prueba gratuita</p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 mx-auto mb-3">
              <Zap className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Soporte técnico</h3>
            <p className="text-sm text-gray-600">personalizado</p>
          </div>
        </div>

        <div className="pt-4 flex flex-col items-center space-y-4">
          <Button size="lg" onClick={nextStep}>
            Comenzar Configuración
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-600 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4 mr-2 text-primary-500" />
            No necesitas tarjeta de crédito
          </div>
        </div>
      </div>
    )
  }

  const renderPlanStep = () => {
    return (
      <PlanSelectionStep
        form={planForm}
        selectedPlan={selectedPlan}
        setSelectedPlan={setSelectedPlan}
        onNext={nextStep}
      />
    )
  }

  const renderStep3 = () => (
    <div className="space-y-8">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100">
          <Building2 className="h-6 w-6 text-primary-600" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-gray-900">
          Crea tu Cuenta
        </h2>
        <p className="mt-1 text-gray-500">
          Comienza configurando tu cuenta empresarial
        </p>
      </div>

      <form onSubmit={step3Form.handleSubmit(handleStep3Submit)} className="space-y-6">
        <div className="space-y-6">

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nombre Completo
            </label>
            <input
              type="text"
              {...step3Form.register('name')}
              autoComplete="name"
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Tu nombre completo"
            />
            {step3Form.formState.errors.name && (
              <p className="mt-1 text-sm text-red-600">{step3Form.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
              Nombre de la Empresa
            </label>
            <input
              type="text"
              {...step3Form.register('companyName')}
              autoComplete="companyName"
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Nombre de tu empresa"
            />
            {step3Form.formState.errors.companyName && (
              <p className="mt-1 text-sm text-red-600">{step3Form.formState.errors.companyName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              {...step3Form.register('email')}
              autoComplete="email"
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="tu@email.com"
            />
            {step3Form.formState.errors.email && (
              <p className="mt-1 text-sm text-red-600">{step3Form.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              type="password"
              {...step3Form.register('password')}
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Mínimo 6 caracteres"
            />
            {step3Form.formState.errors.password && (
              <p className="mt-1 text-sm text-red-600">{step3Form.formState.errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              {...step3Form.register('confirmPassword')}
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Confirma tu contraseña"
            />
            {step3Form.formState.errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{step3Form.formState.errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        <div className="flex justify-between">
          <Button
            type="button"
            onClick={prevStep}
            variant="outline"
          >
            Atrás
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            Continuar
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="bg-secondary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="h-8 w-8 text-secondary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Agrega tu primer profesional</h2>
        <p className="text-gray-600">Configura al primer miembro de tu equipo</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <Target className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">💡 Consejo</h4>
            <p className="text-sm text-blue-700 mt-1">
              Si trabajas solo, agregate a ti mismo como profesional. Si tienes un equipo, comienza con el primer miembro.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={step4Form.handleSubmit(handleStep4Submit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del profesional *
          </label>
          <input
            {...step4Form.register('professional_name')}
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Ej: Carlos Rodríguez"
          />
          {step4Form.formState.errors.professional_name && (
            <p className="mt-1 text-sm text-red-600">{step4Form.formState.errors.professional_name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            {...step4Form.register('professional_email')}
            type="email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="carlos@email.com"
          />
          {step4Form.formState.errors.professional_email && (
            <p className="mt-1 text-sm text-red-600">{step4Form.formState.errors.professional_email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono *
          </label>
          <input
            {...step4Form.register('professional_phone')}
            type="tel"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="+56 9 8765 4321"
          />
          {step4Form.formState.errors.professional_phone && (
            <p className="mt-1 text-sm text-red-600">{step4Form.formState.errors.professional_phone.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Especialidades
          </label>
          <div className="space-y-2">
            {step4Form.watch('specialties')?.map((_: any, index: number) => (
              <div key={index} className="flex gap-2">
                <input
                  {...step4Form.register(`specialties.${index}.value`)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ej: Masajes, Terapia, etc."
                />
                <button
                  type="button"
                  onClick={() => {
                    const values = step4Form.getValues('specialties') || [];
                    if (values.length > 1) {
                      const newValues = values.filter((_, i: number) => i !== index);
                      step4Form.setValue('specialties', newValues);
                    }
                  }}
                  className="inline-flex items-center p-2 border border-transparent rounded-md text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Trash className="h-5 w-5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const values = step4Form.getValues('specialties') || [];
                step4Form.setValue('specialties', [...values, { value: '' }]);
              }}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Plus className="h-5 w-5 mr-2" />
              Agregar Especialidad
            </button>
          </div>
          {step4Form.formState.errors.specialties && (
            <p className="text-sm text-red-600">{step4Form.formState.errors.specialties.message}</p>
          )}
        </div>

        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            Continuar
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Briefcase className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Define tu primer servicio</h2>
        <p className="text-gray-600">Configura los servicios que ofreces a tus clientes</p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <Zap className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
          <div>
            <h4 className="text-sm font-medium text-green-900">⚡ Automatización</h4>
            <p className="text-sm text-green-700 mt-1">
              Una vez configurado, el sistema calculará automáticamente el tiempo total y el costo de cada reserva.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={step5Form.handleSubmit(handleStep5Submit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del servicio *
          </label>
          <input
            {...step5Form.register('service_name')}
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Ej: Masaje Relajante"
          />
          {step5Form.formState.errors.service_name && (
            <p className="mt-1 text-sm text-red-600">{step5Form.formState.errors.service_name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duración (minutos) *
            </label>
            <div className="relative">
              <input
                {...step5Form.register('service_duration')}
                type="number"
                min="15"
                step="15"
                className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="60"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <Clock className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            {step5Form.formState.errors.service_duration && (
              <p className="mt-1 text-sm text-red-600">{step5Form.formState.errors.service_duration.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                {...step5Form.register('service_price')}
                type="number"
                min="1"
                step="0.01"
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="50.00"
              />
            </div>
            {step5Form.formState.errors.service_price && (
              <p className="mt-1 text-sm text-red-600">{step5Form.formState.errors.service_price.message}</p>
            )}
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            Finalizar configuración
            <CheckCircle className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )

  const renderStep6 = () => (
    <div className="text-center space-y-8">
      <div className="mb-8">
        <div className="bg-gradient-to-r from-primary-500 to-secondary-400 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">¡Felicitaciones! 🎉</h2>
        <p className="text-xl text-gray-600 mb-6">
          Tu sistema está configurado y listo para usar
        </p>
      </div>

      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-8 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Lo que puedes hacer ahora:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="h-6 w-6 text-primary-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Crear Reservas</h4>
            <p className="text-sm text-gray-600">Programa citas con tu calendario interactivo</p>
          </div>
          <div className="text-center">
            <div className="bg-secondary-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-secondary-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Gestionar Clientes</h4>
            <p className="text-sm text-gray-600">Administra tu base de datos completa</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Ver Métricas</h4>
            <p className="text-sm text-gray-600">Analiza el rendimiento de tu negocio</p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
        <div className="flex items-center justify-center">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-sm font-medium text-yellow-800">
              Tienes 30 días de prueba gratuita para explorar todas las funcionalidades
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Link to={`/auth?fromOnboarding=true&email=${encodeURIComponent(JSON.parse(localStorage.getItem('onboarding_profile') || '{}').email || '')}`}>
          <Button size="lg">
            Iniciar Sesión
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
        <p className="text-sm text-gray-500">
          ¿Necesitas ayuda? Nuestro equipo de soporte está disponible 24/7
        </p>
      </div>
    </div>
  )

  

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderWelcomeStep()
      case 2: 
        // Si hay un plan preseleccionado, saltar este paso
        if (selectedPlan && (selectedPlan === 'basic' || selectedPlan === 'pro')) {
          nextStep(); // Avanzar automáticamente si hay plan preseleccionado
          return null;
        }
        return renderPlanStep()
      case 3: return renderStep3()
      case 4: return renderStep4()
      case 5: return renderStep5()
      case 6: return renderStep6()
      default: return renderWelcomeStep()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src={logo} alt="Logo" className="h-8 w-auto" />
          </div>
          <p className="text-gray-600">Configuración inicial - Solo tomará unos minutos</p>
        </div>

        {/* Progress Bar */}
        {renderProgressBar()}

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {renderCurrentStep()}
        </div>

        <ConfirmationModal
          isOpen={showEmailExistsModal}
          onClose={() => setShowEmailExistsModal(false)}
          onConfirm={() => {
            setShowEmailExistsModal(false)
            // Redirigir a la página de inicio de sesión con el email como parámetro
            navigate(`/auth?email=${encodeURIComponent(emailInUse)}`)
          }}
          title="Email ya registrado"
          message={`El email ${emailInUse} ya está registrado en el sistema. ¿Deseas ir a la página de inicio de sesión?`}
          confirmText="Ir a inicio de sesión"
          cancelText="Usar otro email"
        />

        {/* Help Section */}
        {currentStep < 4 && (
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              ¿Necesitas ayuda? <a href="#" className="text-primary-600 hover:text-primary-700">Contacta soporte</a>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Onboarding