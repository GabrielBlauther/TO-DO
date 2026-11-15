import type { Task, StudySession } from './types';
import { validDate } from '../../shared/planning';

export type CalendarRange = { start?: string; end?: string };
export type CalendarEntry = { task: Task; session: StudySession };

export function initialMonth(range: CalendarRange, today: string) {
  return (range.start || today).slice(0, 7);
}

export function shiftMonth(month: string, delta: number) {
  const year = Number(month.slice(0, 4));
  const index = year * 12 + Number(month.slice(5)) - 1 + delta;
  // Match the supported civil-date range without wrapping at the endpoints.
  if (index < 1000 * 12 || index > 9999 * 12 + 11) return month;
  return `${Math.floor(index / 12)}-${String(index % 12 + 1).padStart(2, '0')}`;
}

export function monthDays(month: string): (string | null)[] {
  if (!validDate(`${month}-01`)) throw new Error('Mês inválido.');
  // UTC here is a civil calendar arithmetic scale, never a display conversion.
  const first = new Date(`${month}-01T00:00:00Z`);
  const offset = (first.getUTCDay() + 6) % 7; // Monday first.
  const count = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  const days: (string | null)[] = Array(offset).fill(null);
  for (let day = 1; day <= count; day++) days.push(`${month}-${String(day).padStart(2, '0')}`);
  while (days.length % 7) days.push(null);
  return days;
}

export function monthLabel(month: string) {
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(`${month}-01T00:00:00Z`));
}

export function inRange(date: string, range: CalendarRange) {
  return (!range.start || date >= range.start) && (!range.end || date <= range.end);
}

export function calendarEntries(tasks: Task[], range: CalendarRange, month: string): CalendarEntry[] {
  return tasks.flatMap(task => task.sessions
    .filter(session => session.planned_date.startsWith(`${month}-`) && inRange(session.planned_date, range))
    .map(session => ({ task, session })))
    .sort((a, b) => a.session.planned_date.localeCompare(b.session.planned_date)
      || (a.session.start_time || '99:99').localeCompare(b.session.start_time || '99:99')
      || a.task.title.localeCompare(b.task.title) || a.session.id - b.session.id);
}
