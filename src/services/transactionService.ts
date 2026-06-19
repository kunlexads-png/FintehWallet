import { fetchAPI } from './api';
import { Transaction } from '../types';

export const transactionService = {
  getTransactions: async (): Promise<Transaction[]> => {
    return fetchAPI('/api/transactions');
  }
};
