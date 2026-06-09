import api from './api';
import { Task } from '../types';

export const getTasks = async (): Promise<Task[]> => {
  const response = await api.get<Task[]>('/tasks/');
  return response.data;
};
