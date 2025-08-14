// Shared Spanish calendar i18n helpers
// Use across booking and reservations calendars

import type moment from 'moment';

export const dayTranslations: { [key: string]: string } = {
  lu: 'Lun',
  ma: 'Mar',
  mi: 'Mié',
  ju: 'Jue',
  vi: 'Vie',
  sa: 'Sáb',
  do: 'Dom',
};

// Monday-first order
export const dayShortLabels: string[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
export const dayInitials: string[] = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export const monthTranslations: { [key: string]: string } = {
  january: 'Enero',
  february: 'Febrero',
  march: 'Marzo',
  april: 'Abril',
  may: 'Mayo',
  june: 'Junio',
  july: 'Julio',
  august: 'Agosto',
  september: 'Septiembre',
  october: 'Octubre',
  november: 'Noviembre',
  december: 'Diciembre',
};

export const formatMonth = (date: moment.Moment) => {
  const month = date.format('MMMM').toLowerCase();
  const name = monthTranslations[month] || month.charAt(0).toUpperCase() + month.slice(1);
  return name;
};


export const formatDate = (dateString: string | Date) => {
  const d = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return d.toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Santiago',
  });
};
