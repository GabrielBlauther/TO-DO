import { useState } from 'react';
import { Task, Category, Priority, Subject, TaskFormData } from '../types';
import { validDate } from '../../../shared/planning';
import Modal from './Modal';

export default function TaskFormModal({ task, categories, priorities, subjects, onSubmit, onClose }: {
  task: Task | null; categories: Category[]; priorities: Priority[]; subjects: Subject[];
  onSubmit: (data: TaskFormData) => Promise<void>; onClose: () => void;
}) {
  const [data, setData] = useState<TaskFormData>({ title: task?.title || '', description: task?.description || '',
    priority_id: task?.priority_id || 2, category_id: task?.category_id || 1,
    due_date: task?.due_date || '', subject_id: task?.subject_id || null });
  const [error, setError] = useState(''), [busy, setBusy] = useState(false), [confirmed, setConfirmed] = useState(false);
  const afterDue = !!data.due_date && !!task?.sessions.some(s => s.planned_date > data.due_date!);
  function change(patch: Partial<TaskFormData>) { setData(old => ({ ...old, ...patch })); setConfirmed(false); setError(''); }
  return <Modal title={task ? 'Editar atividade' : 'Nova atividade'} onClose={() => { if (!busy) onClose(); }}>
    <form onSubmit={async event => {
      event.preventDefault(); if (busy) return; setError('');
      if (!data.title.trim()) { setError('Informe o título da atividade.'); return; }
      if (data.due_date && !validDate(data.due_date)) { setError('Informe um prazo válido.'); return; }
      if (afterDue && !confirmed) { setError('Revise o prazo ou confirme o aviso antes de salvar.'); return; }
      setBusy(true);
      try { await onSubmit({ ...data, due_date: data.due_date || null, confirm_after_due: confirmed }); }
      catch (err) { setError((err as Error).message); } finally { setBusy(false); }
    }}><fieldset disabled={busy}>
      <div className="form-group"><label htmlFor="title">Título *</label><input id="title" value={data.title} onChange={e => change({ title:e.target.value })} required autoFocus /></div>
      <div className="form-group"><label htmlFor="description">Descrição</label><textarea id="description" value={data.description} onChange={e => change({description:e.target.value})} /></div>
      <div className="form-group"><label htmlFor="subject">Disciplina (opcional)</label><select id="subject" value={data.subject_id || ''} onChange={e => change({subject_id:e.target.value ? Number(e.target.value) : null})}>
        <option value="">Sem disciplina</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
        <p className="help-text">Cadastre novas disciplinas pelo botão Disciplina na tela principal.</p></div>
      <div className="form-group"><label htmlFor="priority">Prioridade</label><select id="priority" value={data.priority_id} onChange={e => change({priority_id:Number(e.target.value)})}>
        {priorities.map(p => <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}</select></div>
      <div className="form-group"><label htmlFor="category">Categoria</label><select id="category" value={data.category_id} onChange={e => change({category_id:Number(e.target.value)})}>
        {categories.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}</select></div>
      <div className="form-group"><label htmlFor="due_date">Prazo da atividade (opcional)</label><input id="due_date" type="date" value={data.due_date || ''} onChange={e => change({due_date:e.target.value})} />
        <p className="help-text">O planejamento de estudo é gerenciado nos detalhes da atividade.</p></div>
      {afterDue && <div className="warning-message"><p>Há sessões de estudo após este prazo. Você pode revisar o prazo antes de salvar.</p>
        <label className="checkbox-label"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} /> Confirmo que desejo manter estudo após o prazo.</label></div>}
      {error && <p className="error-message" role="alert">{error}</p>}
      <div className="form-actions"><button type="button" className="btn btn-secondary" disabled={busy} onClick={onClose}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Salvando…' : task ? 'Salvar alterações' : 'Criar atividade'}</button></div>
    </fieldset></form>
  </Modal>;
}
