import type { CalendarEvent } from '../types';

export const EVENT_COLORS = [
  { id: '#3B82F6', label: '업무·학습', bg: '#EFF6FF', text: '#1D4ED8' },
  { id: '#D97757', label: '개인·약속', bg: '#FFF5F2', text: '#C2410C' },
  { id: '#10B981', label: '건강·운동', bg: '#ECFDF5', text: '#047857' },
  { id: '#8B5CF6', label: '가족·행사', bg: '#F5F3FF', text: '#6D28D9' },
  { id: '#F59E0B', label: '중요', bg: '#FFFBEB', text: '#B45309' },
];

/**
 * Generates official Google Calendar web intent URL to add an event with 1 click
 */
export function createGoogleCalendarUrl(event: CalendarEvent): string {
  const [year, month, day] = event.date.split('-');
  const dateBase = `${year}${month}${day}`;

  let datesParam = '';
  if (event.time) {
    const [startH, startM] = event.time.split(':');
    const startStr = `${dateBase}T${startH}${startM}00`;

    if (event.endTime) {
      const [endH, endM] = event.endTime.split(':');
      const endStr = `${dateBase}T${endH}${endM}00`;
      datesParam = `${startStr}/${endStr}`;
    } else {
      // Default duration: 1 hour
      const nextHour = String(Math.min(23, Number(startH) + 1)).padStart(2, '0');
      const endStr = `${dateBase}T${nextHour}${startM}00`;
      datesParam = `${startStr}/${endStr}`;
    }
  } else {
    // All-day event: start date to next day
    const nextDate = new Date(Number(year), Number(month) - 1, Number(day) + 1);
    const nextY = nextDate.getFullYear();
    const nextM = String(nextDate.getMonth() + 1).padStart(2, '0');
    const nextD = String(nextDate.getDate()).padStart(2, '0');
    datesParam = `${dateBase}/${nextY}${nextM}${nextD}`;
  }

  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.set('action', 'TEMPLATE');
  url.searchParams.set('text', event.title);
  url.searchParams.set('dates', datesParam);

  if (event.description) {
    url.searchParams.set('details', event.description);
  }
  if (event.location) {
    url.searchParams.set('location', event.location);
  }

  return url.toString();
}

/**
 * Opens Google Calendar event creation page in a new window/tab
 */
export function openInGoogleCalendar(event: CalendarEvent): void {
  const url = createGoogleCalendarUrl(event);
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Formats a Date object into UTC iCalendar format "YYYYMMDDTHHMMSSZ"
 */
function toIcsTimestamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Exports all calendar events to a standard RFC 5545 .ics file
 * Supported by Google Calendar, Apple Calendar (iOS), Outlook, etc.
 */
export function exportEventsToIcs(events: CalendarEvent[]): void {
  if (events.length === 0) {
    alert('내보낼 일정이 없습니다.');
    return;
  }

  const nowStamp = toIcsTimestamp(new Date());

  const eventBlocks = events.map((ev) => {
    const [y, m, d] = ev.date.split('-');
    const dateBase = `${y}${m}${d}`;

    let dtStartLine = '';
    let dtEndLine = '';

    if (ev.time) {
      const [sh, sm] = ev.time.split(':');
      dtStartLine = `DTSTART:${dateBase}T${sh}${sm}00`;
      if (ev.endTime) {
        const [eh, em] = ev.endTime.split(':');
        dtEndLine = `DTEND:${dateBase}T${eh}${em}00`;
      } else {
        const nextHour = String(Math.min(23, Number(sh) + 1)).padStart(2, '0');
        dtEndLine = `DTEND:${dateBase}T${nextHour}${sm}00`;
      }
    } else {
      dtStartLine = `DTSTART;VALUE=DATE:${dateBase}`;
      const nextDate = new Date(Number(y), Number(m) - 1, Number(d) + 1);
      const ny = nextDate.getFullYear();
      const nm = String(nextDate.getMonth() + 1).padStart(2, '0');
      const nd = String(nextDate.getDate()).padStart(2, '0');
      dtEndLine = `DTEND;VALUE=DATE:${ny}${nm}${nd}`;
    }

    const cleanTitle = ev.title.replace(/[,;]/g, ' ');
    const cleanDesc = (ev.description || '').replace(/\n/g, '\\n').replace(/[,;]/g, ' ');
    const cleanLoc = (ev.location || '').replace(/[,;]/g, ' ');

    return [
      'BEGIN:VEVENT',
      `UID:${ev.id}@haru.gratitude`,
      `DTSTAMP:${nowStamp}`,
      dtStartLine,
      dtEndLine,
      `SUMMARY:${cleanTitle}`,
      cleanDesc ? `DESCRIPTION:${cleanDesc}` : '',
      cleanLoc ? `LOCATION:${cleanLoc}` : '',
      'STATUS:CONFIRMED',
      'END:VEVENT',
    ]
      .filter(Boolean)
      .join('\r\n');
  });

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Haru Gratitude Journal//KO',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:하루 일정',
    'X-WR-TIMEZONE:Asia/Seoul',
    ...eventBlocks,
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `haru_schedule_${new Date().toISOString().split('T')[0]}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
