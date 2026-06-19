import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useWalletStore from '../store/useWalletStore';
import { 
  Plus, ArrowUpRight, ArrowDownLeft, RefreshCcw, Landmark, 
  Send, UserCheck, ShieldCheck, TrendingUp, Calendar, AlertCircle, 
  CalendarCheck, ChevronRight, CheckCircle2, Search, ArrowRight, Sparkles,
  CreditCard, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { 
    user, wallets, transactions, scheduledTransfers, cards, analytics, loading, error, setError,
    refreshDashboardData, addFunds, withdrawFunds, sendMoney 
  } = useWalletStore();
  
  const navigate = useNavigate();

  // Dialog Modals State
  const [activeModal, setActiveModal] = useState<'none' | 'deposit' | 'withdraw' | 'transfer'>('none');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalSuccessMsg, setModalSuccessMsg] = useState('');
  const [modalError, setModalError] = useState('');

  // Form Fields
  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [amountInput, setAmountInput] = useState('');
  
  // Deposit fields
  const [depositMethod, setDepositMethod] = useState('Visa Ending *4401');
  
  // Withdraw fields
  const [bankRouting, setBankRouting] = useState('');
  
  // Transfer fields
  const [recipientEmail, setRecipientEmail] = useState('');
  const [transferDesc, setTransferDesc] = useState('');
  const [transferScheduled, setTransferScheduled] = useState(false);
  const [transferDate, setTransferDate] = useState('');

  // Search inside txns
  const [txnSearch, setTxnSearch] = useState('');

  // Sync dashboard data on launch
  useEffect(() => {
    refreshDashboardData();
  }, [refreshDashboardData]);

  // Set default wallet inside selectors once loaded
  useEffect(() => {
    if (wallets.length > 0 && !selectedWalletId) {
      setSelectedWalletId(wallets[0].id);
    }
  }, [wallets, selectedWalletId]);

  const rates: { [key: string]: number } = { 'USD': 1.0, 'EUR': 1.09, 'GBP': 1.27 };

  const getAggregatedUSD = () => {
    return wallets.reduce((sum, w) => {
      const r = rates[w.currency] || 1.0;
      return sum + (w.balance * r);
    }, 0);
  };

  const getCurrencySymbol = (cur: string) => {
    if (cur === 'EUR') return '€';
    if (cur === 'GBP') return '£';
    return '$';
  };

  const selectedWallet = wallets.find(w => w.id === selectedWalletId) || wallets[0];

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError('');
    try {
      await addFunds(selectedWalletId, parseFloat(amountInput), depositMethod);
      setModalSuccessMsg(`Successfully credited ${selectedWallet?.currency} ${parseFloat(amountInput).toLocaleString()}!`);
      setTimeout(() => {
        setActiveModal('none');
        setModalSuccessMsg('');
        setAmountInput('');
      }, 1500);
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError('');
    try {
      await withdrawFunds(selectedWalletId, parseFloat(amountInput), bankRouting);
      setModalSuccessMsg(`Payout of ${selectedWallet?.currency} ${parseFloat(amountInput).toLocaleString()} dispatched!`);
      setTimeout(() => {
        setActiveModal('none');
        setModalSuccessMsg('');
        setAmountInput('');
        setBankRouting('');
      }, 1500);
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError('');
    try {
      const msg = await sendMoney({
        sourceWalletId: selectedWalletId,
        recipientEmail,
        amount: parseFloat(amountInput),
        description: transferDesc,
        isScheduled: transferScheduled,
        scheduledDate: transferScheduled ? transferDate : undefined
      });
      setModalSuccessMsg(msg);
      setTimeout(() => {
        setActiveModal('none');
        setModalSuccessMsg('');
        setAmountInput('');
        setRecipientEmail('');
        setTransferDesc('');
        setTransferScheduled(false);
        setTransferDate('');
      }, 1500);
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  // Filter Txns list
  const filteredTxns = transactions.filter(t => {
    const term = txnSearch.toLowerCase();
    return (
      t.description?.toLowerCase().includes(term) ||
      t.category.toLowerCase().includes(term) ||
      t.reference.toLowerCase().includes(term) ||
      t.type.toLowerCase().includes(term)
    );
  }).slice(0, 5); // limit to recent 5

  return (
    <div className="space-y-6">
      {/* Overview Headway */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl tracking-tight text-white flex items-center gap-2">
            Welcome back, {user?.name || 'AURA User'} <Sparkles className="w-5 h-5 text-emerald-400" />
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Real-time balance settlement • UTC Ledger verified: {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            id="dash-refresh-btn"
            onClick={refreshDashboardData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-slate-300 transition-all cursor-pointer disabled:opacity-50"
            title="Force synchronization"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            id="dash-quick-trans-btn"
            onClick={() => {
              setAmountInput('');
              setActiveModal('transfer');
            }}
            className="px-4 py-2 bg-emerald-500 text-slate-900 border border-emerald-400 hover:bg-emerald-400 font-semibold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/15 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Send Funds</span>
          </button>
        </div>
      </div>

      {/* CORE TOP ROW: BALANCES & ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Aggregated Glassmorphic Balance Card */}
        <div className="lg:col-span-8 bg-gradient-to-tr from-[#162235]/90 to-[#101424] border border-white/[0.08] rounded-3xl p-6 relative overflow-hidden shadow-2xl backdrop-blur-md flex flex-col justify-between">
          {/* Wave visuals */}
          <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-emerald-500/5 rounded-full blur-[90px] pointer-events-none translate-x-12 -translate-y-12" />
          <div className="absolute -bottom-12 -left-12 w-[250px] h-[250px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />

          {/* Sub Header */}
          <div className="flex items-center justify-between mb-8 z-10">
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 flex items-center gap-1.5 font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Liquid Net Worth Aggregated (USD)
            </span>
            <span className="text-xs font-mono text-slate-400">
              {wallets.length} active nodes
            </span>
          </div>

          {/* Main Visual Figures */}
          <div className="z-10 mb-8">
            <span className="text-slate-400 text-xs font-mono">Consolidated Balance</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight mt-1.5 font-mono">
              ${getAggregatedUSD().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>

          {/* Individual Wallets slide widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 xl:gap-6 z-10 pt-4 border-t border-white/[0.05]">
            {wallets.map((wallet) => (
              <div 
                key={wallet.id}
                onClick={() => navigate('/wallets')}
                className="p-3.5 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.05] hover:border-emerald-500/20 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-display font-bold text-slate-300">{wallet.currency} Node</span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">{wallet.id.slice(-4)}</span>
                </div>
                <p className="text-lg font-bold text-slate-100 font-mono mt-2.5">
                  {getCurrencySymbol(wallet.currency)}{wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))}
            {wallets.length < 3 && (
              <button
                onClick={() => navigate('/wallets')}
                className="p-3.5 rounded-2xl border-2 border-dashed border-white/[0.06] hover:border-emerald-500/20 text-slate-500 hover:text-emerald-400 flex flex-col items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Wallet Currency</span>
              </button>
            )}
          </div>
        </div>

        {/* Action Widgets Bento-style */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-4">
          <button
            id="dash-action-deposit"
            onClick={() => {
              setAmountInput('');
              setActiveModal('deposit');
            }}
            className="p-5 bg-white/[0.02] hover:bg-gradient-to-tr hover:from-emerald-500/10 hover:to-transparent border border-white/[0.06] hover:border-emerald-500/20 rounded-2xl flex flex-col justify-between text-left transition-all relative group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-slate-100 mb-1">Add Funds</h4>
              <p className="text-[10px] text-slate-400 leading-tight">Instant credit with card or bank networks</p>
            </div>
          </button>

          <button
            id="dash-action-withdraw"
            onClick={() => {
              setAmountInput('');
              setActiveModal('withdraw');
            }}
            className="p-5 bg-white/[0.02] hover:bg-gradient-to-tr hover:from-emerald-500/10 hover:to-transparent border border-white/[0.06] hover:border-emerald-500/20 rounded-2xl flex flex-col justify-between text-left transition-all relative group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-slate-100 mb-1">Bank Payout</h4>
              <p className="text-[10px] text-slate-400 leading-tight">Withdraw directly to external clearing routes</p>
            </div>
          </button>

          <button
            id="dash-action-convert"
            onClick={() => navigate('/wallets')}
            className="p-5 bg-white/[0.02] hover:bg-gradient-to-tr hover:from-emerald-500/10 hover:to-transparent border border-white/[0.06] hover:border-emerald-500/20 rounded-2xl flex flex-col justify-between text-left transition-all relative group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <RefreshCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-slate-100 mb-1">Convert Node</h4>
              <p className="text-[10px] text-slate-400 leading-tight">Swap indices at dynamic pricing matrices</p>
            </div>
          </button>

          <button
            id="dash-action-cards"
            onClick={() => navigate('/cards')}
            className="p-5 bg-white/[0.02] hover:bg-gradient-to-tr hover:from-emerald-500/10 hover:to-transparent border border-white/[0.06] hover:border-emerald-500/20 rounded-2xl flex flex-col justify-between text-left transition-all relative group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-slate-100 mb-1">Debit Card</h4>
              <p className="text-[10px] text-slate-400 leading-tight">Control freeze limits and virtual terminals</p>
            </div>
          </button>
        </div>
      </div>

      {/* CHART ROW & MINI ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart wrapper */}
        <div className="lg:col-span-2 bg-gradient-to-b from-[#0e1324] to-[#0a0d17] border border-white/[0.06] rounded-3xl p-5 shadow-xl relative min-h-[300px] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 font-mono flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Performance Curves
              </span>
              <h3 className="font-display font-bold text-sm text-slate-200 mt-1">Growth & Flow Projection</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Last 7 days (USD basis)</span>
          </div>

          <div className="flex-1 min-h-[220px]">
            {analytics?.growthCurve ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.growthCurve}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis domain={['dataMin - 100', 'dataMax + 100']} stroke="#64748B" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}
                    labelStyle={{ color: '#F8FAFC', fontWeight: 'bold', fontSize: '11px' }}
                    itemStyle={{ color: '#10B981', fontSize: '11px' }}
                  />
                  <Area type="monotone" dataKey="balance" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBalance)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 font-mono text-xs">AURA Curve mapping...</div>
            )}
          </div>
        </div>

        {/* Savings progress goals and quick counters */}
        <div className="bg-[#0b0f1a] border border-white/[0.05] rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 font-mono flex items-center gap-1.5">
              <CalendarCheck className="w-4 h-4" /> Active Portfolios & Goals
            </span>
            <h3 className="font-display font-semibold text-xs text-slate-400 mt-2">Savings targets & fixed deposits</h3>
          </div>

          <div className="space-y-4 my-4 flex-1 overflow-y-auto max-h-[190px] pr-1">
            {scheduledTransfers.length > 0 && (
              <div className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-2xl">
                <div className="flex justify-between items-center text-[10px] text-emerald-300 font-bold uppercase mb-1.5 font-mono">
                  <span>Scheduled Transfer</span>
                  <span>{new Date(scheduledTransfers[0].scheduledDate || '').toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-200">
                  <span className="truncate">{scheduledTransfers[0].description}</span>
                  <span className="font-mono font-bold font-semibold">${scheduledTransfers[0].amount.toLocaleString()}</span>
                </div>
              </div>
            )}

            {cards.length > 0 && (
              <div className="p-3 bg-[#11172B] border border-emerald-500/10 rounded-xl relative overflow-hidden flex items-center justify-between">
                <div className="flex gap-2.5 items-center">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div className="max-w-[130px] truncate">
                    <h5 className="text-xs font-semibold text-slate-200 truncate">{cards[0].cardType}</h5>
                    <p className="text-[10px] text-slate-500 font-mono truncate">{cards[0].cardNumber}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${cards[0].status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {cards[0].status}
                  </span>
                </div>
              </div>
            )}

            <div 
              onClick={() => navigate('/investments')}
              className="p-3 rounded-xl border border-dashed border-white/[0.08] hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all flex items-center justify-between cursor-pointer group"
            >
              <span className="text-xs text-slate-400 group-hover:text-emerald-400 transition-colors">Start micro investment goal</span>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between text-[11px] text-slate-400">
            <span>Monthly limit remaining</span>
            <span className="font-mono text-emerald-400 font-bold">$3,420 / $5,000</span>
          </div>
        </div>
      </div>

      {/* CORE BOT ROW: TRANSACTION FILTER LOGS */}
      <div className="bg-[#0b0f1a] border border-white/[0.05] rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-bold text-lg text-white">Recent Transactions</h3>
            <p className="text-[11px] text-slate-400">Instant direct notifications ledger</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search ledger..."
                value={txnSearch}
                onChange={(e) => setTxnSearch(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs placeholder-slate-500 text-slate-300 focus:outline-none focus:border-emerald-500/50 block w-full"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-2.5" />
            </div>
            <button
              onClick={() => navigate('/analytics')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold font-display underline"
            >
              View All
            </button>
          </div>
        </div>

        {/* List render */}
        <div className="space-y-2">
          {filteredTxns.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs font-mono">No matching transactions logged.</div>
          ) : (
            filteredTxns.map((txn) => {
              const depositedType = txn.type === 'DEPOSIT' || txn.type === 'TRANSFER_RECEIVED' || txn.type === 'CASHBACK';
              return (
                <div
                  key={txn.id}
                  className="p-3.5 rounded-2xl bg-[#0e1324]/50 border border-white/[0.02] hover:border-white/[0.06] flex items-center justify-between gap-4 group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9.5 h-9.5 rounded-xl flex items-center justify-center shrink-0 ${
                      depositedType 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {depositedType ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-slate-200 group-hover:text-slate-100">{txn.description}</h5>
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                        {txn.category} • Ref {txn.reference} • {new Date(txn.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-bold font-mono ${depositedType ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {depositedType ? '+' : '-'}{getCurrencySymbol(txn.currency || 'USD')}{txn.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <span className="text-[9px] text-slate-500 font-mono mt-0.5">Success</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* DIALOG MODALS POPUPS */}
      <AnimatePresence>
        {activeModal !== 'none' && (
          <div className="fixed inset-0 bg-[#000]/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="bg-[#0F1426] border border-white/[0.08] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-6 relative"
            >
              <div className="flex justify-between items-center pb-4 border-b border-rose border-white/[0.05] mb-5">
                <h3 className="font-display font-extrabold text-[#F8FAFC]">
                  {activeModal === 'deposit' && 'Debit Card Funding Node'}
                  {activeModal === 'withdraw' && 'Direct Bank Payout Payout'}
                  {activeModal === 'transfer' && 'Outward Remittance Payout'}
                </h3>
                <button
                  onClick={() => setActiveModal('none')}
                  className="text-slate-500 hover:text-white hover:bg-white/[0.05] rounded-xl p-1 shrink-0"
                >
                  ✕
                </button>
              </div>

              {/* Error reporting inside models */}
              {modalError && (
                <div className="mb-4 p-3.5 bg-rose-500/10 rounded-xl border border-rose-500/20 text-xs text-rose-300">
                  {modalError}
                </div>
              )}

              {modalSuccessMsg && (
                <div className="mb-4 py-4 px-3.5 bg-emerald-500/15 rounded-xl border border-emerald-500/20 text-xs text-emerald-300 text-center flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  <p className="font-bold leading-relaxed">{modalSuccessMsg}</p>
                </div>
              )}

              {!modalSuccessMsg && (
                <form
                  onSubmit={
                    activeModal === 'deposit' ? handleDepositSubmit :
                    activeModal === 'withdraw' ? handleWithdrawalSubmit :
                    handleTransferSubmit
                  }
                  className="space-y-4"
                >
                  {/* Currency Wallet selector Node */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase font-mono">Select Active Node</label>
                    <select
                      value={selectedWalletId}
                      onChange={(e) => setSelectedWalletId(e.target.value)}
                      className="block w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                    >
                      {wallets.map(w => (
                        <option value={w.id} key={w.id} className="bg-[#0F1426] text-white">
                          {w.currency} Node (Balance: {getCurrencySymbol(w.currency)}{w.balance.toLocaleString(undefined, {minimumFractionDigits:2})})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Transfer Spec of Recipient */}
                  {activeModal === 'transfer' && (
                    <>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase font-mono">Recipient Email</label>
                        <input
                          id="transfer-recipient-email-field"
                          type="email"
                          required
                          value={recipientEmail}
                          onChange={(e) => setRecipientEmail(e.target.value)}
                          placeholder="recipient@wallet.com"
                          className="block w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs placeholder-slate-500 text-white focus:outline-none focus:border-emerald-500/50"
                        />
                        <span className="text-[9px] text-slate-500 mt-1 block">Recipient must possess a registered AURA wallet node.</span>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase font-mono">Remittance Note</label>
                        <input
                          type="text"
                          value={transferDesc}
                          onChange={(e) => setTransferDesc(e.target.value)}
                          placeholder="e.g. Security rent deposit allocation"
                          className="block w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs placeholder-slate-500 text-white focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>

                      {/* Scheduled triggers */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="sched-chk"
                          checked={transferScheduled}
                          onChange={(e) => setTransferScheduled(e.target.checked)}
                          className="rounded border-white/[0.08] text-emerald-500 bg-white/[0.03]"
                        />
                        <label htmlFor="sched-chk" className="text-xs text-slate-400 cursor-pointer">Schedule payout execution</label>
                      </div>

                      {transferScheduled && (
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase font-mono">Execution Date</label>
                          <input
                            type="date"
                            required
                            value={transferDate}
                            onChange={(e) => setTransferDate(e.target.value)}
                            className="block w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none"
                          />
                        </div>
                      )}
                    </>
                  )}

                  {/* Funding Details cards */}
                  {activeModal === 'deposit' && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase font-mono">Saved Funding Option</label>
                      <select
                        value={depositMethod}
                        onChange={(e) => setDepositMethod(e.target.value)}
                        className="block w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                      >
                        <option value="Visa Ending *4401" className="bg-[#0F1426]">Visa Premium Gold Ending *4401</option>
                        <option value="Mastercard Ending *8912" className="bg-[#0F1426]">Master Platinum Ending *8912</option>
                        <option value="Plaid Connected Account" className="bg-[#0F1426]">Chase Checking (Plaid connected)</option>
                      </select>
                    </div>
                  )}

                  {/* Bank routing withdrawals details */}
                  {activeModal === 'withdraw' && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase font-mono">Bank Routing IFSC / Routing IBAN</label>
                      <input
                        id="withdraw-routing-field"
                        type="text"
                        required
                        value={bankRouting}
                        onChange={(e) => setBankRouting(e.target.value)}
                        placeholder="US-DE-CHASE-009912048"
                        className="block w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs placeholder-slate-500 text-white focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  )}

                  {/* Input amount node */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase font-mono">Amount ({selectedWallet?.currency || 'USD'})</label>
                    <input
                      id="tx-amount-field"
                      type="number"
                      required
                      min={1}
                      step="0.01"
                      placeholder="500.00"
                      value={amountInput}
                      onChange={(e) => setAmountInput(e.target.value)}
                      className="block w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm placeholder-slate-500 text-white focus:outline-none focus:border-emerald-500/50 font-mono"
                    />
                    <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500 font-mono">
                      <span>Rate flat fee</span>
                      <span>
                        {activeModal === 'deposit' && 'Free of charge'}
                        {activeModal === 'withdraw' && '$1.99 fixed'}
                        {activeModal === 'transfer' && '1% network fee'}
                      </span>
                    </div>
                  </div>

                  {/* Submit trigger button */}
                  <button
                    id="modal-submit-btn"
                    type="submit"
                    disabled={modalLoading}
                    className="w-full mt-2 cursor-pointer py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold rounded-xl text-xs shadow-lg flex justify-center items-center gap-2 duration-150 active:scale-98"
                  >
                    {modalLoading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>Execute transaction</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
