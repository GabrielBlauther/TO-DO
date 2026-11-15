import { Task } from '../types';
import { formatDate, localToday } from '../../../shared/planning';

export default function TaskCard({ task, onView, onEdit, onDelete, onStatusChange, statusLabel }: {
  task: Task; onView: () => void; onEdit: () => void; onDelete: () => void; onStatusChange: () => void; statusLabel: string;
}) {
  const overdue = task.due_date && task.due_date < localToday() && task.status !== 'done';
  return <article className="task-card">
    <div className="task-card-header"><button className="task-card-title title-button" onClick={onView} aria-label={`Detalhes de ${task.title}`}>{task.title}</button>
      <span title={`Prioridade ${task.priority_name}`}>{task.priority_emoji} {task.priority_name}</span></div>
    <p className="card-line">Disciplina: {task.subject_name || 'Sem disciplina'}</p>
    <p className="card-line">Categoria: {task.category_emoji} {task.category_name}</p>
    <p className={`card-line ${overdue ? 'overdue' : ''}`}>Prazo: {formatDate(task.due_date)}{overdue ? ' — vencido' : ''}</p>
    <div className="card-planning"><strong>Planejamento:</strong>
      {task.sessions.length === 0 ? <p>Sem planejamento</p> : <ul>{task.sessions.map(s => <li key={s.id}>{formatDate(s.planned_date)} · {s.start_time || 'Sem horário'} · {s.duration_minutes} min</li>)}</ul>}</div>
    <div className="task-card-actions"><button className="btn-status" onClick={onStatusChange}>{statusLabel}</button>
      <button onClick={onEdit}>Editar</button><button className="btn-delete" onClick={onDelete} aria-label={`Excluir ${task.title}`}>Excluir</button></div>
  </article>;
}
