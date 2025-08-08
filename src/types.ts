export interface Professional {
  id: string
  name: string
  email: string
  phone?: string
  specialties: string[]
  hourly_rate: number
  available: boolean
  user_id: string
  created_at?: string
  updated_at?: string
  // Campos opcionales para compatibilidad con la base de datos
  is_public?: boolean
}

export interface Service {
  id: string
  name: string
  description?: string
  duration: number
  price: number
  user_id: string
  created_at: string
  updated_at: string
  active: boolean
}

export interface Client {
  id: string
  name: string
  email: string
  phone?: string
  address?: string  
  created_at: string
  updated_at: string
}

export interface Reservation {
  id: string
  client_id: string
  professional_id: string
  service_id: string
  user_id: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  created_at: string
  updated_at: string
  clients?: Client
  professionals?: Professional
  services?: Service
  start_time: string
  end_time: string
  total_amount: number
  notes?: string
}

export interface Schedule {
  id: string
  professional_id: string
  user_id: string
  day_of_week: number
  start_time: string
  end_time: string
  created_at: string
  updated_at: string
}

export interface Block {
  id: string
  professional_id: string
  user_id: string
  start_date: string
  end_date: string
  reason?: string
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  user_id: string
  business_name: string
  business_email?: string
  business_phone?: string
  business_address?: string
  tax_id?: string
  plan: 'free' | 'basic' | 'premium' | 'enterprise'
  created_at: string
  updated_at: string
}
