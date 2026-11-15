import { expect, test } from 'bun:test';
import { calendarEntries, initialMonth, inRange, monthDays, monthLabel, shiftMonth } from '../frontend/src/calendar';
import type { Task } from '../frontend/src/types';

test('navegação atravessa dezembro/janeiro e preserva os limites suportados', () => {
  expect(shiftMonth('2026-12', 1)).toBe('2027-01');
  expect(shiftMonth('2027-01', -1)).toBe('2026-12');
  expect(shiftMonth('1000-01', -1)).toBe('1000-01');
  expect(shiftMonth('9999-12', 1)).toBe('9999-12');
});
test('grade inclui fevereiro bissexto, alinhamento segunda-feira e somente dias do mês', () => {
  const leap = monthDays('2024-02');
  expect(leap.slice(0, 4)).toEqual([null, null, null, '2024-02-01']);
  expect(leap.filter(Boolean)).toHaveLength(29);
  expect(leap).toContain('2024-02-29');
  expect(monthDays('2026-02').filter(Boolean)).toHaveLength(28);
  expect(monthDays('2026-04').filter(Boolean)).toHaveLength(30);
  expect(monthDays('2026-12').filter(Boolean)).toHaveLength(31);
  expect(leap.length % 7).toBe(0);
  expect(() => monthDays('2026-13')).toThrow();
});
test('mês inicial pertence ao filtro; mês e rótulo não deslocam por fuso', () => {
  const range = { start: '2024-02-29', end: '2024-03-01' };
  expect(initialMonth(range, '2026-11-15')).toBe('2024-02');
  expect(initialMonth({}, '2026-11-15')).toBe('2026-11');
  expect(monthLabel('2024-02')).toBe('fevereiro de 2024');
  expect(inRange('2024-02-29', range)).toBe(true);
  expect(inRange('2024-03-01', range)).toBe(true);
  expect(inRange('2024-02-28', range)).toBe(false);
});
test('calendário filtra cada sessão; várias sessões não duplicam a atividade nem usam prazo', () => {
  const task = { id: 42, title: 'IHC', due_date: '2024-04-01', sessions: [
    { id: 1, task_id: 42, planned_date: '2024-02-28', start_time: null, duration_minutes: 50 },
    { id: 2, task_id: 42, planned_date: '2024-02-29', start_time: null, duration_minutes: 50 },
    { id: 3, task_id: 42, planned_date: '2024-02-29', start_time: '09:00', duration_minutes: 50 },
    { id: 4, task_id: 42, planned_date: '2024-03-01', start_time: null, duration_minutes: 50 },
  ] } as Task;
  const entries = calendarEntries([task], {start:'2024-02-29',end:'2024-03-01'}, '2024-02');
  expect(entries.map(e => e.session.id)).toEqual([3, 2]);
  expect(new Set(entries.map(e => e.task.id)).size).toBe(1);
  expect(entries.every(e => e.task === task)).toBe(true);
  expect(calendarEntries([task], {}, '2024-04')).toEqual([]);
  expect(calendarEntries([{ ...task, sessions: [] }], {}, '2024-02')).toEqual([]);
});
