import { LoginResponse } from '../../types/domain.types';
import { request } from './client';

export const AuthApi = {
  login(email: string, password: string): Promise<LoginResponse> {
    return request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
};
