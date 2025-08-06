import { useState, useEffect } from 'react'
import { Calendar, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../hooks/useToast'
import Button from '../ui/Button'
import { Professional } from '../../types'
import { ProfessionalBlock } from '../../types/schedule'

interface ProfessionalBlocksProps {
  professional: Professional
}

export default function ProfessionalBlocks({ professional }: ProfessionalBlocksProps) {
  const [blocks, setBlocks] = useState<ProfessionalBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newBlock, setNewBlock] = useState({
    start_date: '',
    end_date: '',
    reason: ''
  })
  const { showToast } = useToast()

  useEffect(() => {
    fetchBlocks()
  }, [professional.id])

  const fetchBlocks = async () => {
    try {
      const { data, error } = await supabase
        .from('professional_blocks')
        .select('*')
        .eq('professional_id', professional.id)
        .order('start_date')

      if (error) throw error

      setBlocks(data || [])
    } catch (error) {
      console.error('Error fetching blocks:', error)
      showToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudieron cargar los bloqueos'
      })
    } finally {
      setLoading(false)
    }
  }

  const addBlock = async () => {
    try {
      if (!newBlock.start_date || !newBlock.end_date) {
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Las fechas son requeridas'
        })
        return
      }

      const startDate = new Date(newBlock.start_date)
      const endDate = new Date(newBlock.end_date)

      if (endDate <= startDate) {
        showToast({
          type: 'error',
          title: 'Error',
          message: 'La fecha de fin debe ser posterior a la fecha de inicio'
        })
        return
      }

      const { data, error } = await supabase
        .from('professional_blocks')
        .insert({
          professional_id: professional.id,
          user_id: professional.user_id,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          reason: newBlock.reason || null
        })
        .select()
        .single()

      if (error) throw error

      setBlocks([...blocks, data])
      setShowAddForm(false)
      setNewBlock({ start_date: '', end_date: '', reason: '' })
      
      showToast({
        type: 'success',
        title: 'Bloqueo agregado',
        message: 'Se agregó el bloqueo correctamente'
      })
    } catch (error) {
      console.error('Error adding block:', error)
      showToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudo agregar el bloqueo'
      })
    }
  }

  const deleteBlock = async (id: string) => {
    try {
      const { error } = await supabase
        .from('professional_blocks')
        .delete()
        .eq('id', id)

      if (error) throw error

      setBlocks(blocks.filter(block => block.id !== id))
      showToast({
        type: 'success',
        title: 'Bloqueo eliminado',
        message: 'Se eliminó el bloqueo correctamente'
      })
    } catch (error) {
      console.error('Error deleting block:', error)
      showToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudo eliminar el bloqueo'
      })
    }
  }

  if (loading) {
    return <div className="text-center">Cargando bloqueos...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Bloqueos de Fechas</h3>
        <Calendar className="h-5 w-5 text-gray-400" />
      </div>

      {showAddForm ? (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de inicio
              </label>
              <input
                type="datetime-local"
                value={newBlock.start_date}
                onChange={(e) => setNewBlock({ ...newBlock, start_date: e.target.value })}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de fin
              </label>
              <input
                type="datetime-local"
                value={newBlock.end_date}
                onChange={(e) => setNewBlock({ ...newBlock, end_date: e.target.value })}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo (Opcional)
            </label>
            <input
              type="text"
              value={newBlock.reason || ''}
              onChange={(e) => setNewBlock({ ...newBlock, reason: e.target.value })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Ej: Vacaciones, Capacitación, etc."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddForm(false)
                setNewBlock({ start_date: '', end_date: '', reason: '' })
              }}
            >
              Cancelar
            </Button>
            <Button onClick={addBlock}>
              Agregar Bloqueo
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={() => setShowAddForm(true)}
        >
          Agregar nuevo bloqueo
        </Button>
      )}

      {blocks.length === 0 ? (
        <p className="text-sm text-gray-500">No hay bloqueos configurados</p>
      ) : (
        <div className="space-y-3">
          {blocks.map(block => (
            <div
              key={block.id}
              className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4"
            >
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {new Date(block.start_date).toLocaleString()} - {new Date(block.end_date).toLocaleString()}
                </div>
                {block.reason && (
                  <div className="text-sm text-gray-500 mt-1">
                    {block.reason}
                  </div>
                )}
              </div>
              <button
                onClick={() => deleteBlock(block.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
