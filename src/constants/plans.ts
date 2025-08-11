// src/constants/plans.ts

export type PlanCode = 'free' | 'basic' | 'premium' | 'enterprise'

export const PLAN_LIMITS: Record<PlanCode, number> = {
  free: 1,
  basic: 5,
  premium: 10,
  enterprise: Number.POSITIVE_INFINITY,
}

export const PLAN_LABELS: Record<PlanCode, string> = {
  free: 'Free',
  basic: 'Basic',
  premium: 'Premium',
  enterprise: 'Enterprise',
}

export interface PlanFeature {
  text: string
}

export interface PricingPlan {
  name: string
  price: string
  features: PlanFeature[]
  planId: PlanCode
  isPopular?: boolean
  buttonText: string
  buttonVariant?: 'primary' | 'outline' | 'secondary' | 'ghost' | 'danger'
}

export const defaultPlans: PricingPlan[] = [
  {
    name: 'Gratis',
    price: '0',
    planId: 'free',
    buttonText: 'Comenzar Gratis',
    buttonVariant: 'outline',
    features: [
      { text: 'Hasta 1 profesional' },
      { text: 'Calendario básico' },
      { text: 'Gestión de clientes' },
      { text: 'Notificaciones por email' },
    ],
  },
  {
    name: 'Medio',
    price: '10.000',
    planId: 'basic',
    isPopular: true,
    buttonText: 'Prueba 30 días gratis',
    buttonVariant: 'outline',
    features: [
      { text: 'Hasta 5 profesionales' },
      { text: 'Calendario avanzado' },
      { text: 'Gestión de clientes' },
      { text: 'Notificaciones por email' },
      { text: 'Reportes básicos' },
    ],
  },
  {
    name: 'Pro',
    price: '25.000',
    planId: 'premium',
    buttonText: 'Prueba 30 días gratis',
    buttonVariant: 'outline',
    features: [
      { text: 'Hasta 10 profesionales' },
      { text: 'Calendario premium' },
      { text: 'Gestión de clientes' },
      { text: 'Notificaciones por email' },
      { text: 'Reportes avanzados' },
    ],
  },
]
