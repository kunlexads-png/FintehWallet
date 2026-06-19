import { create } from 'zustand';
import { 
  User, Wallet, Transaction, VirtualCard, Investment, Notification, Transfer, KYCRequest 
} from '../types';
import { authService } from '../services/authService';
import { walletService } from '../services/walletService';
import { transactionService } from '../services/transactionService';
import { cardService } from '../services/cardService';
import { transferService } from '../services/transferService';
import { userService } from '../services/userService';
import { adminService, AdminStats } from '../services/adminService';
import { analyticsService, AnalyticsData } from '../services/analyticsService';

interface WalletState {
  // Authentication & session
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  
  // App data
  wallets: Wallet[];
  transactions: Transaction[];
  cards: VirtualCard[];
  investments: Investment[];
  notifications: Notification[];
  scheduledTransfers: Transfer[];
  analytics: AnalyticsData | null;

  // Admin section
  adminStats: AdminStats | null;
  adminUsers: User[];
  adminKycRequests: KYCRequest[];

  // Core Actions
  init: () => void;
  setError: (err: string | null) => void;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (email: string, pass: string, name: string, referralCode?: string) => Promise<boolean>;
  logout: () => void;
  resetPassword: (token: string, pass: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<string>;

  // Dashboard Sync Actions
  refreshDashboardData: () => Promise<void>;
  
  // Wallet Mutators
  createWallet: (currency: string) => Promise<void>;
  addFunds: (walletId: string, amount: number, method: string) => Promise<void>;
  withdrawFunds: (walletId: string, amount: number, bankDetails: string) => Promise<void>;
  convertCurrency: (sourceWalletId: string, targetCurrency: string, amount: number) => Promise<void>;

  // Card Mutators
  createCard: (walletId: string, limit: number, brand?: string) => Promise<void>;
  toggleCardFreeze: (cardId: string, currentStatus: string) => Promise<void>;
  updateCardLimit: (cardId: string, amount: number) => Promise<void>;

  // Money Transfers
  sendMoney: (params: {
    sourceWalletId: string;
    recipientEmail: string;
    amount: number;
    description?: string;
    isScheduled?: boolean;
    scheduledDate?: string;
  }) => Promise<string>;

  // Investment Core
  createInvestment: (params: {
    type: 'SAVINGS_GOAL' | 'FIXED_DEPOSIT';
    title: string;
    amount: number;
    walletId: string;
    durationMonths: number;
    interestRate: number;
  }) => Promise<void>;

  // User notifications & files
  submitKYC: (params: {
    fullName: string;
    dateOfBirth: string;
    documentType: string;
    documentNumber: string;
    documentUrl?: string;
  }) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;

  // Admin approvals
  refreshAdminSection: () => Promise<void>;
  approveKYC: (requestId: string) => Promise<void>;
  rejectKYC: (requestId: string) => Promise<void>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  user: null,
  token: null,
  loading: false,
  error: null,
  
  wallets: [],
  transactions: [],
  cards: [],
  investments: [],
  notifications: [],
  scheduledTransfers: [],
  analytics: null,

  adminStats: null,
  adminUsers: [],
  adminKycRequests: [],

  setError: (err) => set({ error: err }),

  init: () => {
    const cachedToken = localStorage.getItem('fintech_wallet_token');
    const cachedUser = localStorage.getItem('fintech_wallet_user');
    
    if (cachedToken && cachedUser) {
      try {
        set({ 
          token: cachedToken, 
          user: JSON.parse(cachedUser) 
        });
        get().refreshDashboardData();
      } catch {
        get().logout();
      }
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await authService.login(email, password);
      localStorage.setItem('fintech_wallet_token', res.token);
      localStorage.setItem('fintech_wallet_user', JSON.stringify(res.user));
      set({ user: res.user, token: res.token, loading: false });
      
      await get().refreshDashboardData();
      return true;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  register: async (email, password, name, referralCode) => {
    set({ loading: true, error: null });
    try {
      const res = await authService.register(email, password, name, referralCode);
      localStorage.setItem('fintech_wallet_token', res.token);
      localStorage.setItem('fintech_wallet_user', JSON.stringify(res.user));
      set({ user: res.user, token: res.token, loading: false });

      await get().refreshDashboardData();
      return true;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('fintech_wallet_token');
    localStorage.removeItem('fintech_wallet_user');
    set({
      user: null,
      token: null,
      wallets: [],
      transactions: [],
      cards: [],
      investments: [],
      notifications: [],
      scheduledTransfers: [],
      analytics: null,
      adminStats: null,
      adminUsers: [],
      adminKycRequests: [],
      error: null
    });
  },

  forgotPassword: async (email) => {
    try {
      const res = await authService.forgotPassword(email);
      return res.message;
    } catch (err: any) {
      throw new Error(err.message);
    }
  },

  resetPassword: async (token, pass) => {
    set({ loading: true, error: null });
    try {
      await authService.resetPassword(token, pass);
      set({ loading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  refreshDashboardData: async () => {
    if (!get().token) return;
    set({ loading: true });
    try {
      const [
        walletRes,
        txnRes,
        cardRes,
        investmentRes,
        scheduledRes,
        notificationRes,
        analyticsRes,
        profileRes
      ] = await Promise.all([
        walletService.getWallets(),
        transactionService.getTransactions(),
        cardService.getCards(),
        fetchAPI<Investment[]>('/api/investments'), // simple dynamic mapping
        transferService.getScheduledTransfers(),
        userService.getNotifications(),
        analyticsService.getAnalytics(),
        userService.getProfile()
      ]);

      // Cache profile updates on changes
      localStorage.setItem('fintech_wallet_user', JSON.stringify(profileRes));

      set({
        user: profileRes,
        wallets: walletRes,
        transactions: txnRes,
        cards: cardRes,
        investments: investmentRes,
        scheduledTransfers: scheduledRes,
        notifications: notificationRes,
        analytics: analyticsRes,
        loading: false
      });

      if (profileRes.role === 'ADMIN') {
        await get().refreshAdminSection();
      }
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createWallet: async (currency) => {
    set({ loading: true, error: null });
    try {
      await walletService.createWallet(currency);
      await get().refreshDashboardData();
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  addFunds: async (walletId, amount, method) => {
    set({ loading: true, error: null });
    try {
      await walletService.addFunds(walletId, amount, method);
      await get().refreshDashboardData();
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  withdrawFunds: async (walletId, amount, bankDetails) => {
    set({ loading: true, error: null });
    try {
      await walletService.withdrawFunds(walletId, amount, bankDetails);
      await get().refreshDashboardData();
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  convertCurrency: async (sourceWalletId, targetCurrency, amount) => {
    set({ loading: true, error: null });
    try {
      await walletService.convertCurrency(sourceWalletId, targetCurrency, amount);
      await get().refreshDashboardData();
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  createCard: async (walletId, limit, brand) => {
    set({ loading: true, error: null });
    try {
      await cardService.createCard({ walletId, limit, cardType: brand });
      await get().refreshDashboardData();
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  toggleCardFreeze: async (cardId, status) => {
    try {
      if (status === 'ACTIVE') {
        await cardService.freezeCard(cardId);
      } else {
        await cardService.unfreezeCard(cardId);
      }
      await get().refreshDashboardData();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  updateCardLimit: async (cardId, amount) => {
    try {
      await cardService.updateLimit(cardId, amount);
      await get().refreshDashboardData();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  sendMoney: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await transferService.sendMoney(params) as any;
      await get().refreshDashboardData();
      return res.message || 'Money transfer processed successfully!';
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  createInvestment: async (params) => {
    set({ loading: true, error: null });
    try {
      await fetchAPI('/api/investments/create', {
        method: 'POST',
        body: JSON.stringify(params),
      });
      await get().refreshDashboardData();
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  submitKYC: async (params) => {
    set({ loading: true, error: null });
    try {
      await userService.submitKYC(params);
      await get().refreshDashboardData();
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  markNotificationRead: async (id) => {
    try {
      await userService.markAsRead(id);
      // update locally to avoid full re-render flickering
      set({
        notifications: get().notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
      });
    } catch (err: any) {
      console.error(err);
    }
  },

  // Admin approvals
  refreshAdminSection: async () => {
    try {
      const [stats, users, kycReqs] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(),
        adminService.getKYCRequests()
      ]);
      set({
        adminStats: stats,
        adminUsers: users,
        adminKycRequests: kycReqs
      });
    } catch (err: any) {
      console.error('Error fetching admin panels', err);
    }
  },

  approveKYC: async (id) => {
    try {
      await adminService.approveKYC(id);
      await get().refreshAdminSection();
      await get().refreshDashboardData();
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  rejectKYC: async (id) => {
    try {
      await adminService.rejectKYC(id);
      await get().refreshAdminSection();
      await get().refreshDashboardData();
    } catch (err: any) {
      set({ error: err.message });
    }
  }
}));

// Fallback import reference support
import { fetchAPI } from '../services/api';
export default useWalletStore;
