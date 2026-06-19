import React, { useState, useEffect } from 'react';
import useWalletStore from '../store/useWalletStore';
import { 
  CreditCard, ShieldAlert, Sparkles, Sliders, Eye, EyeOff, 
  Lock, Unlock, Plus, RefreshCw, CheckCircle2, AlertCircle, TrendingUp 
} from 'lucide-react';

export default function Cards() {
  const { wallets, cards, createCard, toggleCardFreeze, updateCardLimit, refreshDashboardData } = useWalletStore();
  
  // Card Creation dialog State
  const [walletId, setWalletId] = useState('');
  const [limitInput, setLimitInput] = useState('1000');
  const [cardBrand, setCardBrand] = useState('VISA Black Gold Corporate');
  
  // Display states
  const [revealSecretsId, setRevealSecretsId] = useState<string | null>(null);
  const [adjustLimitId, setAdjustLimitId] = useState<string | null>(null);
  const [customLimitVal, setCustomLimitVal] = useState('');

  const [msgSuccess, setMsgSuccess] = useState('');
  const [msgError, setMsgError] = useState('');
  const [cardIssuingLoader, setCardIssuingLoader] = useState(false);

  useEffect(() => {
    refreshDashboardData();
  }, [refreshDashboardData]);

  useEffect(() => {
    if (wallets.length > 0 && !walletId) {
      setWalletId(wallets[0].id);
    }
  }, [wallets, walletId]);

  const handleIssueCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setCardIssuingLoader(true);
    setMsgSuccess('');
    setMsgError('');
    try {
      await createCard(walletId, parseFloat(limitInput), cardBrand);
      setMsgSuccess('Pristine virtual card issued successfully!');
    } catch (err: any) {
      setMsgError(err.message);
    } finally {
      setCardIssuingLoader(false);
    }
  };

  const handleFreezeToggle = async (cardId: string, status: string) => {
    setMsgSuccess('');
    setMsgError('');
    try {
      await toggleCardFreeze(cardId, status);
      setMsgSuccess(`Card has been successfully ${status === 'ACTIVE' ? 'frozen and locked' : 'unfrozen and authorized'}!`);
    } catch (err: any) {
      setMsgError(err.message);
    }
  };

  const handleUpdateLimitSubmit = async (cardId: string) => {
    setMsgSuccess('');
    setMsgError('');
    try {
      await updateCardLimit(cardId, parseFloat(customLimitVal));
      setMsgSuccess('Spending limits modified successfully.');
      setAdjustLimitId(null);
      setCustomLimitVal('');
    } catch (err: any) {
      setMsgError(err.message);
    }
  };

  const toggleRevealCard = (id: string) => {
    if (revealSecretsId === id) {
      setRevealSecretsId(null);
    } else {
      setRevealSecretsId(id);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl tracking-tight text-white">Virtual Card Management</h1>
        <p className="text-xs text-slate-400 mt-1">Generate multi-currency virtual debit terminals, modify spending metrics, or cycle credentials recursively.</p>
      </div>

      {msgSuccess && (
        <div id="cards-success-banner" className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{msgSuccess}</span>
        </div>
      )}

      {msgError && (
        <div id="cards-error-banner" className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{msgError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Issued Cards Catalog List */}
        <div className="lg:col-span-8 space-y-6">
          {cards.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs font-mono border-2 border-dashed border-white/[0.05] rounded-3xl">
              No virtual terminals currently issued on this account. Generate one on the right to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cards.map((card) => {
                const isRevealed = revealSecretsId === card.id;
                const isFrozen = card.status === 'FROZEN';
                const parentWallet = wallets.find(w => w.id === card.walletId);
                
                return (
                  <div key={card.id} className="space-y-4">
                    {/* Glass visual debit card display */}
                    <div className={`p-6 rounded-3xl relative h-48 overflow-hidden shadow-2xl flex flex-col justify-between transition-all border ${
                      isFrozen 
                        ? 'bg-gradient-to-tr from-[#1E293B] to-[#0F172A] border-white/[0.05] opacity-75' 
                        : card.cardType.includes('MASTERCARD')
                          ? 'bg-gradient-to-tr from-[#4f2a1b] to-[#120807] border-orange-500/10'
                          : 'bg-gradient-to-tr from-[#0b3c2e] to-[#010c08] border-emerald-500/10'
                    }`}>
                      {/* Internal grid graphics overlay */}
                      <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none" />
                      <div className="absolute top-0 inset-x-0 bottom-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

                      {/* Header details */}
                      <div className="flex justify-between items-start z-10">
                        <div>
                          <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-400 font-mono">
                            {parentWallet ? `${parentWallet.currency} Wallet Node` : 'USD Terminal'}
                          </span>
                          <h4 className="font-display font-medium text-[11px] text-slate-300 truncate mt-0.5">{card.cardType}</h4>
                        </div>
                        <span className="text-xs uppercase font-extrabold text-slate-100 font-mono italic">
                          {card.cardType.includes('VISA') ? 'VISA' : 'MC'}
                        </span>
                      </div>

                      {/* Decentered Card numbers */}
                      <div className="z-10 text-center py-2">
                        <p className="text-lg md:text-xl font-mono font-bold tracking-widest text-white leading-none">
                          {isRevealed ? card.cardNumber : `•••• •••• •••• ${card.cardNumber.slice(-4)}`}
                        </p>
                      </div>

                      {/* Bottom values */}
                      <div className="flex justify-between items-end z-10">
                        <div>
                          <span className="text-[8px] uppercase tracking-widest text-slate-500 block font-mono">Holder</span>
                          <span className="text-xs font-semibold uppercase text-slate-200 truncate">{card.cardHolder}</span>
                        </div>
                        <div className="flex gap-4">
                          <div>
                            <span className="text-[8px] uppercase tracking-widest text-slate-500 block font-mono">Expiry</span>
                            <span className="text-xs font-bold font-mono text-slate-200">{card.expiryDate}</span>
                          </div>
                          <div>
                            <span className="text-[8px] uppercase tracking-widest text-slate-500 block font-mono">CVV</span>
                            <span className="text-xs font-bold font-mono text-slate-200">{isRevealed ? card.cvv : '•••'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick controls controls deck */}
                    <div className="bg-[#0b0f1a] border border-white/[0.05] p-4 rounded-2xl flex flex-wrap gap-2 justify-between items-center text-xs">
                      <div className="flex gap-2.5">
                        <button
                          onClick={() => toggleRevealCard(card.id)}
                          className="px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.08] text-slate-300 hover:text-white flex items-center gap-1.5 hover:bg-white/[0.05] cursor-pointer"
                        >
                          {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          <span>{isRevealed ? 'Mask' : 'Reveal'}</span>
                        </button>

                        <button
                          onClick={() => handleFreezeToggle(card.id, card.status)}
                          className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                            isFrozen 
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' 
                              : 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20'
                          }`}
                        >
                          {isFrozen ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          <span>{isFrozen ? 'Unlock' : 'Freeze'}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {adjustLimitId === card.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              placeholder="Limit"
                              value={customLimitVal}
                              onChange={(e) => setCustomLimitVal(e.target.value)}
                              className="w-16 px-1.5 py-1 text-xs bg-slate-800 rounded border border-slate-700 text-white focus:outline-none"
                            />
                            <button
                              onClick={() => handleUpdateLimitSubmit(card.id)}
                              className="px-2 py-1 text-[10px] font-bold bg-emerald-500 rounded text-slate-900"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setAdjustLimitId(null)}
                              className="text-slate-500 hover:text-white"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setAdjustLimitId(card.id);
                              setCustomLimitVal(String(card.spendingLimit));
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[#0F1426] border border-white/[0.08] text-slate-300 hover:text-white flex items-center gap-1.5 hover:bg-white/[0.03] cursor-pointer"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>Limit: ${card.spendingLimit.toLocaleString()}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Virtual Card Issuer Form */}
        <div className="lg:col-span-4 bg-[#0b0f1a] border border-white/[0.05] rounded-3xl p-5 shadow-xl shrink-0">
          <h3 className="font-display font-semibold text-sm text-slate-200 mb-4 flex items-center gap-1.5">
            <Plus className="w-4.5 h-4.5 text-emerald-300" /> Issue Terminal Node
          </h3>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
            Create an independent Visa or MasterCard linked to any of your active currency balances to facilitate online checkouts.
          </p>

          <form onSubmit={handleIssueCard} className="space-y-4">
            {/* Wallet Selection */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono mb-1">Fundings Wallet Node</label>
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

            {/* Brand/Tier type selection */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono mb-1 font-mono">Tier Design</label>
              <select
                value={cardBrand}
                onChange={(e) => setCardBrand(e.target.value)}
                className="block w-full px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none"
              >
                <option value="VISA Black Elite Premium" className="bg-[#0F1426]">VISA Black Elite (Sleek Emerald Edge)</option>
                <option value="MASTERCARD Platinum Business" className="bg-[#0F1426]">MASTERCARD Platinum (Warm Obsidian)</option>
                <option value="VISA Classic Single Use" className="bg-[#0F1426]">VISA Classic (Pure Silver Border)</option>
              </select>
            </div>

            {/* Limit */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono mb-1 leading-none">Monthly Limit (USD)</label>
              <input
                id="card-issue-limit-field"
                type="number"
                required
                min={50}
                max={5000}
                value={limitInput}
                onChange={(e) => setLimitInput(e.target.value)}
                className="block w-full px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs placeholder-slate-500 text-white focus:outline-none"
              />
            </div>

            <button
              id="card-issue-submit-btn"
              type="submit"
              disabled={cardIssuingLoader}
              className="w-full py-2.5 cursor-pointer bg-emerald-500 hover:bg-emerald-400 text-slate-900 border border-emerald-400 font-semibold text-xs rounded-xl flex items-center justify-center gap-2"
            >
              <span>{cardIssuingLoader ? 'Cycling numbers...' : 'Activate Card Node'}</span>
            </button>
          </form>

          <div className="mt-5 p-3 rounded-2xl bg-white/[0.01] border border-white/[0.04] text-[10px] text-slate-400 leading-normal flex gap-2 items-start">
            <ShieldAlert className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <p>Cards are protected by tokenization standards. Suspicious transaction limits are auto-capped.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
