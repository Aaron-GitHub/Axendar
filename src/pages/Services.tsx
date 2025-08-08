import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../contexts/AuthContext'
import { Service } from '../types'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ServiceForm from '../components/services/ServiceForm'
import { IconDownload, IconPlus, IconService, IconEdit, IconTrash, IconSearch } from '../components/ui/Icons'
import { DataTable } from '../components/ui/DataTable'
import { ColumnDef } from '@tanstack/react-table'
import toast from 'react-hot-toast'
import ConfirmationModal from '../components/ui/ConfirmationModal'

const Services = () => {
  const { user } = useAuthContext()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null)

  // Definición de columnas para la tabla
  const columns = useMemo<ColumnDef<Service>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Servicio',
        cell: ({ row }) => (
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10">
              <div className="h-10 w-10 bg-primary-500 rounded-full flex items-center justify-center">
                <IconService className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <div className="font-medium text-gray-900">{row.original.name}</div>
              <div className="text-sm text-gray-500 max-w-xs truncate">
                {row.original.description || 'Sin descripción'}
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'duration',
        header: 'Duración',
        cell: ({ row }) => (
          <div className="text-sm text-gray-900">
            {row.original.duration || 'Sin duración'}
          </div>
        ),
      },
      {
        accessorKey: 'price',
        header: 'Precio',
        cell: ({ row }) => (
          <div className="text-sm text-gray-900">
            ${row.original.price?.toLocaleString('es-CL') || 'Sin precio'}
          </div>
        ),
      },
      {
        accessorKey: 'created_at',
        header: 'Fecha de registro',
        cell: ({ row }) => (
          <div className="text-sm text-gray-500">
            {formatDate(row.original.created_at)}
          </div>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={() => handleEditService(row.original)}
              className="text-primary-600 hover:text-primary-900"
            >
              <IconEdit className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleDeleteService(row.original.id)}
              className="text-red-600 hover:text-red-900"
            >
              <IconTrash className="h-5 w-5" />
            </button>
          </div>
        ),
      },
    ],
    []
  )

  // Ref para controlar la carga inicial
  const initialLoadRef = useRef(false)

  // Efecto único para manejar carga inicial y suscripción
  useEffect(() => {
    if (!user?.id) return

    // Carga inicial solo una vez
    if (!initialLoadRef.current) {
      initialLoadRef.current = true
      fetchServices()
    }

    // Configurar suscripción en tiempo real
    const subscription = supabase
      .channel('services_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'services',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchServices()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user?.id])

  
  const formatDate = useCallback((date: string | undefined | null) => {
    if (!date) return 'N/A'
    try {
      const dateObj = new Date(date)
      if (isNaN(dateObj.getTime())) return 'N/A'
      return dateObj.toLocaleDateString('es-CL')
    } catch {
      return 'N/A'
    }
  }, [])

  const fetchServices = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setServices(data || [])
    } catch (error) {
      console.error('Error fetching services:', error)
      toast.error('Error al cargar los servicios')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleNewService = () => {
    setEditingService(null)
    setIsFormModalOpen(true)
  }

  const handleEditService = (service: Service) => {
    setEditingService(service)
    setIsFormModalOpen(true)
  }

  const handleDeleteService = (serviceId: string) => {
    setServiceToDelete(serviceId)
    setShowDeleteConfirmation(true)
  }

  const confirmDeleteService = async () => {
    if (!serviceToDelete) return

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceToDelete)

      if (error) throw error

      setServices(prev => prev.filter(s => s.id !== serviceToDelete))
      toast.success('Servicio eliminado exitosamente')
    } catch (error) {
      console.error('Error deleting service:', error)
      toast.error('Error al eliminar el servicio')
    }
  }

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

  const handleFormSubmit = async () => {
    try {
      setIsSubmitting(true)
      await fetchServices()
      setIsFormModalOpen(false)
      setEditingService(null)
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('Error al guardar el servicio')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExportToCSV = () => {
    if (services.length === 0) {
      toast.error('No hay datos para exportar')
      return
    }

    const headers = ['Nombre', 'Descripción', 'Duración', 'Precio', 'Activo']
    const csvContent = [
      headers.join(','),
      ...services.map(service => [
        `"${service.name}"`,
        `"${service.description}"`,
        `"${service.duration || ''}"`,
        `"${service.price || ''}"`,
        `"${service.active || ''}"`,
        `"${formatDate(service.created_at)}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', 'servicios.csv')
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
     
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <IconService className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Activos</p>
              <p className="text-2xl font-bold text-gray-900">
                {services.filter((s) => s.active).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <IconService className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Nuevos este mes</p>
              <p className="text-2xl font-bold text-gray-900">
                {services.filter((s) => new Date(s.created_at).getMonth() === new Date().getMonth()).length}
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
              <p className="text-sm font-medium text-gray-600">Disponibles</p>
              <p className="text-2xl font-bold text-gray-900">
                {services.filter(p => p.active).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex justify-end space-x-2">
        <Button
          onClick={handleExportToCSV}
          variant="outline"
          className="w-full sm:w-auto"
          disabled={services.length === 0}
        >
          <IconDownload className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
        <Button
          onClick={handleNewService}
          variant="primary"
          className="w-full sm:w-auto"
        >
          <IconPlus className="h-4 w-4 mr-2" />
          Nuevo Servicio
        </Button>
      </div>

      {/* Services Table */}
      <div className="p-6">
        {services.length === 0 ? (
          <div className="text-center py-12">
            <IconService className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No hay servicios
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza agregando tu primer servicio.
            </p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={services}
            pageSize={10}
            enableRowSelection={false}
            enableMultiRowSelection={false}
          />
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => !isSubmitting && setIsFormModalOpen(false)}
        title={editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
        size="md"
      >
        <ServiceForm
          service={editingService}
          onSubmit={handleFormSubmit}
          onCancel={() => !isSubmitting && setIsFormModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => {
          setShowDeleteConfirmation(false)
          setServiceToDelete(null)
        }}
        onConfirm={() => {
          confirmDeleteService()
          setShowDeleteConfirmation(false)
        }}
        title="Eliminar Servicio"
        message="¿Estás seguro de que quieres eliminar este servicio? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmVariant="danger"
      /> 
    </div>
  )
}

export default Services