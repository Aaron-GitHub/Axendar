import { useState, useEffect } from 'react'
import { Clock, Plus, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../hooks/useToast'
import Button from '../ui/Button'
import { Professional } from '../../types'
import { DAYS_OF_WEEK, ProfessionalSchedule as Schedule } from '../../types/schedule'

interface ProfessionalScheduleProps {
  professional: Professional
}

export default function ProfessionalSchedule({ professional }: ProfessionalScheduleProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    fetchSchedules()
  }, [professional.id])

  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('professional_schedules')
        .select('*')
        .eq('professional_id', professional.id)
        .order('day_of_week')
        .order('start_time')

      if (error) throw error

      setSchedules(data || [])
    } catch (error) {
      console.error('Error fetching schedules:', error)
      showToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudieron cargar los horarios'
      })
    } finally {
      setLoading(false)
    }
  }

  const addSchedule = async (dayOfWeek: number) => {
    try {
      const newSchedule = {
        professional_id: professional.id,
        user_id: professional.user_id,
        day_of_week: dayOfWeek,
        start_time: '09:00',
        end_time: '17:00',
        is_working: true
      }

      const { data, error } = await supabase
        .from('professional_schedules')
        .insert(newSchedule)
        .select()
        .single()

      if (error) throw error

      setSchedules([...schedules, data])
      showToast({
        type: 'success',
        title: 'Horario agregado',
        message: 'Se agregó el nuevo horario correctamente'
      })
    } catch (error) {
      console.error('Error adding schedule:', error)
      showToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudo agregar el horario'
      })
    }
  }

  const updateSchedule = async (id: string, updates: Partial<Schedule>) => {
    try {
      const { error } = await supabase
        .from('professional_schedules')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      setSchedules(schedules.map(schedule => 
        schedule.id === id ? { ...schedule, ...updates } : schedule
      ))

      showToast({
        type: 'success',
        title: 'Horario actualizado',
        message: 'Se actualizó el horario correctamente'
      })
    } catch (error) {
      console.error('Error updating schedule:', error)
      showToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudo actualizar el horario'
      })
    }
  }

  const deleteSchedule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('professional_schedules')
        .delete()
        .eq('id', id)

      if (error) throw error

      setSchedules(schedules.filter(schedule => schedule.id !== id))
      showToast({
        type: 'success',
        title: 'Horario eliminado',
        message: 'Se eliminó el horario correctamente'
      })
    } catch (error) {
      console.error('Error deleting schedule:', error)
      showToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudo eliminar el horario'
      })
    }
  }

  if (loading) {
    return <div className="text-center">Cargando horarios...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Horarios Laborales</h3>
        <Clock className="h-5 w-5 text-gray-400" />
      </div>

      <div className="space-y-4">
        {DAYS_OF_WEEK.map(day => {
          const daySchedules = schedules.filter(s => s.day_of_week === day.dayNumber)
          
          return (
            <div key={day.dayNumber} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">{day.dayName}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addSchedule(day.dayNumber)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar horario
                </Button>
              </div>

              {daySchedules.length === 0 ? (
                <p className="text-sm text-gray-500">No hay horarios configurados</p>
              ) : (
                <div className="space-y-3">
                  {daySchedules.map(schedule => (
                    <div key={schedule.id} className="flex items-center gap-4">
                      <input
                        type="time"
                        value={schedule.start_time}
                        onChange={(e) => updateSchedule(schedule.id, { start_time: e.target.value })}
                        className="border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-gray-500">a</span>
                      <input
                        type="time"
                        value={schedule.end_time}
                        onChange={(e) => updateSchedule(schedule.id, { end_time: e.target.value })}
                        className="border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      />
                      <button
                        onClick={() => deleteSchedule(schedule.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
