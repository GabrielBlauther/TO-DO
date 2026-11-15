import { Task, Comment, Category, Priority, TaskFormData, TaskStatus } from './types';

const BASE_URL = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  return res.json();
}

// Tasks
export const getTasks = () => request<Task[]>('/tasks');
export const getTask = (id: number) => request<Task>(`/tasks/${id}`);
export const createTask = (data: TaskFormData) =>
  request<Task>('/tasks', { method: 'POST', body: JSON.stringify({ ...data, status: 'todo' }) });
export const updateTask = (id: number, data: Partial<TaskFormData & { status: TaskStatus }>) =>
  request<Task>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const updateTaskStatus = (id: number, status: TaskStatus) =>
  request<Task>(`/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
export const deleteTask = (id: number) =>
  request<{ success: boolean }>(`/tasks/${id}`, { method: 'DELETE' });

// Comments
export const getComments = (taskId: number) => request<Comment[]>(`/tasks/${taskId}/comments`);
export const addComment = (taskId: number, text: string) =>
  request<Comment>(`/tasks/${taskId}/comments`, { method: 'POST', body: JSON.stringify({ text }) });
export const deleteComment = (id: number) =>
  request<{ success: boolean }>(`/comments/${id}`, { method: 'DELETE' });

// Categories & Priorities
export const getCategories = () => request<Category[]>('/categories');
export const getPriorities = () => request<Priority[]>('/priorities');
