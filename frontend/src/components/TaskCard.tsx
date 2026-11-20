import { useRef, useState, type DragEvent } from 'react';
import { Task,TaskStatus } from '../types';
import { formatDate, localToday } from '../../../shared/planning';
import {STATUS_LABELS,TASK_STATUSES} from '../kanban';

export default function TaskCard({ task, onView, onEdit, onDelete, onMove, onDragStart, onDragEnd, busy, disabled, pending, dragging }: {
  task: Task; onView: () => void; onEdit: () => void; onDelete: () => void; onMove:(status:TaskStatus)=>void;
  onDragStart:(event:DragEvent<HTMLElement>)=>void; onDragEnd:()=>void;
  busy:boolean; disabled:boolean; pending:boolean; dragging:boolean;
}) {
  const [moveOpen,setMoveOpen]=useState(false);
  const moveButton=useRef<HTMLButtonElement>(null),interactivePointer=useRef(false);
  const overdue = task.due_date && task.due_date < localToday() && task.status !== 'done';
  return <article id={`task-card-${task.id}`} tabIndex={-1} aria-label={task.title} aria-busy={busy} className={`task-card ${dragging?'is-dragging':''}`} draggable={!disabled}
    onPointerDownCapture={event=>{interactivePointer.current=!!(event.target as Element).closest('button,input,select,textarea,a');}}
    onKeyDown={event=>{if(event.key==='Escape'&&moveOpen){event.preventDefault();event.stopPropagation();setMoveOpen(false);moveButton.current?.focus();}}}
    onDragStart={event=>{if(disabled||interactivePointer.current){event.preventDefault();return;}onDragStart(event);}} onDragEnd={onDragEnd}>
    <div className="task-card-header"><span className="card-drag-hint" aria-hidden="true" title="Arraste a atividade para outra coluna">⠿</span><button className="task-card-title title-button" disabled={disabled} onClick={onView} aria-label={`Detalhes de ${task.title}`}>{task.title}</button>
      <span title={`Prioridade ${task.priority_name}`}>{task.priority_emoji} {task.priority_name}</span></div>
    <p className="card-line">Disciplina: {task.subject_name || 'Sem disciplina'}</p>
    <p className="card-line">Categoria: {task.category_emoji} {task.category_name}</p>
    <p className={`card-line ${overdue ? 'overdue' : ''}`}>Prazo: {formatDate(task.due_date)}{overdue ? ' — vencido' : ''}</p>
    <div className="card-planning"><strong>Planejamento:</strong>
      {task.sessions.length === 0 ? <p>Sem planejamento</p> : <ul>{task.sessions.map(s => <li key={s.id}>{formatDate(s.planned_date)} · {s.start_time || 'Sem horário'} · {s.duration_minutes} min</li>)}</ul>}</div>
    <div className="task-card-actions"><button ref={moveButton} id={`task-move-${task.id}`} className="btn-status" disabled={disabled} aria-expanded={moveOpen} aria-controls={`task-destinations-${task.id}`} aria-label={`Mover para…: ${task.title}`} onClick={()=>setMoveOpen(value=>!value)}>Mover para…</button>
      <button disabled={disabled} onClick={onEdit}>Editar</button><button className="btn-delete" disabled={disabled} onClick={onDelete} aria-label={`Excluir ${task.title}`}>Excluir</button></div>
    {moveOpen&&<div id={`task-destinations-${task.id}`} className="task-move-options" role="group" aria-label={`Destino de ${task.title}`}><p>Escolha a coluna de destino:</p>{TASK_STATUSES.filter(status=>status!==task.status).map(status=><button type="button" className="btn btn-secondary" key={status} disabled={disabled} aria-label={`Mover ${task.title} para ${STATUS_LABELS[status]}`} onClick={()=>onMove(status)}>{STATUS_LABELS[status]}</button>)}</div>}
    {busy&&<p className="help-text" role="status">Salvando nova coluna…</p>}
    {pending&&<p className="pending-move-note">Mudança de situação aguardando confirmação. Use Verificar resultado no aviso acima antes de mover novamente.</p>}
  </article>;
}
