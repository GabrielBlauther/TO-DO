import type { Database } from 'bun:sqlite';
import { sessionInterval, overlaps } from '../shared/planning';
import type { SessionFormData } from '../frontend/src/types';

export class PlanningError extends Error {
  constructor(message: string, public status=400) { super(message); }
}
export function validateSession(db: Database, dueDate: string|null, data: SessionFormData, excludeId=0, confirmed=false) {
  if (data.start_time !== null && typeof data.start_time !== 'string') throw new PlanningError('Horário inválido.');
  let interval: [number,number]|null;
  try { interval = sessionInterval(data.planned_date,data.start_time,data.duration_minutes); }
  catch(error) { throw new PlanningError((error as Error).message); }
  if (interval) {
    const others = db.query('SELECT ss.*, t.title FROM study_sessions ss JOIN tasks t ON t.id=ss.task_id WHERE ss.start_time IS NOT NULL AND ss.id != ?').all(excludeId) as (SessionFormData & {title:string})[];
    const conflict = others.find(other => overlaps(interval!,sessionInterval(other.planned_date,other.start_time,other.duration_minutes)!));
    if (conflict) throw new PlanningError(`Conflito com "${conflict.title}" em ${conflict.planned_date} às ${conflict.start_time}. Escolha outro horário ou cancele.`,409);
  }
  if (dueDate && data.planned_date>dueDate && !confirmed) throw new PlanningError('O estudo está após o prazo da atividade. Revise ou confirme conscientemente para salvar.',422);
}
