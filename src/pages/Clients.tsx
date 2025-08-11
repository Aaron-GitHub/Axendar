import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../contexts/AuthContext'
import { Client } from '../types'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmationModal from '../components/ui/ConfirmationModal'
import ClientForm from '../components/clients/ClientForm'
import { IconSearch, IconDownload, IconPlus, IconUsers, IconEdit } from '../components/ui/Icons'
import toast from 'react-hot-toast'
import { DataTable } from '../components/ui/DataTable'
import { ColumnDef } from '@tanstack/react-table'
import { useIsLg } from '../hooks/useBreakpoint'

const Clients: React.FC = () => {
  const isLg = useIsLg()
  // Definición de columnas para la tabla (responsive)
  const columns = useMemo<ColumnDef<Client>[]>(() => {
    const baseCols: ColumnDef<Client>[] = [
      {
        accessorKey: 'name',
        header: 'Cliente',
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
            </div>
          </div>
        ),
      },
    ]

    const desktopOnly: ColumnDef<Client>[] = [
      {
        accessorKey: 'email',
        header: 'Contacto',
        cell: ({ row }) => (
          <div>
            <div className="text-sm text-gray-900">{row.original.email}</div>
            <div className="text-sm text-gray-500">{row.original.phone || 'Sin teléfono'}</div>
          </div>
        ),
      },
      {
        accessorKey: 'address',
        header: 'Dirección',
        cell: ({ row }) => (
          <div className="text-sm text-gray-900">{row.original.address || 'Sin dirección'}</div>
        ),
      },
      {
        accessorKey: 'created_at',
        header: 'Fecha de registro',
        cell: ({ row }) => (
          <div className="text-sm text-gray-500">
            {new Date(row.original.created_at).toLocaleDateString()}
          </div>
        ),
      },
    ]

    const actionsCol: ColumnDef<Client> = {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="px-2 py-1">
          <div className={`flex items-center ${isLg ? 'justify-end space-x-2' : 'justify-end'}`}>
            {isLg ? (
              <button
                onClick={() => handleEditClient(row.original)}
                className="text-primary-600 hover:text-primary-900"
                aria-label="Editar cliente"
              >
                <IconEdit className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={() => handleEditClient(row.original)}
                className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-gray-300 bg-white text-primary-700 hover:bg-gray-50 active:bg-gray-100"
                aria-label="Editar cliente"
              >
                <IconEdit className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      ),
    }

    return isLg ? [...baseCols, ...desktopOnly, actionsCol] : [...baseCols, actionsCol]
  }, [isLg])

  const { user } = useAuthContext()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

  // Ref para controlar la carga inicial
  const initialLoadRef = useRef(false)

  // Efecto único para manejar carga inicial y suscripción
  useEffect(() => {
    if (!user?.id) return

    // Carga inicial solo una vez
    if (!initialLoadRef.current) {
      initialLoadRef.current = true
      fetchClients()
    }

    // Configurar suscripción en tiempo real para todos los clientes del usuario
    const subscription = supabase
      .channel('clients_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients'
        },
        (payload) => {
          // Verificar si el cliente pertenece a este usuario antes de actualizar
          const clientId = payload.new?.id || payload.old?.id
          if (clientId && clients.some(c => c.id === clientId)) {
            fetchClients()
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user?.id])



  const fetchClients = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      // 1) Clientes propios
      console.log(user.id)
      const { data: ownClients, error: ownErr } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (ownErr) throw ownErr

      // 2) Clientes con reservas del negocio
      const { data: reservedClients, error: resErr } = await supabase
        .from('clients')
        .select('*, reservations!inner(user_id)')
        .eq('reservations.user_id', user.id)
        .order('created_at', { ascending: false })

      if (resErr) throw resErr

      // 3) Unir y deduplicar por id
      const combined = [
        ...((ownClients || []) as Client[]),
        ...((reservedClients || []) as Client[]),
      ]
      const deduped = Object.values(
        combined.reduce<Record<string, Client>>((acc, c) => {
          acc[c.id] = acc[c.id] || c
          return acc
        }, {})
      )
      setClients(deduped)
    } catch (error) {
      console.error('Error fetching clients:', error)
      toast.error('Error al cargar los clientes')
    } finally {
      setLoading(false)
    }
  }, [user])

  const handleNewClient = () => {
    setEditingClient(null)
    setIsFormModalOpen(true)
  }

  const handleEditClient = (client: Client) => {
    setEditingClient(client)
    setIsFormModalOpen(true)
  }

  /*const handleDeleteClient = async (client: Client) => {
    setClientToDelete(client)
    setShowDeleteConfirmation(true)
  }*/

  const confirmDeleteClient = async () => {
    if (!clientToDelete || !user) return

    try {
      // Solo eliminamos las reservas asociadas a este negocio
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('client_id', clientToDelete.id)
        .eq('user_id', user.id)

      if (error) throw error

      // Actualizamos la lista de clientes
      await fetchClients()
      toast.success('Cliente eliminado de tu lista exitosamente')
      setShowDeleteConfirmation(false)
      setClientToDelete(null)
    } catch (error) {
      console.error('Error deleting client:', error)
      toast.error('Error al eliminar el cliente')
    }
  }

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFormSubmit = async () => {
    try {
      setIsSubmitting(true)
      await fetchClients()
      setIsFormModalOpen(false)
      setEditingClient(null)
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('Error al guardar el cliente')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExportToCSV = () => {
    if (clients.length === 0) {
      toast.error('No hay datos para exportar')
      return
    }

    const headers = ['Nombre', 'Email', 'Teléfono', 'Dirección', 'Fecha de Registro']
    const csvContent = [
      headers.join(','),
      ...clients.map(client => [
        `"${client.name}"`,
        `"${client.email}"`,
        `"${client.phone || ''}"`,
        `"${client.address || ''}"`,
        `"${new Date(client.created_at).toLocaleDateString()}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', 'clientes.csv')
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

      <div className="mb-2 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
        {/* Encabezado + Acciones */}
        <div className="flex items-center justify-between gap-2">
          {/* KPIs compactos (siempre compactos; ocupan una sola línea) */}
          <div className="-mx-1 flex-1 overflow-x-auto md:overflow-visible">
            <div className="px-1 inline-flex gap-2 min-w-max md:min-w-0 md:flex md:flex-wrap">
              <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-1 shadow-sm bg-primary-50">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-primary-100">
                  <IconUsers className="h-4 w-4 text-primary-600" />
                </span>
                <div className="leading-tight">
                  <p className="text-[12px] uppercase tracking-wide text-gray-500">Total</p>
                  <p className="text-sm font-semibold text-gray-900">{clients.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-1 shadow-sm">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-green-100">
                  <IconUsers className="h-4 w-4 text-green-600" />
                </span>
                <div className="leading-tight">
                  <p className="text-[12px] uppercase tracking-wide text-gray-500">Nuevos</p>
                  <p className="text-sm font-semibold text-gray-900">{clients.filter(c => {
                    const d = new Date(c.created_at)
                    const now = new Date()
                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
                  }).length}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-1 shadow-sm">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-blue-100">
                  <IconSearch className="h-4 w-4 text-blue-600" />
                </span>
                <div className="leading-tight">
                  <p className="text-[12px] uppercase tracking-wide text-gray-500">Resultados</p>
                  <p className="text-sm font-semibold text-gray-900">{clients.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              onClick={handleExportToCSV}
              disabled={clients.length === 0}
              className="text-xs md:text-sm gap-1 h-8 px-2"
            >
              <IconDownload className="h-4 w-4" />
              Exportar CSV
            </Button>
            <Button onClick={handleNewClient} className="text-xs md:text-sm gap-1 h-8 px-2">
              <IconPlus className="h-4 w-4" />
              Nuevo Cliente
            </Button>
          </div>
        </div>
        {/* Sin bloque extra en desktop para minimizar altura */}
      </div>
      {/* Clients Table */}
     
      <div className="mt-4">
        <DataTable
          columns={columns}
          data={clients}
        />
        {clients.length === 0 && (
          <div className="text-center py-12">
            <IconUsers className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No hay clientes
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza agregando tu primer cliente.
            </p>
            <div className="mt-6">
              <Button onClick={handleNewClient}>
                <IconPlus className="h-4 w-4 mr-2" />
                Nuevo Cliente
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => !isSubmitting && setIsFormModalOpen(false)}
        title={editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
        size="md"
      >
        <ClientForm
          client={editingClient}
          onSubmit={handleFormSubmit}
          onCancel={() => !isSubmitting && setIsFormModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => {
          setShowDeleteConfirmation(false)
          setClientToDelete(null)
        }}
        onConfirm={confirmDeleteClient}
        title="Eliminar Cliente"
        message={`¿Estás seguro de que quieres eliminar a ${clientToDelete?.name || 'este cliente'} de tu lista? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        confirmVariant="danger"
      />
    </div>
  )
}

export default Clients