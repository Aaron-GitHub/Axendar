import { useMemo, useState, useCallback, useEffect } from 'react';
import { dayInitials, formatMonth } from '../utils/esCalendar';
import moment from 'moment'
import 'moment/locale/es'
import { toast } from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../contexts/AuthContext'
import { Reservation, Service, Client, Professional } from '../types'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { getStatusBadgeColor, getStatusLabel, ReservationStatus } from '../utils/statusUtils'
import { Filter, Calendar, Plus, Download, RefreshCcw, List } from 'lucide-react'
import ReservationForm from '../components/reservations/ReservationForm'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import * as XLSX from 'xlsx'
import ReservationDetails from '../components/reservations/ReservationDetails'
import CalendarView from '../components/reservations/CalendarView'
import ConfirmationModal from '../components/ui/ConfirmationModal'
import { DataTable } from '../components/ui/DataTable'
import { ColumnDef } from '@tanstack/react-table'
import { useIsLg } from '../hooks/useBreakpoint'
import { IconEdit, IconView } from '../components/ui/Icons'

moment.locale('es')

const Reservations = () => {
  const isLg = useIsLg()
  // Definición de columnas para la tabla (responsive)
  const columns = useMemo<ColumnDef<Reservation>[]>(() => {
    const baseCols: ColumnDef<Reservation>[] = [
      {
        accessorKey: 'start_time',
        header: 'Fecha y Hora',
        cell: ({ row }) =>(
          <div>
              <div>{moment(row.getValue('start_time')).format('DD/MM/YYYY HH:mm')}</div>
              <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                row.original.status as ReservationStatus
              )}`}
            >
              {getStatusLabel(row.original.status as ReservationStatus)}
            </span>
          </div>
        ),
        sortingFn: 'datetime',
      },
      {
        accessorFn: (row: Reservation) => row.clients?.name,
        header: 'Cliente',
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-gray-900">{row.original.clients?.name}</div>
            <div className="text-sm text-gray-500">{row.original.services?.name}</div>
          </div>
        ),
      },
    ]

    const desktopOnly: ColumnDef<Reservation>[] = [
      {
        accessorFn: (row: Reservation) => row.professionals?.name,
        header: 'Profesional y Servicio',
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-gray-900">{row.original.professionals?.name}</div>
            <div className="text-sm text-gray-500">{row.original.services?.name}</div>
          </div>
        ),
      },
     {
        accessorKey: 'total_amount',
        header: 'Total',
        cell: ({ row }) => {
          const amount = row.getValue('total_amount') as number
          return `$${amount?.toLocaleString('es-CL') || 'Sin precio'}`
        },
      },
    ]

    const actionsCol: ColumnDef<Reservation> = {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="px-2 py-1">
          <div className={`flex items-center ${isLg ? 'justify-end space-x-2' : 'justify-end space-x-3'}`}>
            {isLg ? (
              <>
                <button
                  onClick={() => handleEdit(row.original)}
                  className="text-primary-600 hover:text-primary-900"
                  aria-label="Editar"
                >
                  <IconEdit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleViewDetails(row.original)}
                  className="text-yellow-600 hover:text-yellow-900"
                  aria-label="Ver detalles"
                >
                  <IconView className="h-5 w-5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleEdit(row.original)}
                  className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-gray-300 bg-white text-primary-700 hover:bg-gray-50 active:bg-gray-100"
                  aria-label="Editar"
                >
                  <IconEdit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleViewDetails(row.original)}
                  className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-gray-300 bg-white text-yellow-700 hover:bg-gray-50 active:bg-gray-100"
                  aria-label="Ver detalles"
                >
                  <IconView className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>
      ),
    }

    return isLg ? [...baseCols, ...desktopOnly, actionsCol] : [...baseCols, actionsCol]
  }, [isLg])

  const { user } = useAuthContext()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [services, setServices] = useState<Service[]>([])
  const [filters, setFilters] = useState({
    status: '',
    service: '',
    professional: '',
    startDate: '',
    endDate: ''
  })
  // Filtros aplicados (los que realmente usa el backend)
  const [appliedFilters, setAppliedFilters] = useState({
    status: '',
    service: '',
    professional: '',
    startDate: '',
    endDate: ''
  })
  // Búsqueda rápida local (cliente/servicio/profesional)
  const [searchQuery, setSearchQuery] = useState('')
  // Calendario mensual pequeño (panel izquierdo)
  const [miniMonth, setMiniMonth] = useState(moment())
  const [showFilters, setShowFilters] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [selectedReservations, setSelectedReservations] = useState<string[]>([])
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [reservationToCancel, setReservationToCancel] = useState<Reservation | null>(null)
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false)

  const fetchReservations = useCallback(async (filterOptions = appliedFilters, opts?: { silent?: boolean }) => {
    if (!user?.id) return
    if (!opts?.silent) setLoading(true)
    try {
      // Construir la consulta única con todos los datos necesarios
      let query = supabase
        .from('reservations')
        .select(`
          *,
          clients!inner(*),
          services!inner(*),
          professionals!inner(*)
        `)
        .eq('user_id', user.id)

      // Aplicar filtros si existen
      if (filterOptions?.status) {
        query = query.eq('status', filterOptions.status)
      }
      if (filterOptions?.service) {
        query = query.eq('service_id', filterOptions.service)
      }
      if (filterOptions?.professional) {
        query = query.eq('professional_id', filterOptions.professional)
      }
      if (filterOptions?.startDate) {
        query = query.gte('start_time', `${filterOptions.startDate}T00:00:00`)
      }
      if (filterOptions?.endDate) {
        query = query.lte('start_time', `${filterOptions.endDate}T23:59:59`)
      }

      // Ordenar por fecha
      query = query.order('start_time', { ascending: false })

      // Ejecutar la consulta
      const { data: reservationsData, error: reservationsError } = await query

      if (reservationsError) throw reservationsError

      // Actualizar el estado con los datos filtrados desde backend
      setReservations(reservationsData || [])
      setFilteredReservations(reservationsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Error al cargar los datos')
    } finally {
      if (!opts?.silent) setLoading(false)
    }
  }, [user?.id, appliedFilters]) // Actualiza cuando cambian los filtros aplicados

  // Aplicar búsqueda rápida en el cliente sobre el resultado ya filtrado
  useEffect(() => {
    if (!searchQuery) {
      setFilteredReservations(reservations)
      return
    }
    const q = searchQuery.toLowerCase()
    const next = reservations.filter(r => {
      const c = r.clients?.name?.toLowerCase() || ''
      const s = r.services?.name?.toLowerCase() || ''
      const p = r.professionals?.name?.toLowerCase() || ''
      return c.includes(q) || s.includes(q) || p.includes(q)
    })
    setFilteredReservations(next)
  }, [searchQuery, reservations])

  // Cargar catálogos independientes (clientes, profesionales, servicios)
  useEffect(() => {
    const fetchAuxData = async () => {
      if (!user?.id) return
      try {
        const [
          { data: servicesData, error: servicesErr },
          { data: profsData, error: profsErr }
        ] = await Promise.all([
          supabase.from('services').select('*').eq('user_id', user.id).order('name', { ascending: true }),
          supabase.from('professionals').select('*').eq('user_id', user.id).order('name', { ascending: true })
        ])
        if (servicesErr) throw servicesErr
        if (profsErr) throw profsErr

        setServices(servicesData || [])
        setProfessionals(profsData || [])

        // Clientes: obtener client_ids desde reservas del usuario y luego traer esos clientes
        try {
          const { data: reservationClients, error: rcErr } = await supabase
            .from('reservations')
            .select('client_id')
            .eq('user_id', user.id)
            .not('client_id', 'is', null)

          if (rcErr) throw rcErr

          const ids = Array.from(new Set((reservationClients || []).map((r: any) => r.client_id)))
          if (ids.length === 0) {
            setClients([])
          } else {
            const { data: clientRows, error: clientsErr } = await supabase
              .from('clients')
              .select('*')
              .in('id', ids)
              .eq('user_id', user.id)
              .order('name', { ascending: true })
            if (clientsErr) throw clientsErr
            setClients(clientRows || [])
          }
        } catch (clientsLoadErr) {
          console.error('Error fetching filtered clients:', clientsLoadErr)
          setClients([])
        }
      } catch (err) {
        console.error('Error fetching catalogs:', err)
      }
    }
    fetchAuxData()
  }, [user?.id])

  // Efecto para carga inicial y suscripción (no refetch en cada cambio de filtro)
  useEffect(() => {
    if (!user?.id) return

    // Variable para los timeouts
    let debounceTimeout: NodeJS.Timeout | null = null

    // Función para limpiar timeouts
    const clearTimeouts = () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout)
        debounceTimeout = null
      }
    }

    // Carga inicial (no silenciosa)
    fetchReservations(undefined, { silent: false })

    // Configurar suscripción en tiempo real
    const subscription = supabase
      .channel('reservations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Real-time update received')
          clearTimeouts()
          debounceTimeout = setTimeout(() => {
            // Refrescar en segundo plano para evitar parpadeo
            fetchReservations(undefined, { silent: true })
          }, 1000)
        }
      )
      .subscribe()

    // Cleanup
    return () => {
      clearTimeouts()
      subscription.unsubscribe()
    }
  }, [user?.id]) // No dependemos de filtros para evitar refetch en cada cambio

  const handleViewDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setShowDetails(true)
  }

  const handleEdit = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setShowEdit(true)
  }

  const handleStatusChange = async (reservationId: string | Reservation | string[], newStatus: ReservationStatus) => {
    // Si es cancelación individual, mostrar confirmación
    if (newStatus === 'cancelled' && !Array.isArray(reservationId)) {
      const reservation = typeof reservationId === 'string' 
        ? reservations.find(r => r.id === reservationId)
        : reservationId
      
      if (reservation) {
        setReservationToCancel(reservation)
        setShowCancelConfirmation(true)
        return
      }
    }

    await updateReservationStatus(reservationId, newStatus)
  }

  const confirmCancelReservation = async () => {
    if (!reservationToCancel) return
    await updateReservationStatus(reservationToCancel, 'cancelled')
    setShowCancelConfirmation(false)
    setReservationToCancel(null)
  }

  const updateReservationStatus = async (reservationId: string | Reservation | string[], newStatus: ReservationStatus) => {
    try {
      if (Array.isArray(reservationId)) {
        // Cambio masivo de estado
        const { error } = await supabase
          .from('reservations')
          .update({ status: newStatus })
          .in('id', reservationId)

        if (error) throw error

        await fetchReservations()
        setSelectedReservations([])
        toast.success('Estados actualizados exitosamente')
        setShowStatusModal(false)
      } else {
        // Cambio individual de estado
        const { error } = await supabase
          .from('reservations')
          .update({ status: newStatus })
          .eq('id', typeof reservationId === 'string' ? reservationId : reservationId.id)

        if (error) throw error

        await fetchReservations()
        toast.success('Estado actualizado exitosamente')
      }
    } catch (error) {
      console.error('Error updating reservation status:', error)
      toast.error('Error al actualizar el estado')
    }
  }



  const handleExportToExcel = () => {
    const dataToExport = filteredReservations.map(reservation => ({
      'ID': reservation.id,
      'Cliente': reservation.clients?.name || '',
      'Email': reservation.clients?.email || '',
      'Teléfono': reservation.clients?.phone || '',
      'Servicio': reservation.services?.name || '',
      'Profesional': reservation.professionals?.name || '',
      'Fecha': moment(reservation.start_time).format('DD/MM/YYYY'),
      'Hora': moment(reservation.start_time).format('HH:mm'),
      'Estado': getStatusLabel(reservation.status),
      'Total': `$${reservation.total_amount}`,
      'Notas': reservation.notes || ''
    }))

    const ws = XLSX.utils.json_to_sheet(dataToExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Reservas')
    XLSX.writeFile(wb, `reservas_${moment().format('YYYY-MM-DD')}.xlsx`)
  }

  return (
    <div className="">
      {/* Barra superior de acciones */}
      <div className="flex items-center justify-between mb-3 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-2">
          {/* Toggle de filtros en móvil */}
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="inline-flex items-center text-xs md:hidden"
          >
            <Filter className="-ml-1 mr-2 h-4 w-4" /> Filtros
          </Button>

          {/* Vista lista / calendario */}
          <div className="hidden md:flex items-center">
            <Button onClick={() => setViewMode('list')} variant={viewMode === 'list' ? 'primary' : 'outline'} className="inline-flex items-center rounded-r-none border-r-0 text-xs">
              <List className="h-4 w-4" />
            </Button>
            <Button onClick={() => setViewMode('calendar')} variant={viewMode === 'calendar' ? 'primary' : 'outline'} className="inline-flex items-center rounded-l-none text-xs">
              <Calendar className="h-4 w-4" />
            </Button>
          </div>

          <Button onClick={() => setShowNew(true)} variant="primary" className="inline-flex items-center text-xs">
            <Plus className="-ml-1 mr-2 h-4 w-4" /> Nueva
          </Button>
        </div>

        {/* Acciones de selección */}
        {selectedReservations.length > 0 && (
          <div className="flex items-center gap-2">
            <Button onClick={() => handleExportToExcel()} variant="outline" className="inline-flex items-center text-xs">
              <Download className="-ml-1 mr-2 h-4 w-4" /> Exportar ({selectedReservations.length})
            </Button>
            <Button onClick={() => setShowStatusModal(true)} variant="outline" className="inline-flex items-center text-xs">
              <RefreshCcw className="-ml-1 mr-2 h-4 w-4" /> Cambiar Estado ({selectedReservations.length})
            </Button>
          </div>
        )}
      </div>

      {/* Layout de 2 columnas: filtros a la izquierda, contenido a la derecha */}
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4">
        {/* Panel de filtros - siempre visible en desktop, toggle en móvil */}
        <aside className={`md:block ${showFilters ? 'block' : 'hidden'} md:sticky md:top-20`}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Filtros</h3>

            {/* Búsqueda rápida */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-1">Búsqueda rápida</label>
              <input
                type="text"
                placeholder="Cliente, servicio o profesional..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Todos</option>
                  <option value="pending">Pendiente</option>
                  <option value="confirmed">Confirmada</option>
                  <option value="cancelled">Cancelada</option>
                  <option value="completed">Completada</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Servicio</label>
                <select
                  value={filters.service}
                  onChange={(e) => setFilters(prev => ({ ...prev, service: e.target.value }))}
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Todos</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>{service.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Profesional</label>
                <select
                  value={filters.professional}
                  onChange={(e) => setFilters(prev => ({ ...prev, professional: e.target.value }))}
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Todos</option>
                  {professionals.map(prof => (
                    <option key={prof.id} value={prof.id}>{prof.name}</option>
                  ))}
                </select>
              </div>

              {/* Chips de profesionales (rápido) */}
              {/*professionals.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Rápido: Profesionales</label>
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {professionals.map((prof) => {
                      const selected = filters.professional === prof.id
                      return (
                        <button
                          key={prof.id}
                          type="button"
                          onClick={() => setFilters(prev => ({ ...prev, professional: selected ? '' : String(prof.id) }))}
                          className={`flex-shrink-0 inline-flex items-center gap-2 rounded-full border ${selected ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300 bg-white text-gray-700'} px-2.5 py-1.5 shadow-sm hover:bg-gray-50`}
                          title={prof.name}
                        >
                          <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold ${selected ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
                            {getInitials(prof.name)}
                          </span>
                          <span className="text-xs whitespace-nowrap">{prof.name.split(' ')[0]}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )*/}

              {/* Fecha por mini-calendario: inputs removidos */}

              {/* Calendario mensual pequeño */}
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <button
                    type="button"
                    onClick={() => setMiniMonth(prev => prev.clone().subtract(1, 'month'))}
                    className="px-2 py-1 text-xs rounded-md border border-gray-300 hover:bg-gray-50"
                  >
                    ◀
                  </button>
                  <span className="text-xs font-medium text-gray-700">{`${formatMonth(miniMonth)} ${miniMonth.format('YYYY')}`}</span>
                  <button
                    type="button"
                    onClick={() => setMiniMonth(prev => prev.clone().add(1, 'month'))}
                    className="px-2 py-1 text-xs rounded-md border border-gray-300 hover:bg-gray-50"
                  >
                    ▶
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-gray-500 mb-1">
                  {dayInitials.map(d => (
                    <div key={d} className="py-1">{d}</div>
                  ))}
                </div>
                {(() => {
                  // Usar semanas ISO (lunes como primer día) y locale español
                  const start = miniMonth.clone().locale('es').startOf('month').startOf('isoWeek')
                  const end = miniMonth.clone().locale('es').endOf('month').endOf('isoWeek')
                  const days: moment.Moment[] = []
                  const cur = start.clone()
                  while (cur.isSameOrBefore(end, 'day')) {
                    days.push(cur.clone())
                    cur.add(1, 'day')
                  }
                  return (
                    <div className="grid grid-cols-7 gap-1">
                      {days.map((day) => {
                        const isOtherMonth = day.month() !== miniMonth.month()
                        const isToday = day.isSame(moment().startOf('day'), 'day')
                        const isSelected = filters.startDate && filters.endDate && day.isSame(filters.startDate, 'day') && day.isSame(filters.endDate, 'day')
                        return (
                          <button
                            key={day.format('YYYY-MM-DD')}
                            type="button"
                            onClick={() => {
                              const d = day.format('YYYY-MM-DD')
                              const next = { ...filters, startDate: d, endDate: d }
                              setFilters(next)
                              setAppliedFilters(next)
                              fetchReservations(next, { silent: false })
                            }}
                            className={`text-xs rounded-md py-1 ${isSelected ? 'bg-primary-600 text-white' : isToday ? 'bg-primary-100 text-primary-800' : 'bg-white text-gray-700'} ${isOtherMonth ? 'opacity-40' : ''} border border-gray-200 hover:bg-gray-50`}
                          >
                            {day.date()}
                          </button>
                        )
                      })}
                    </div>
                  )
                })()}
              </div>

              <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between gap-2 sticky bottom-0 bg-white -mx-4 px-4 pb-1">
                <button
                  onClick={() => {
                    const empty = { status: '', service: '', professional: '', startDate: '', endDate: '' }
                    setFilters(empty)
                    setAppliedFilters(empty)
                    setSearchQuery('')
                    fetchReservations(empty, { silent: false })
                  }}
                  className="px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Limpiar
                </button>
                <Button
                  onClick={() => {
                    setAppliedFilters(filters)
                    setShowFilters(false)
                    fetchReservations(filters, { silent: false })
                  }}
                  variant="primary"
                  className="text-xs"
                >
                  Aplicar
                </Button>
              </div>
            </div>
          </div>
        </aside>

        {/* Contenido principal */}
        <section>
          {/* Conmutador de vista en móvil */}
          <div className="flex items-center justify-between md:hidden mb-3">
            <div className="flex items-center">
              <Button onClick={() => setViewMode('list')} variant={viewMode === 'list' ? 'primary' : 'outline'} className="inline-flex items-center rounded-r-none border-r-0 text-xs">
                <List className="h-4 w-4" />
              </Button>
              <Button onClick={() => setViewMode('calendar')} variant={viewMode === 'calendar' ? 'primary' : 'outline'} className="inline-flex items-center rounded-l-none text-xs">
                <Calendar className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>
          ) : (
            <>
              {viewMode === 'list' ? (
                <div>
                  <DataTable
                    data={filteredReservations}
                    columns={columns}
                    enableRowSelection
                    enableMultiRowSelection
                    onRowSelectionChange={(selectedRows) => {
                      setSelectedReservations(selectedRows.map(row => row.id))
                    }}
                    pageSize={20}
                  />
                </div>
              ) : (
                <CalendarView
                  reservations={filteredReservations}
                  onEventClick={(reservation) => handleViewDetails(reservation)}
                  currentDate={appliedFilters.startDate || undefined}
                />
              )}
            </>
          )}
        </section>
      </div>

      {/* Modal de detalles */}
      {showDetails && selectedReservation && (
        <Modal
          isOpen={showDetails}
          onClose={() => {
            setShowDetails(false)
            setSelectedReservation(null)
          }}
          title="Detalles de la Reserva"
          size="lg"
        >
          <ReservationDetails reservation={selectedReservation} onEdit={() => handleEdit(selectedReservation)} onClose={() => setShowDetails(false)} />
        </Modal>
      )}

      {/* Modal de edición */}
      {showEdit && selectedReservation && (
        <Modal
          isOpen={showEdit}
          onClose={() => {
            setShowEdit(false)
            setSelectedReservation(null)
          }}
          title="Editar Reserva"
          size="lg"
        >
          <ReservationForm
            reservation={selectedReservation}
            clients={clients}
            professionals={professionals}
            services={services}
            onSubmit={() => {
              setShowEdit(false)
              setSelectedReservation(null)
              fetchReservations()
            }}
            onCancel={() => {
              setShowEdit(false)
              setSelectedReservation(null)
            }}
          />
        </Modal>
      )}

      {/* Modal de nueva reserva */}
      {showNew && (
        <Modal
          isOpen={showNew}
          onClose={() => setShowNew(false)}
          title="Nueva Reserva"
          size="lg"
        >
          <ReservationForm
            clients={clients}
            professionals={professionals}
            services={services}
            onSubmit={() => {
              setShowNew(false)
              fetchReservations()
            }}
            onCancel={() => setShowNew(false)}
          />
        </Modal>
      )}

      {/* Modal de cambio de estado en lote */}
      {showStatusModal && (
        <Modal
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          title="Cambiar Estado"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Selecciona el nuevo estado para las {selectedReservations.length} reservas seleccionadas.
            </p>
            <div className="grid grid-cols-1 gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  handleStatusChange(selectedReservations, 'pending')
                  setShowStatusModal(false)
                }}
              >
                Pendiente
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  handleStatusChange(selectedReservations, 'confirmed')
                  setShowStatusModal(false)
                }}
              >
                Confirmada
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  handleStatusChange(selectedReservations, 'completed')
                  setShowStatusModal(false)
                }}
              >
                Completada
              </Button>
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700 border-red-600 hover:border-red-700"
                onClick={() => {
                  handleStatusChange(selectedReservations, 'cancelled')
                  setShowStatusModal(false)
                }}
              >
                Cancelada
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de confirmación para cancelar reserva */}
      <ConfirmationModal
        isOpen={showCancelConfirmation}
        onClose={() => {
          setShowCancelConfirmation(false)
          setReservationToCancel(null)
        }}
        onConfirm={confirmCancelReservation}
        title="Cancelar Reserva"
        message={`¿Estás seguro de que quieres cancelar la reserva de ${reservationToCancel?.clients?.name || 'este cliente'}? Esta acción no se puede deshacer.`}
        confirmText="Cancelar Reserva"
        confirmVariant="danger"
      />
    </div>
  )
}

export default Reservations;