import type { Task, StudySession, SessionFormData } from '../frontend/src/types';
import { validDate, sessionInterval, overlaps } from './planning';

export type FocusAction = 'same' | 'keep' | 'reschedule' | 'unplan' | 'new';
export type Origin = Pick<StudySession, 'id' | 'task_id' | 'planned_date' | 'start_time' | 'duration_minutes'>;
export const snapshot = (s: Origin): Origin => ({id:s.id, task_id:s.task_id, planned_date:s.planned_date, start_time:s.start_time, duration_minutes:s.duration_minutes});
export interface FocusRequest {
  key: string; task_id: number; origin: Origin | null; action: FocusAction;
  current: SessionFormData | null; previous: SessionFormData | null;
  minutes: number; confirm_after_due: boolean;
}
export interface FocusResult { key: string; task_id: number; session_id: number | null; minutes: number }

export function validMinutes(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 180;
}
export function localTime(now = new Date()) { return `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`; }

export function suggestFocus(tasks: Task[], today: string, time: string) {
  const available = tasks.filter(t => t.status !== 'done');
  const now = sessionInterval(today, time, 1)![0];
  const entries = available.flatMap(task => task.sessions.filter(s => s.planned_date === today).map(session => {
    const interval = sessionInterval(session.planned_date, session.start_time, session.duration_minutes);
    const group = interval ? interval[0] <= now && now < interval[1] ? 0 : interval[0] > now ? 1 : 2 : 3;
    return {task, session, group, start:interval?.[0] || 0};
  })).sort((a,b) => a.group-b.group || a.start-b.start || a.task.priority_level-b.task.priority_level || a.task.id-b.task.id || a.session.id-b.session.id);
  if (entries.length) {
    const e = entries[0];
    return {task:e.task, session:e.session, reason:['Sessão de hoje cujo intervalo inclui o horário atual.','Próxima sessão com horário de hoje.','Sessão com horário de hoje já passado.','Sessão de hoje sem horário.'][e.group]};
  }
  const dated = available.filter(t => t.due_date).sort((a,b) => a.due_date!.localeCompare(b.due_date!) || a.priority_level-b.priority_level || a.id-b.id);
  return dated.length ? {task:dated[0], session:null, reason:dated[0].due_date! < today ? 'Atividade pendente com o prazo vencido mais antigo.' : 'Atividade pendente com o prazo mais próximo.'} : null;
}

export function freeSlot(tasks: Task[], origin: Origin, today: string, time: string) {
  if (origin.duration_minutes > 720) return null;
  const occupied = tasks.flatMap(t => t.sessions).filter(s => s.id !== origin.id);
  // The replacement occupies the original slot while the previous study moves.
  const intervals = [...occupied, origin].map(s => sessionInterval(s.planned_date,s.start_time,s.duration_minutes)).filter((s): s is [number,number] => !!s);
  const now = sessionInterval(today,time,1)![0];
  for (let offset=0; offset<7; offset++) {
    const day = new Date(`${today}T00:00:00Z`); day.setUTCDate(day.getUTCDate()+offset);
    const date = day.toISOString().slice(0,10);
    if (!validDate(date)) return null;
    for (let minute=8*60; minute+origin.duration_minutes<=20*60; minute+=15) {
      const start = `${String(Math.floor(minute/60)).padStart(2,'0')}:${String(minute%60).padStart(2,'0')}`;
      const interval = sessionInterval(date,start,origin.duration_minutes)!;
      if (interval[0] >= now && !intervals.some(other => overlaps(interval,other))) return {planned_date:date,start_time:start,duration_minutes:origin.duration_minutes};
    }
  }
  return null;
}

export interface FocusTimer extends FocusResult {
  version: 1; phase: 'study'|'break'; status: 'running'|'paused'|'finished';
  totalMs: number; remainingMs: number; deadline: number; endedEarly: boolean;
}
export function newCycle(result: FocusResult, phase: FocusTimer['phase'], now: number): FocusTimer {
  if (!validMinutes(result.minutes)) throw new Error('O ciclo deve ter de 1 a 180 minutos inteiros.');
  const totalMs = (phase === 'break' ? 5 : result.minutes)*60000;
  return {...result,version:1,phase,status:'running',totalMs,remainingMs:totalMs,deadline:now+totalMs,endedEarly:false};
}
export const remaining = (timer: FocusTimer, now: number) => timer.status === 'running' ? Math.max(0,Math.min(timer.totalMs,timer.deadline-now)) : timer.remainingMs;
export function recoverTimer(value: unknown, now: number): FocusTimer | null {
  const t = value as FocusTimer | null;
  if (!t || t.version!==1 || typeof t.key!=='string' || !t.key || !Number.isSafeInteger(t.task_id) || t.task_id<=0 || !validMinutes(t.minutes)
    || (t.session_id!==null && (!Number.isSafeInteger(t.session_id)||t.session_id<=0)) || typeof t.endedEarly!=='boolean'
    || !['study','break'].includes(t.phase) || !['running','paused','finished'].includes(t.status)
    || !Number.isFinite(t.deadline) || !Number.isFinite(t.remainingMs) || t.remainingMs<0 || t.remainingMs>t.totalMs
    || t.totalMs!==(t.phase==='break'?5:t.minutes)*60000) return null;
  return t.status==='running' && remaining(t,now)===0 ? {...t,status:'finished',remainingMs:0} : t;
}
export function changeTimer(timer: FocusTimer, action: 'pause'|'resume'|'end', now: number): FocusTimer {
  const t = recoverTimer(timer,now)!;
  if (action==='pause' && t.status==='running') return {...t,status:'paused',remainingMs:remaining(t,now)};
  if (action==='resume' && t.status==='paused') return {...t,status:'running',deadline:now+t.remainingMs};
  if (action==='end' && t.status!=='finished') return {...t,status:'finished',remainingMs:remaining(t,now),endedEarly:true};
  return t;
}
export function timerText(timer: FocusTimer, now: number) {
  const seconds = Math.ceil(remaining(timer,now)/1000);
  return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
}
