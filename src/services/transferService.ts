import { fetchAPI } from './api';
import { Transfer, Transaction } from '../types';

export const transferService = {
  sendMoney: async (params: {
    sourceWalletId: string;
    recipientEmail: string;
    amount: number;
    description?: string;
    isScheduled?: boolean;
    scheduledDate?: string;
  }): Promise<{ success: boolean; transaction?: Transaction; transfer?: Transfer }> => {
    return fetchAPI('/api/transfers/send', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  getScheduledTransfers: async (): Promise<Transfer[]> => {
    return fetchAPI('/api/transfers/scheduled');
  }
};
