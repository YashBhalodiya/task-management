export interface User {
  id: number;
  google_id?: string;
  name: string;
  email: string;
  avatar_url: string | null;
  created_at?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type TaskStatus = 'pending' | 'completed';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  created_by: User;
  assigned_to: User | null;
  created_at: string;
  updated_at: string;
}
