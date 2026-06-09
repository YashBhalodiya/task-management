import api from './api';
import { AuthResponse } from '../types';

export const loginWithGoogle = async (idToken: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/google', { id_token: idToken });
  return response.data;
};
