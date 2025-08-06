import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../contexts/AuthContext'
import { Professional } from '../types'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Button from '../components/ui/Button'
import { IconSearch, IconDownload, IconPlus, IconUsers, IconEdit, IconTrash } from '../components/ui/Icons'
import toast from 'react-hot-toast'
import ConfirmationModal from '../components/ui/ConfirmationModal'

const Professionals: React.FC = () => {
  const { user } = useAuthContext()
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [filteredProfessionals, setFilteredProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      fetchProfessionals()
    }
  }, [user])

  useEffect(() => {
    // Filter clients based on search term
    const filtered = professionals.filter(professional =>
      professional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professional.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (professional.phone && professional.phone.includes(searchTerm))
    )
    setFilteredProfessionals(filtered)
  }, [professionals, searchTerm])

  const fetchProfessionals = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProfessionals(data || [])
    } catch (error) {
      console.error('Error fetching professionals:', error)
      toast.error('Error al cargar los profesionales')
    } finally {
      setLoading(false)
    }
  }

  const handleNewProfessional = () => {
    navigate('/app/professionals/new')
  }

  const handleEditProfessional = (professional: Professional) => {
    navigate(`/app/professionals/${professional.id}`)
  }

  const handleDeleteProfessional = (professionalId: string) => {
    if (!user) return
    setProfessionalToDelete(professionalId)
    setShowDeleteConfirmation(true)
  }

  const confirmDeleteProfessional = async () => {
    if (!user || !professionalToDelete) return

    try {
      const { error } = await supabase
        .from('professionals')
        .delete()
        .eq('id', professionalToDelete)

      if (error) throw error


      toast.success('Profesional eliminado exitosamente')
      await fetchProfessionals()

    } catch (error) {
      console.error('Error deleting professional:', error)
      toast.error('Error al eliminar el profesional')
    }
  }

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [professionalToDelete, setProfessionalToDelete] = useState<string | null>(null)

  const handleExportToCSV = () => {
    if (!user) return

    if (professionals.length === 0) {
      toast.error('No hay datos para exportar')
      return
    }

    const headers = ['Nombre', 'Email', 'Teléfono', 'Especialidades', 'Tarifa por hora', 'Disponibilidad', 'Fecha de Registro']
    const csvContent = [
      headers.join(','),
      ...professionals.map(professional => [
        `"${professional.name}"`,
        `"${professional.email}"`,
        `"${professional.phone || ''}"`,
        `"${professional.specialties.join(', ')}"`,
        `"${professional.hourly_rate.toFixed(2)}"`,
        `"${professional.available ? 'Disponible' : 'No disponible'}"`,
        `"${new Date(professional.created_at).toLocaleDateString()}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', 'profesionales.csv')
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    toast.success('Datos exportados exitosamente')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full max-w-2xl">
          <IconSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar clientes por nombre, email o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleExportToCSV}
            disabled={professionals.length === 0}
          >
            <IconDownload className="h-5 w-5" />
            Exportar CSV
          </Button>
          <Button onClick={handleNewProfessional}>
            <IconPlus className="h-5 w-5" />
            Nuevo Profesional
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-primary-100 p-3 rounded-lg">
              <IconUsers className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Profesionales</p>
              <p className="text-2xl font-bold text-gray-900">{professionals.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <IconUsers className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Nuevos este mes</p>
              <p className="text-2xl font-bold text-gray-900">
                {professionals.filter(p => new Date(p.created_at).getMonth() === new Date().getMonth()).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <IconSearch className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resultados</p>
              <p className="text-2xl font-bold text-gray-900">{filteredProfessionals.length}</p>
            </div>  
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Lista de Profesionales</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profesional
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Especialidades
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarifa por hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Disponibilidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de Registro
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProfessionals.map((professional) => (
                <tr key={professional.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 bg-primary-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {professional.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {professional.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{professional.email}</div>
                    <div className="text-sm text-gray-500">{professional.phone || 'Sin teléfono'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {professional.specialties.map((specialty, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {specialty}
                        </span>
                      ))}
                      {professional.specialties.length === 0 && (
                        <span className="text-sm text-gray-500">Sin especialidades</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${professional.hourly_rate.toFixed(2)}/hora
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${professional.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {professional.available ? 'Disponible' : 'No disponible'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(professional.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">

                      <button
                        onClick={() => handleEditProfessional(professional)}
                        className="text-primary-600 hover:text-primary-900"
                        title="Editar profesional"
                      >
                        <IconEdit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProfessional(professional.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar profesional"
                      >
                        <IconTrash className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProfessionals.length === 0 && (
            <div className="text-center py-12">
              <IconUsers className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm ? 'No se encontraron profesionales' : 'No hay profesionales'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Comienza agregando tu primer profesional.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => {
          setShowDeleteConfirmation(false)
          setProfessionalToDelete(null)
        }}
        onConfirm={() => {
          confirmDeleteProfessional()
          setShowDeleteConfirmation(false)
        }}
        title="Eliminar Profesional"
        message="¿Estás seguro de que quieres eliminar este profesional? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmVariant="danger"
      />
    </div>
  )
}

export default Professionals