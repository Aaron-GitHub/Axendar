import React, { useState, useEffect, useMemo } from 'react'
import { Professional, Service } from '../../types'
import { ProfessionalSchedule } from '../../types/schedule'
import { Calendar, Loader2 } from 'lucide-react'
import moment from 'moment'
import 'moment/locale/es'
import { getAvailableTimeSlots } from '../../services/bookingService'
import { supabaseAdmin } from '../../lib/supabase'
import { hexToRgba } from '../../utils/color'

// Forzar el locale a español globalmente
moment.locale('es')

// Forzar el locale a español
if (moment.locale() !== 'es') {
  moment.locale('es')
}

interface DateTimeSelectionProps {
  selectedService: Service
  selectedProfessional: Professional
  selectedDate: Date | null
  selectedTime: string | null
  onSelect: (date: Date, time: string) => void
  userId: string
  profile_color: string
}

const dayTranslations: { [key: string]: string } = {
  'lu': 'Lun',
  'ma': 'Mar',
  'mi': 'Mié',
  'ju': 'Jue',
  'vi': 'Vie',
  'sa': 'Sáb',
  'do': 'Dom'
}

const monthTranslations: { [key: string]: string } = {
  'january': 'Enero',
  'february': 'Febrero',
  'march': 'Marzo',
  'april': 'Abril',
  'may': 'Mayo',
  'june': 'Junio',
  'july': 'Julio',
  'august': 'Agosto',
  'september': 'Septiembre',
  'october': 'Octubre',
  'november': 'Noviembre',
  'december': 'Diciembre'
}

const formatMonth = (date: moment.Moment) => {
  const month = date.format('MMMM').toLowerCase()
  return monthTranslations[month] || month.charAt(0).toUpperCase() + month.slice(1)
}

const getLocalizedWeekdays = () => {
  const weekDays = ['lu', 'ma', 'mi', 'ju', 'vi', 'sa', 'do']
  return weekDays.map(day => dayTranslations[day] || day.toUpperCase())
}

const DateTimeSelection: React.FC<DateTimeSelectionProps> = ({
  selectedService,
  selectedProfessional,
  selectedDate: initialDate,
  selectedTime: initialTime,
  onSelect,
  userId,
  profile_color,
}) => {
  const [currentMonth, setCurrentMonth] = useState(moment().locale('es'))
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate)
  const [selectedTime, setSelectedTime] = useState<string | null>(initialTime)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [hoveredTime, setHoveredTime] = useState<string | null>(null)

  // Memorizar los días de la semana para evitar recálculos
  const localizedWeekDays = useMemo(() => getLocalizedWeekdays(), [])

  // Asegurar que el locale esté en español y actualizar el mes actual
  useEffect(() => {
    moment.locale('es')
    setCurrentMonth(moment().locale('es'))
  }, [])

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
          selectedProfessional.user_id
        )

        if (!result.success) {
          console.error('Error fetching time slots:', result)
          return
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
    const daysFromPrevMonth = firstDay.day() === 0 ? 6 : firstDay.day() - 1
    for (let i = daysFromPrevMonth; i > 0; i--) {
      days.push(moment(startDate).subtract(i + 1, 'days'))
    }
    
    // Añadir todos los días del mes actual
    for (let i = 0; i < endDate.date(); i++) {
      days.push(moment(startDate).add(i, 'days'))
    }
    
    // Añadir días del mes siguiente para completar la última semana
    const lastDay = moment(endDate)
    const daysFromNextMonth = lastDay.day() === 0 ? 0 : 7 - lastDay.day()
    for (let i = 1; i <= daysFromNextMonth; i++) {
      days.push(moment(endDate).add(i, 'days'))
    }
    
    return days
  }

  // Verificar si el profesional tiene horario para un día específico
  const [professionalSchedules, setProfessionalSchedules] = useState<ProfessionalSchedule[]>([])

  // Cargar los horarios del profesional
  useEffect(() => {
    const loadProfessionalSchedules = async () => {
      const { data: schedules, error } = await supabaseAdmin
        .from('professional_schedules')
        .select('*')
        .eq('professional_id', selectedProfessional.id)
        .eq('is_working', true)

      if (!error && schedules) {
        setProfessionalSchedules(schedules)
      }
    }

    loadProfessionalSchedules()
  }, [selectedProfessional.id])

  const isDateDisabled = (date: moment.Moment) => {
    // Deshabilitar fechas pasadas
    if (date.isBefore(moment(), 'day')) {
      return true
    }

    // Obtener el día de la semana (0-6, donde 0 es domingo)
    const dayOfWeek = date.day()

    // Verificar si hay algún horario configurado para este día
    const hasSchedule = professionalSchedules.some(
      schedule => schedule.day_of_week === dayOfWeek
    )

    // Deshabilitar el día si no hay horario configurado
    return !hasSchedule
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
    setCurrentMonth(prev => moment(prev).subtract(1, 'month').locale('es'))
  }

  const handleNextMonth = () => {
    setCurrentMonth(prev => moment(prev).add(1, 'month').locale('es'))
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
        <div className="space-y-4 shadow-md rounded-lg p-2">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              &lt;
            </button>
            <h3 className="text-lg font-medium text-gray-900">
              {`${formatMonth(currentMonth)} ${currentMonth.format('YYYY')}`}
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
            {localizedWeekDays.map(day => (
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
                  className={`p-2 text-sm rounded-lg ${isDisabled ? 'text-gray-300 cursor-not-allowed' : ''} ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-900'}`}
                  style={
                    isDisabled
                      ? { backgroundColor: 'rgba(255,0,0,0.05)' }
                      : isSelected
                        ? { backgroundColor: hexToRgba(profile_color, 0.15), color: profile_color, fontWeight: 600 as any }
                        : undefined
                  }
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
                      className={`p-2 text-sm rounded-lg border transition-colors`}
                      onMouseEnter={() => setHoveredTime(time)}
                      onMouseLeave={() => setHoveredTime(null)}
                      style={(() => {
                        if (isSelected) {
                          return { backgroundColor: hexToRgba(profile_color, 0.15), borderColor: profile_color, color: profile_color, fontWeight: 500 }
                        }
                        if (hoveredTime === time) {
                          return { borderColor: profile_color }
                        }
                        return { borderColor: '#e5e7eb' }
                      })()}
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
