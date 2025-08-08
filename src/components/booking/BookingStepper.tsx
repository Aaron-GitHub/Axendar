import React, { useState } from 'react'
import { Service, Professional } from '../../types'
import { toast } from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import ServiceSelection from './ServiceSelection'
import ProfessionalSelection from './ProfessionalSelection'
import DateTimeSelection from './DateTimeSelection'
import ClientDataForm, { ClientFormData } from './ClientDataForm'
import BookingSummary from './BookingSummary'
import BookingSuccess from './BookingSuccess'
import { createBooking } from '../../services/bookingService'
import ConfirmationModal from '../ui/ConfirmationModal'

interface BookingStepperProps {
  userId: string
  onComplete: (bookingData: BookingData) => void
  onCancel: () => void
  onDetailsChange?: (details: {
    service?: { name: string }
    professional?: { name: string }
    date?: Date
    time?: string
  }) => void
}

export interface BookingData {
  service: Service | null
  professional: Professional | null
  date: Date | null
  time: string | null
  clientData: {
    name: string
    email: string
    phone: string | null
    notes: string | null
  } | null
}

const STEPS = [
  { id: 'service', title: 'Servicio' },
  { id: 'professional', title: 'Profesional' },
  { id: 'datetime', title: 'Fecha y Hora' },
  { id: 'client', title: 'Tus Datos' },
  { id: 'summary', title: 'Resumen' },
  { id: 'success', title: 'Éxito' }
]

