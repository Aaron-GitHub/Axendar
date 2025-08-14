import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../contexts/AuthContext'
import { Professional } from '../types'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Button from '../components/ui/Button'
import { IconSearch, IconDownload, IconPlus, IconUsers, IconEdit } from '../components/ui/Icons'
import toast from 'react-hot-toast'
import ConfirmationModal from '../components/ui/ConfirmationModal'
import { DataTable } from '../components/ui/DataTable'
import { ColumnDef } from '@tanstack/react-table'
import { useIsLg } from '../hooks/useBreakpoint'
import { PLAN_LIMITS } from '../constants/plans'

// useIsLg se importa desde hooks/useBreakpoint

const Professionals = () => {
  const isLg = useIsLg()
  // Límite por plan (desde constants)
  // Definición de columnas para la tabla (condicional por breakpoint)
  const columns = useMemo<ColumnDef<Professional>[]>(() => {
    const baseCols: ColumnDef<Professional>[] = [
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
    ]

    const desktopOnlyCols: ColumnDef<Professional>[] = [
      {
        accessorKey: 'phone',
        header: 'Teléfono',
        cell: ({ row }) => (
          <div className="text-sm text-gray-900">{row.original.phone || 'Sin teléfono'}</div>
        ),
      },
      {
        accessorKey: 'specialties',
        header: 'Especialidades',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.specialties.map((specialty, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
              >
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
          <div className="text-sm text-gray-900">${row.original.hourly_rate.toFixed(2)}/hora</div>
        ),
      },
      {
        accessorKey: 'available',
        header: 'Estado',
        cell: ({ row }) => (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.original.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
          >
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
    ]

    const actionsCol: ColumnDef<Professional> = {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="px-2 py-1">
          <div className={`flex items-center ${isLg ? 'justify-end space-x-2' : 'justify-end'}`}>
            {isLg ? (
              <button
                onClick={() => handleEditProfessional(row.original)}
                className="text-primary-600 hover:text-primary-900"
                aria-label="Editar profesional"
                title="Editar profesional"
              >
                <IconEdit className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={() => handleEditProfessional(row.original)}
                className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-gray-300 bg-white text-primary-700 hover:bg-gray-50 active:bg-gray-100"
                aria-label="Editar profesional"
                title="Editar profesional"
              >
                <IconEdit className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      ),
    }

    // En móvil solo mostramos nombre y acciones; en desktop añadimos el resto
    return isLg ? [...baseCols, ...desktopOnlyCols, actionsCol] : [...baseCols, actionsCol]
  }, [isLg])

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

  // Plan de suscripción desde profiles
  const [plan, setPlan] = useState<'free' | 'basic' | 'premium' | 'enterprise' | null>(null)
  const [loadingPlan, setLoadingPlan] = useState(false)

  const fetchProfilePlan = useCallback(async () => {
    if (!user?.id) return
    setLoadingPlan(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_plan')
        .eq('id', user.id)
        .single()

      if (error) throw error
      if (data?.subscription_plan) setPlan(data.subscription_plan)
    } catch (error) {
      console.error('Error fetching profile plan:', error)
    } finally {
      setLoadingPlan(false)
    }
  }, [])

  useEffect(() => {
    fetchProfilePlan()
  }, [user])

  const professionalLimit = plan ? PLAN_LIMITS[plan] : 0
  const canAddProfessional = plan ? professionals.length < professionalLimit : false

  const handleNewProfessional = () => {
    if (!plan) {
      toast.error('No se pudo determinar tu plan. Intenta nuevamente.')
      return
    }
    if (!canAddProfessional) {
      const limitText = professionalLimit === Number.POSITIVE_INFINITY ? 'ilimitado' : professionalLimit
      toast.error(`Has alcanzado el límite de profesionales para tu plan (${plan}). Límite: ${limitText}.`)
      return
    }
    navigate('/app/professionals/new')
  }

  const handleEditProfessional = (professional: Professional) => {
    navigate(`/app/professionals/${professional.id}`)
  }

  /*const handleDeleteProfessional = (professionalId: string) => {
    if (!user) return
    setProfessionalToDelete(professionalId)
    setShowDeleteConfirmation(true)
  }*/

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

  return (
    <div className="">
      <>
        {/* Header compacto */}
      <div className="mb-2 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between gap-2">
          {/* Chips KPI */}
          <div className="-mx-1 flex-1 overflow-x-auto md:overflow-visible">
            <div className="px-1 inline-flex gap-2 min-w-max md:min-w-0 md:flex md:flex-wrap">
              <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2 py-1 shadow-sm">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-primary-100">
                  <IconUsers className="h-3.5 w-3.5 text-primary-600" />
                </span>
                <div className="leading-tight">
                  <p className="text-[10px] uppercase tracking-wide text-gray-500">Total</p>
                  <p className="text-sm font-semibold text-gray-900">{professionals.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2 py-1 shadow-sm">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-green-100">
                  <IconUsers className="h-3.5 w-3.5 text-green-600" />
                </span>
                <div className="leading-tight">
                  <p className="text-[10px] uppercase tracking-wide text-gray-500">Nuevos</p>
                  <p className="text-sm font-semibold text-gray-900">{professionals.filter(p => {
                    const d = new Date(p.created_at || '')
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
                  <p className="text-sm font-semibold text-gray-900">{professionals.filter(p => p.available).length}</p>
                </div>
              </div>
            </div>
          </div>
          {/* Acciones */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              onClick={handleExportToCSV}
              disabled={professionals.length === 0}
              className="text-xs md:text-sm gap-1 h-8 px-2"
            >
              <IconDownload className="h-4 w-4" />
              Exportar CSV
            </Button>
            <Button onClick={handleNewProfessional} className="text-xs md:text-sm gap-1 h-8 px-2" disabled={!canAddProfessional || loadingPlan}>
              <IconPlus className="h-4 w-4" />
              Nuevo Profesional
            </Button>
          </div>
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