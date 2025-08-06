import React from 'react'
import { Link, Copy, Code2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface BookingUrlSectionProps {
  userId: string
}

const BookingUrlSection: React.FC<BookingUrlSectionProps> = ({ userId }) => {
  const bookingUrl = `${window.location.origin}/reservar/${userId}`

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(bookingUrl)
    toast.success('URL copiada al portapapeles')
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Link className="h-6 w-6 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">URL de Reservas</h3>
        </div>
        <button 
          onClick={handleCopyUrl}
          className="flex items-center px-3 py-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors"
        >
          <Copy className="h-4 w-4 mr-1" />
          Copiar URL
        </button>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-md mb-4 font-mono text-sm break-all">
        {bookingUrl}
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-base font-medium text-gray-900 mb-2">Integración Simple</h4>
          <p className="text-gray-600 text-sm mb-2">Agrega este botón a tu sitio web para permitir reservas:</p>
          <div className="bg-gray-50 p-4 rounded-md font-mono text-sm whitespace-pre-wrap">
{`<a href="${bookingUrl}" 
   class="reservas-pro-button"
   style="display: inline-block;
          padding: 10px 20px;
          background-color: #338B85;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-family: system-ui, sans-serif;">
   Reservar Ahora
</a>`}
          </div>
        </div>

        <div>
          <h4 className="text-base font-medium text-gray-900 mb-2">Widget Incrustado</h4>
          <p className="text-gray-600 text-sm mb-2">O integra el formulario directamente en tu sitio:</p>
          <div className="bg-gray-50 p-4 rounded-md font-mono text-sm whitespace-pre-wrap">
{`<iframe src="${bookingUrl}"
        width="100%"
        height="700"
        frameborder="0"
        style="border-radius: 8px;">
</iframe>`}
          </div>
        </div>

        <div className="mt-4 flex items-center text-sm text-gray-500">
          <Code2 className="h-4 w-4 mr-2" />
          <span>Personaliza los estilos según tu sitio web</span>
        </div>
      </div>
    </div>
  )
}

export default BookingUrlSection
