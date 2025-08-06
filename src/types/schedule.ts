export interface ProfessionalSchedule {
  id: string
  professional_id: string
  user_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_working: boolean
  created_at: string
  updated_at: string
}

export interface ProfessionalBlock {
  id: string
  professional_id: string
  user_id: string
  start_date: string
  end_date: string
  reason?: string
  created_at: string
  updated_at: string
}

export interface DaySchedule {
  dayName: string
  dayNumber: number
  schedules: ProfessionalSchedule[]
}

export const DAYS_OF_WEEK: DaySchedule[] = [
  { dayName: 'Domingo', dayNumber: 0, schedules: [] },
  { dayName: 'Lunes', dayNumber: 1, schedules: [] },
  { dayName: 'Martes', dayNumber: 2, schedules: [] },
  { dayName: 'Miércoles', dayNumber: 3, schedules: [] },
  { dayName: 'Jueves', dayNumber: 4, schedules: [] },
  { dayName: 'Viernes', dayNumber: 5, schedules: [] },
  { dayName: 'Sábado', dayNumber: 6, schedules: [] }
]
