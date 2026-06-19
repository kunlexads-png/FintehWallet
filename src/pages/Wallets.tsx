import React, { useState } from 'react';
import useWalletStore from '../store/useWalletStore';
import { Wallet, RefreshCw, Sparkles, TrendingUp, AlertCircle, Plus, CheckCircle2, ArrowRightLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Wallets() {
  const { wallets, createWallet, convertCurrency, loading } = useWalletStore();
  const [currencyNode, setCurrencyNode] = useState('EUR');
  
  // Convert fields
  const [sourceId, setSourceId] = useState('');
  const [targetCurr, setTargetCurr] = useState('EUR');
  const [convertAmt, setConvertAmt] = useState('');
  
  // Messages
  const [msgSuccess, setMsgSuccess] = useState('');
  const [msgError, setMsgError] = useState('');

  const currenciesAvailable = ['EUR', 'GBP', 'USD', 'JPY', 'CAD', 'AUD'];

  const getCurrencySymbol = (cur: string) => {
    if (cur === 'EUR') return '€';
    if (cur === 'GBP') return '£';
    if (cur === 'JPY') return '¥';
    return '$';
  };

  const currentSourceWallet = wallets.find(w => w.id === sourceId) || wallets[0];

  const handleCreateNode = async () => {
    setMsgSuccess('');
    setMsgError('');
    try {
      await createWallet(currencyNode);
      setMsgSuccess(`Pristine digital ${currencyNode} wallet node created and configured in ledger!`);
    } catch (err: any) {
      setMsgError(err.message);
    }
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsgSuccess('');
    setMsgError('');
    try {
      const srcId = sourceId || wallets[0]?.id;
      if (!srcId) return;
      await convertCurrency(srcId, targetCurr, parseFloat(convertAmt));
      setMsgSuccess('Conversions completed! Balances updated.');
      setConvertAmt('');
    } catch (err: any) {
      setMsgError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl tracking-tight text-white">My Currency Wallets</h1>
        <p className="text-xs text-slate-400 mt-1">Configure multiple currencies and perform real-time FX currency conversions.</p>
      </div>

      {msgSuccess && (
        <div id="wallets-success-banner" className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{msgSuccess}</span>
        </div>
      )}

      {msgError && (
        <div id="wallets-error-banner" className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{msgError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Wallets Inventory */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-[#0b0f1a] border border-white/[0.05] rounded-3xl p-5 shadow-xl">
            <h3 className="font-display font-bold text-sm text-slate-200 mb-4 uppercase tracking-wider text-[11px] font-mono">Active Nodes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wallets.map((w) => (
                <div 
                  key={w.id}
                  className="p-5 rounded-2xl bg-[#0F1426] border border-white/[0.08] flex flex-col justify-between h-36 relative overflow-hidden group hover:border-[#10B981]/30 transition-all shadow-lg"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-[30px] pointer-events-none" />
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-display font-bold text-sm">
                        {w.currency.slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-sm text-slate-100">{w.currency} Wallet</h4>
                        <span className="text-[9px] text-slate-500 font-mono">Reference ID: {w.id.slice(-6)}</span>
                      </div>
                    </div>
                    <span className="text-[9px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">Vault Verified</span>
                  </div>

                  <div className="pt-3">
                    <span className="text-[10px] text-slate-500 font-mono block">Available Ledger Balance</span>
                    <p className="text-2xl font-bold text-white tracking-tight font-mono">
                      {getCurrencySymbol(w.currency)}{w.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Wallet Limit Status */}
          <div className="bg-[#0b0f1a] border border-white/[0.05] rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex gap-3 items-start">
              <TrendingUp className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-display font-bold text-sm text-slate-200">Daily Ledger Limit limits</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Limits on outward settlements for security metrics.</p>
              </div>
            </div>
            <div className="text-right sm:text-left">
              <span className="text-[10px] text-slate-500 font-mono block">Current allocation limit</span>
              <span className="font-mono text-emerald-400 font-bold">$5,000.00 Daily limits</span>
            </div>
          </div>
        </div>

        {/* Right Side: Wallet Config Tools */}
        <div className="lg:col-span-4 space-y-6">
          {/* Create Node Component */}
          <div className="bg-[#0b0f1a] border border-white/[0.05] rounded-3xl p-5 shadow-xl">
            <h3 className="font-display font-bold text-xs text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Expand Currencies
            </h3>
            <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
              Open a new digital wallet node to start receiving direct transfers instantly in that denomination.
            </p>
            <div className="space-y-3">
              <select
                value={currencyNode}
                onChange={(e) => setCurrencyNode(e.target.value)}
                className="block w-full px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none"
              >
                {currenciesAvailable.map(c => (
                  <option key={c} value={c} className="bg-[#0F1426] text-white">
                    {c} (Global Currency Node)
                  </option>
                ))}
              </select>
              <button
                id="wallet-create-node-btn"
                onClick={handleCreateNode}
                className="w-full py-2 bg-white/[0.04] hover:bg-emerald-500 hover:text-slate-900 border border-white/[0.08] hover:border-transparent text-slate-300 transition-all font-semibold text-xs rounded-xl cursor-pointer shadow"
              >
                Create Selected Node
              </button>
            </div>
          </div>

          {/* Quick FX Exchanges Matrix */}
          <div className="bg-[#0b0f1a] border border-white/[0.05] rounded-3xl p-5 shadow-xl">
            <h3 className="font-display font-bold text-xs text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <ArrowRightLeft className="w-4 h-4 text-emerald-400" /> FX Exchanges Workspace
            </h3>
            <p className="text-[11px] text-slate-400 mb-4">
              Swap accumulated funds internally at actual market prices. No third-party spreads.
            </p>
            
            <form onSubmit={handleConvert} className="space-y-3">
              {/* Source node */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono mb-1">Source Wallet</label>
                <select
                  value={sourceId}
                  onChange={(e) => setSourceId(e.target.value)}
                  className="block w-full px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none"
                >
                  {wallets.map(w => (
                    <option key={w.id} value={w.id} className="bg-[#0F1426]">
                      {w.currency} Node ({getCurrencySymbol(w.currency)}{w.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Target node */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono mb-1">Target Currency</label>
                <select
                  value={targetCurr}
                  onChange={(e) => setTargetCurr(e.target.value)}
                  className="block w-full px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none"
                >
                  {currenciesAvailable.filter(c => c !== currentSourceWallet?.currency).map(c => (
                    <option key={c} value={c} className="bg-[#0F1426]">{c}</option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono mb-1">Convert Amount</label>
                <input
                  id="wallet-convert-amount-field"
                  type="number"
                  required
                  min={1}
                  step="0.01"
                  placeholder="100"
                  value={convertAmt}
                  onChange={(e) => setConvertAmt(e.target.value)}
                  className="block w-full px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs placeholder-slate-500 text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <button
                id="wallet-covert-swap-btn"
                type="submit"
                className="w-full py-2.5 cursor-pointer bg-emerald-500 hover:bg-emerald-400 text-slate-900 border border-emerald-400 font-semibold text-xs rounded-xl flex items-center justify-center gap-2"
              >
                <span>Commit Real-Time Swap</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
