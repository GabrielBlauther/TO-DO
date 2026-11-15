import { useState, useEffect, useCallback } from 'react';
import { Task, Category, Priority, TaskStatus } from './types';
import * as api from './api';
import TaskCard from './components/TaskCard';
import TaskFormModal from './components/TaskFormModal';
import TaskDetailModal from './components/TaskDetailModal';
import ConfirmDialog from './components/ConfirmDialog';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [tasksData, catsData, priosData] = await Promise.all([
        api.getTasks(),
        api.getCategories(),
        api.getPriorities(),
      ]);
      setTasks(tasksData);
      setCategories(catsData);
      setPriorities(priosData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateTask = () => {
    setEditingTask(null);
    setShowFormModal(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowFormModal(true);
  };

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  const handleDeleteRequest = (taskId: number) => {
    setTaskToDelete(taskId);
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (taskToDelete === null) return;
    await api.deleteTask(taskToDelete);
    setShowConfirmDelete(false);
    setTaskToDelete(null);
    if (showDetailModal && selectedTask?.id === taskToDelete) {
      setShowDetailModal(false);
      setSelectedTask(null);
    }
    loadData();
  };

  const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
    await api.updateTaskStatus(taskId, newStatus);
    loadData();
  };

  const handleFormSubmit = async (data: any) => {
    if (editingTask) {
      await api.updateTask(editingTask.id, data);
    } else {
      await api.createTask(data);
    }
    setShowFormModal(false);
    loadData();
  };

  const getNextStatus = (current: TaskStatus): TaskStatus => {
    if (current === 'todo') return 'in_progress';
    if (current === 'in_progress') return 'done';
    return 'todo';
  };

  const getNextStatusLabel = (current: TaskStatus): string => {
    if (current === 'todo') return '▶ Iniciar';
    if (current === 'in_progress') return '✓ Concluir';
    return '↩ Reabrir';
  };

  if (loading) {
    return <div className="loading">Carregando tarefas...</div>;
  }

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  const totalTasks = tasks.length;
  const completedTasks = doneTasks.length;
  const pendingTasks = totalTasks - completedTasks;

  const columns: { key: TaskStatus; title: string; icon: string; tasks: Task[]; className: string }[] = [
    { key: 'todo', title: 'A Fazer', icon: '📋', tasks: todoTasks, className: 'column-todo' },
    { key: 'in_progress', title: 'Em Progresso', icon: '⚡', tasks: inProgressTasks, className: 'column-in-progress' },
    { key: 'done', title: 'Concluída', icon: '✅', tasks: doneTasks, className: 'column-done' },
  ];

  return (
    <>
      <header className="header">
        <h1>📝 Gestão de Tarefas</h1>
        <div className="header-stats">
          <span>✅ Concluídas: {completedTasks}</span>
          <span>⏳ Pendentes: {pendingTasks}</span>
          <span>📊 Total: {totalTasks}</span>
        </div>
        <button className="btn-new-task" onClick={handleCreateTask}>
          + Nova Tarefa
        </button>
      </header>

      <main className="kanban-board">
        {columns.map(col => (
          <section key={col.key} className={`kanban-column ${col.className}`}>
            <div className="column-header">
              <h2>{col.icon} {col.title}</h2>
              <span className="column-count">{col.tasks.length}</span>
            </div>
            {col.tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onView={() => handleViewTask(task)}
                onEdit={() => handleEditTask(task)}
                onDelete={() => handleDeleteRequest(task.id)}
                onStatusChange={() => handleStatusChange(task.id, getNextStatus(task.status))}
                statusLabel={getNextStatusLabel(task.status)}
              />
            ))}
            {col.tasks.length === 0 && (
              <p style={{ textAlign: 'center', color: '#aaa', padding: '2rem 0', fontSize: '0.85rem' }}>
                Nenhuma tarefa
              </p>
            )}
          </section>
        ))}
      </main>

      {showFormModal && (
        <TaskFormModal
          task={editingTask}
          categories={categories}
          priorities={priorities}
          onSubmit={handleFormSubmit}
          onClose={() => setShowFormModal(false)}
        />
      )}

      {showDetailModal && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => { setShowDetailModal(false); setSelectedTask(null); }}
          onDelete={() => handleDeleteRequest(selectedTask.id)}
          onMarkDone={() => handleStatusChange(selectedTask.id, 'done').then(() => { setShowDetailModal(false); setSelectedTask(null); })}
          onRefresh={loadData}
        />
      )}

      {showConfirmDelete && (
        <ConfirmDialog
          message="Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita."
          onConfirm={handleConfirmDelete}
          onCancel={() => { setShowConfirmDelete(false); setTaskToDelete(null); }}
        />
      )}
    </>
  );
}

export default App;
