export interface User {
  id: string
  email: string
  name: string
  company_name?: string
  phone?: string
  address?: string
  website?: string
  logo_url?: string
  min_booking_hours?: number
  min_cancel_hours?: number
  subscription_plan?: 'free' | 'basic' | 'premium' | 'enterprise'
  subscription_start?: string
  subscription_end?: string
  created_at?: string
  updated_at?: string
}

export interface Client {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface Professional {
  id: string
  name: string
  email: string
  phone?: string
  specialties: string[]
  avatar_url?: string
  hourly_rate: number
  available: boolean
  is_public: boolean
  user_id: string
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  name: string
  description?: string
  duration: number
  price: number
  category?: string
  active: boolean
  is_public: boolean
  user_id: string
  created_at: string
  updated_at: string
}

export interface Reservation {
  id: string
  client_id: string
  professional_id: string
  service_id: string
  start_time: string
  end_time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes?: string
  total_amount: number
  user_id: string
  created_at: string
  updated_at: string
  clients?: Client
  professionals?: Professional
  services?: Service
}

export interface ProfessionalService {
  id: string
  professional_id: string
  service_id: string
  created_at: string
}

export interface DashboardStats {
  todayRevenue: number
  monthlyRevenue: number
  totalRevenue: number
  totalReservations: number
  completedReservations: number
  activeClients: number
  averageRevenue: number
  totalRevenueChange: number
  pendingChange: number
  completedChange: number
  averageRevenueChange: number
  activeClientsChange: number
  conversionRate: number
  conversionRateChange: number
}