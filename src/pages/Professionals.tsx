import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../contexts/AuthContext'
import { Professional } from '../types'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Button from '../components/ui/Button'
import { IconSearch, IconDownload, IconPlus, IconUsers, IconEdit, IconTrash } from '../components/ui/Icons'
import toast from 'react-hot-toast'
import ConfirmationModal from '../components/ui/ConfirmationModal'
import { DataTable } from '../components/ui/DataTable'
import { ColumnDef } from '@tanstack/react-table'

const Professionals = () => {
  // Definición de columnas para la tabla
  const columns = useMemo<ColumnDef<Professional>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Profesional',
        cell: ({ row }) => (
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10">
              <div className="h-10 w-10 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {row.original.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="ml-4">
              <div className="font-medium text-gray-900">{row.original.name}</div>
              <div className="text-sm text-gray-500">{row.original.email}</div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'Teléfono',
        cell: ({ row }) => (
          <div className="text-sm text-gray-900">
            {row.original.phone || 'Sin teléfono'}
          </div>
        ),
      },
      {
        accessorKey: 'specialties',
        header: 'Especialidades',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.specialties.map((specialty, index) => (
              <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                {specialty}
              </span>
            ))}
            {row.original.specialties.length === 0 && (
              <span className="text-sm text-gray-500">Sin especialidades</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'hourly_rate',
        header: 'Tarifa',
        cell: ({ row }) => (
          <div className="text-sm text-gray-900">
            ${row.original.hourly_rate.toFixed(2)}/hora
          </div>
        ),
      },
      {
        accessorKey: 'available',
        header: 'Estado',
        cell: ({ row }) => (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.original.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {row.original.available ? 'Disponible' : 'No disponible'}
          </span>
        ),
      },
      {
        accessorKey: 'created_at',
        header: 'Fecha de registro',
        cell: ({ row }) => (
          <div className="text-sm text-gray-500">
            {new Date(row.original.created_at || '').toLocaleDateString()}
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={() => handleEditProfessional(row.original)}
              className="text-primary-600 hover:text-primary-900"
              title="Editar profesional"
            >
              <IconEdit className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleDeleteProfessional(row.original.id)}
              className="text-red-600 hover:text-red-900"
              title="Eliminar profesional"
            >
              <IconTrash className="h-5 w-5" />
            </button>
          </div>
        ),
      },
    ],
    []
  )

  const { user } = useAuthContext()
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Ref para controlar la carga inicial
  const initialLoadRef = useRef(false)

  // Efecto único para manejar carga inicial y suscripción
  useEffect(() => {
    if (!user?.id) return

    // Carga inicial solo una vez
    if (!initialLoadRef.current) {
      initialLoadRef.current = true
      fetchProfessionals()
    }

    // Configurar suscripción en tiempo real
    const subscription = supabase
      .channel('professionals_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'professionals',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchProfessionals()
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
      return dateObj.toLocaleDateString()
    } catch {
      return 'N/A'
    }
  }, [])

  const fetchProfessionals = useCallback(async () => {
    if (!user?.id) return

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
  }, [])

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
        `"${formatDate(professional.created_at)}"`
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
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {loading && !professionals.length ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : (
        <>

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
                {professionals.filter((p) => new Date(p.created_at || '').getMonth() === new Date().getMonth()).length}
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
                {professionals.filter(p => p.available).length}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Acciones */}
      <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-end gap-4">
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
      <div className="mt-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          ) : professionals.length === 0 ? (
            <div className="text-center py-12">
              <IconUsers className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No hay profesionales
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Comienza agregando tu primer profesional.
              </p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={professionals}
              pageSize={10}
              enableRowSelection={false}
              enableMultiRowSelection={false}
            />
          )}
        </div>
        </>
      )}

      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => {
          setShowDeleteConfirmation(false);
          setProfessionalToDelete(null);
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