import type { Database } from 'bun:sqlite';
import { validMinutes, snapshot, type FocusRequest, type FocusResult, type Origin } from '../shared/focus';
import { PlanningError, validateSession } from './session-rules';
import type { SessionFormData } from '../frontend/src/types';

function canonical(value: any): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;
}
export function confirmFocus(db: Database, body: FocusRequest): FocusResult {
  if (typeof body.key!=='string' || !/^[\w-]{16,100}$/.test(body.key)) throw new PlanningError('Confirmação inválida. Reabra o Foco.');
  if (!validMinutes(body.minutes)) throw new PlanningError('O ciclo deve ter de 1 a 180 minutos inteiros.');
  if (body.origin && (typeof body.origin!=='object' || Array.isArray(body.origin) || !Number.isSafeInteger(body.origin.id))) throw new PlanningError('O estudo planejado escolhido não é válido. Atualize as atividades e escolha novamente.');
  return db.transaction(() => {
    const request = canonical(body);
    const receipt = db.query('SELECT * FROM focus_confirmations WHERE request_key=?').get(body.key) as {request_json:string;result_json:string}|null;
    if (receipt) {
      if (receipt.request_json!==request) throw new PlanningError('Esta confirmação já foi usada com outras escolhas.',409);
      return JSON.parse(receipt.result_json);
    }
    const getTask = (id: number) => {
      if (!Number.isSafeInteger(id)) throw new PlanningError('Escolha uma atividade válida.');
      const t = db.query('SELECT id,status,due_date FROM tasks WHERE id=?').get(id) as {id:number;status:string;due_date:string|null}|null;
      if (!t || t.status==='done') throw new PlanningError('A atividade não está disponível para estudar. Atualize a escolha.',409);
      return t;
    };
    const current = getTask(body.task_id);
    const original = body.origin ? db.query('SELECT * FROM study_sessions WHERE id=?').get(body.origin.id) as Origin|null : null;
    if (body.origin && (!original || canonical(snapshot(original))!==canonical(body.origin))) throw new PlanningError('O estudo planejado escolhido mudou ou foi removido. Atualize as atividades, volte à escolha e revise antes de confirmar.',409);
    const previous = original ? getTask(original.task_id) : null;
    function insert(data: SessionFormData) {
      validateSession(db,current.due_date,data,0,body.confirm_after_due===true);
      return Number((db.query('INSERT INTO study_sessions(task_id,planned_date,start_time,duration_minutes) VALUES (?,?,?,?) RETURNING id').get(current.id,data.planned_date,data.start_time || null,data.duration_minutes) as {id:number}).id);
    }
    let sessionId: number|null = null;
    if (!original) {
      if (body.action!=='new' || !body.current) throw new PlanningError('Revise a inclusão do planejamento atual.');
      sessionId=insert(body.current);
    } else if (original.task_id===current.id) {
      if (body.action!=='same') throw new PlanningError('Este estudo já pertence à atividade escolhida. Volte e revise o planejamento.');
      sessionId=original.id;
    } else if (body.action==='keep') {
      // Execution only: no automatic planning or conflicting insertion.
    } else if (body.action==='reschedule' || body.action==='unplan') {
      if (body.action==='reschedule') {
        if (!body.previous || body.previous.duration_minutes!==original.duration_minutes) throw new PlanningError('Revise a data e o horário do estudo anterior.');
        validateSession(db,previous!.due_date,body.previous,original.id,body.confirm_after_due===true);
        db.query('UPDATE study_sessions SET planned_date=?,start_time=? WHERE id=?').run(body.previous.planned_date,body.previous.start_time || null,original.id);
      } else db.query('DELETE FROM study_sessions WHERE id=?').run(original.id);
      // Checks the moved original too; overlap causes rollback of all writes.
      sessionId=insert(original);
    } else throw new PlanningError('Escolha o destino da sessão anterior.');
    const result = {key:body.key,task_id:current.id,session_id:sessionId,minutes:body.minutes};
    db.query('INSERT INTO focus_confirmations(request_key,request_json,result_json) VALUES (?,?,?)').run(body.key,request,JSON.stringify(result));
    return result;
  })();
}
