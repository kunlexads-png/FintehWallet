import { fetchAPI } from './api';
import { User, Notification } from '../types';

export const userService = {
  getProfile: async (): Promise<User> => {
    return fetchAPI('/api/users/profile');
  },

  submitKYC: async (params: {
    fullName: string;
    dateOfBirth: string;
    documentType: string;
    documentNumber: string;
    documentUrl?: string;
  }): Promise<{ user: User; message: string }> => {
    return fetchAPI('/api/users/kyc', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  getNotifications: async (): Promise<Notification[]> => {
    return fetchAPI('/api/users/notifications');
  },

  markAsRead: async (id: string): Promise<{ success: boolean }> => {
    return fetchAPI(`/api/users/notifications/${id}/read`, {
      method: 'POST',
    });
  }
};
