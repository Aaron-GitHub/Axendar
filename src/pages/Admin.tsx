import React from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  Palette,
  Users,
  KeyRound,
  Bell,
  Share2,
  ClipboardList,
  Link as LinkIcon,
  DollarSign
} from 'lucide-react'

interface AdminCardProps {
  title: string
  description: string
  icon: React.ElementType
  href?: string
  comingSoon?: boolean
}

const AdminCard: React.FC<AdminCardProps> = ({ title, description, icon: Icon, href, comingSoon }) => {
  const content = (
    <div className={`relative group bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-primary-500 transition-colors ${
      comingSoon ? 'opacity-75' : ''
    }`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className="h-8 w-8 text-primary-600" />
        </div>
        <div className="ml-5">
          <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
            {title}
            {comingSoon && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Próximamente
              </span>
            )}
          </h3>
          <p className="mt-2 text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  )

  if (comingSoon) {
    return content
  }

  return href ? (
    <Link to={href} className="block">
      {content}
    </Link>
  ) : (
    content
  )
}

const Admin: React.FC = () => {
  const adminCards = [
    {
      title: 'Datos de Empresa',
      description: 'Configura el nombre, logo y datos fiscales de tu negocio.',
      icon: Building2,
      href: '/app/admin/profile',
      comingSoon: false
    },
    {
      title: 'URL de Reservas',
      description: 'Configura e integra el sistema de reservas en tu sitio web.',
      icon: LinkIcon,
      href: '/app/admin/booking-url'
    },
    {
      title: 'Datos de Financieros',
      description: 'Obtén informes financieros y estadísticas de tu negocio.',
      icon: DollarSign,
      comingSoon: true
    },
    {
      title: 'Personalización',
      description: 'Ajusta los colores y el estilo visual de tu sistema.',
      icon: Palette,
      comingSoon: true
    },
    
    {
      title: 'Usuarios y Roles',
      description: 'Gestiona los permisos y accesos de tu equipo.',
      icon: Users,
      comingSoon: true
    },
    {
      title: 'Seguridad',
      description: 'Configura opciones de seguridad y autenticación.',
      icon: KeyRound,
      comingSoon: true
    },
    {
      title: 'Notificaciones',
      description: 'Personaliza las notificaciones y correos del sistema.',
      icon: Bell,
      comingSoon: true
    },
    {
      title: 'Integraciones',
      description: 'Conecta con Google Calendar, Zapier y otros servicios.',
      icon: Share2,
      comingSoon: true
    },
    {
      title: 'Logs y Auditoría',
      description: 'Revisa el historial de actividad del sistema.',
      icon: ClipboardList,
      comingSoon: true
    }
  ]

  return (
    <div className="space-y-6">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {adminCards.map((card) => (
            <AdminCard key={card.title} {...card} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Admin