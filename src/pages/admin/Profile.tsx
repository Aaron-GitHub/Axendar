import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import ProfileForm from '../../components/admin/ProfileForm'
import PageHeader from '../../components/ui/PageHeader'
import { useToast } from '../../hooks/useToast'

export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<{ booking_primary_color?: string; booking_accent_color?: string } | null>(null)
  const [savingSettings, setSavingSettings] = useState(false)
  const { showToast } = useToast()

  const fetchProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
    const fetchSettings = async () => {
      if (!user) return
      try {
        const { data, error } = await supabase
          .from('profile_settings')
          .select('booking_primary_color, booking_accent_color')
          .eq('user_id', user.id)
          .maybeSingle()
        if (error) throw error
        setSettings(data || { booking_primary_color: '#338B85', booking_accent_color: '#22c55e' })
      } catch (e) {
        console.error('Error fetching profile settings:', e)
        setSettings({ booking_primary_color: '#338B85', booking_accent_color: '#22c55e' })
      }
    }
    fetchSettings()
  }, [user])




  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-1/4 bg-gray-200 rounded"></div>
            <div className="mt-6 h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Perfil de la Empresa"
          subtitle="Gestiona la información de tu empresa y consulta el estado de tu suscripción"
        />

        <div className="mt-8">
          <div>
            <ProfileForm profile={profile} onSave={fetchProfile} />
          </div>
          {/* Branding / Booking settings */}
          <div className="mt-8 bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Branding de la Página de Reservas</h2>
            <p className="text-sm text-gray-500 mb-4">Personaliza los colores principales visibles en tu página pública de reservas.</p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color principal</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings?.booking_primary_color || '#338B85'}
                    onChange={(e) => setSettings((s) => ({ ...(s || {}), booking_primary_color: e.target.value }))}
                    className="h-10 w-14 p-1 bg-transparent border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={settings?.booking_primary_color || ''}
                    onChange={(e) => setSettings((s) => ({ ...(s || {}), booking_primary_color: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="#338B85"
                  />
                </div>
              </div>
              {/*<div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color de acento</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings?.booking_accent_color || '#22c55e'}
                    onChange={(e) => setSettings((s) => ({ ...(s || {}), booking_accent_color: e.target.value }))}
                    className="h-10 w-14 p-1 bg-transparent border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={settings?.booking_accent_color || ''}
                    onChange={(e) => setSettings((s) => ({ ...(s || {}), booking_accent_color: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="#22c55e"
                  />
                </div>
              </div>*/}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={async () => {
                  if (!user || !settings) return
                  setSavingSettings(true)
                  try {
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
                      title: 'Color Modificado',
                      message: 'Se modifico el color de tu formulario de reservas correctamente'
                    })
                  } catch (e) {
                    console.error('Error saving settings:', e)
                  } finally {
                    setSavingSettings(false)
                  }
                }}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-md"
                style={{ backgroundColor: settings?.booking_primary_color || '#338B85' }}
                disabled={savingSettings}
              >
                {savingSettings ? 'Guardando…' : 'Guardar colores'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
