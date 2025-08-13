import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import ProfileForm from '../../components/admin/ProfileForm'
import PageHeader from '../../components/ui/PageHeader'


export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [, setLoading] = useState(true)

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
  }, [user])

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Perfil de la Empresa"
          subtitle="Gestiona la información de tu empresa y consulta el estado de tu suscripción"
        />

        <div className="mt-8">
          <ProfileForm profile={profile} onSave={fetchProfile} />
        </div>
      </div>
    </div>
  )
}
