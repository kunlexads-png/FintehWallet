export type Role = 'USER' | 'ADMIN' | 'SUPER_ADMIN';
export type KYCStatus = 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
export type CardStatus = 'ACTIVE' | 'FROZEN' | 'CANCELLED';
export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export type TransactionType =
  | 'DEPOSIT'
  | 'WITHDRAWAL'
  | 'TRANSFER_SENT'
  | 'TRANSFER_RECEIVED'
  | 'BILL_PAYMENT'
  | 'INVESTMENT_FUND'
  | 'CASHBACK';

export type InvestmentType = 'SAVINGS_GOAL' | 'FIXED_DEPOSIT';
export type InvestmentStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  isVerified: boolean;
  kycStatus: KYCStatus;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  referralCode: string;
  referredBy?: string;
  createdAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  currency: string;
  balance: number;
  ledgerBalance: number;
  dailyLimit: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: TransactionType;
  category: string; // e.g., 'Food', 'Transport', 'Bills', 'Shopping', 'Entertainment', 'Salary', 'Investments', 'Rewards'
  amount: number;
  fee: number;
  status: TransactionStatus;
  reference: string;
  description: string;
  createdAt: string;
  currency?: string; // helper for display
}

export interface Transfer {
  id: string;
  sourceWalletId: string;
  targetWalletId: string;
  amount: number;
  fee: number;
  description: string;
  isScheduled: boolean;
  scheduledDate?: string;
  status: TransactionStatus;
  createdAt: string;
}

export interface VirtualCard {
  id: string;
  userId: string;
  walletId: string;
  cardNumber: string;
  cardHolder: string;
  expiryDate: string; // MM/YY
  cvv: string;
  status: CardStatus;
  spendingLimit: number;
  spentThisMonth: number;
  cardType: string;
  createdAt: string;
}

export interface Investment {
  id: string;
  userId: string;
  type: InvestmentType;
  title: string;
  targetAmount?: number;
  currentAmount: number;
  interestRate: number; // e.g., 5.5 (for 5.5%)
  durationMonths: number;
  startDate: string;
  maturityDate: string;
  status: InvestmentStatus;
  createdAt: string;
}

export interface KYCRequest {
  id: string;
  userId: string;
  fullName: string;
  dateOfBirth: string;
  documentType: string;
  documentNumber: string;
  documentUrl: string;
  status: KYCStatus;
  notes?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  type: 'TRANSFER' | 'SECURITY' | 'PROMOTION' | 'SYSTEM';
  createdAt: string;
}

// Client services types
export interface AuthResponse {
  user: User;
  token: string;
}

export interface DashboardStats {
  balance: number;
  ledgerBalance: number;
  monthlySpending: number;
  monthlyIncome: number;
  wallets: Wallet[];
  recentTransactions: Transaction[];
  cards: VirtualCard[];
  investments: Investment[];
}
