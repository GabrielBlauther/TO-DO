import { Task } from '../types';

interface Props {
  task: Task;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: () => void;
  statusLabel: string;
}

function TaskCard({ task, onView, onEdit, onDelete, onStatusChange, statusLabel }: Props) {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';

  const formatDate = (date: string | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="task-card" onClick={onView}>
      <div className="task-card-header">
        <span className="task-card-title">{task.title}</span>
        <span className="task-card-priority">{task.priority_emoji}</span>
      </div>
      <div className="task-card-meta">
        <span className="task-card-category">
          {task.category_emoji} {task.category_name}
        </span>
        {task.due_date && (
          <span className={`task-card-due ${isOverdue ? 'overdue' : ''}`}>
            📅 {formatDate(task.due_date)}
          </span>
        )}
      </div>
      <div className="task-card-actions" onClick={e => e.stopPropagation()}>
        <button className="btn-status" onClick={onStatusChange}>{statusLabel}</button>
        <button onClick={onEdit}>✏️ Editar</button>
        <button className="btn-delete" onClick={onDelete}>🗑️</button>
      </div>
    </div>
  );
}

export default TaskCard;
