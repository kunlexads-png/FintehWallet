import { fetchAPI } from './api';

export interface AnalyticsData {
  totalExpenses: number;
  totalIncome: number;
  categoryBreakdown: { name: string; value: number }[];
  growthCurve: { name: string; balance: number }[];
  budgetLimit: number;
  budgetSpent: number;
}

export const analyticsService = {
  getAnalytics: async (): Promise<AnalyticsData> => {
    return fetchAPI('/api/analytics');
  }
};
