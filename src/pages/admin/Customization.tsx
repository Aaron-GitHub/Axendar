import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import PageHeader from '../../components/ui/PageHeader'
import { useToast } from '../../hooks/useToast'
import Button from '../../components/ui/Button'
import { Palette, Eye, Smartphone, Monitor } from 'lucide-react'

interface CustomizationSettings {
  booking_primary_color?: string
  booking_accent_color?: string
}

export default function Customization() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<CustomizationSettings>({ 
    booking_primary_color: '#338B85', 
    booking_accent_color: '#22c55e' 
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()

  const fetchSettings = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profile_settings')
        .select('booking_primary_color, booking_accent_color')
        .eq('user_id', user.id)
        .maybeSingle()
      
      if (error) throw error
      
      setSettings(data || { 
        booking_primary_color: '#338B85', 
        booking_accent_color: '#22c55e' 
      })
    } catch (error) {
      console.error('Error fetching customization settings:', error)
      setSettings({ 
        booking_primary_color: '#338B85', 
        booking_accent_color: '#22c55e' 
      })
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    if (!user || !settings) return
    
    try {
      setSaving(true)
      const payload = {
        user_id: user.id,
        booking_primary_color: settings.booking_primary_color || null,
        booking_accent_color: settings.booking_accent_color || null,
        updated_at: new Date().toISOString()
      }
      
      const { error } = await supabase
        .from('profile_settings')
        .upsert(payload, { onConflict: 'user_id' })
      
      if (error) throw error

      showToast({
        type: 'success',
        title: 'Personalización Guardada',
        message: 'Los colores de tu página de reservas se han actualizado correctamente'
      })
    } catch (error) {
      console.error('Error saving customization settings:', error)
      showToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudieron guardar los cambios. Inténtalo de nuevo.'
      })
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Personalización"
          subtitle="Ajusta los colores y el estilo visual de tu página de reservas"
        />

        <div className="mt-8 space-y-8">
          {/* Sección de Colores */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex items-center mb-6">
              <Palette className="h-6 w-6 text-primary-600 mr-3" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Colores del Sistema</h2>
                <p className="text-sm text-gray-500">Personaliza los colores principales de tu página pública de reservas</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Color principal</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings?.booking_primary_color || '#338B85'}
                      onChange={(e) => setSettings(s => ({ ...s, booking_primary_color: e.target.value }))}
                      className="h-12 w-16 p-1 bg-transparent border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings?.booking_primary_color || ''}
                      onChange={(e) => setSettings(s => ({ ...s, booking_primary_color: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="#338B85"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Este color se usa para botones principales, enlaces y elementos destacados
                  </p>
                </div>

                {/* Preparado para futuras opciones */}
                <div className="opacity-50 pointer-events-none">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Color de acento
                    <span className="ml-2 text-xs text-gray-400">(Próximamente)</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings?.booking_accent_color || '#22c55e'}
                      className="h-12 w-16 p-1 bg-transparent border border-gray-300 rounded-lg"
                      disabled
                    />
                    <input
                      type="text"
                      value={settings?.booking_accent_color || ''}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      placeholder="#22c55e"
                      disabled
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Color secundario para elementos de apoyo y estados de éxito
                  </p>
                </div>
              </div>

              {/* Vista previa */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                  <Eye className="h-4 w-4 mr-2" />
                  Vista previa
                </h3>
                <div className="space-y-4">
                  {/* Simulación de botón principal */}
                  <div
                    className="px-4 py-2 rounded-lg text-white text-sm font-medium text-center"
                    style={{ backgroundColor: settings?.booking_primary_color || '#338B85' }}
                  >
                    Reservar Cita
                  </div>
                  
                  {/* Simulación de enlace */}
                  <div className="text-sm">
                    <span className="text-gray-600">Ver más </span>
                    <span 
                      className="underline font-medium"
                      style={{ color: settings?.booking_primary_color || '#338B85' }}
                    >
                      información aquí
                    </span>
                  </div>

                  {/* Simulación de elemento seleccionado */}
                  <div className="border-2 rounded-lg p-3 text-sm"
                       style={{ borderColor: settings?.booking_primary_color || '#338B85' }}>
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: settings?.booking_primary_color || '#338B85' }}
                      ></div>
                      Horario seleccionado: 10:00 AM
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de futuras personalizaciones */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 opacity-50">
            <div className="flex items-center mb-6">
              <Monitor className="h-6 w-6 text-gray-400 mr-3" />
              <div>
                <h2 className="text-lg font-semibold text-gray-500">Más Opciones de Personalización</h2>
                <p className="text-sm text-gray-400">Próximamente disponibles</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="p-4 border border-gray-200 rounded-lg">
                <Smartphone className="h-8 w-8 text-gray-400 mb-2" />
                <h3 className="font-medium text-gray-500">Diseño Móvil</h3>
                <p className="text-sm text-gray-400 mt-1">Personaliza la experiencia en dispositivos móviles</p>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg">
                <Palette className="h-8 w-8 text-gray-400 mb-2" />
                <h3 className="font-medium text-gray-500">Temas Predefinidos</h3>
                <p className="text-sm text-gray-400 mt-1">Aplica temas de colores profesionales</p>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg">
                <Monitor className="h-8 w-8 text-gray-400 mb-2" />
                <h3 className="font-medium text-gray-500">Tipografías</h3>
                <p className="text-sm text-gray-400 mt-1">Selecciona fuentes personalizadas</p>
              </div>
            </div>
          </div>

          {/* Botón de guardar */}
          <div className="flex justify-end">
            <Button
              onClick={saveSettings}
              loading={saving}
              className="px-6"
            >
              Guardar Cambios
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
