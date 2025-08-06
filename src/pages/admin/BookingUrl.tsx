import React from 'react'
import { useAuth } from '../../hooks/useAuth'
import BookingUrlSection from '../../components/admin/BookingUrlSection'
import AdminLayout from '../../layouts/AdminLayout'
import PageHeader from '../../components/ui/PageHeader'

const BookingUrl: React.FC = () => {
  const { user } = useAuth()

  if (!user) return null

  return (
    <AdminLayout>
      <PageHeader
          title="URL de Reservas"
          subtitle="Configura e integra el sistema de reservas en tu sitio web."
        />
      <BookingUrlSection userId={user.id} />
    </AdminLayout>
  )
}

export default BookingUrl
