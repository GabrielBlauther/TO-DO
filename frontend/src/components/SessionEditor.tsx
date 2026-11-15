import { useState, useEffect } from 'react';
import { Task, StudySession, SessionFormData } from '../types';
import { formatDate, localToday, sessionInterval } from '../../../shared/planning';
import * as api from '../api';

export default function SessionEditor({ task, onUpdated, onBusyChange }: { task: Task; onUpdated: (task: Task) => void; onBusyChange: (busy: boolean) => void }) {
  const [editing, setEditing] = useState<StudySession | 'new' | null>(null);
  const [data, setData] = useState<SessionFormData>({planned_date:localToday(),start_time:'',duration_minutes:50});
  const [confirmed, setConfirmed] = useState(false), [error, setError] = useState(''), [message, setMessage] = useState('');
  const [busy, setBusyState] = useState(false), [removeId, setRemoveId] = useState<number | null>(null);
  function setBusy(value: boolean) { setBusyState(value); onBusyChange(value); }
  useEffect(() => { if (editing) document.getElementById('planned-date')?.focus(); }, [editing]);
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
    <ul className="session-list">{task.sessions.map(session => <li key={session.id}>
      <p>{formatDate(session.planned_date)} · {session.start_time || 'Sem horário'} · {session.duration_minutes} min</p>
      <div className="session-actions"><button type="button" className="btn btn-secondary" disabled={busy} onClick={() => edit(session)} aria-label={`Editar sessão de ${formatDate(session.planned_date)} às ${session.start_time || 'sem horário'}`}>Editar sessão</button>
        <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => {setRemoveId(session.id);setEditing(null);setError('');}} aria-label={`Remover sessão de ${formatDate(session.planned_date)} às ${session.start_time || 'sem horário'}`}>Remover sessão</button></div>
      {removeId === session.id && <div className="warning-message"><p>Remover este planejamento? A atividade e seu prazo serão mantidos.</p>
        <button className="btn btn-secondary" disabled={busy} onClick={() => setRemoveId(null)}>Cancelar remoção</button>{' '}
        <button className="btn btn-danger" disabled={busy} onClick={async () => {
          setBusy(true);setError('');try {onUpdated(await api.deleteSession(task.id,session.id));setRemoveId(null);setMessage('Sessão removida. A atividade foi mantida.');}
          catch(err){setError((err as Error).message);}finally{setBusy(false);}
        }}>Confirmar remoção</button></div>}
    </li>)}</ul>
    {!editing && <button type="button" className="btn btn-primary" disabled={busy} onClick={() => edit('new')}>Adicionar sessão</button>}
    {editing && <form className="session-form" onSubmit={async event => {
      event.preventDefault(); if(busy)return;setError('');setMessage('');
      try { sessionInterval(data.planned_date,data.start_time,data.duration_minutes); }
      catch(err){setError((err as Error).message);return;}
      if(afterDue && !confirmed){setError('Revise a data ou confirme o aviso antes de salvar.');return;}
      setBusy(true);
      try {onUpdated(await api.saveSession(task.id,{...data,start_time:data.start_time || null,confirm_after_due:confirmed},editing === 'new' ? undefined : editing.id));setEditing(null);setMessage('Planejamento salvo.');}
      catch(err){setError((err as Error).message);}finally{setBusy(false);}
    }}><fieldset disabled={busy}>
      <h4>{editing === 'new' ? 'Nova sessão' : 'Editar sessão'}</h4>
      <div className="form-group"><label htmlFor="planned-date">Data planejada *</label><input id="planned-date" type="date" value={data.planned_date} required onChange={e => change({planned_date:e.target.value})} /></div>
      <div className="form-group"><label htmlFor="start-time">Horário inicial (opcional)</label><input id="start-time" type="time" value={data.start_time || ''} onChange={e => change({start_time:e.target.value})} /></div>
      <div className="form-group"><label htmlFor="duration">Duração planejada (minutos) *</label><input id="duration" type="number" min="1" step="1" required value={Number.isNaN(data.duration_minutes) ? '' : data.duration_minutes} onChange={e => change({duration_minutes:e.target.valueAsNumber})} /></div>
      <p className="help-text">Sem horário, várias sessões podem coexistir no dia. A duração pode abranger vários ciclos de estudo.</p>
      {afterDue && <div className="warning-message"><p>O estudo está após o prazo ({formatDate(task.due_date)}). Revise a data ou confirme sua escolha.</p>
        <label className="checkbox-label"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} /> Confirmo que desejo estudar após o prazo.</label></div>}
      <div className="form-actions"><button type="button" className="btn btn-secondary" disabled={busy} onClick={() => {setEditing(null);setError('');}}>Cancelar sessão</button>
        <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Salvando…' : 'Salvar sessão'}</button></div>
    </fieldset></form>}
    {error && <p role="alert" className="error-message">{error}</p>}{message && <p role="status" className="success-message">{message}</p>}
  </section>;
}
