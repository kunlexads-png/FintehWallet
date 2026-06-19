import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { dbService } from './server/db';
import { 
  User, Wallet, Transaction, Transfer, VirtualCard, 
  Investment, KYCRequest, Notification, TransactionType 
} from './src/types';

const app = express();
const PORT = 3000;

const randId = () => Math.random().toString(36).substring(2, 15);

app.use(express.json());

// Simple Auth Middleware
interface AuthRequest extends Request {
  user?: User;
}

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }
  
  const token = authHeader.split(' ')[1];
  
  // In our high-fidelity sandboxed system, the token matches the userId or is a composite e.g., 'usr_demo'
  const db = dbService.get();
  const user = db.users.find(u => u.id === token);
  
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: Session expired or invalid' });
  }
  
  req.user = user;
  next();
};

// Admin Auth Middleware
const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access only' });
  }
  next();
};

// Helper to log user transactions & adjustments
const createJournal = (walletId: string, type: TransactionType, category: string, amount: number, fee: number, description: string) => {
  const db = dbService.get();
  const ref = 'TXN-' + Math.floor(10000000 + Math.random() * 90000000);
  const transaction: Transaction = {
    id: 'txn_' + Math.random().toString(36).substring(2, 10),
    walletId,
    type,
    category,
    amount,
    fee,
    status: 'SUCCESS',
    reference: ref,
    description,
    createdAt: new Date().toISOString()
  };
  db.transactions.push(transaction);
  dbService.save(db);
  return transaction;
};

// --- API ROUTES ---

// 1. Auth Services
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { email, password, name, referralCode } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Missing required fields: email, password, name' });
  }

  const db = dbService.get();
  if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }

  const userId = 'usr_' + Math.random().toString(36).substring(2, 11);
  const newUser: User = {
    id: userId,
    email: email.toLowerCase(),
    name,
    role: 'USER',
    isVerified: false,
    kycStatus: 'NOT_SUBMITTED',
    twoFactorEnabled: false,
    referralCode: name.toUpperCase().replace(/\s+/g, '') + Math.floor(100 + Math.random() * 900),
    referredBy: referralCode || undefined,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  db.passwords[userId] = password;

  // Create primary USD wallet automatically
  const walletId = 'wlt_' + Math.random().toString(36).substring(2, 11);
  const initialWallet: Wallet = {
    id: walletId,
    userId: userId,
    currency: 'USD',
    balance: 50.00, // $50 sign up bonus to make exploration exciting!
    ledgerBalance: 50.00,
    dailyLimit: 3000.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.wallets.push(initialWallet);

  // Journal Transaction for welcome bonus
  db.transactions.push({
    id: 'txn_' + Math.random().toString(36).substring(2, 11),
    walletId: walletId,
    type: 'CASHBACK',
    category: 'Cashback',
    amount: 50.00,
    fee: 0,
    status: 'SUCCESS',
    reference: 'TXN-WELCOME-' + Math.floor(1000 + Math.random() * 9000),
    description: 'Welcome Sign Up Bonus Rewards',
    createdAt: new Date().toISOString()
  });

  // Handle cashback reward if referred by someone
  if (referralCode) {
    const referrer = db.users.find(u => u.referralCode === referralCode);
    if (referrer) {
      const parentWallet = db.wallets.find(w => w.userId === referrer.id && w.currency === 'USD');
      if (parentWallet) {
        parentWallet.balance += 25.00;
        parentWallet.ledgerBalance += 25.00;
        db.transactions.push({
          id: 'txn_' + Math.random().toString(36).substring(2, 11),
          walletId: parentWallet.id,
          type: 'CASHBACK',
          category: 'Cashback',
          amount: 25.0,
          fee: 0,
          status: 'SUCCESS',
          reference: 'TXN-REFER-' + Math.floor(10000 + Math.random() * 90000),
          description: `Referral rewards for inviting ${name}`,
          createdAt: new Date().toISOString()
        });
      }
    }
  }

  dbService.save(db);

  res.status(201).json({
    user: newUser,
    token: userId
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter both your email and password' });
  }

  const db = dbService.get();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user || db.passwords[user.id] !== password) {
    return res.status(401).json({ error: 'Invalid email or password credentials' });
  }

  res.json({
    user,
    token: user.id
  });
});

