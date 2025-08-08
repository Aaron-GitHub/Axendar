import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../contexts/AuthContext'
import { Client } from '../types'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmationModal from '../components/ui/ConfirmationModal'
import ClientForm from '../components/clients/ClientForm'
import { IconSearch, IconDownload, IconPlus, IconUsers, IconEdit, IconTrash } from '../components/ui/Icons'
import toast from 'react-hot-toast'
import { DataTable } from '../components/ui/DataTable'
import { ColumnDef } from '@tanstack/react-table'

const Clients: React.FC = () => {
  // Definición de columnas para la tabla
  const columns = useMemo<ColumnDef<Client>[]>(
    () => [
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
      {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={() => handleEditClient(row.original)}
              className="text-primary-600 hover:text-primary-900"
            >
              <IconEdit className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleDeleteClient(row.original)}
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
      // Obtener todos los clientes que han hecho reservas con este negocio
      const { data, error } = await supabase
        .from('clients')
        .select('*, reservations!inner(*)')
        .eq('reservations.user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Asegurarnos de que los datos cumplen con el tipo Client[]
      const typedData = (data || []) as Client[]
      setClients(typedData)
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

  const handleDeleteClient = async (client: Client) => {
    setClientToDelete(client)
    setShowDeleteConfirmation(true)
  }

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-primary-100 p-3 rounded-lg">
                <IconUsers className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Clientes</p>
                <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
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
                  {clients.filter(c => new Date(c.created_at).getMonth() === new Date().getMonth()).length}
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
                <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-end gap-4">
          <Button
            variant="outline"
            onClick={handleExportToCSV}
            disabled={clients.length === 0}
          >
            <IconDownload className="h-5 w-5" />
            Exportar CSV
          </Button>
          <Button onClick={handleNewClient}>
            <IconPlus className="h-5 w-5" />
            Nuevo Cliente
          </Button>
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