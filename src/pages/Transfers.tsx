import React, { useState, useEffect } from 'react';
import useWalletStore from '../store/useWalletStore';
import { Send, Clock, AlertCircle, CheckCircle2, Search, Sparkles, UserCheck, Trash2, Calendar } from 'lucide-react';

export default function Transfers() {
  const { wallets, scheduledTransfers, sendMoney, refreshDashboardData } = useWalletStore();
  
  // Fields
  const [sourceWalletId, setSourceWalletId] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  
  // Scheduling
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');

  // Notifications
  const [alertSuccess, setAlertSuccess] = useState('');
  const [alertError, setAlertError] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    refreshDashboardData();
  }, [refreshDashboardData]);

  useEffect(() => {
    if (wallets.length > 0 && !sourceWalletId) {
      setSourceWalletId(wallets[0].id);
    }
  }, [wallets, sourceWalletId]);

  const activeWallet = wallets.find(w => w.id === sourceWalletId) || wallets[0];

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setAlertSuccess('');
    setAlertError('');

    try {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error('Please enter a valid transfer amount.');
      }

      const msg = await sendMoney({
        sourceWalletId,
        recipientEmail,
        amount: parsedAmount,
        description,
        isScheduled,
        scheduledDate: isScheduled ? scheduledDate : undefined
      });

      setAlertSuccess(msg);
      // reset
      setAmount('');
      setDescription('');
      setIsScheduled(false);
      setScheduledDate('');
      setRecipientEmail('');
    } catch (err: any) {
      setAlertError(err.message);
    } finally {
      setSending(false);
    }
  };

  const getCurrencySymbol = (cur: string) => {
    if (cur === 'EUR') return '€';
    if (cur === 'GBP') return '£';
    return '$';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl tracking-tight text-white">Remittance & Money Transfers</h1>
        <p className="text-xs text-slate-400 mt-1">Send funds directly to other registered AURA users or queue scheduled transfers.</p>
      </div>

      {alertSuccess && (
        <div id="transfer-success-banner" className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{alertSuccess}</span>
        </div>
      )}

      {alertError && (
        <div id="transfer-error-banner" className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{alertError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Money Outflow Form */}
        <div className="lg:col-span-7 bg-[#0b0f1a] border border-white/[0.05] rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px] pointer-events-none" />
          
          <h3 className="font-display font-semibold text-sm text-slate-200 mb-5 flex items-center gap-2">
            <Send className="w-4.5 h-4.5 text-emerald-400" /> Remittance Constructor
          </h3>

          <form onSubmit={handleTransferSubmit} className="space-y-4">
            {/* Sender Wallet Node */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono mb-1.5">Funding Source Node</label>
              <select
                value={sourceWalletId}
                onChange={(e) => setSourceWalletId(e.target.value)}
                className="block w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none"
              >
                {wallets.map(w => (
                  <option key={w.id} value={w.id} className="bg-[#0F1426]">
                    {w.currency} Wallet Node (Ledger Val: {getCurrencySymbol(w.currency)}{w.balance.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Recipient email search verification indicator */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono mb-1.5">Recipient Verified Email Address</label>
              <div className="relative">
                <input
                  id="transfer-page-email-input"
                  type="email"
                  required
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="e.g. user@wallet.com"
                  className="block w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs placeholder-slate-500 text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono mb-1.5">Transfer Amount</label>
                <input
                  id="transfer-page-amount-input"
                  type="number"
                  required
                  min={1}
                  step="0.01"
                  placeholder="50.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="block w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs placeholder-slate-500 text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono mb-1.5">Ledger Network Fee (1%)</label>
                <div className="px-3.5 py-2.5 bg-white/[0.01] border border-dashed border-white/[0.08] rounded-xl text-xs text-slate-400 font-mono">
                  {amount ? `$${(parseFloat(amount) * 0.01).toFixed(2)}` : '$0.00'}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono mb-1.5">Transaction Description Note</label>
              <input
                id="transfer-page-desc-input"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Rent rebate / birthday present allocation"
                className="block w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs placeholder-slate-500 text-white focus:outline-none"
              />
            </div>

            {/* Scheduled toggles */}
            <div className="p-4 bg-[#0F1426] border border-white/[0.05] rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <input
                  id="transfer-page-sched-toggle"
                  type="checkbox"
                  checked={isScheduled}
                  onChange={(e) => setIsScheduled(e.target.checked)}
                  className="rounded border-white/[0.08] text-emerald-500 bg-white/[0.03]"
                />
                <label htmlFor="transfer-page-sched-toggle" className="text-xs font-semibold text-slate-300 cursor-pointer">Queue inside scheduled remittances</label>
              </div>

              {isScheduled && (
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono mb-1">Execution Date</label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="block w-full px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none"
                  />
                  <span className="text-[9px] text-slate-500 mt-1 block">Scheduled transactions pull from selected source wallet node on designated UTC calendar day.</span>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              id="transfer-page-submit-btn"
              type="submit"
              disabled={sending}
              className="w-full py-2.5 cursor-pointer bg-emerald-500 hover:bg-emerald-400 text-slate-900 border border-emerald-400 font-semibold text-xs rounded-xl shadow-lg flex justify-center items-center gap-2 transition-all disabled:opacity-50"
            >
              <span>{sending ? 'Auditing limits...' : 'Execute Instant Outward Remittance'}</span>
            </button>
          </form>
        </div>

        {/* Scheduled Remittance Sidebar Tracker */}
        <div className="lg:col-span-5 bg-[#0b0f1a] border border-white/[0.05] rounded-3xl p-6 shadow-xl">
          <h3 className="font-display font-semibold text-sm text-slate-200 mb-5 flex items-center gap-2">
            <Clock className="w-4.5 h-4.5 text-emerald-400" /> Pending Remittance Schedules
          </h3>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {scheduledTransfers.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs font-mono border border-dashed border-white/[0.05] rounded-2xl">
                No scheduled outward payouts logged in this cycle.
              </div>
            ) : (
              scheduledTransfers.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-[#0e1324] border border-white/[0.04] flex items-center justify-between"
                >
                  <div className="truncate max-w-[180px]">
                    <h5 className="text-xs font-semibold text-slate-200 truncate">{item.description}</h5>
                    <span className="text-[9px] text-slate-500 font-mono block mt-0.5">
                      Execution: {new Date(item.scheduledDate || '').toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold font-mono text-amber-400">${item.amount.toLocaleString()}</span>
                    <span className="text-[9px] uppercase font-bold text-slate-500 font-mono block mt-0.5">PENDING</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-5 p-3.5 rounded-2xl bg-white/[0.01] border border-white/[0.05] text-[10px] text-slate-400 leading-relaxed font-mono">
            <strong>Network Notice:</strong> Outward transfer limits approvals are linked to KYC clearance badges. Higher tier limits are applied on user levels.
          </div>
        </div>
      </div>
    </div>
  );
}
