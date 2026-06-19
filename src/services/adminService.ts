import { fetchAPI } from './api';
import { User, KYCRequest } from '../types';

export interface AdminStats {
  totalVolume: number;
  activeAccounts: number;
  totalTransactions: number;
  verificationQueue: number;
  systemUptime: string;
}

export const adminService = {
  getStats: async (): Promise<AdminStats> => {
    return fetchAPI('/api/admin/stats');
  },

  getUsers: async (): Promise<User[]> => {
    return fetchAPI('/api/admin/users');
  },

  getKYCRequests: async (): Promise<KYCRequest[]> => {
    return fetchAPI('/api/admin/kyc-requests');
  },

  approveKYC: async (requestId: string): Promise<KYCRequest> => {
    return fetchAPI(`/api/admin/kyc-requests/${requestId}/approve`, {
      method: 'POST',
    });
  },

  rejectKYC: async (requestId: string): Promise<KYCRequest> => {
    return fetchAPI(`/api/admin/kyc-requests/${requestId}/reject`, {
      method: 'POST',
    });
  }
};
