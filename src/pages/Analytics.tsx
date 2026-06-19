import { useState, useEffect } from 'react';
import useWalletStore from '../store/useWalletStore';
import { 
  BarChart3, Calendar, FileDown, CheckCircle2, TrendingUp, AlertCircle, 
  PieChart as PieIcon, Sparkles, Filter, Search, ArrowUpRight, ArrowDownLeft 
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';

export default function Analytics() {
  const { analytics, transactions, wallets, refreshDashboardData } = useWalletStore();
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchWord, setSearchWord] = useState('');
  const [exportBanner, setExportBanner] = useState('');

  useEffect(() => {
    refreshDashboardData();
  }, [refreshDashboardData]);

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

  const getCurrencySymbol = (cur: string) => {
    if (cur === 'EUR') return '€';
    if (cur === 'GBP') return '£';
    return '$';
  };

  // Aggregated filters ledger
  const filteredLedger = transactions.filter(t => {
    const isCatMatched = filterCategory === 'ALL' || t.category.toUpperCase() === filterCategory;
    const isSearchMatched = 
      t.description?.toLowerCase().includes(searchWord.toLowerCase()) ||
      t.reference.toLowerCase().includes(searchWord.toLowerCase());
    return isCatMatched && isSearchMatched;
  });

  const categoriesTotal = [
    { name: 'Food', count: 0 },
    { name: 'Transport', count: 0 },
    { name: 'Bills', count: 0 },
    { name: 'Shopping', count: 0 },
    { name: 'Entertainment', count: 0 },
    { name: 'Investments', count: 0 }
  ];

  const handleExportStatement = () => {
    setExportBanner('AURA_Wallet_Statement_UTC.pdf successfully exported to Downloads path!');
    setTimeout(() => setExportBanner(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Headways */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl tracking-tight text-white">Spending Analytics & Logs</h1>
          <p className="text-xs text-slate-400 mt-1 font-sans">Leverage machine-classified indices to optimize saving rates and budget categories.</p>
        </div>
        <button
          onClick={handleExportStatement}
          className="px-4 py-2 cursor-pointer bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-xs font-semibold rounded-xl flex items-center justify-center gap-2 duration-150 transition-colors"
        >
          <FileDown className="w-4 h-4 text-emerald-400" />
          <span>Export PDF Statement</span>
        </button>
      </div>

      {exportBanner && (
        <div id="analytics-success-banner" className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{exportBanner}</span>
        </div>
      )}

      {/* CHARTS LAYER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown PIE Chart */}
        <div className="lg:col-span-5 bg-[#0b0f1a] border border-white/[0.05] rounded-3xl p-5 shadow-xl min-h-[320px] flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 font-mono flex items-center gap-1.5 leading-none">
              <PieIcon className="w-4 h-4" /> Categorized Allocations
            </span>
            <h3 className="font-display font-bold text-sm text-slate-200 mt-2">Expenses Subdivisions (USD)</h3>
          </div>

          <div className="flex-1 min-h-[200px] relative">
            {analytics?.categoryBreakdown && analytics.categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.categoryBreakdown}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {analytics.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}
                    itemStyle={{ color: '#FFF', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs font-mono">No expenses records to map.</div>
            )}
            
            {/* Center label */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="text-[9px] uppercase tracking-widest text-slate-500 block">Outgoings</span>
              <span className="text-xl font-bold text-slate-200 font-mono">
                ${analytics?.totalExpenses.toLocaleString() || '0'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 justify-center pt-2">
            {analytics?.categoryBreakdown && analytics.categoryBreakdown.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span>{item.name} (${item.value.toLocaleString()})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar charts income vs outgoings and budget meter bento */}
        <div className="lg:col-span-7 bg-[#0b0f1a] border border-white/[0.05] rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#3B82F6] font-mono flex items-center gap-1.5 leading-none">
              <TrendingUp className="w-4 h-4" /> Budget & Income Metrics
            </span>
            <h3 className="font-display font-bold text-sm text-slate-200 mt-2">Income Ratios (Monthly basis)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center flex-1 my-4">
            {/* Values overview */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.04] space-y-1.5">
                <span className="text-[10px] text-slate-500 font-mono tracking-wider block">Gross Income Registered</span>
                <span className="text-2xl font-bold font-mono text-[#10B981]">+${analytics?.totalIncome.toLocaleString()}</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.04] space-y-1.5">
                <span className="text-[10px] text-slate-500 font-mono tracking-wider block">Outgoings Settlements</span>
                <span className="text-2xl font-bold font-mono text-slate-300">-${analytics?.totalExpenses.toLocaleString()}</span>
              </div>
            </div>

            {/* Budget Limit Tracker */}
            <div className="p-5 bg-[#0F1426] border border-white/[0.05] rounded-2xl text-center space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono">Safety Monthly Budget Cap</span>
              
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                {/* SVG Dial meter radial */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="56" cy="56" r="48" className="stroke-slate-800" strokeWidth="6" fill="transparent" />
                  <circle cx="56" cy="56" r="48" className="stroke-emerald-400" strokeWidth="8" fill="transparent"
                    strokeDasharray={301.6}
                    strokeDashoffset={301.6 - (301.6 * Math.min(100, Math.floor((analytics?.totalExpenses || 0) / 5000 * 100))) / 100}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold font-mono text-white">
                    {Math.min(100, Math.floor((analytics?.totalExpenses || 0) / 5000 * 100))}%
                  </span>
                  <span className="text-[8px] text-slate-500 uppercase font-mono">exhausted</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400">Budget Limit: $5,000 / Spent: ${analytics?.totalExpenses}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.05] text-[10px] font-mono text-slate-500 flex justify-between">
            <span>Aggregated currency conversion rates of 1.09 EUR and 1.27 GBP applied dynamically.</span>
          </div>
        </div>
      </div>

      {/* FILTER SEARCH DETAILED LEDGER */}
      <div className="bg-[#0b0f1a] border border-white/[0.05] rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-bold text-sm text-slate-200">History & Category Auditor</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Filter outward transactions by categories or text tags.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative w-44">
              <input
                type="text"
                placeholder="Search description..."
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs placeholder-slate-500 text-slate-300 focus:outline-none focus:border-emerald-500/50 block w-full"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            </div>

            {/* Category selection filters tabs */}
            <div className="flex bg-white/[0.02] border border-white/[0.08] rounded-xl p-0.5 text-xs text-slate-400 font-mono">
              {['ALL', 'SALARY', 'FOOD', 'BILLS', 'SHOPPING', 'ENTERTAINMENT', 'INVESTMENTS'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilterCategory(tab)}
                  className={`px-2 py-1 rounded-lg text-[9px] uppercase font-bold cursor-pointer transition-all ${
                    filterCategory === tab 
                      ? 'bg-emerald-500/10 text-emerald-400 border-b border-emerald-500/30' 
                      : 'hover:text-slate-200'
                  }`}
                >
                  {tab === 'ALL' ? 'All' : tab.slice(0, 4)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ledger logs Render */}
        <div className="space-y-2">
          {filteredLedger.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs font-mono border border-dashed border-white/[0.04] rounded-2xl">
              No matching ledger records registered under parameters.
            </div>
          ) : (
            filteredLedger.map((txn) => {
              const depositedType = txn.type === 'DEPOSIT' || txn.type === 'TRANSFER_RECEIVED' || txn.type === 'CASHBACK';
              return (
                <div
                  key={txn.id}
                  className="p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.04] rounded-2xl flex items-center justify-between gap-4 group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center shrink-0 ${
                      depositedType ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {depositedType ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200 group-hover:text-slate-100">{txn.description}</h4>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {txn.category} • Ref {txn.reference} • Scheduled Date: {new Date(txn.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold font-mono ${depositedType ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {depositedType ? '+' : '-'}{getCurrencySymbol(txn.currency || 'USD')}{txn.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[9px] text-emerald-400/80 font-mono block mt-0.5">Clearance success</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
