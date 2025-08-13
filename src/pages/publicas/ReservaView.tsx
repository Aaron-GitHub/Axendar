import React, { useCallback, useEffect, useMemo, useState } from 'react';
// Icons are used inside ReservationCard only
import { useNavigate, useParams } from 'react-router-dom';
import { supabaseAdmin } from '../../lib/supabase';
import { ReservationWithBranding } from '../../types/reservation.types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ReservationCard from '../../components/reservations/ReservationCard';
import { hexToRgba } from '../../utils/color';
import { sendEmail } from '../../services/emailService';
import { Download, Phone, Share2 } from 'lucide-react';
import { formatDate } from '../../utils/esCalendar';

// getStatusIcon se movió a components/reservations/ReservationCard

// Nota: se eliminó formatTime porque el mapeo usa toLocaleTimeString inline con zona horaria de Chile.
// Página pública que carga la reserva por ID desde la URL
export const ReservaView: React.FC = () => {
  const { reservaId } = useParams<{ reservaId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservation, setReservation] = useState<(ReservationWithBranding & { time?: string; location?: string; modificationDeadline?: string | Date }) | null>(null);
  // Branding básico tomado del perfil si existe, si no, usa el color por defecto
  const branding = useMemo(() => ({
    booking_primary_color: (reservation as any)?.profile?.primary_color || '#338B85',
  }), [reservation]);

  useEffect(() => {
    const fetchReservation = async () => {
      if (!reservaId) {
        setError('ID de reserva no proporcionado');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabaseAdmin
          .from('reservations')
          .select(`
            id, client_id, professional_id, service_id, start_time, end_time, status, notes, total_amount, user_id, start_time,
            clients ( id, name, email, phone ),
            services ( id, name, price, duration, description ),
            professionals ( id, name, email, phone )
          `)
          .eq('id', reservaId)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Reserva no encontrada');

        // Normalizar relaciones (algunas instalaciones devuelven arrays si no hay FK declarada)
        const client = Array.isArray((data as any).clients) ? (data as any).clients[0] : (data as any).clients;
        const service = Array.isArray((data as any).services) ? (data as any).services[0] : (data as any).services;
        const professional = Array.isArray((data as any).professionals) ? (data as any).professionals[0] : (data as any).professionals;

        // Cargar el perfil por separado usando user_id
        let profile: any = null;
        if ((data as any).user_id) {
          const { data: profileData, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('id, name, email, phone, logo_url, company_name, address, phone, website, min_booking_hours, min_cancel_hours')
            .eq('id', (data as any).user_id)
            .single();
          if (profileError) {
            console.warn('No se pudo cargar el perfil del usuario:', profileError.message);
          }
          profile = profileData || null;
        }

        let branding: any = null;
        if ((data as any).user_id) {
           const { data: brandingData, error: brandingError } = await supabaseAdmin
              .from('profile_settings')
              .select('booking_primary_color, booking_accent_color')
              .eq('user_id', (data as any).user_id)
              .maybeSingle()
            if (brandingError) throw brandingError
            branding = brandingData || null

        }
  
        const start = new Date((data as any).start_time);
        // Calcular fecha límite de modificación considerando min_cancel_hours del perfil
        const minCancelHours = (profile as any)?.min_cancel_hours ?? 0;
        const modificationDeadline = new Date(start.getTime() - minCancelHours * 60 * 60 * 1000);
        const mapped: ReservationWithBranding & { time: string; modificationDeadline?: string | Date } = {
          ...(data as any),
          clients: client,
          services: service,
          professionals: professional,
          profile,
          branding,
          time: start.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Santiago' }),
          modificationDeadline,
          date: start,
          client_name: client?.name || '',
          client_email: client?.email || '',
        };

        setReservation(mapped);
      } catch (e) {
        console.error('Error fetching reservation:', e);
        setError(e instanceof Error ? e.message : 'Error al cargar la reserva');
      } finally {
        setLoading(false);
      }
    };

    fetchReservation();
  }, [reservaId]);

  const notifyAdminStatusChange = useCallback(async (newStatus: 'confirmed' | 'cancelled') => {
    if (!reservation) return;
    try {
      // Obtener email del admin/propietario desde profiles
      const { data: adminProfile } = await supabaseAdmin
        .from('profiles')
        .select('email, company_name')
        .eq('id', reservation.user_id)
        .single();

      const adminEmail = (adminProfile as any)?.email;
      if (!adminEmail) return;

      const subject = newStatus === 'confirmed' ? 'Reserva confirmada' : 'Reserva cancelada';
      const actionUrl = `${window.location.origin}/reservacliente/${reservation.id}`;
      const serviceName = (reservation as any)?.services?.name || 'Servicio';
      const professionalName = (reservation as any)?.professionals?.name || 'Profesional';
      const clientName = (reservation as any)?.clients?.name || reservation.client_name || 'Cliente';

      await sendEmail(adminEmail, `Axendar · ${subject}`, {
        title: `Reserva ${newStatus === 'confirmed' ? 'confirmada' : 'cancelada'}`,
        name: adminProfile?.company_name || 'Administrador',
        message: `La reserva ${reservation.id} fue ${newStatus === 'confirmed' ? 'confirmada' : 'cancelada'} por el cliente (${clientName}).`,
        actionUrl,
        actionText: 'Ver detalle público',
        sections: [
          {
            title: 'Resumen',
            content: `
              <div class="detail-row"><span class="detail-label" style="margin-right: 10px; font-weight: bold;">Servicio:</span><span class="detail-value">${serviceName}</span></div>
              <div class="detail-row"><span class="detail-label" style="margin-right: 10px; font-weight: bold;">Fecha:</span><span class="detail-value">${formatDate(reservation.start_time)}</span></div>
              <div class="detail-row"><span class="detail-label" style="margin-right: 10px; font-weight: bold;">Profesional:</span><span class="detail-value">${professionalName}</span></div>
              <div class="detail-row"><span class="detail-label" style="margin-right: 10px; font-weight: bold;">Cliente:</span><span class="detail-value">${clientName}</span></div>
              <div class="detail-row"><span class="detail-label" style="margin-right: 10px; font-weight: bold;">Reserva:</span><span class="detail-value">${reservation.id}</span></div>
            `,
          },
        ],
      });
    } catch (e) {
      console.error('No se pudo notificar por email al admin:', e);
    }
  }, [reservation]);

  const handlers = useMemo(() => ({
    onConfirm: async (id: string) => {
      try {
        const { error } = await supabaseAdmin
          .from('reservations')
          .update({ status: 'confirmed' })
          .eq('id', id);
        if (error) throw error;
        setReservation((prev) => (prev ? { ...prev, status: 'confirmed' } : prev));
        await notifyAdminStatusChange('confirmed');
      } catch (e) {
        console.error(e);
        alert('No se pudo confirmar la reserva');
      }
    },
    onModify: (_id: string) => {
      // Redirigir a la página de reservar del dueño (si se conoce)
      if (reservation?.user_id) {
        navigate(`/reservar/${reservation.user_id}`);
      }
    },
    onCancel: async (id: string) => {
      try {
        const { error } = await supabaseAdmin
          .from('reservations')
          .update({ status: 'cancelled' })
          .eq('id', id);
        if (error) throw error;
        setReservation((prev) => (prev ? { ...prev, status: 'cancelled' } : prev));
        await notifyAdminStatusChange('cancelled');
      } catch (e) {
        console.error(e);
        alert('No se pudo cancelar la reserva');
      }
    },
    onContact: (_id: string) => {
      if (reservation?.professionals?.email) {
        window.location.href = `mailto:${reservation.professionals.email}`;
      }
    },
    onShare: (_id: string) => {
      if (navigator.share) {
        navigator.share({ title: 'Mi reserva', url: window.location.href });
      } else {
        navigator.clipboard.writeText(window.location.href);
        alert('Enlace copiado');
      }
    },
    onDownload: (_id: string) => {
      window.print();
    },
  }), [navigate, reservation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{error || 'Reserva no encontrada'}</h2>
          <p className="text-gray-600 mb-4">Revisa el enlace de confirmación que recibiste por correo.</p>
          <button onClick={() => navigate('/', { replace: true })} className="text-primary-600 hover:text-primary-700">Volver al inicio</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Columna de información de la empresa */}
        <div className="bg-white shadow sm:rounded-lg p-4 lg:col-span-1">
          <div className="flex flex-col items-center mb-8">
            {reservation?.profile?.logo_url ? (
              <img
                src={reservation?.profile?.logo_url}
                alt={reservation?.profile?.company_name}
                className="max-w-64 max-h-64 object-contain mb-4"
              />
            ) : (
              <div className="w-32 h-32 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: hexToRgba(branding?.booking_primary_color || '#338B85', 0.25) }}>
                <span className="text-4xl font-bold"
                  style={{ color: branding?.booking_primary_color || '#338B85' }}>
                  {reservation?.profile?.company_name?.[0]?.toUpperCase() || 'E'}
                </span>
              </div>
            )}
            <h1 className="text-3xl font-bold text-gray-900 text-center">
              {reservation?.profile?.company_name}
            </h1>
          </div>

          <div className="space-y-2 mb-8">
            {reservation?.profile?.address && (
              <div className="flex items-start">
                <svg className="w-5 h-5 text-gray-400 mt-1 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-gray-600">{reservation?.profile?.address}</p>
              </div>
            )}
            {reservation?.profile?.phone && (
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <p className="text-gray-600">{reservation?.profile?.phone}</p>
              </div>
            )}
            {reservation?.profile?.website && (
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <a href={reservation?.profile?.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">
                  {reservation?.profile?.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}

            <div className="mt-6 p-3 bg-blue-50 rounded-md">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Información importante</h4>
              <ul className="space-y-1 text-sm text-blue-700">
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Agenda con {reservation?.profile?.min_booking_hours || 0} horas de antelación
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancela con {reservation?.profile?.min_cancel_hours || 0} horas de antelación
                </li>
              </ul>
            </div>

            <div className="flex space-x-2 border-t pt-2">  
              <button
                onClick={() => handlers.onContact(reservation.id)}
                className="inline-flex p-2 rounded-full border-2 mb-4"
                style={{ borderColor: reservation.branding.booking_primary_color, color: reservation.branding.booking_primary_color }}
              >
                <Phone className="w-4 h-4" />
              </button>

              <button
                onClick={() => handlers.onShare(reservation.id)}
                className="inline-flex p-2 rounded-full border-2 mb-4"
                style={{ borderColor: reservation.branding.booking_primary_color, color: reservation.branding.booking_primary_color }}
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => handlers.onDownload(reservation.id)}
                className="inline-flex p-2 rounded-full border-2 mb-4"
                style={{ borderColor: reservation.branding.booking_primary_color, color: reservation.branding.booking_primary_color }}
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white shadow sm:rounded-lg p-2 sm:p-6 lg:col-span-2">
          <ReservationCard
            reservation={reservation}
            onConfirm={handlers.onConfirm}
            onModify={handlers.onModify}
            onCancel={handlers.onCancel}
          />
        </div>
        </div>
      </div>
    </div>
  );
};
