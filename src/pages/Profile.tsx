import React, { useState, useEffect } from 'react';
import useWalletStore from '../store/useWalletStore';
import { 
  User, ShieldCheck, Mail, Sparkles, Bell, ToggleLeft, ToggleRight, 
  Upload, QrCode, AlertCircle, CheckCircle2, RefreshCw, KeyRound 
} from 'lucide-react';

export default function Profile() {
  const { user, notifications, submitKYC, refreshDashboardData } = useWalletStore();

  // KYC Verification Form
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [docType, setDocType] = useState('Passport');
  const [docNumber, setDocNumber] = useState('');
  const [docUrl, setDocUrl] = useState('');

  // Preference switches
  const [allowPush, setAllowPush] = useState(true);
  const [allowEmail, setAllowEmail] = useState(false);
  const [allow2fa, setAllow2fa] = useState(false);

  // Status indicators
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [submittingKyc, setSubmittingKyc] = useState(false);

  useEffect(() => {
    refreshDashboardData();
  }, [refreshDashboardData]);

  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingKyc(true);
    setError('');
    setSuccess('');

    try {
      if (!fullName || !docNumber) {
        throw new Error('Please populate your official full name and document code identifier.');
      }
      // Submit
      await submitKYC({
        fullName,
        dateOfBirth: dob,
        documentType: docType,
        documentNumber: docNumber,
        documentUrl: docUrl || undefined
      });

      setSuccess('Your identity documentation was uploaded! Status: Pending Administrator Approval.');
      setFullName('');
      setDob('');
      setDocNumber('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmittingKyc(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl tracking-tight text-white">Security & Account Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Manage KYC credentials, security mechanisms, notification channels, or claim and audit referral bonuses.</p>
      </div>

      {success && (
        <div id="profile-success-banner" className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div id="profile-error-banner" className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
        {/* Left Side: KYC Submission and Settings */}
        <div className="lg:col-span-7 space-y-6">
          {/* KYC Center widgets */}
          <div className="bg-[#0b0f1a] border border-white/[0.05] rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[40px] pointer-events-none" />
            <h3 className="font-display font-semibold text-sm text-slate-200 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-500" /> Identity verification (KYC Node)
            </h3>
            
            {/* Status alerts depending on user KYC state */}
            {user?.kycStatus === 'NOT_SUBMITTED' && (
              <div className="mb-4 text-xs text-slate-400 leading-relaxed bg-[#11172A] border border-white/[0.04] p-4 rounded-2xl space-y-3">
                <p>Verifying identity triggers multi-currency node withdrawals, higher corporate credit limits, and unlocks scheduled remittance pools.</p>
                <form onSubmit={handleKycSubmit} className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] uppercase tracking-wider font-bold text-slate-500 mb-1">Official Name</label>
                      <input
                        id="kyc-fullname-field"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Alex Rivera"
                        className="block w-full px-3 py-1.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs placeholder-slate-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase tracking-wider font-bold text-slate-500 mb-1">Birth Date</label>
                      <input
                        type="date"
                        required
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="block w-full px-3 py-1.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] uppercase tracking-wider font-bold text-slate-500 mb-1">Identity Document</label>
                      <select
                        value={docType}
                        onChange={(e) => setDocType(e.target.value)}
                        className="block w-full px-3 py-1.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs"
                      >
                        <option value="Passport" className="bg-[#0F1426]">Passport / Global Visa</option>
                        <option value="ID Card" className="bg-[#0F1426]">National Identity ID</option>
                        <option value="Driver License" className="bg-[#0F1426]">Drivers License Certificate</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase tracking-wider font-bold text-slate-500 mb-1">Reference Number</label>
                      <input
                        id="kyc-doc-number-field"
                        type="text"
                        required
                        value={docNumber}
                        onChange={(e) => setDocNumber(e.target.value)}
                        placeholder="US-9912048X"
                        className="block w-full px-3 py-1.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs placeholder-slate-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    id="kyc-submit-btn"
                    type="submit"
                    disabled={submittingKyc}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 border border-amber-400 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow mt-2"
                  >
                    <span>{submittingKyc ? 'Uploading files...' : 'Saturate KYC Document Details'}</span>
                  </button>
                </form>
              </div>
            )}

            {user?.kycStatus === 'PENDING' && (
              <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-xs text-amber-200 mt-2 text-center leading-relaxed">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <strong>Credentials pending validation reviewer checks!</strong>
                <p className="mt-1 text-slate-400 max-w">An administrator possesses your doc sheets. If you are signed into our admin demo account, approve directly inside Admin Controls panel!</p>
              </div>
            )}

            {user?.kycStatus === 'APPROVED' && (
              <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-xs text-emerald-200 mt-2 text-center leading-relaxed">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <strong>Your Identity Verification Is Complete! (KYC Status approved)</strong>
                <p className="mt-1 text-slate-400 max-w">Multi currency node conversions, scheduled payouts and credit-tier Virtual Cards have been authorized.</p>
              </div>
            )}
          </div>

          {/* Preferences controls */}
          <div className="bg-[#0b0f1a] border border-white/[0.05] rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="font-display font-semibold text-sm text-slate-200 mb-4 flex items-center gap-2">
              <KeyRound className="w-4.5 h-4.5 text-emerald-400" /> Notifications & Security Preference
            </h3>

            {/* Push alerts */}
            <div className="flex items-center justify-between p-3.5 bg-white/[0.01] border border-white/[0.04] rounded-2xl">
              <div>
                <dt className="text-xs font-semibold text-slate-200">System Notification Messages</dt>
                <dd className="text-[10px] text-slate-500">Enable real-time push events inside navigation bell indicators.</dd>
              </div>
              <button onClick={() => setAllowPush(!allowPush)} className="text-slate-400 hover:text-white cursor-pointer select-none">
                {allowPush ? <ToggleRight className="w-9 h-9 text-emerald-400" /> : <ToggleLeft className="w-9 h-9 text-slate-600" />}
              </button>
            </div>

            {/* Email reports */}
            <div className="flex items-center justify-between p-3.5 bg-white/[0.01] border border-white/[0.04] rounded-2xl">
              <div>
                <dt className="text-xs font-semibold text-slate-200">Email Monthly Statements</dt>
                <dd className="text-[10px] text-slate-500">Auto transmit financial ledgers to registered email folders.</dd>
              </div>
              <button onClick={() => setAllowEmail(!allowEmail)} className="text-slate-400 hover:text-white cursor-pointer select-none">
                {allowEmail ? <ToggleRight className="w-9 h-9 text-emerald-400" /> : <ToggleLeft className="w-9 h-9 text-slate-600" />}
              </button>
            </div>

            {/* 2fa */}
            <div className="flex items-center justify-between p-3.5 bg-white/[0.01] border border-white/[0.04] rounded-2xl">
              <div>
                <dt className="text-xs font-semibold text-slate-200">Simulate Two-Factor (2FA)</dt>
                <dd className="text-[10px] text-slate-500">Reinforce checkouts using secondary TOTP verification tokens.</dd>
              </div>
              <button onClick={() => setAllow2fa(!allow2fa)} className="text-slate-400 hover:text-white cursor-pointer select-none">
                {allow2fa ? <ToggleRight className="w-9 h-9 text-emerald-400" /> : <ToggleLeft className="w-9 h-9 text-slate-600" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Account metadata and Referral codes */}
        <div className="lg:col-span-5 space-y-6">
          {/* Metadata profiles details */}
          <div className="bg-[#0b0f1a] border border-white/[0.05] rounded-3xl p-5 shadow-xl relative overflow-hidden">
            <h3 className="font-display font-semibold text-xs text-slate-400 uppercase tracking-widest mb-4">Official Profile</h3>
            
            <div className="space-y-4">
              <div>
                <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 block font-mono">Profile Name</span>
                <span className="text-sm font-semibold text-slate-200">{user?.name}</span>
              </div>

              <div>
                <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 block font-mono">Email Address</span>
                <span className="text-sm font-semibold text-slate-200">{user?.email}</span>
              </div>

              <div>
                <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 block font-mono">Account Level Role</span>
                <span className="text-xs font-bold text-emerald-400 uppercase font-mono">{user?.role} Badge</span>
              </div>
            </div>
          </div>

          {/* Referral codes dashboard widget */}
          <div className="bg-[#0b0f1a] border border-white/[0.05] rounded-3xl p-5 shadow-xl text-center space-y-3">
            <h4 className="font-display font-semibold text-xs text-slate-400 uppercase tracking-widest leading-none">Induction Awards Referral</h4>
            <div className="p-3 bg-white/[0.01] border border-dashed border-white/[0.08] rounded-2xl">
              <span className="text-lg font-mono font-bold tracking-widest text-[#10B981] select-all cursor-pointer">
                {user?.referralCode || 'ALEX999'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 max-w leading-relaxed">
              Earn <strong className="text-emerald-400">$25 rewards</strong> on every referral who creates a wallet using your referral code. Referrals claim a <strong className="text-emerald-400">$50 welcome bonus</strong> instantly!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
