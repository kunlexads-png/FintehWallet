import React, { useState, useEffect } from 'react';
import useWalletStore from '../store/useWalletStore';
import { 
  Building2, Zap, Droplet, Wifi, Tv, Smartphone, Globe, 
  CheckCircle2, AlertCircle, RefreshCw, Send, ArrowRight 
} from 'lucide-react';
import { fetchAPI } from '../services/api';

export default function Utilities() {
  const { wallets, refreshDashboardData } = useWalletStore();
  
  // Selection
  const [selectedUtil, setSelectedUtil] = useState<'electricity' | 'water' | 'internet' | 'tv' | 'airtime' | 'data'>('electricity');
  
  // Fields
  const [walletId, setWalletId] = useState('');
  const [amount, setAmount] = useState('');
  const [billerName, setBillerName] = useState('Metro Power & Grid');
  const [customerCode, setCustomerCode] = useState('');

  // Notifications
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshDashboardData();
  }, [refreshDashboardData]);

  useEffect(() => {
    if (wallets.length > 0 && !walletId) {
      setWalletId(wallets[0].id);
    }
  }, [wallets, walletId]);

  const activeWallet = wallets.find(w => w.id === walletId) || wallets[0];

  const handleBillPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error('Please enter a valid billing amount.');
      }

      const res = await fetchAPI('/api/bills/pay', {
        method: 'POST',
        body: JSON.stringify({
          billType: selectedUtil.toUpperCase(),
          billerName,
          walletId,
          amount: parsedAmount,
          customerCode
        })
      });

      setSuccessMsg(`Bills processed successfully! ${activeWallet?.currency} ${parsedAmount.toLocaleString()} has been sent to ${billerName}.`);
      setAmount('');
      setCustomerCode('');
      await refreshDashboardData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const utilityServices = [
    { key: 'electricity', label: 'Electricity Grid', icon: Zap, billers: ['Metro Power & Grid', 'Vortex Electric Co', 'Westcoast Energy'] },
    { key: 'water', label: 'Water & Sanitation', icon: Droplet, billers: ['Municipal Water Works', 'AquaClear Sanitation', 'Purewater Authority'] },
    { key: 'internet', label: 'Broadband Internet', icon: Wifi, billers: ['StarLink Telecom', 'FiberStream Giga', 'Infinity Broadband'] },
    { key: 'tv', label: 'TV Subscription', icon: Tv, billers: ['DirectStreams Pro', 'SkyNet Cable Node', 'Netflix Premium Link'] },
    { key: 'airtime', label: 'Mobile Airtime', icon: Smartphone, billers: ['T-Mobile Top Up', 'Verizon Wireless Air', 'Aura SIM Airtime'] },
    { key: 'data', label: 'Data Purchase', icon: Globe, billers: ['VodaGiga 5G Pack', 'AT&T Roaming Plus', 'Aura Infinite Giga'] },
  ];

  const getCurrencySymbol = (cur: string) => {
    if (cur === 'EUR') return '€';
    if (cur === 'GBP') return '£';
    return '$';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl tracking-tight text-white">Utility Bill Payments</h1>
        <p className="text-xs text-slate-400 mt-1">Settle electricity grids, fiber broadband networks, TV subscriptions, or buy mobile mobile data packages.</p>
      </div>

      {successMsg && (
        <div id="util-success-banner" className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div id="util-error-banner" className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid wrapper */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Services lists */}
        <div className="lg:col-span-5 bg-[#0b0f1a] border border-white/[0.05] rounded-3xl p-5 shadow-xl space-y-3">
          <h3 className="font-display font-semibold text-xs text-slate-400 uppercase tracking-widest mb-3">Settle Utilities</h3>
          <div className="grid grid-cols-1 gap-2.5">
            {utilityServices.map((service) => {
              const Icon = service.icon;
              const active = selectedUtil === service.key;
              return (
                <button
                  key={service.key}
                  onClick={() => {
                    setSelectedUtil(service.key as any);
                    setBillerName(service.billers[0]);
                  }}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between group cursor-pointer transition-all ${
                    active 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 shadow-md shadow-emerald-500/5' 
                      : 'bg-white/[0.01] border-white/[0.04] text-slate-400 hover:text-slate-100 hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/[0.02] text-slate-400 group-hover:text-slate-200'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-semibold">{service.label}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-slate-500 group-hover:translate-x-1 duration-150 ${active ? 'text-emerald-300' : ''}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Bill Constructor Form */}
        <div className="lg:col-span-7 bg-[#0b0f1a] border border-white/[0.05] rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px] pointer-events-none" />
          
          <h3 className="font-display font-semibold text-sm text-slate-200 mb-5 flex items-center gap-2 capitalize">
            Settle {selectedUtil} bills
          </h3>

          <form onSubmit={handleBillPaymentSubmit} className="space-y-4">
            {/* Funding selector */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono mb-1.5">Funding Wallet Node</label>
              <select
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="block w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none"
              >
                {wallets.map(w => (
                  <option key={w.id} value={w.id} className="bg-[#0F1426]">
                    {w.currency} Node (Balance: {getCurrencySymbol(w.currency)}{w.balance.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Biller Name */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono mb-1.5 font-mono">Select Biller Operator</label>
              <select
                value={billerName}
                onChange={(e) => setBillerName(e.target.value)}
                className="block w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none"
              >
                {utilityServices.find(s => s.key === selectedUtil)?.billers.map(b => (
                  <option key={b} value={b} className="bg-[#0F1426]">{b}</option>
                ))}
              </select>
            </div>

            {/* Customer Code account number */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono mb-1.5 uppercase font-mono">
                {selectedUtil === 'airtime' || selectedUtil === 'data' ? 'Mobile SIM Number (+1)' : 'Biller Account Number'}
              </label>
              <input
                id="utility-page-biller-acc-input"
                type="text"
                required
                value={customerCode}
                onChange={(e) => setCustomerCode(e.target.value)}
                placeholder={selectedUtil === 'airtime' || selectedUtil === 'data' ? '+1 (555) 441-2890' : 'M-GRID-990-2341-88'}
                className="block w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs placeholder-slate-500 text-white focus:outline-none"
              />
            </div>

            {/* Settle amount */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono mb-1.5 uppercase font-mono">Billing Settle Amount</label>
              <input
                id="utility-page-amount-input"
                type="number"
                required
                min={1}
                step="0.01"
                placeholder="45.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="block w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs placeholder-slate-500 text-white focus:outline-none font-mono"
              />
            </div>

            <button
              id="utility-page-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#0F1426] hover:bg-emerald-500 hover:text-slate-900 border border-white/[0.08] hover:border-transparent text-slate-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Processing bill settle...' : 'Authorize Settle Utility Claim'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Fallback Helper imports
import { ChevronRight } from 'lucide-react';