const BookingStepper: React.FC<BookingStepperProps> = ({ userId, onComplete, onDetailsChange }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [bookingData, setBookingData] = useState<BookingData>({
    service: null,
    professional: null,
    date: null,
    time: null,
    clientData: null
  })

  const resetForm = () => {
    setCurrentStep(0)
    setBookingData({
      service: null,
      professional: null,
      date: null,
      time: null,
      clientData: null
    })
    // Notificar al componente padre del cambio en los detalles
    if (onDetailsChange) {
      onDetailsChange({
        service: undefined,
        professional: undefined,
        date: undefined,
        time: undefined
      })
    }
  }

  const handleCancel = () => {
    // Si hay datos ingresados, mostrar confirmación
    if (bookingData.service || bookingData.professional || bookingData.date || bookingData.time || bookingData.clientData) {
      setShowCancelConfirm(true)
    } else {
      // Si no hay datos, reiniciar directamente
      resetForm()
    }
  }



  const handleBack = () => {
    // No permitir retroceder en el paso de éxito
    if (currentStep === 5) {
      return
    }

    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleNext = () => {
    setCurrentStep(prev => prev + 1)
  }

  const updateBookingData = (data: Partial<BookingData>) => {
    const newData = { ...bookingData, ...data }
    setBookingData(newData)
    
    // Actualizar el resumen en el componente padre
    if (onDetailsChange) {
      onDetailsChange({
        service: newData.service ? { name: newData.service.name } : undefined,
        professional: newData.professional ? { name: newData.professional.name } : undefined,
        date: newData.date || undefined,
        time: newData.time || undefined
      })
    }
  }

  return (
    <>
      <div className="max-w-4xl mx-auto px-2 sm:px-6 lg:px-8">
      {/* Stepper Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <React.Fragment key={step.id}>
              {/* Step Circle */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${index < currentStep
                      ? 'bg-primary-600 text-white'
                      : index === currentStep
                        ? 'bg-primary-100 text-primary-600 border-2 border-primary-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                >
                  {index + 1}
                </div>
                <span className="mt-2 hidden sm:block text-sm font-medium text-gray-600 text-center">
                  {step.title}
                </span>
              </div>
              {/* Connector Line */}
              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-3 ${index < currentStep ? 'bg-primary-600' : 'bg-gray-200'}`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="mt-8 p-2 sm:p-6 bg-white rounded-lg shadow">
        <div className="min-h-[400px]">
          {currentStep === 0 && (
            <ServiceSelection
              selectedService={bookingData.service}
              onSelect={(service) => {
                updateBookingData({ service })
                handleNext()
              }}
              userId={userId}
            />
          )}
          {currentStep === 1 && bookingData.service && (
            <ProfessionalSelection
              selectedService={bookingData.service}
              selectedProfessional={bookingData.professional}
              onSelect={(professional) => {
                updateBookingData({ professional })
                handleNext()
              }}
              userId={userId}
            />
          )}
          {currentStep === 2 && bookingData.service && bookingData.professional && (
            <DateTimeSelection
              selectedService={bookingData.service}
              selectedProfessional={bookingData.professional}
              selectedDate={bookingData.date}
              selectedTime={bookingData.time}
              onSelect={(date, time) => {
                const handleDateTimeSelect = () => {
                  updateBookingData({ date, time })
                  handleNext()
                }
                handleDateTimeSelect()
              }}
              userId={userId}
            />
          )}
          {currentStep === 3 && bookingData.service && bookingData.professional && bookingData.date && bookingData.time && (
            <ClientDataForm
              selectedService={bookingData.service}
              selectedProfessional={bookingData.professional}
              selectedDate={bookingData.date}
              selectedTime={bookingData.time}
              onSubmit={(data: ClientFormData) => {
                const { name, email, phone, notes } = data
                updateBookingData({ 
                  clientData: {
                    name,
                    email,
                    phone,
                    notes
                  } 
                })
                handleNext()
              }}  
            />
          )}
          {currentStep === 4 && bookingData.service && bookingData.professional && bookingData.date && bookingData.time && bookingData.clientData && (
            <BookingSummary
              service={bookingData.service!}
              professional={bookingData.professional!}
              date={bookingData.date!}
              time={bookingData.time!}
              clientData={bookingData.clientData!}
              onConfirm={async () => {
                // Ya validamos que todos los datos existen en la condición del render
                try {
                  const { success, error } = await createBooking({
                    service_id: bookingData.service?.id || '',
                    professional_id: bookingData.professional?.id || '',
                    client_name: bookingData.clientData?.name || '',
                    client_email: bookingData.clientData?.email || '',
                    client_phone: bookingData.clientData?.phone || null,
                    notes: bookingData.clientData?.notes || null,
                    date: bookingData.date || new Date(),
                    time: bookingData.time || '',
                    status: 'pending',
                    user_id: userId
                  })

                  if (!success) {
                    throw new Error(error)
                  }

                  handleNext() // Avanzar al paso de éxito
                  onComplete(bookingData) // Notificar que la reserva se completó
                } catch (error) {
                  console.error('Error al crear la reserva:', error)
                  toast.error('Error al crear la reserva. Por favor intenta nuevamente.')
                } finally {
                  setIsSubmitting(false)
                }
              }}
              isSubmitting={isSubmitting}
            />
          )}
          {currentStep === 5 && (
            <BookingSuccess
              onNewBooking={resetForm}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between gap-4">
          {currentStep !== 5 && (
            <button
              onClick={currentStep === 0 ? handleCancel : handleBack}
              disabled={isSubmitting}
              className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {currentStep === 0 ? 'Cancelar' : 'Anterior'}
            </button>
          )}
          {(currentStep !== 3 && currentStep !== 4 && currentStep !== 5) && ( // No mostrar el botón en el paso del formulario de cliente, resumen ni éxito
            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className="ml-auto px-3 sm:px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center whitespace-nowrap"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {currentStep === STEPS.length - 1 ? 'Confirmar Reserva' : 'Siguiente'}
            </button>
          )}
        </div>
      </div>
    </div>

    {/* Modal de confirmación para cancelar */}
    <ConfirmationModal
      isOpen={showCancelConfirm}
      onClose={() => setShowCancelConfirm(false)}
      onConfirm={() => {
        setShowCancelConfirm(false)
        resetForm()
      }}
      title="Cancelar Reserva"
      message="¿Estás seguro que deseas cancelar la reserva? Se perderán todos los datos ingresados."
      confirmText="Sí, Cancelar"
      cancelText="No, Continuar"
      confirmVariant="danger"
    />
  </>
  )
}

export default BookingStepper
