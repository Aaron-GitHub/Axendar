// src/types/reservation.types.ts
export interface Reservation {
  id: string
  client_id: string
  professional_id: string
  service_id: string
  start_time: Date | string
  end_time: Date | string
  status: 'pending' | 'confirmed' | 'cancelled'
  notes?: string | null
  total_amount: number
  user_id: string
  date: Date | string
  clients: Client
  services: Service
  professionals: Professional
  client_name: string
  client_email: string
}


// src/types/reservation.types.ts
export interface ReservationWithBranding {
  id: string
  client_id: string
  professional_id: string
  service_id: string
  start_time: Date | string
  end_time: Date | string
  status: 'pending' | 'confirmed' | 'cancelled'
  notes?: string | null
  total_amount: number
  user_id: string
  date: Date | string
  clients: Client
  services: Service
  professionals: Professional
  client_name: string
  client_email: string
  branding: any
  profile: any
}


export interface Client {
  id: string
  name: string
  email: string
  phone?: string
  created_at: Date | string
  updated_at: Date | string
}

export interface Professional {
  id: string
  name: string
  email: string
  phone?: string
  location?: string
  user_id: string
  is_active: boolean
  created_at: Date | string
  updated_at: Date | string
}

export interface Service {
  id: string
  name: string
  description?: string
  duration: number
  price: number
  user_id: string
  is_active: boolean
  created_at: Date | string
  updated_at: Date | string
}
