import { useState } from 'react';
import { Task, Category, Priority, TaskFormData } from '../types';

interface Props {
  task: Task | null;
  categories: Category[];
  priorities: Priority[];
  onSubmit: (data: TaskFormData) => void;
  onClose: () => void;
}

function TaskFormModal({ task, categories, priorities, onSubmit, onClose }: Props) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: task?.title || '',
    description: task?.description || '',
    priority_id: task?.priority_id || 2,
    category_id: task?.category_id || 1,
    due_date: task?.due_date || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{task ? '✏️ Editar Tarefa' : '➕ Nova Tarefa'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Título *</label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="Digite o título da tarefa"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Descrição</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva a tarefa em detalhes..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="priority">Prioridade</label>
            <select
              id="priority"
              value={formData.priority_id}
              onChange={e => setFormData({ ...formData, priority_id: Number(e.target.value) })}
            >
              {priorities.map(p => (
                <option key={p.id} value={p.id}>
                  {p.emoji} {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="category">Categoria</label>
            <select
              id="category"
              value={formData.category_id}
              onChange={e => setFormData({ ...formData, category_id: Number(e.target.value) })}
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="due_date">Data de Vencimento</label>
            <input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={e => setFormData({ ...formData, due_date: e.target.value })}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {task ? 'Salvar Alterações' : 'Criar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskFormModal;
