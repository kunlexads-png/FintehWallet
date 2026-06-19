import fs from 'fs';
import path from 'path';
import { 
  User, Wallet, Transaction, Transfer, VirtualCard, 
  Investment, KYCRequest, Notification, Role, KYCStatus, CardStatus, TransactionStatus
} from '../src/types';

interface Schema {
  users: User[];
  passwords: { [userId: string]: string }; // simple lookup mimicking passwords
  wallets: Wallet[];
  transactions: Transaction[];
  transfers: Transfer[];
  virtualCards: VirtualCard[];
  investments: Investment[];
  kycRequests: KYCRequest[];
  notifications: Notification[];
}

const DB_FILE = path.join(process.cwd(), 'fintech_db.json');

// Generation helper
const randId = () => Math.random().toString(36).substring(2, 15);
const randRef = () => 'TXN-' + Math.floor(10000000 + Math.random() * 90000000);

function loadDB(): Schema {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.error('Error reading fintech_db.json, recreating...', err);
    }
  }

  // Generate initial database mock data
  const db: Schema = {
    users: [],
    passwords: {},
    wallets: [],
    transactions: [],
    transfers: [],
    virtualCards: [],
    investments: [],
    kycRequests: [],
    notifications: []
  };

  // Seed User
  const userId = 'user_demo_123';
  const user: User = {
    id: userId,
    email: 'user@wallet.com',
    name: 'Alex Rivera',
    role: 'USER',
    isVerified: true,
    kycStatus: 'APPROVED',
    twoFactorEnabled: false,
    referralCode: 'ALEX999',
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
  };
  db.users.push(user);
  db.passwords[userId] = 'Password123'; // plaintext/mock format for sandboxed db ease. We will mock verification.

  // Seed Admin
  const adminId = 'admin_demo_999';
  const admin: User = {
    id: adminId,
    email: 'admin@wallet.com',
    name: 'Sarah Connor (COO)',
    role: 'ADMIN',
    isVerified: true,
    kycStatus: 'APPROVED',
    twoFactorEnabled: true,
    twoFactorSecret: 'JBSWY3DPEHPK3PXP', // Mock secret
    referralCode: 'ADMIN777',
    createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString()
  };
  db.users.push(admin);
  db.passwords[adminId] = 'AdminPassword123';

  // Seed Wallets
  const walletUSD: Wallet = {
    id: 'wallet_usd_123',
    userId: userId,
    currency: 'USD',
    balance: 14480.50,
    ledgerBalance: 14480.50,
    dailyLimit: 5000.0,
    createdAt: new Date(Date.now() - 29 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  };
  const walletEUR: Wallet = {
    id: 'wallet_eur_123',
    userId: userId,
    currency: 'EUR',
    balance: 5210.00,
    ledgerBalance: 5210.00,
    dailyLimit: 4000.0,
    createdAt: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  };
  const walletGBP: Wallet = {
    id: 'wallet_gbp_123',
    userId: userId,
    currency: 'GBP',
    balance: 3150.00,
    ledgerBalance: 3150.00,
    dailyLimit: 3500.0,
    createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.wallets.push(walletUSD, walletEUR, walletGBP);

  // Seed Cards
  const card1: VirtualCard = {
    id: 'card_1',
    userId: userId,
    walletId: 'wallet_usd_123',
    cardNumber: '4111 8890 2341 9901',
    cardHolder: 'ALEX RIVERA',
    expiryDate: '12/29',
    cvv: '381',
    status: 'ACTIVE',
    spendingLimit: 3000.0,
    spentThisMonth: 640.20,
    cardType: 'VISA Black Elite',
    createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString()
  };
  const card2: VirtualCard = {
    id: 'card_2',
    userId: userId,
    walletId: 'wallet_usd_123',
    cardNumber: '5412 7543 8812 3349',
    cardHolder: 'ALEX RIVERA',
    expiryDate: '06/28',
    cvv: '912',
    status: 'FROZEN',
    spendingLimit: 1500.0,
    spentThisMonth: 120.00,
    cardType: 'MASTERCARD Platinum',
    createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
  };
  db.virtualCards.push(card1, card2);

  // Seed Investments
  const invest1: Investment = {
    id: 'inv_1',
    userId: userId,
    type: 'SAVINGS_GOAL',
    title: 'Model X Downpayment',
    targetAmount: 15000,
    currentAmount: 8400,
    interestRate: 4.5,
    durationMonths: 24,
    startDate: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
    maturityDate: new Date(Date.now() + 660 * 24 * 3600 * 1000).toISOString(),
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString()
  };
  const invest2: Investment = {
    id: 'inv_2',
    userId: userId,
    type: 'FIXED_DEPOSIT',
    title: 'High-Yield Certificate (H1 2026)',
    targetAmount: 10000,
    currentAmount: 10000,
    interestRate: 6.2,
    durationMonths: 12,
    startDate: new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString(),
    maturityDate: new Date(Date.now() + 270 * 24 * 3600 * 1000).toISOString(),
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString()
  };
  db.investments.push(invest1, invest2);

  // Seed Notifications
  db.notifications.push({
    id: 'not_1',
    userId: userId,
    title: 'Welcome to FinTech Wallet!',
    message: 'Your biometric verification has succeeded. Start sending and managing funds securely.',
    isRead: false,
    type: 'SYSTEM',
    createdAt: new Date().toISOString()
  });

  // Seed Transactions
  const categories = ['Salary', 'Food', 'Transport', 'Bills', 'Shopping', 'Entertainment', 'Investments', 'Cashback'];
  const baseTime = Date.now();
  
  // Salary
  db.transactions.push({
    id: 'txn_sal',
    walletId: 'wallet_usd_123',
    type: 'DEPOSIT',
    category: 'Salary',
    amount: 5400.00,
    fee: 0.00,
    status: 'SUCCESS',
    reference: randRef(),
    description: 'TechCorp Monthly Payout',
    createdAt: new Date(baseTime - 12 * 24 * 3600 * 1000).toISOString()
  });

  // Food
  db.transactions.push({
    id: 'txn_food1',
    walletId: 'wallet_usd_123',
    type: 'WITHDRAWAL',
    category: 'Food',
    amount: 85.50,
    fee: 0.00,
    status: 'SUCCESS',
    reference: randRef(),
    description: 'Whole Foods Market Inc',
    createdAt: new Date(baseTime - 8 * 24 * 3600 * 1000).toISOString()
  });

  // Transport
  db.transactions.push({
    id: 'txn_trans1',
    walletId: 'wallet_usd_123',
    type: 'WITHDRAWAL',
    category: 'Transport',
    amount: 45.00,
    fee: 0.00,
    status: 'SUCCESS',
    reference: randRef(),
    description: 'Uber Ride City Center',
    createdAt: new Date(baseTime - 6 * 24 * 3600 * 1000).toISOString()
  });

  // Bills
  db.transactions.push({
    id: 'txn_bill1',
    walletId: 'wallet_usd_123',
    type: 'BILL_PAYMENT',
    category: 'Bills',
    amount: 145.00,
    fee: 1.50,
    status: 'SUCCESS',
    reference: randRef(),
    description: 'Electric Power Grid bill payment',
    createdAt: new Date(baseTime - 5 * 24 * 3600 * 1000).toISOString()
  });

  // Shopping
  db.transactions.push({
    id: 'txn_shop1',
    walletId: 'wallet_usd_123',
    type: 'WITHDRAWAL',
    category: 'Shopping',
    amount: 320.00,
    fee: 0.00,
    status: 'SUCCESS',
    reference: randRef(),
    description: 'Nike Store Apparel',
    createdAt: new Date(baseTime - 3 * 24 * 3600 * 1000).toISOString()
  });

  // Entertainment
  db.transactions.push({
    id: 'txn_ent1',
    walletId: 'wallet_usd_123',
    type: 'WITHDRAWAL',
    category: 'Entertainment',
    amount: 15.99,
    fee: 0.00,
    status: 'SUCCESS',
    reference: randRef(),
    description: 'Netflix Subscription',
    createdAt: new Date(baseTime - 2 * 24 * 3600 * 1000).toISOString()
  });

  // Outward Transfer
  db.transactions.push({
    id: 'txn_transf1',
    walletId: 'wallet_usd_123',
    type: 'TRANSFER_SENT',
    category: 'Bills',
    amount: 450.00,
    fee: 2.50,
    status: 'SUCCESS',
    reference: randRef(),
    description: 'Transfer to Alice (Security Rent)',
    createdAt: new Date(baseTime - 1 * 24 * 3600 * 1000).toISOString()
  });

  // Cashback
  db.transactions.push({
    id: 'txn_reward1',
    walletId: 'wallet_usd_123',
    type: 'CASHBACK',
    category: 'Cashback',
    amount: 12.00,
    fee: 0.00,
    status: 'SUCCESS',
    reference: randRef(),
    description: '1.5% cashback on Nike elite purchase',
    createdAt: new Date(baseTime - 1 * 24 * 3600 * 1000).toISOString()
  });

  // Seed a pending KYC for demo admin verification
  const kycId = 'kyc_demo_456';
  db.kycRequests.push({
    id: kycId,
    userId: userId,
    fullName: 'Alex Rivera',
    dateOfBirth: '1992-04-15',
    documentType: 'Passport',
    documentNumber: 'US-9912048X',
    documentUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800',
    status: 'APPROVED',
    notes: 'Biometrics and document verified.',
    createdAt: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString()
  });

  // Save initial database state
  saveDB(db);
  return db;
}

function saveDB(data: Schema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing to fintech_db.json', err);
  }
}

export const dbService = {
  get: () => {
    return loadDB();
  },
  save: (data: Schema) => {
    saveDB(data);
  }
};
