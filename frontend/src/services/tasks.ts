import api from './api';
import { Task } from '../types';

export interface CreateTaskInput {
  title: string;
  description?: string;
  assigned_to?: number | null;
}

export const getTasks = async (): Promise<Task[]> => {
  const response = await api.get<Task[]>('/tasks/');
  return response.data;
};

export const createTask = async (input: CreateTaskInput): Promise<Task> => {
  const response = await api.post<Task>('/tasks/', input);
  return response.data;
};

