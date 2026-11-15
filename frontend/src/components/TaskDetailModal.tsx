import { useState, useEffect } from 'react';
import { Task, Comment } from '../types';
import * as api from '../api';

interface Props {
  task: Task;
  onClose: () => void;
  onDelete: () => void;
  onMarkDone: () => void;
  onRefresh: () => void;
}

function TaskDetailModal({ task, onClose, onDelete, onMarkDone, onRefresh }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    loadComments();
  }, [task.id]);

  const loadComments = async () => {
    const data = await api.getComments(task.id);
    setComments(data);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    await api.addComment(task.id, newComment.trim());
    setNewComment('');
    loadComments();
  };

  const handleDeleteComment = async (commentId: number) => {
    await api.deleteComment(commentId);
    loadComments();
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Não definida';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const statusLabels: Record<string, string> = {
    todo: '📋 A Fazer',
    in_progress: '⚡ Em Progresso',
    done: '✅ Concluída',
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-large" onClick={e => e.stopPropagation()}>
        <div className="task-detail-header">
          <h2 className="task-detail-title">{task.title}</h2>
        </div>

        <div className="task-detail-badges">
          <span className="badge badge-priority">{task.priority_emoji} {task.priority_name}</span>
          <span className="badge badge-category">{task.category_emoji} {task.category_name}</span>
          <span className="badge badge-status">{statusLabels[task.status]}</span>
        </div>

        {task.description && (
          <div className="task-detail-description">
            {task.description}
          </div>
        )}

        <div className="task-detail-info">
          <div className="task-detail-info-item">
            <span>Vencimento</span>
            <span>{formatDate(task.due_date)}</span>
          </div>
          <div className="task-detail-info-item">
            <span>Criada em</span>
            <span>{formatDate(task.created_at)}</span>
          </div>
          <div className="task-detail-info-item">
            <span>Prioridade</span>
            <span>{task.priority_emoji} {task.priority_name}</span>
          </div>
          <div className="task-detail-info-item">
            <span>Categoria</span>
            <span>{task.category_emoji} {task.category_name}</span>
          </div>
        </div>

        <div className="task-detail-actions">
          {task.status !== 'done' && (
            <button className="btn btn-success" onClick={onMarkDone}>
              ✅ Marcar como Concluída
            </button>
          )}
          <button className="btn btn-danger" onClick={onDelete}>
            🗑️ Excluir
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Fechar
          </button>
        </div>

        <div className="comments-section">
          <h3>💬 Notas / Comentários ({comments.length})</h3>
          <form className="comment-form" onSubmit={handleAddComment}>
            <input
              type="text"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Adicionar um comentário..."
            />
            <button type="submit">Enviar</button>
          </form>
          <ul className="comment-list">
            {comments.map(comment => (
              <li key={comment.id} className="comment-item">
                <p>{comment.text}</p>
                <small>{new Date(comment.created_at).toLocaleDateString('pt-BR')}</small>
                <button onClick={() => handleDeleteComment(comment.id)} title="Excluir comentário">
                  ✕
                </button>
              </li>
            ))}
            {comments.length === 0 && (
              <li className="comment-item" style={{ justifyContent: 'center', color: '#aaa' }}>
                <p>Nenhum comentário ainda.</p>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default TaskDetailModal;
