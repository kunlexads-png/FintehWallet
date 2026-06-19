import { useState, useEffect } from 'react';
import useWalletStore from '../store/useWalletStore';
import { 
  ShieldCheck, AlertTriangle, Users, Landmark, TrendingUp, CheckCircle, 
  XCircle, ArrowDownLeft, ArrowUpRight, Check, X, ShieldAlert, Sparkles, AlertCircle 
} from 'lucide-react';

export default function Admin() {
  const { 
    user, adminStats, adminUsers, adminKycRequests, 
    refreshAdminSection, approveKYC, rejectKYC 
  } = useWalletStore();

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      refreshAdminSection();
    }
  }, [user, refreshAdminSection]);

  if (user?.role !== 'ADMIN') {
    return (
      <div id="admin-forbidden-panel" className="py-16 text-center max-w-sm mx-auto space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto animate-bounce" />
        <h3 className="font-display font-semibold text-lg text-white">Administration Access Only</h3>
        <p className="text-xs text-slate-400">Your profile level is categorized under standard permissions. Log into `admin@wallet.com` to check verified metrics.</p>
      </div>
    );
  }

  const pendingKYCDocs = adminKycRequests.filter(r => r.status === 'PENDING');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl tracking-tight text-white flex items-center gap-2">
          Admin Controls Panel <ShieldCheck className="w-5.5 h-5.5 text-emerald-400" />
        </h1>
        <p className="text-xs text-[#94A3B8] mt-1">Supervise user registrations, issue clearance status approvals, or check total vault liquidity indexes.</p>
      </div>

      {/* KPI stats section row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="p-5 bg-[#0b0f1a] border border-white/[0.05] rounded-3xl shadow flex gap-4 items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-[20px] pointer-events-none" />
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 tracking-wider font-mono block">Vault Circulation</span>
            <span className="text-lg font-bold text-white font-mono">
              ${adminStats?.totalVolume ? adminStats.totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '14,480'}
            </span>
          </div>
        </div>

        <div className="p-5 bg-[#0b0f1a] border border-white/[0.05] rounded-3xl shadow flex gap-4 items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-[20px] pointer-events-none" />
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 tracking-wider font-mono block">Registered Users</span>
            <span className="text-lg font-bold text-white font-mono">{adminStats?.activeAccounts || 0} Clients</span>
          </div>
        </div>

        <div className="p-5 bg-[#0b0f1a] border border-white/[0.05] rounded-3xl shadow flex gap-4 items-center relative overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 tracking-wider font-mono block">Verification Queue</span>
            <span className="text-lg font-bold text-white font-mono">{pendingKYCDocs.length} Pending</span>
          </div>
        </div>

        <div className="p-5 bg-[#0b0f1a] border border-white/[0.05] rounded-3xl shadow flex gap-4 items-center relative overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 tracking-wider font-mono block">System Uptime</span>
            <span className="text-lg font-bold text-white font-mono">{adminStats?.systemUptime || '99.98%'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Pending KYC Requests approvals pane */}
        <div className="lg:col-span-12 bg-[#0b0f1a] border border-white/[0.05] rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[80px] pointer-events-none translate-x-12 -translate-y-12" />
          
          <h3 className="font-display font-semibold text-sm text-slate-200 mb-5 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" /> Pending KYC Verifications Queue ({pendingKYCDocs.length})
          </h3>

          <div className="space-y-4">
            {pendingKYCDocs.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs font-mono border border-dashed border-white/[0.04] rounded-2xl">
                The verification queue is clean. Ready for incoming requests.
              </div>
            ) : (
              pendingKYCDocs.map((req) => (
                <div 
                  key={req.id}
                  className="p-5 rounded-2xl bg-[#0F1426] border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-display font-bold text-sm text-slate-100">{req.fullName}</h4>
                      <span className="text-[9px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded font-mono">
                        {req.documentType}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 font-mono">
                      Birth Date: {req.dateOfBirth} • Document Identifier: {req.documentNumber}
                    </p>

                    <a 
                      href={req.documentUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-400 hover:text-emerald-300 underline font-mono block pt-1.5"
                    >
                      Audit Scan Record File &rarr;
                    </a>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      id={`kyc-approve-btn-${req.id}`}
                      onClick={() => approveKYC(req.id)}
                      className="px-4.5 py-2.5 cursor-pointer bg-emerald-500 text-slate-950 font-semibold text-xs rounded-xl flex items-center gap-1.5 hover:bg-emerald-400 duration-150 shadow"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve Identity</span>
                    </button>

                    <button
                      id={`kyc-reject-btn-${req.id}`}
                      onClick={() => rejectKYC(req.id)}
                      className="px-4.5 py-2.5 cursor-pointer bg-rose-500/20 text-rose-300 font-semibold text-xs rounded-xl flex items-center gap-1.5 hover:bg-rose-500/35 duration-150"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject Identity</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom Full Directory view */}
        <div className="lg:col-span-12 bg-[#0b0f1a] border border-white/[0.05] rounded-3xl p-6 shadow-xl space-y-4">
          <div>
            <h3 className="font-display font-semibold text-sm text-slate-200">Registered Users Directory</h3>
            <p className="text-[11px] text-[#64748b] mt-0.5">Summary of registrations and current clearance level flags.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/[0.05] text-slate-500 font-mono font-bold">
                  <th className="pb-3 pt-1">Client ID</th>
                  <th className="pb-3 pt-1">Profile Name</th>
                  <th className="pb-3 pt-1">Email Folder</th>
                  <th className="pb-3 pt-1 text-center">Identity clearance Verify</th>
                  <th className="pb-3 pt-1 text-right">Join Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {adminUsers.map((user) => (
                  <tr key={user.id} className="text-[#F8FAFC] hover:bg-white/[0.01]">
                    <td className="py-3 font-mono text-[10px] text-slate-500 uppercase">{user.id.slice(-6)}</td>
                    <td className="py-3 font-semibold">{user.name}</td>
                    <td className="py-3 font-mono">{user.email}</td>
                    <td className="py-3">
                      <span className={`mx-auto block w-24 text-center py-0.5 rounded text-[10px] font-bold font-mono ${
                        user.kycStatus === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' :
                        user.kycStatus === 'PENDING' ? 'bg-amber-500/10 text-amber-500 animate-pulse' :
                        user.kycStatus === 'REJECTED' ? 'bg-rose-500/10 text-rose-400' :
                        'bg-slate-800 text-slate-500'
                      }`}>
                        {user.kycStatus}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
