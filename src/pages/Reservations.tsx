import { useState, useEffect, useCallback } from 'react'
import moment from 'moment'
import 'moment/locale/es'
import { RealtimeChannel } from '@supabase/supabase-js'
import { toast } from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../contexts/AuthContext'
import { Reservation, Service, Client, Professional } from '../types'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { getStatusBadgeColor, getStatusLabel, ReservationStatus } from '../utils/statusUtils'
import { Filter, Calendar, Plus, Download, RefreshCcw, List } from 'lucide-react'
import ReservationActions from '../components/reservations/ReservationActions'
import ReservationForm from '../components/reservations/ReservationForm'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import * as XLSX from 'xlsx'
import ReservationDetails from '../components/reservations/ReservationDetails'
import CalendarView from '../components/reservations/CalendarView'
import ConfirmationModal from '../components/ui/ConfirmationModal'

moment.locale('es')

const Reservations = () => {
  const { user } = useAuthContext()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [services, setServices] = useState<Service[]>([])
  const [filters, setFilters] = useState({
    status: '',
    service: '',
    startDate: '',
    endDate: ''
  })
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

  const fetchReservations = useCallback(async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const [reservationsRes, servicesRes, clientsRes, professionalsRes] = await Promise.all([
        supabase
          .from('reservations')
          .select(`
            *,
            clients (*),
            services (*),
            professionals (*)
          `)
          .eq('user_id', user?.id)
          .order('start_time', { ascending: true }),
        supabase
          .from('services')
          .select('*')
          .eq('user_id', user?.id),
        supabase
          .from('clients')
          .select('*'),
        supabase
          .from('professionals')
          .select('*')
          .eq('user_id', user?.id)
      ])

      const { data: reservationsData, error: reservationsError } = reservationsRes
      const { data: servicesData } = servicesRes
      const { data: clientsData } = clientsRes
      const { data: professionalsData } = professionalsRes

      if (reservationsError) throw reservationsError

      setReservations(reservationsData || [])
      setFilteredReservations(reservationsData || [])
      setServices(servicesData || [])
      setClients(clientsData || [])
      setProfessionals(professionalsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!user) return

    let subscription: RealtimeChannel | null = null

    const setupSubscription = async () => {
      try {
        subscription = supabase
          .channel('reservations_channel')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'reservations',
              filter: `user_id=eq.${user.id}`
            },
            () => {
              fetchReservations()
            }
          )
          .subscribe()
      } catch (error) {
        console.error('Error initializing subscription:', error)
        toast.error('Error al conectar con el servidor')
      }
    }

    setupSubscription()
    fetchReservations()

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [user, fetchReservations])

  // Función para aplicar filtros
  const applyFilters = () => {
    let filtered = [...reservations]

    if (filters.status) {
      filtered = filtered.filter(r => r.status === filters.status)
    }

    if (filters.service) {
      filtered = filtered.filter(r => r.services?.id === filters.service)
    }

    if (filters.startDate) {
      filtered = filtered.filter(r => 
        moment(r.start_time).isSameOrAfter(moment(filters.startDate).startOf('day'))
      )
    }

    if (filters.endDate) {
      filtered = filtered.filter(r => 
        moment(r.start_time).isSameOrBefore(moment(filters.endDate).endOf('day'))
      )
    }

    setFilteredReservations(filtered)
  }

  // Efecto para aplicar filtros cuando cambien
  useEffect(() => {
    applyFilters()
  }, [filters, reservations])

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
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className={`inline-flex items-center ${showFilters ? 'bg-primary-50 text-primary-700 border-primary-500' : ''}`}
          >
            <Filter className="-ml-1 mr-2 h-4 w-4" />
            Filtros
          </Button>
          <div className="flex items-center">
            <Button
              onClick={() => setViewMode('list')}
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              className="inline-flex items-center rounded-r-none border-r-0"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => setViewMode('calendar')}
              variant={viewMode === 'calendar' ? 'primary' : 'outline'}
              className="inline-flex items-center rounded-l-none"
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {selectedReservations.length > 0 && (
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => handleExportToExcel()}
                variant="outline"
                className="inline-flex items-center touch-manipulation py-2.5 px-4 text-sm"
                size="lg"
              >
                <Download className="-ml-1 mr-2 h-5 w-5" />
                Exportar ({selectedReservations.length})
              </Button>
              <Button
                onClick={() => setShowStatusModal(true)}
                variant="outline"
                className="inline-flex items-center touch-manipulation"
                size="md"
              >
                <RefreshCcw className="-ml-1 mr-2 h-4 w-4" />
                Cambiar Estado ({selectedReservations.length})
              </Button>
            </div>
          )}
          <Button
            onClick={() => setShowNew(true)}
            variant="primary"
            className="inline-flex items-center touch-manipulation"
            size="md"
          >
            <Plus className="-ml-1 mr-2 h-4 w-4" />
            Nueva Reserva
          </Button>
        </div>
      </div>
      {showFilters && (
        <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="mt-1 block w-full pl-3 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
              >
                <option value="">Todos</option>
                <option value="pending">Pendiente</option>
                <option value="confirmed">Confirmada</option>
                <option value="cancelled">Cancelada</option>
                <option value="completed">Completada</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Servicio
              </label>
              <select
                value={filters.service}
                onChange={(e) => setFilters(prev => ({ ...prev, service: e.target.value }))}
                className="mt-1 block w-full pl-3 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
              >
                <option value="">Todos</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Inicio
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  className="mt-1 block w-full pl-3 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Fin
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  className="mt-1 block w-full pl-3 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={() => setFilters({ status: '', service: '', startDate: '', endDate: '' })}
              className="px-4 py-3 sm:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 mr-3 transition-colors duration-200 touch-manipulation"
            >
              Limpiar Filtros
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="px-4 py-3 sm:py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors duration-200 shadow-sm touch-manipulation"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}

      {!loading ? (
        viewMode === 'list' ? (
          <div className="bg-white shadow sm:rounded-lg">
            <div className="overflow-x-auto relative">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr className="text-left">
                    <th scope="col" className="relative px-3 sm:px-6 py-3.5 text-left text-sm font-semibold text-gray-900 min-w-[200px]">
                      <input
                        type="checkbox"
                        className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        checked={selectedReservations.length === filteredReservations.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedReservations(filteredReservations.map(r => r.id))
                          } else {
                            setSelectedReservations([])
                          }
                        }}
                      />
                      <span className="ml-8">Cliente</span>
                    </th>
                    <th
                      scope="col"
                      className="px-3 sm:px-6 py-3.5 text-left text-sm font-semibold text-gray-900 min-w-[120px]"
                    >
                      Servicio
                    </th>
                    <th
                      scope="col"
                      className="px-3 sm:px-6 py-3.5 text-left text-sm font-semibold text-gray-900 min-w-[120px]"
                    >
                      Profesional
                    </th>
                    <th
                      scope="col"
                      className="px-3 sm:px-6 py-3.5 text-left text-sm font-semibold text-gray-900 min-w-[150px]"
                    >
                      Fecha y Hora
                    </th>
                    <th
                      scope="col"
                      className="px-3 sm:px-6 py-3.5 text-left text-sm font-semibold text-gray-900 min-w-[100px]"
                    >
                      Estado
                    </th>
                    <th
                      scope="col"
                      className="px-3 sm:px-6 py-3.5 text-left text-sm font-semibold text-gray-900 min-w-[100px]"
                    >
                      Total
                    </th>
                    <th scope="col" className="relative px-6 py-3.5">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReservations.map((reservation) => (
                    <tr
                      key={reservation.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            checked={selectedReservations.includes(reservation.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedReservations([...selectedReservations, reservation.id])
                              } else {
                                setSelectedReservations(selectedReservations.filter(id => id !== reservation.id))
                              }
                            }}
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{reservation.clients?.name}</div>
                            <div className="text-sm text-gray-500">{reservation.clients?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{reservation.services?.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{reservation.professionals?.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {moment(reservation.start_time).format('DD/MM/YYYY')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {moment(reservation.start_time).format('HH:mm')} - {moment(reservation.end_time).format('HH:mm')}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeColor(reservation.status)}`}
                        >
                          {getStatusLabel(reservation.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${reservation.total_amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative overflow-visible">
                        <ReservationActions
                          reservation={reservation}
                          onViewDetails={() => handleViewDetails(reservation)}
                          onEdit={() => handleEdit(reservation)}
                          onStatusChange={(status) => handleStatusChange(reservation, status)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {reservations.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900">No hay reservas</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No se encontraron reservas para mostrar.
                </p>
              </div>
            )}
          </div>
        ) : (
          <CalendarView 
            reservations={filteredReservations}
            onEventClick={(reservation) => handleViewDetails(reservation)}
          />
        )
      ) : (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      )}

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