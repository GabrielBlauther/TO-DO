export type Period = 'all' | 'today' | 'month' | 'semester' | 'custom' | 'unplanned';
export function validDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^[1-9]\d{3}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function localToday(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
export function formatDate(value: string | null): string {
  return value ? value.split('-').reverse().join('/') : 'Sem prazo';
}
export function periodRange(period: Period, today: string, start = '', end = '') {
  const year = today.slice(0, 4), month = today.slice(5, 7);
  if (period === 'today') return { start: today, end: today };
  if (period === 'month') return { start: `${year}-${month}-01`, end: `${year}-${month}-${new Date(Number(year), Number(month), 0).getDate()}` };
  if (period === 'semester') return Number(month) <= 6
    ? { start: `${year}-01-01`, end: `${year}-06-30` } : { start: `${year}-07-01`, end: `${year}-12-31` };
  if (period === 'custom') {
    if (!validDate(start) || !validDate(end)) throw new Error('Informe datas inicial e final válidas.');
    if (start > end) throw new Error('A data inicial não pode ser posterior à final.');
    return { start, end };
  }
  return {};
}
export function sessionInterval(date: string, time: string | null, duration: number): [number, number] | null {
  if (!validDate(date)) throw new Error('Informe uma data planejada válida.');
  if (!Number.isSafeInteger(duration) || duration <= 0) throw new Error('A duração deve ser um número inteiro positivo de minutos.');
  if (time === null || time === '') return null;
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error('Informe um horário válido (HH:mm).');
  // Arithmetic scale for civil intervals, without local timezone conversion.
  const start = Date.parse(`${date}T${time}:00Z`) / 60000, end = start + duration;
  if (!Number.isSafeInteger(end) || end > Date.parse('9999-12-31T23:59:00Z') / 60000) throw new Error('A duração ultrapassa o intervalo de datas suportado.');
  return [start, end];
}
export function overlaps(a: [number, number], b: [number, number]) {
  return a[0] < b[1] && b[0] < a[1];
}
