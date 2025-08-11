import React, { useEffect, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Reservation } from '../../types'
import moment from 'moment'
import { getStatusColor } from '../../utils/statusUtils'

// Importar estilos de FullCalendar 6.1.8
//import 'node_modules/@fullcalendar/core/main.css'
//import 'node_modules/@fullcalendar/daygrid/main.css'
//import 'node_modules/@fullcalendar/timegrid/main.css'

interface CalendarViewProps {
  reservations: Reservation[]
  onEventClick: (reservation: Reservation) => void
  currentDate?: string
}

const CalendarView: React.FC<CalendarViewProps> = ({ reservations, onEventClick, currentDate }) => {
  const calendarRef = useRef<FullCalendar | null>(null)
  const events = reservations.map(reservation => ({
    id: reservation.id,
    title: `${reservation.clients?.name}`,
    start: reservation.start_time,
    end: reservation.end_time,
    backgroundColor: getStatusColor(reservation.status).replace('text-', 'bg-').replace('bg-opacity-10', 'bg-opacity-80'),
    borderColor: 'transparent',
    textColor: '#ffffff',
    extendedProps: { reservation },
    description: `${reservation.services?.name} - ${reservation.professionals?.name || 'Sin profesional'}`,
    classNames: [
      'event-with-description',
      `status-${reservation.status}`
    ]
  }))

  useEffect(() => {
    if (currentDate && calendarRef.current) {
      const api = calendarRef.current.getApi()
      try { api.gotoDate(currentDate) } catch {}
    }
  }, [currentDate])

  return (
    <div className="bg-white rounded-lg shadow">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridDay"
        initialDate={currentDate}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        views={{
          timeGridWeek: {
            titleFormat: { year: 'numeric', month: 'long', day: 'numeric' }
          },
          timeGridDay: {
            titleFormat: { year: 'numeric', month: 'long', day: 'numeric' }
          }
        }}
        buttonText={{
          today: 'Hoy',
          month: 'Mes',
          week: 'Semana',
          day: 'Día'
        }}
        locale="es"
        firstDay={1}
        slotMinTime="08:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={false}
        events={events}
        eventContent={(arg) => {
          return (
            <div
              className="event-with-description"
              data-description={arg.event.extendedProps.description}
            >
              <div className="fc-event-time">{arg.timeText}</div>
              <div className="fc-event-title">{arg.event.title}</div>
            </div>
          )
        }}
        eventClick={(info) => {
          onEventClick(info.event.extendedProps.reservation)
        }}
        height="auto"
        slotDuration="00:30:00"
        slotLabelFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }}
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }}
        nowIndicator={true}
        scrollTime={moment().format('HH:mm:ss')}
      />
    </div>
  )
}

export default CalendarView