app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  const db = dbService.get();
  const user = db.users.find(u => u.email.toLowerCase() === email?.toLowerCase());
  
  if (!user) {
    return res.status(404).json({ error: 'Email address not registered in our database' });
  }
  
  res.json({ message: 'A secure password reset verification flow was sent to your email.' });
});

app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Missing token or new password parameters' });
  }
  const db = dbService.get();
  // Simply mock successful reset using token as userId or matching user
  const user = db.users.find(u => u.id === token || u.email === token);
  if (!user) {
    return res.status(400).json({ error: 'Invalid password reset token' });
  }
  db.passwords[user.id] = newPassword;
  dbService.save(db);
  res.json({ message: 'Your password has been successfully reset. Choose Login to proceed.' });
});

app.post('/api/auth/verify', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// 2. Wallets Services
app.get('/api/wallets', authMiddleware, (req: AuthRequest, res: Response) => {
  const db = dbService.get();
  const userWallets = db.wallets.filter(w => w.userId === req.user!.id);
  res.json(userWallets);
});

app.post('/api/wallets/create', authMiddleware, (req: AuthRequest, res: Response) => {
  const { currency } = req.body;
  if (!currency) return res.status(400).json({ error: 'Currency (e.g., EUR, GBP) is required' });

  const db = dbService.get();
  const exists = db.wallets.some(w => w.userId === req.user!.id && w.currency === currency.toUpperCase());
  if (exists) {
    return res.status(400).json({ error: `You already possess a dynamic ${currency.toUpperCase()} digital wallet.` });
  }

  const wallet: Wallet = {
    id: 'wlt_' + Math.random().toString(36).substring(2, 11),
    userId: req.user!.id,
    currency: currency.toUpperCase(),
    balance: 0.0,
    ledgerBalance: 0.0,
    dailyLimit: 3000.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.wallets.push(wallet);
  dbService.save(db);
  res.status(201).json(wallet);
});

app.post('/api/wallets/add-funds', authMiddleware, (req: AuthRequest, res: Response) => {
  const { walletId, amount, paymentMethod } = req.body;
  if (!walletId || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid wallet selection or funding amount' });
  }

  const db = dbService.get();
  const wallet = db.wallets.find(w => w.id === walletId && w.userId === req.user!.id);
  if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

  wallet.balance += parseFloat(amount);
  wallet.ledgerBalance += parseFloat(amount);
  wallet.updatedAt = new Date().toISOString();

  const journal = createJournal(
    walletId, 
    'DEPOSIT', 
    'Salary', 
    parseFloat(amount), 
    0, 
    `Top Up of Direct Funds using external ${paymentMethod || 'Linked Card'}`
  );

  res.json({ wallet, transaction: journal });
});

app.post('/api/wallets/withdraw-funds', authMiddleware, (req: AuthRequest, res: Response) => {
  const { walletId, amount, bankDetails } = req.body;
  if (!walletId || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid wallet selection or withdrawal amount' });
  }

  const db = dbService.get();
  const wallet = db.wallets.find(w => w.id === walletId && w.userId === req.user!.id);
  if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

  const numericAmt = parseFloat(amount);
  const fee = 1.99; // Standard payout fee
  
  if (wallet.balance < (numericAmt + fee)) {
    return res.status(400).json({ error: 'Insufficient wallet Balance to process withdrawal and cover payouts fee ($1.99)' });
  }

  wallet.balance -= (numericAmt + fee);
  wallet.ledgerBalance -= (numericAmt + fee);
  wallet.updatedAt = new Date().toISOString();

  const journal = createJournal(
    walletId, 
    'WITHDRAWAL', 
    'Bills', 
    numericAmt, 
    fee, 
    `Bank withdrawal to account: ${bankDetails || 'Global Clearing routing'}`
  );

  res.json({ wallet, transaction: journal });
});

app.post('/api/wallets/convert', authMiddleware, (req: AuthRequest, res: Response) => {
  const { sourceWalletId, targetCurrency, amount } = req.body;
  if (!sourceWalletId || !targetCurrency || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid currencies or conversion amount requested' });
  }

  const db = dbService.get();
  const srcWallet = db.wallets.find(w => w.id === sourceWalletId && w.userId === req.user!.id);
  if (!srcWallet) return res.status(404).json({ error: 'Source wallet not found' });

  const sourceAmt = parseFloat(amount);
  if (srcWallet.balance < sourceAmt) {
    return res.status(400).json({ error: 'Insufficient balance on chosen source wallet' });
  }

  // Look for target currency wallet
  let destWallet = db.wallets.find(w => w.userId === req.user!.id && w.currency === targetCurrency.toUpperCase());
  if (!destWallet) {
    return res.status(400).json({ error: `Please create a digital ${targetCurrency.toUpperCase()} wallet balance node before converting.` });
  }

  // Conversion rates (simulated based on static values)
  const rates: { [key: string]: number } = {
    'USD-EUR': 0.92, 'EUR-USD': 1.09,
    'USD-GBP': 0.79, 'GBP-USD': 1.27,
    'EUR-GBP': 0.86, 'GBP-EUR': 1.16
  };

  const pairKey = `${srcWallet.currency}-${destWallet.currency}`;
  const rate = rates[pairKey] || 1.0;
  const destAmt = sourceAmt * rate;
  const conversionFee = parseFloat((sourceAmt * 0.005).toFixed(2)); // 0.5% fee

  srcWallet.balance -= sourceAmt;
  srcWallet.ledgerBalance -= sourceAmt;
  srcWallet.updatedAt = new Date().toISOString();

  destWallet.balance += (destAmt - (conversionFee * rate));
  destWallet.ledgerBalance += (destAmt - (conversionFee * rate));
  destWallet.updatedAt = new Date().toISOString();

  // Logs on source wallet
  const journalSrc = createJournal(
    srcWallet.id,
    'WITHDRAWAL',
    'Bills',
    sourceAmt,
    conversionFee,
    `Exchanged to ${destWallet.currency} at dynamic rate ${rate}`
  );

  // Logs on destination wallet
  createJournal(
    destWallet.id,
    'DEPOSIT',
    'Salary',
    destAmt - (conversionFee * rate),
    0,
    `Exchanged from ${srcWallet.currency} at direct rate ${rate}`
  );

  res.json({ sourceWallet: srcWallet, targetWallet: destWallet, transaction: journalSrc });
});

// 3. Transactions Services
app.get('/api/transactions', authMiddleware, (req: AuthRequest, res: Response) => {
  const db = dbService.get();
  const userWalletIds = db.wallets.filter(w => w.userId === req.user!.id).map(w => w.id);
  
  // Filter all transactions corresponding to any of active user's wallets
  const userTxns = db.transactions.filter(t => userWalletIds.includes(t.walletId));
  
  // Attach currency metadata back for UI details rendering
  const outputTxns = userTxns.map(t => {
    const w = db.wallets.find(wl => wl.id === t.walletId);
    return {
      ...t,
      currency: w ? w.currency : 'USD'
    };
  });

  // Sort descending by date
  outputTxns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(outputTxns);
});

// 4. Money Transfers Services
app.post('/api/transfers/send', authMiddleware, (req: AuthRequest, res: Response) => {
  const { sourceWalletId, recipientEmail, amount, description, isScheduled, scheduledDate } = req.body;
  if (!sourceWalletId || !recipientEmail || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Please enter a valid recipient email, source wallet, and transfer amount' });
  }

  const db = dbService.get();
  const sourceWallet = db.wallets.find(w => w.id === sourceWalletId && w.userId === req.user!.id);
  if (!sourceWallet) return res.status(404).json({ error: 'Source wallet not found' });

  const transferAmount = parseFloat(amount);
  const transferFee = parseFloat((transferAmount * 0.01).toFixed(2)); // 1% internal network transaction fee

  if (sourceWallet.balance < (transferAmount + transferFee)) {
    return res.status(400).json({ error: `Insufficient funds. Need ${sourceWallet.currency} ${(transferAmount + transferFee).toLocaleString()} inclusive of 1% flat fee.` });
  }

  // Recipient Lookup
  const recipient = db.users.find(u => u.email.toLowerCase() === recipientEmail.toLowerCase());
  if (!recipient) {
    return res.status(404).json({ error: 'Recipient with that email is not registered. Verification failed.' });
  }

  if (recipient.id === req.user!.id) {
    return res.status(400).json({ error: 'You cannot perform outward self-transfers of this nature. Use Conversion node instead.' });
  }

  // Find recipient matching wallet currency
  let recipientWallet = db.wallets.find(w => w.userId === recipient.id && w.currency === sourceWallet.currency);
  
  if (!recipientWallet) {
    // Automatically create the matching wallet node for convenience
    recipientWallet = {
      id: 'wlt_' + Math.random().toString(36).substring(2, 11),
      userId: recipient.id,
      currency: sourceWallet.currency,
      balance: 0.0,
      ledgerBalance: 0.0,
      dailyLimit: 3000.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.wallets.push(recipientWallet);
  }

  if (isScheduled) {
    // Record visual scheduled transfer
    const newScheduled: Transfer = {
      id: 'sch_' + randId(),
      sourceWalletId,
      targetWalletId: recipientWallet.id,
      amount: transferAmount,
      fee: transferFee,
      description: description || `Scheduled payout allocation`,
      isScheduled: true,
      scheduledDate: scheduledDate || new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    db.transfers.push(newScheduled);
    dbService.save(db);
    return res.status(201).json({ scheduled: true, transfer: newScheduled, message: 'Your payment schedule has been logged and queued.' });
  }

  // Commit real-time ledger deduction
  sourceWallet.balance -= (transferAmount + transferFee);
  sourceWallet.ledgerBalance -= (transferAmount + transferFee);
  sourceWallet.updatedAt = new Date().toISOString();

  recipientWallet.balance += transferAmount;
  recipientWallet.ledgerBalance += transferAmount;
  recipientWallet.updatedAt = new Date().toISOString();

  // Record Transactions
  const txnSentObject = createJournal(
    sourceWallet.id,
    'TRANSFER_SENT',
    'Bills',
    transferAmount,
    transferFee,
    description || `Sent payment to ${recipient.name} via real-time network`
  );

  createJournal(
    recipientWallet.id,
    'TRANSFER_RECEIVED',
    'Salary',
    transferAmount,
    0,
    `Payment received from ${req.user!.name}`
  );

  // Send Push Notification
  db.notifications.push({
    id: 'not_' + randId(),
    userId: recipient.id,
    title: 'Payment Received! 💰',
    message: `You received ${recipientWallet.currency} ${transferAmount.toLocaleString()} from ${req.user!.name}.`,
    isRead: false,
    type: 'TRANSFER',
    createdAt: new Date().toISOString()
  });

  dbService.save(db);
  res.json({ success: true, transaction: txnSentObject });
});

app.get('/api/transfers/scheduled', authMiddleware, (req: AuthRequest, res: Response) => {
  const db = dbService.get();
  const userWalletIds = db.wallets.filter(w => w.userId === req.user!.id).map(w => w.id);
  const userScheduled = db.transfers.filter(t => t.isScheduled && userWalletIds.includes(t.sourceWalletId));
  res.json(userScheduled);
});

// 5. Virtual Cards Services
app.get('/api/cards', authMiddleware, (req: AuthRequest, res: Response) => {
  const db = dbService.get();
  const userCards = db.virtualCards.filter(c => c.userId === req.user!.id);
  res.json(userCards);
});

app.post('/api/cards/create', authMiddleware, (req: AuthRequest, res: Response) => {
  const { walletId, limit, cardType } = req.body;
  if (!walletId) return res.status(400).json({ error: 'Please link a wallet before proceeding to generate card.' });

  const db = dbService.get();
  const wallet = db.wallets.find(w => w.id === walletId && w.userId === req.user!.id);
  if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

  // Generates unique formatted Visa/Master
  const formattedC = '4111 ' + Array.from({length: 3}, () => Math.floor(1000 + Math.random() * 9000)).join(' ');
  const cvv = String(Math.floor(100 + Math.random() * 900));
  
  const m = String(Math.floor(1 + Math.random() * 12)).padStart(2, '0');
  const y = String(new Date().getFullYear() + 4).substring(2);

  const newCard: VirtualCard = {
    id: 'crd_' + randId(),
    userId: req.user!.id,
    walletId: walletId,
    cardNumber: formattedC,
    cardHolder: req.user!.name.toUpperCase(),
    expiryDate: `${m}/${y}`,
    cvv,
    status: 'ACTIVE',
    spendingLimit: limit ? parseFloat(limit) : 1000.0,
    spentThisMonth: 0.0,
    cardType: cardType || 'VISA Platinum Lite',
    createdAt: new Date().toISOString()
  };

  db.virtualCards.push(newCard);
  
  // Create system notification
  db.notifications.push({
    id: 'not_' + randId(),
    userId: req.user!.id,
    title: 'Virtual Card Activated! 💳',
    message: `Your secondary virtual card ending ${formattedC.slice(-4)} has been generated and ready for zero-touch checkout.`,
    isRead: false,
    type: 'SECURITY',
    createdAt: new Date().toISOString()
  });

  dbService.save(db);
  res.status(201).json(newCard);
});

app.post('/api/cards/:id/freeze', authMiddleware, (req: AuthRequest, res: Response) => {
  const db = dbService.get();
  const card = db.virtualCards.find(c => c.id === req.params.id && c.userId === req.user!.id);
  if (!card) return res.status(404).json({ error: 'Virtual Card not found' });

  card.status = 'FROZEN';
  dbService.save(db);
  res.json(card);
});

app.post('/api/cards/:id/unfreeze', authMiddleware, (req: AuthRequest, res: Response) => {
  const db = dbService.get();
  const card = db.virtualCards.find(c => c.id === req.params.id && c.userId === req.user!.id);
  if (!card) return res.status(404).json({ error: 'Virtual Card not found' });

  card.status = 'ACTIVE';
  dbService.save(db);
  res.json(card);
});

app.post('/api/cards/:id/limit', authMiddleware, (req: AuthRequest, res: Response) => {
  const { spendingLimit } = req.body;
  if (!spendingLimit || spendingLimit <= 0) return res.status(400).json({ error: 'Please enter a valid spending limit' });

  const db = dbService.get();
  const card = db.virtualCards.find(c => c.id === req.params.id && c.userId === req.user!.id);
  if (!card) return res.status(404).json({ error: 'Virtual card not found in your inventory' });

  card.spendingLimit = parseFloat(spendingLimit);
  dbService.save(db);
  res.json(card);
});

// 6. Spending Analytics Services
app.get('/api/analytics', authMiddleware, (req: AuthRequest, res: Response) => {
  const db = dbService.get();
  const userWalletIds = db.wallets.filter(w => w.userId === req.user!.id).map(w => w.id);
  const userTxns = db.transactions.filter(t => userWalletIds.includes(t.walletId) && t.status === 'SUCCESS');

  // Group by categories
  const categoryTotals: { [cat: string]: number } = {
    'Food': 0, 'Transport': 0, 'Bills': 0, 'Shopping': 0, 'Entertainment': 0, 'Salary': 0, 'Investments': 0, 'Cashback': 0
  };

  let totalExpenses = 0;
  let totalIncome = 0;

  userTxns.forEach(txn => {
    const amt = txn.amount;
    const cat = txn.category;
    if (categoryTotals[cat] === undefined) {
      categoryTotals[cat] = 0;
    }
    
    if (txn.type === 'DEPOSIT' || txn.type === 'TRANSFER_RECEIVED' || txn.type === 'CASHBACK') {
      totalIncome += amt;
    } else {
      totalExpenses += amt;
      categoryTotals[cat] += amt;
    }
  });

  const categoryBreakdown = Object.keys(categoryTotals)
    .filter(cat => cat !== 'Salary' && cat !== 'Cashback' && categoryTotals[cat] > 0)
    .map(name => ({
      name,
      value: categoryTotals[name]
    }));

  // Generate dynamic growth curves back
  const growthCurve = [
    { name: 'Mon', balance: 13900 },
    { name: 'Tue', balance: 14100 },
    { name: 'Wed', balance: 14000 },
    { name: 'Thu', balance: 14200 },
    { name: 'Fri', balance: 14450 },
    { name: 'Sat', balance: 14480 },
    { name: 'Sun', balance: 14480 }
  ];

  res.json({
    totalExpenses,
    totalIncome,
    categoryBreakdown,
    growthCurve,
    budgetLimit: 5000,
    budgetSpent: totalExpenses
  });
});

// 7. Bills Payments Services
app.post('/api/bills/pay', authMiddleware, (req: AuthRequest, res: Response) => {
  const { billType, billerName, walletId, amount, customerCode } = req.body;
  if (!billType || !walletId || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid bills payment parameters' });
  }

  const db = dbService.get();
  const wallet = db.wallets.find(w => w.id === walletId && w.userId === req.user!.id);
  if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

  const billAmount = parseFloat(amount);
  if (wallet.balance < billAmount) {
    return res.status(400).json({ error: `Insufficient funds inside ${wallet.currency} wallet node to pay ${billType}.` });
  }

  wallet.balance -= billAmount;
  wallet.ledgerBalance -= billAmount;
  wallet.updatedAt = new Date().toISOString();

  // Journal transactional logger
  const journal = createJournal(
    walletId,
    'BILL_PAYMENT',
    'Bills',
    billAmount,
    0,
    `Biller payoff: ${billerName || billType} (Account: ${customerCode || 'Instant utility settlement'})`
  );

  res.json({ success: true, wallet, transaction: journal });
});

// 8. Investments Services
app.get('/api/investments', authMiddleware, (req: AuthRequest, res: Response) => {
  const db = dbService.get();
  const userInvests = db.investments.filter(i => i.userId === req.user!.id);
  res.json(userInvests);
});

app.post('/api/investments/create', authMiddleware, (req: AuthRequest, res: Response) => {
  const { type, title, amount, walletId, durationMonths, interestRate } = req.body;
  if (!title || !amount || amount <= 0 || !walletId) {
    return res.status(400).json({ error: 'Please enter a valid investment layout, amount, and linked funding source.' });
  }

  const db = dbService.get();
  const wallet = db.wallets.find(w => w.id === walletId && w.userId === req.user!.id);
  if (!wallet) return res.status(404).json({ error: 'Funding wallet index not found' });

  const capital = parseFloat(amount);
  if (wallet.balance < capital) {
    return res.status(400).json({ error: 'Insufficient wallet balances to lock in investment.' });
  }

  // Deduct from wallet balance node
  wallet.balance -= capital;
  wallet.ledgerBalance -= capital;
  wallet.updatedAt = new Date().toISOString();

  const mYear = new Date();
  mYear.setMonth(mYear.getMonth() + parseInt(durationMonths || '12'));

  const rate = parseFloat(interestRate || '5.5');

  const newInvest: Investment = {
    id: 'inv_' + randId(),
    userId: req.user!.id,
    type: type || 'FIXED_DEPOSIT',
    title,
    targetAmount: type === 'SAVINGS_GOAL' ? capital * 1.5 : capital,
    currentAmount: capital,
    interestRate: rate,
    durationMonths: parseInt(durationMonths || '12'),
    startDate: new Date().toISOString(),
    maturityDate: mYear.toISOString(),
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  };

  db.investments.push(newInvest);

  // Journal Transaction
  createJournal(
    walletId,
    'INVESTMENT_FUND',
    'Investments',
    capital,
    0,
    `Invested: ${title} (${type === 'FIXED_DEPOSIT' ? 'Fixed Term' : 'Flex Goals'})`
  );

  dbService.save(db);
  res.status(201).json(newInvest);
});

// 9. User Profile & KYC Uploads
app.get('/api/users/profile', authMiddleware, (req: AuthRequest, res: Response) => {
  res.json(req.user);
});

app.post('/api/users/kyc', authMiddleware, (req: AuthRequest, res: Response) => {
  const { fullName, dateOfBirth, documentType, documentNumber, documentUrl } = req.body;
  if (!fullName || !documentNumber) {
    return res.status(400).json({ error: 'Please enter your Full Identity Name and document specifications.' });
  }

  const db = dbService.get();
  const user = db.users.find(u => u.id === req.user!.id);
  if (!user) return res.status(404).json({ error: 'Identity record missing' });

  // Update Status
  user.kycStatus = 'PENDING';
  
  // Re-push KYC Record
  const reqId = 'kyc_' + randId();
  db.kycRequests = db.kycRequests.filter(r => r.userId !== user.id); // clear existing first
  db.kycRequests.push({
    id: reqId,
    userId: user.id,
    fullName,
    dateOfBirth: dateOfBirth || '1995-01-01',
    documentType: documentType || 'Passport',
    documentNumber,
    documentUrl: documentUrl || 'https://images.unsplash.com/photo-1544256718-3bcf237f3974?w=800',
    status: 'PENDING',
    createdAt: new Date().toISOString()
  });

  dbService.save(db);
  res.json({ user, message: 'KYC Document submitted for admin approval.' });
});

app.get('/api/users/notifications', authMiddleware, (req: AuthRequest, res: Response) => {
  const db = dbService.get();
  const notes = db.notifications.filter(n => n.userId === req.user!.id);
  res.json(notes);
});

app.post('/api/users/notifications/:id/read', authMiddleware, (req: AuthRequest, res: Response) => {
  const db = dbService.get();
  const note = db.notifications.find(n => n.id === req.params.id && n.userId === req.user!.id);
  if (note) {
    note.isRead = true;
    dbService.save(db);
  }
  res.json({ success: true });
});

// 10. Admin Core Dashboard Controls
app.get('/api/admin/stats', authMiddleware, adminMiddleware, (req: AuthRequest, res: Response) => {
  const db = dbService.get();
  const totalWalletsBalUSD = db.wallets.reduce((sum, w) => sum + w.balance, 0);
  const totalUsers = db.users.filter(u => u.role !== 'ADMIN').length;
  const totalTxnsCount = db.transactions.length;
  const pendingKYCCount = db.kycRequests.filter(r => r.status === 'PENDING').length;

  res.json({
    totalVolume: totalWalletsBalUSD,
    activeAccounts: totalUsers,
    totalTransactions: totalTxnsCount,
    verificationQueue: pendingKYCCount,
    systemUptime: '99.98%'
  });
});

app.get('/api/admin/users', authMiddleware, adminMiddleware, (req: AuthRequest, res: Response) => {
  const db = dbService.get();
  res.json(db.users.filter(u => u.role !== 'ADMIN'));
});

app.get('/api/admin/kyc-requests', authMiddleware, adminMiddleware, (req: AuthRequest, res: Response) => {
  const db = dbService.get();
  res.json(db.kycRequests);
});

app.post('/api/admin/kyc-requests/:id/approve', authMiddleware, adminMiddleware, (req: AuthRequest, res: Response) => {
  const db = dbService.get();
  const reqId = req.params.id;
  const request = db.kycRequests.find(r => r.id === reqId);
  if (!request) return res.status(404).json({ error: 'KYC Record index not found' });

  request.status = 'APPROVED';
  
  const user = db.users.find(u => u.id === request.userId);
  if (user) {
    user.kycStatus = 'APPROVED';
    user.isVerified = true;

    db.notifications.push({
      id: 'not_' + randId(),
      userId: user.id,
      title: 'Congratulations! KYC Approved ✔',
      message: 'Your document verification has been successfully approved! All features are unlocked.',
      isRead: false,
      type: 'SECURITY',
      createdAt: new Date().toISOString()
    });
  }

  dbService.save(db);
  res.json(request);
});

app.post('/api/admin/kyc-requests/:id/reject', authMiddleware, adminMiddleware, (req: AuthRequest, res: Response) => {
  const db = dbService.get();
  const reqId = req.params.id;
  const request = db.kycRequests.find(r => r.id === reqId);
  if (!request) return res.status(404).json({ error: 'KYC Record index not found' });

  request.status = 'REJECTED';
  
  const user = db.users.find(u => u.id === request.userId);
  if (user) {
    user.kycStatus = 'REJECTED';

    db.notifications.push({
      id: 'not_' + randId(),
      userId: user.id,
      title: 'KYC Documents Rejected ❌',
      message: 'Your document verification failed. Please check criteria or submit again.',
      isRead: false,
      type: 'SECURITY',
      createdAt: new Date().toISOString()
    });
  }

  dbService.save(db);
  res.json(request);
});


// Serve Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static frontend compiled targets in production mode
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express server successfully running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
