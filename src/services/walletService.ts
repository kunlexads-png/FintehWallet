import { fetchAPI } from './api';
import { Wallet, Transaction } from '../types';

export const walletService = {
  getWallets: async (): Promise<Wallet[]> => {
    return fetchAPI('/api/wallets');
  },

  createWallet: async (currency: string): Promise<Wallet> => {
    return fetchAPI('/api/wallets/create', {
      method: 'POST',
      body: JSON.stringify({ currency }),
    });
  },

  addFunds: async (walletId: string, amount: number, paymentMethod: string): Promise<{ wallet: Wallet; transaction: Transaction }> => {
    return fetchAPI('/api/wallets/add-funds', {
      method: 'POST',
      body: JSON.stringify({ walletId, amount, paymentMethod }),
    });
  },

  withdrawFunds: async (walletId: string, amount: number, bankDetails: string): Promise<{ wallet: Wallet; transaction: Transaction }> => {
    return fetchAPI('/api/wallets/withdraw-funds', {
      method: 'POST',
      body: JSON.stringify({ walletId, amount, bankDetails }),
    });
  },

  convertCurrency: async (sourceWalletId: string, targetCurrency: string, amount: number): Promise<{ sourceWallet: Wallet; targetWallet: Wallet; transaction: Transaction }> => {
    return fetchAPI('/api/wallets/convert', {
      method: 'POST',
      body: JSON.stringify({ sourceWalletId, targetCurrency, amount }),
    });
  }
};
