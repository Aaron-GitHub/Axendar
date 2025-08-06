import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface PageHeaderProps {
  title: string
  subtitle?: string
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  const navigate = useNavigate()

  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate('/app/admin')}
        className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Volver a Administración
      </button>

      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        {subtitle && (
          <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
        )}
      </div>
    </div>
  )
}
