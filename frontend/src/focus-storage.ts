import { recoverTimer, type FocusRequest, type FocusTimer } from '../../shared/focus';
export const TIMER_KEY = 'todo.focus.timer.v1';
export const PENDING_KEY = 'todo.focus.pending.v1';

export function readTimer(storage: Storage, now=Date.now()) {
  const raw=storage.getItem(TIMER_KEY);
  if (!raw) return null;
  const timer=recoverTimer(JSON.parse(raw),now);
  if (!timer) throw new Error('O estado local do Foco é inválido. O planejamento salvo não foi alterado.');
  return timer;
}
export function readPending(storage: Storage): FocusRequest|null {
  const raw=storage.getItem(PENDING_KEY);
  if (!raw) return null;
  const value=JSON.parse(raw);
  if (!value || typeof value.key!=='string' || !Number.isSafeInteger(value.task_id) || typeof value.action!=='string') throw new Error('A confirmação local do Foco é inválida.');
  return value;
}
export function writeTimer(storage: Storage, timer: FocusTimer|null) {
  if (timer) storage.setItem(TIMER_KEY,JSON.stringify(timer)); else storage.removeItem(TIMER_KEY);
}
export function writePending(storage: Storage, pending: FocusRequest|null) {
  if (pending) storage.setItem(PENDING_KEY,JSON.stringify(pending)); else storage.removeItem(PENDING_KEY);
}
