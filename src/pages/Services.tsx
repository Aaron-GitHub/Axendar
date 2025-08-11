import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../contexts/AuthContext'
import { Service } from '../types'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ServiceForm from '../components/services/ServiceForm'
import { IconDownload, IconPlus, IconService, IconEdit, IconSearch } from '../components/ui/Icons'
import { DataTable } from '../components/ui/DataTable'
import { ColumnDef } from '@tanstack/react-table'
import { useIsLg } from '../hooks/useBreakpoint'
import toast from 'react-hot-toast'
import ConfirmationModal from '../components/ui/ConfirmationModal'

const Services = () => {
  const { user } = useAuthContext()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null)

  const isLg = useIsLg()
  // Definición de columnas para la tabla (responsive)
  const columns = useMemo<ColumnDef<Service>[]>(() => {
    const baseCols: ColumnDef<Service>[] = [
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
    ]

    const desktopOnly: ColumnDef<Service>[] = [
      {
        accessorKey: 'duration',
        header: 'Duración',
        cell: ({ row }) => (
          <div className="text-sm text-gray-900">{row.original.duration || 'Sin duración'}</div>
        ),
      },
      {
        accessorKey: 'price',
        header: 'Precio',
        cell: ({ row }) => (
          <div className="text-sm text-gray-900">${row.original.price?.toLocaleString('es-CL') || 'Sin precio'}</div>
        ),
      },
      {
        accessorKey: 'created_at',
        header: 'Fecha de registro',
        cell: ({ row }) => (
          <div className="text-sm text-gray-500">{formatDate(row.original.created_at)}</div>
        ),
      },
    ]

    const actionsCol: ColumnDef<Service> = {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="px-2 py-1">
          <div className={`flex items-center ${isLg ? 'justify-end space-x-2' : 'justify-end space-x-3'}`}>
            {isLg ? (
              <>
                <button
                  onClick={() => handleEditService(row.original)}
                  className="text-primary-600 hover:text-primary-900"
                  aria-label="Editar servicio"
                  title="Editar servicio"
                >
                  <IconEdit className="h-5 w-5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleEditService(row.original)}
                  className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-gray-300 bg-white text-primary-700 hover:bg-gray-50 active:bg-gray-100"
                  aria-label="Editar servicio"
                  title="Editar servicio"
                >
                  <IconEdit className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>
      ),
    }

    return isLg ? [...baseCols, ...desktopOnly, actionsCol] : [...baseCols, actionsCol]
  }, [isLg])

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

  /*const handleDeleteService = (serviceId: string) => {
    setServiceToDelete(serviceId)
    setShowDeleteConfirmation(true)
  }*/

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
      {/* Header compacto */}
      <div className="mb-2 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between gap-2">
          {/* Chips KPI */}
          <div className="-mx-1 flex-1 overflow-x-auto md:overflow-visible">
            <div className="px-1 inline-flex gap-2 min-w-max md:min-w-0 md:flex md:flex-wrap">
              <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2 py-1 shadow-sm">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-green-100">
                  <IconService className="h-3.5 w-3.5 text-green-600" />
                </span>
                <div className="leading-tight">
                  <p className="text-[10px] uppercase tracking-wide text-gray-500">Activos</p>
                  <p className="text-sm font-semibold text-gray-900">{services.filter(s => s.active).length}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2 py-1 shadow-sm">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-blue-100">
                  <IconService className="h-3.5 w-3.5 text-blue-600" />
                </span>
                <div className="leading-tight">
                  <p className="text-[10px] uppercase tracking-wide text-gray-500">Nuevos</p>
                  <p className="text-sm font-semibold text-gray-900">{services.filter(s => {
                    const d = new Date(s.created_at)
                    const now = new Date()
                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
                  }).length}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2 py-1 shadow-sm">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-blue-100">
                  <IconSearch className="h-3.5 w-3.5 text-blue-600" />
                </span>
                <div className="leading-tight">
                  <p className="text-[10px] uppercase tracking-wide text-gray-500">Disponibles</p>
                  <p className="text-sm font-semibold text-gray-900">{services.filter(p => p.active).length}</p>
                </div>
              </div>
            </div>
          </div>
          {/* Acciones */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={handleExportToCSV}
              variant="outline"
              className="text-xs md:text-sm gap-1 h-8 px-2"
              disabled={services.length === 0}
            >
              <IconDownload className="h-4 w-4" />
              Exportar CSV
            </Button>
            <Button
              onClick={handleNewService}
              variant="primary"
              className="text-xs md:text-sm gap-1 h-8 px-2"
            >
              <IconPlus className="h-4 w-4" />
              Nuevo Servicio
            </Button>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="">
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