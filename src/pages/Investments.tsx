import React, { useState, useEffect } from 'react';
import useWalletStore from '../store/useWalletStore';
import { 
  Sparkles, TrendingUp, DollarSign, Percent, Calendar, CheckCircle2, 
  AlertCircle, ArrowRight, BarChart3, Plus, Sliders 
} from 'lucide-react';

export default function Investments() {
  const { wallets, investments, createInvestment, refreshDashboardData } = useWalletStore();
  
  // Create Form Fields
  const [walletId, setWalletId] = useState('');
  const [investType, setInvestType] = useState<'FIXED_DEPOSIT' | 'SAVINGS_GOAL'>('FIXED_DEPOSIT');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('12');
  
  // Dynamic ROI Calculator States
  const [calcAmt, setCalcAmt] = useState(1000);
  const [calcMonths, setCalcMonths] = useState(12);
  const [calcRate, setCalcRate] = useState(6.2);

  // Statuses
  const [msgSuccess, setMsgSuccess] = useState('');
  const [msgError, setMsgError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    refreshDashboardData();
  }, [refreshDashboardData]);

  useEffect(() => {
    if (wallets.length > 0 && !walletId) {
      setWalletId(wallets[0].id);
    }
  }, [wallets, walletId]);

  const activeWallet = wallets.find(w => w.id === walletId) || wallets[0];

  const handleCreateInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMsgSuccess('');
    setMsgError('');

    // Determine APY interest rate dynamically
    const ratesByDuration: { [key: string]: number } = { '3': 4.2, '6': 4.8, '12': 6.2, '24': 7.5 };
    const rate = ratesByDuration[duration] || 5.5;

    try {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 10) {
        throw new Error('Minimum investment capital constraint is $10.');
      }

      await createInvestment({
        type: investType,
        title,
        amount: parsedAmount,
        walletId,
        durationMonths: parseInt(duration),
        interestRate: rate
      });

      setMsgSuccess(`Portfolio logged! ${activeWallet?.currency} ${parsedAmount.toLocaleString()} has been locked.`);
      setTitle('');
      setAmount('');
    } catch (err: any) {
      setMsgError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Calculations ROI helper
  const calculateROI = (principal: number, months: number, rate: number) => {
    const years = months / 12;
    const interest = principal * (rate / 100) * years;
    return principal + interest;
  };

  // Sync ROI slider rates on term changes
  useEffect(() => {
    const rMap: { [key: string]: number } = { '3': 4.2, '6': 4.8, '12': 6.2, '24': 7.5 };
    setCalcRate(rMap[String(calcMonths)] || 5.5);
  }, [calcMonths]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl tracking-tight text-white">Compound Wealth & Investments</h1>
        <p className="text-xs text-slate-400 mt-1">Grow your digital wallet balances. Book fixed term deposits or outline flexible savings progress goals.</p>
      </div>

      {msgSuccess && (
        <div id="invest-success-banner" className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{msgSuccess}</span>
        </div>
      )}

      {msgError && (
        <div id="invest-error-banner" className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{msgError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Portfolio Ledger */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-[#0b0f1a] border border-white/[0.05] rounded-3xl p-5 shadow-xl">
            <h3 className="font-display font-semibold text-xs text-slate-400 uppercase tracking-widest mb-4">Active Yield Portfolio</h3>
            
            <div className="space-y-4">
              {investments.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs font-mono border-2 border-dashed border-white/[0.05] rounded-2xl">
                  No active compound accounts booked. Issue one using the panel.
                </div>
              ) : (
                investments.map((inv) => {
                  const percentageProgress = inv.targetAmount 
                    ? Math.min(100, Math.floor((inv.currentAmount / inv.targetAmount) * 100)) 
                    : 100;
                  return (
                    <div 
                      key={inv.id} 
                      className="p-5 rounded-2xl bg-[#0F1426] border border-white/[0.08] relative overflow-hidden flex flex-col justify-between shadow-lg"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="truncate max-w-[220px]">
                          <span className={`px-2.5 py-0.5 rounded text-[8px] uppercase font-mono tracking-widest font-extrabold ${inv.type === 'SAVINGS_GOAL' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {inv.type === 'SAVINGS_GOAL' ? 'Goal Tracker' : 'Fixed Certificate'}
                          </span>
                          <h4 className="font-display font-bold text-sm text-slate-100 truncate mt-1.5">{inv.title}</h4>
                          <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">Start date: {new Date(inv.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-slate-100 font-mono">${inv.currentAmount.toLocaleString()}</span>
                          <span className="text-[10px] text-emerald-400 font-bold block mt-0.5 font-mono">{inv.interestRate}% APY</span>
                        </div>
                      </div>

                      {/* Percentage slider metrics */}
                      <div className="mt-2.5">
                        <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mb-1.5">
                          <span>Progress goals target</span>
                          <span>{percentageProgress}% • ${inv.targetAmount?.toLocaleString() || inv.currentAmount.toLocaleString()}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${percentageProgress}%` }} 
                            className="bg-emerald-500 h-full rounded-full duration-500 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Interactive ROI Calculator Slider Slit */}
          <div className="bg-[#0b0f1a] border border-white/[0.05] rounded-3xl p-5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-[30px] pointer-events-none" />
            <h3 className="font-display font-semibold text-xs text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-emerald-400" /> Dynamic Return Simulator (ROI)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                {/* Principal slider */}
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1 font-mono">
                    <span>Investment Principal</span>
                    <span className="text-white font-bold">${calcAmt.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="50000"
                    step="100"
                    value={calcAmt}
                    onChange={(e) => setCalcAmt(Number(e.target.value))}
                    className="w-full accent-emerald-400"
                  />
                </div>

                {/* Duration select */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 font-mono">Choose Locked Period</label>
                  <select
                    value={calcMonths}
                    onChange={(e) => setCalcMonths(Number(e.target.value))}
                    className="block w-full px-3 py-1.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="3" className="bg-[#0F1426]">3 Months (4.2% APY Yield)</option>
                    <option value="6" className="bg-[#0F1426]">6 Months (4.8% APY Yield)</option>
                    <option value="12" className="bg-[#0F1426]">12 Months (6.2% APY Yield)</option>
                    <option value="24" className="bg-[#0F1426]">24 Months (7.5% APY Yield)</option>
                  </select>
                </div>
              </div>

              {/* Aggregation results output */}
              <div className="bg-[#0e1324] border border-white/[0.05] p-5 rounded-2.5 rounded-2xl text-center space-y-2">
                <span className="text-slate-500 text-[10px] uppercase font-bold font-mono tracking-widest">Compounded Total Return</span>
                <h4 className="text-3xl font-display font-extrabold text-[#10B981] font-mono leading-none">
                  ${Math.floor(calculateROI(calcAmt, calcMonths, calcRate)).toLocaleString()}
                </h4>
                <div className="text-[10px] text-slate-400 font-mono">
                  Earned Interest Payout: <span className="text-slate-100 font-bold">+${Math.floor(calculateROI(calcAmt, calcMonths, calcRate) - calcAmt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Book Deposits Term Issuer Form */}
        <div className="lg:col-span-4 bg-[#0b0f1a] border border-white/[0.05] rounded-3xl p-5 shadow-xl shrink-0">
          <h3 className="font-display font-semibold text-sm text-slate-200 mb-4 flex items-center gap-1.5">
            <Plus className="w-4.5 h-4.5 text-emerald-300" /> Book Term Certificate
          </h3>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
            Lock capital away securely. Compound interests are auto-liquidated to linked wallets on designated maturity days.
          </p>

          <form onSubmit={handleCreateInvestment} className="space-y-4">
            {/* Funding selector */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono mb-1">Deduct Funds From</label>
              <select
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="block w-full px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none"
              >
                {wallets.map(w => (
                  <option key={w.id} value={w.id} className="bg-[#0F1426]">
                    {w.currency} Node (Bal: {w.balance.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono mb-1">Portfolio Tier</label>
              <select
                value={investType}
                onChange={(e) => setInvestType(e.target.value as any)}
                className="block w-full px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none"
              >
                <option value="FIXED_DEPOSIT" className="bg-[#0F1426]">Fixed Treasury Certificate (Max ROI)</option>
                <option value="SAVINGS_GOAL" className="bg-[#0F1426]">Flexible Milestone Goal (Periodic funding)</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono mb-1">Milestone Name / Title</label>
              <input
                id="invest-page-title-input"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Tesla Model S purchase / Retirement Term"
                className="block w-full px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs placeholder-slate-500 text-white focus:outline-none"
              />
            </div>

            {/* Term Period */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono mb-1">Compound Period</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="block w-full px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs text-white"
              >
                <option value="3" className="bg-[#0F1426]">3 Months (4.2% APY)</option>
                <option value="6" className="bg-[#0F1426]">6 Months (4.8% APY)</option>
                <option value="12" className="bg-[#0F1426]">12 Months (6.2% APY)</option>
                <option value="24" className="bg-[#0F1426]">24 Months (7.5% APY Check)</option>
              </select>
            </div>

            {/* Capital */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono mb-1 font-mono">Investment Capital (USD)</label>
              <input
                id="invest-page-amount-input"
                type="number"
                required
                min={10}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="block w-full px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs placeholder-slate-500 text-white focus:outline-none"
              />
            </div>

            <button
              id="invest-page-submit-btn"
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 cursor-pointer bg-emerald-500 hover:bg-emerald-400 text-slate-900 border border-emerald-400 font-semibold text-xs rounded-xl flex items-center justify-center gap-2"
            >
              <span>{submitting ? 'Authentic checks...' : 'Deed Investment Certificate'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
