import { fetchAPI } from './api';
import { User } from '../types';

export const authService = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    return fetchAPI('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (email: string, password: string, name: string, referralCode?: string): Promise<{ user: User; token: string }> => {
    return fetchAPI('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, referralCode }),
    });
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    return fetchAPI('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token: string, passwordNew: string): Promise<{ message: string }> => {
    return fetchAPI('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword: passwordNew }),
    });
  }
};
