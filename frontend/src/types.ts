export interface Task {
  id: number;
  title: string;
  description: string;
  priority_id: number;
  category_id: number;
  status: 'todo' | 'in_progress' | 'done';
  due_date: string | null;
  created_at: string;
  updated_at: string;
  category_name: string;
  category_emoji: string;
  priority_name: string;
  priority_level: number;
  priority_emoji: string;
}

export interface Comment {
  id: number;
  task_id: number;
  text: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  emoji: string;
}

export interface Priority {
  id: number;
  name: string;
  level: number;
  emoji: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface TaskFormData {
  title: string;
  description: string;
  priority_id: number;
  category_id: number;
  due_date: string;
}
