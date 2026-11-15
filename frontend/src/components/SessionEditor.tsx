import { useState, useEffect, useRef } from 'react';
import { Task, StudySession, SessionFormData } from '../types';
import { formatDate, localToday, sessionInterval } from '../../../shared/planning';
import * as api from '../api';
import {useAttempt} from '../useAttempt';

export default function SessionEditor({ task, onUpdated, onBusyChange, onDraftChange, initialDate, initialSessionId }: {
  task: Task; onUpdated: (task: Task) => void; onBusyChange: (busy: boolean) => void;
  initialDate?: string; initialSessionId?: number;
  onDraftChange:(dirty:boolean)=>void;
}) {
  const initialSession = task.sessions.find(session => session.id === initialSessionId);
  const [editing, setEditing] = useState<StudySession | 'new' | null>(initialDate ? 'new' : null);
  const [data, setData] = useState<SessionFormData>(initialSession || {planned_date:initialDate || localToday(),start_time:'',duration_minutes:50});
  const [confirmed, setConfirmed] = useState(false), [message, setMessage] = useState('');
  const [removeId, setRemoveId] = useState<number | null>(null);
  const {busy,error,setError,uncertain,run}=useAttempt();
  const previousEditing=useRef<typeof editing>(null);
  useEffect(()=>{
    if(!initialSessionId)return;
    const frame=requestAnimationFrame(()=>document.getElementById(`study-${initialSessionId}`)?.focus());
    return()=>cancelAnimationFrame(frame);
  },[initialSessionId]);
  useEffect(()=>onBusyChange(busy),[busy]);
  useEffect(()=>onDraftChange(!!editing&&!uncertain),[editing,uncertain]);
  useEffect(() => {
    if(!previousEditing.current&&!editing)return;
    previousEditing.current=editing;
    const frame = requestAnimationFrame(() => document.getElementById(editing?'planned-date':'add-session')?.focus());
    return () => cancelAnimationFrame(frame);
  }, [editing]);
  const afterDue = !!task.due_date && data.planned_date > task.due_date;
  function edit(session: StudySession | 'new') {
    setEditing(session); setRemoveId(null); setConfirmed(false); setError(''); setMessage('');
    setData(session === 'new' ? {planned_date:localToday(),start_time:'',duration_minutes:50} : {...session,start_time:session.start_time || ''});
  }
  function change(patch: Partial<SessionFormData>) { setData(old => ({...old,...patch})); setConfirmed(false); setError(''); }
  return <section className="study-planning" aria-labelledby="planning-title">
    <h3 id="planning-title">Planejamento de estudo</h3>
    <p className="help-text">Prazo da atividade: {formatDate(task.due_date)}. Reagendar estudo não altera o prazo.</p>
    {task.sessions.length === 0 && <p>Sem planejamento</p>}
    <ul className="session-list">{task.sessions.map(session => <li key={session.id} id={`study-${session.id}`} tabIndex={session.id===initialSessionId?-1:undefined} className={session.id===initialSessionId?'selected-session':''}>
      {session.id===initialSessionId&&<strong>Estudo selecionado no calendário</strong>}
      <p>{formatDate(session.planned_date)} · {session.start_time || 'Sem horário'} · {session.duration_minutes} min</p>
      <div className="session-actions"><button type="button" className="btn btn-secondary" disabled={busy||uncertain||!!editing} onClick={() => edit(session)} aria-label={`Editar sessão de ${formatDate(session.planned_date)} às ${session.start_time || 'sem horário'}`}>Editar sessão</button>
        <button type="button" className="btn btn-secondary" disabled={busy||uncertain||!!editing} onClick={() => {setRemoveId(session.id);setEditing(null);setError('');setMessage('');}} aria-label={`Remover sessão de ${formatDate(session.planned_date)} às ${session.start_time || 'sem horário'}`}>Remover sessão</button></div>
      {removeId === session.id && <div className="warning-message"><p>Remover este planejamento? A atividade e seu prazo serão mantidos.</p>
        <button className="btn btn-secondary" disabled={busy||uncertain} onClick={() => setRemoveId(null)}>Cancelar remoção</button>{' '}
        <button className="btn btn-danger" disabled={busy} onClick={async () => {
          await run(async()=>{onUpdated(await api.deleteSession(task.id,session.id));setRemoveId(null);setMessage('Sessão removida. A atividade foi mantida.');document.getElementById('add-session')?.focus();});
        }}>{busy?'Removendo…':uncertain?'Verificar resultado':'Confirmar remoção'}</button></div>}
    </li>)}</ul>
    {!editing && <button id="add-session" type="button" className="btn btn-primary" disabled={busy||uncertain} onClick={() => edit('new')}>Adicionar sessão</button>}
    {editing && <form className="session-form" onSubmit={async event => {
      event.preventDefault(); if(busy)return;setError('');setMessage('');
      try { sessionInterval(data.planned_date,data.start_time,data.duration_minutes); }
      catch(err){setError((err as Error).message);return;}
      if(afterDue && !confirmed){setError('Revise a data ou confirme o aviso antes de salvar.');return;}
      await run(async()=>{onUpdated(await api.saveSession(task.id,{...data,start_time:data.start_time || null,confirm_after_due:confirmed},editing === 'new' ? undefined : editing.id));setEditing(null);setMessage('Planejamento salvo.');});
    }}><fieldset disabled={busy||uncertain}>
      <h4>{editing === 'new' ? 'Nova sessão' : 'Editar sessão'}</h4>
      <div className="form-group"><label htmlFor="planned-date">Data planejada *</label><input id="planned-date" type="date" value={data.planned_date} required onChange={e => change({planned_date:e.target.value})} /></div>
      <div className="form-group"><label htmlFor="start-time">Horário inicial (opcional)</label><input id="start-time" type="time" value={data.start_time || ''} onChange={e => change({start_time:e.target.value})} /></div>
      <div className="form-group"><label htmlFor="duration">Duração planejada (minutos) *</label><input id="duration" type="number" min="1" step="1" required value={Number.isNaN(data.duration_minutes) ? '' : data.duration_minutes} onChange={e => change({duration_minutes:e.target.valueAsNumber})} /></div>
      <p className="help-text">Sem horário, várias sessões podem coexistir no dia. A duração pode abranger vários ciclos de estudo.</p>
      {afterDue && <div className="warning-message"><p>O estudo está após o prazo ({formatDate(task.due_date)}). Revise a data ou confirme sua escolha.</p>
        <label className="checkbox-label"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} /> Confirmo que desejo estudar após o prazo.</label></div>}
    </fieldset>
      <div className="form-actions"><button type="button" className="btn btn-secondary" disabled={busy||uncertain} onClick={() => {setEditing(null);setError('');}}>Cancelar sessão</button>
        <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Salvando…' : uncertain?'Verificar resultado':'Salvar sessão'}</button></div>
    </form>}
    {editing&&<p className="help-text">Termine ou cancele esta edição antes de escolher outro estudo.</p>}
    {error && <p role="alert" className="error-message">{error}</p>}{message && <p role="status" className="success-message">{message}</p>}
  </section>;
}
