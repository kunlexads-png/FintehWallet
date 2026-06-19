import { fetchAPI } from './api';
import { VirtualCard } from '../types';

export const cardService = {
  getCards: async (): Promise<VirtualCard[]> => {
    return fetchAPI('/api/cards');
  },

  createCard: async (params: { walletId: string; limit: number; cardType?: string }): Promise<VirtualCard> => {
    return fetchAPI('/api/cards/create', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  freezeCard: async (cardId: string): Promise<VirtualCard> => {
    return fetchAPI(`/api/cards/${cardId}/freeze`, {
      method: 'POST',
    });
  },

  unfreezeCard: async (cardId: string): Promise<VirtualCard> => {
    return fetchAPI(`/api/cards/${cardId}/unfreeze`, {
      method: 'POST',
    });
  },

  updateLimit: async (cardId: string, spendingLimit: number): Promise<VirtualCard> => {
    return fetchAPI(`/api/cards/${cardId}/limit`, {
      method: 'POST',
      body: JSON.stringify({ spendingLimit }),
    });
  }
};
