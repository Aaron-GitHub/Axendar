import React, { useState, useEffect } from 'react'
import { Professional, Service } from '../../types'
import { Calendar, Loader2 } from 'lucide-react'
import moment from 'moment'
import 'moment/locale/es'
import { getAvailableTimeSlots } from '../../services/bookingService'

interface DateTimeSelectionProps {
  selectedService: Service
  selectedProfessional: Professional
  selectedDate: Date | null
  selectedTime: string | null
  onSelect: (date: Date, time: string) => void
  userId: string
}

const DateTimeSelection: React.FC<DateTimeSelectionProps> = ({
  selectedService,
  selectedProfessional,
  selectedDate: initialDate,
  selectedTime: initialTime,
  onSelect,
  userId,
}) => {
  const [currentMonth, setCurrentMonth] = useState(moment())
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate)
  const [selectedTime, setSelectedTime] = useState<string | null>(initialTime)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  
  // Carga los horarios disponibles cuando se selecciona una fecha
  useEffect(() => {
    const loadAvailableSlots = async () => {
      if (!selectedDate) {
        setAvailableSlots([])
        return
      }

      setLoading(true)
      setError(null)

      try {
        const result = await getAvailableTimeSlots(
          selectedProfessional.id,
          selectedDate,
          selectedService.id,
          userId
        )

        if (!result.success) {
          throw new Error(result.error)
        }

        setAvailableSlots(result.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar horarios disponibles')
        setAvailableSlots([])
      } finally {
        setLoading(false)
      }
    }

    loadAvailableSlots()
  }, [selectedDate, selectedProfessional.id, selectedService.id])
  
  // Genera las fechas del mes actual
  const getDaysInMonth = () => {
    const days = []
    const startDate = moment(currentMonth).startOf('month')
    const endDate = moment(currentMonth).endOf('month')
    
    // Añadir días del mes anterior para completar la primera semana
    const firstDay = moment(startDate)
    const daysFromPrevMonth = firstDay.day()
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      days.push(moment(startDate).subtract(i + 1, 'days'))
    }
    
    // Añadir todos los días del mes actual
    for (let i = 0; i < endDate.date(); i++) {
      days.push(moment(startDate).add(i, 'days'))
    }
    
    // Añadir días del mes siguiente para completar la última semana
    const lastDay = moment(endDate)
    const daysFromNextMonth = 6 - lastDay.day()
    for (let i = 1; i <= daysFromNextMonth; i++) {
      days.push(moment(endDate).add(i, 'days'))
    }
    
    return days
  }

  const isDateDisabled = (date: moment.Moment) => {
    // Deshabilitar fechas pasadas y fines de semana
    return date.isBefore(moment(), 'day') || 
           date.day() === 0 || 
           date.day() === 6
  }

  const handleDateSelect = (date: moment.Moment) => {
    if (!isDateDisabled(date)) {
      // Solo actualizar la fecha seleccionada internamente
      setSelectedDate(date.toDate())
    }
  }

  const handleTimeSelect = (time: string) => {
    if (selectedDate) {
      // Actualizar el tiempo seleccionado y avanzar al siguiente paso
      setSelectedTime(time)
      onSelect(selectedDate, time)
    }
  }

  const handlePrevMonth = () => {
    setCurrentMonth(prev => moment(prev).subtract(1, 'month'))
  }

  const handleNextMonth = () => {
    setCurrentMonth(prev => moment(prev).add(1, 'month'))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Selecciona fecha y hora
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Para: <span className="font-medium">{selectedService.name}</span> con{' '}
          <span className="font-medium">{selectedProfessional.name}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendario */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              &lt;
            </button>
            <h3 className="text-lg font-medium text-gray-900">
              {currentMonth.format('MMMM YYYY')}
            </h3>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              &gt;
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {/* Días de la semana */}
            {moment.weekdaysMin(true).map(day => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-600 py-2"
              >
                {day}
              </div>
            ))}

            {/* Días del mes */}
            {getDaysInMonth().map((date, index) => {
              const isDisabled = isDateDisabled(date)
              const isSelected = selectedDate && moment(selectedDate).isSame(date, 'day')
              const isCurrentMonth = date.month() === currentMonth.month()

              return (
                <button
                  key={index}
                  onClick={() => handleDateSelect(date)}
                  disabled={isDisabled}
                  className={`
                    p-2 text-sm rounded-lg
                    ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-primary-50'}
                    ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-700'}
                    ${isSelected ? 'bg-primary-100 text-primary-700 font-medium' : ''}
                  `}
                >
                  {date.date()}
                </button>
              )
            })}
          </div>
        </div>

        {/* Horarios disponibles */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Horarios disponibles</h3>
          {selectedDate ? (
            <div className="grid grid-cols-3 gap-2">
              {loading ? (
                <div className="col-span-3 flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                </div>
              ) : error ? (
                <div className="col-span-3 text-center text-red-600 py-12">
                  {error}
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="col-span-3 text-center text-gray-500 py-12">
                  <p>No hay horarios disponibles para este día</p>
                  <p className="text-sm mt-2">Por favor selecciona otra fecha</p>
                </div>
              ) : (
                availableSlots.map(time => {
                  const isSelected = time === selectedTime

                  return (
                    <button
                      key={time}
                      onClick={() => handleTimeSelect(time)}
                      className={`
                        p-2 text-sm rounded-lg border
                        ${isSelected
                          ? 'bg-primary-100 border-primary-600 text-primary-700'
                          : 'border-gray-200 hover:border-primary-200 hover:bg-primary-50'
                        }
                      `}
                    >
                      {time}
                    </button>
                  )
                })
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
              <div className="text-center text-gray-500">
                <Calendar className="mx-auto h-8 w-8" />
                <p className="mt-2">Selecciona una fecha para ver los horarios disponibles</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DateTimeSelection
