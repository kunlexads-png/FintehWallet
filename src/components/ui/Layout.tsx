import { ReactNode, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useWalletStore from '../../store/useWalletStore';
import { 
  Wallet, Shield, Bell, LogOut, LayoutDashboard, Send, 
  CreditCard, BarChart3, Settings, HelpCircle, Activity, 
  Menu, X, Sparkles, Building2, CheckCircle2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, notifications, logout, markNotificationRead, wallets } = useWalletStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  const adminItem = user?.role === 'ADMIN';
  const unverified = user?.kycStatus !== 'APPROVED';

  const menuItems = [
    { title: 'Dashboard', path: '/', icon: LayoutDashboard },
    { title: 'My Wallets', path: '/wallets', icon: Wallet },
    { title: 'Transfers', path: '/transfers', icon: Send },
    { title: 'Virtual Cards', path: '/cards', icon: CreditCard },
    { title: 'Bills & Utilities', path: '/utilities', icon: Building2 },
    { title: 'Investments', path: '/investments', icon: Sparkles },
    { title: 'Analytics', path: '/analytics', icon: BarChart3 },
    { title: 'Account Settings', path: '/profile', icon: Settings },
  ];

  if (adminItem) {
    menuItems.push({ title: 'Admin Controls', path: '/admin', icon: Shield });
  }

  const unreadNotes = notifications.filter(n => !n.isRead);

  // Close menus on page switch
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowNotificationDropdown(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const calculateTotalBalanceUSD = () => {
    // Convert EUR & GBP to equivalent USD for visual aggregation
    const rates: { [key: string]: number } = { 'USD': 1.0, 'EUR': 1.09, 'GBP': 1.27 };
    return wallets.reduce((sum, wallet) => {
      const rate = rates[wallet.currency] || 1.0;
      return sum + (wallet.balance * rate);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-[#060813] text-[#F8FAFC] flex flex-col font-sans relative selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* KYC Warning Ribbon Header */}
      {unverified && user && (
        <div id="kyc-warning-ribbon" className="bg-gradient-to-r from-amber-600/30 via-amber-500/20 to-amber-600/30 border-b border-amber-500/30 py-2.5 px-4 text-center text-xs flex items-center justify-center gap-2 text-amber-100 backdrop-blur z-50">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Your KYC identity documentation is pending submission or approval. Verifying unlocks higher funding limit parameters.</span>
          <button 
            onClick={() => navigate('/profile')} 
            className="underline hover:text-white font-medium ml-2 transition-colors cursor-pointer"
          >
            Verify Identity Now &rarr;
          </button>
        </div>
      )}

      {/* Main Core View Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* DESKTOP SIDEBAR */}
        <aside id="desktop-sidebar" className="hidden lg:flex flex-col w-72 bg-[#090D1A]/95 border-r border-emerald-500/10 backdrop-blur-xl shrink-0 p-6 z-40 sticky top-0 h-screen">
          {/* Logo Brand Brand */}
          <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-white via-emerald-100 to-emerald-400 bg-clip-text text-transparent">
                AURA Wallet
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400/70">
                Premium FinTech
              </span>
            </div>
          </div>

          {/* User Preview Box */}
          <div className="mb-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-b from-emerald-500/20 to-blue-500/20 border border-emerald-400/30 flex items-center justify-center font-display font-bold text-emerald-300">
              {user?.name?.slice(0, 2).toUpperCase() || 'US'}
            </div>
            <div className="truncate">
              <h4 className="font-medium text-sm text-slate-100 truncate">{user?.name}</h4>
              <p className="font-mono text-[10px] text-slate-400 truncate">
                {calculateTotalBalanceUSD() > 0 
                  ? `$${calculateTotalBalanceUSD().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                  : '$0.00'
                }
              </p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <button
                  id={`sidebar-link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all group duration-200 cursor-pointer ${
                    active 
                      ? 'bg-emerald-500/10 border-l-4 border-emerald-400 text-emerald-300 shadow-inner' 
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.02]'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${active ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span>{item.title}</span>
                </button>
              );
            })}
          </nav>

          {/* Bottom Sidebar Action Items */}
          <div className="pt-6 border-t border-white/[0.05] space-y-1">
            <button
              id="sidebar-help"
              onClick={() => navigate('/profile')}
              className="w-full flex items-center gap-3.5 px-4 py-3 text-slate-400 hover:text-slate-200 text-sm font-medium hover:bg-white/[0.02] rounded-xl transition-all cursor-pointer"
            >
              <HelpCircle className="w-5 h-5 text-slate-400" />
              <span>Help Center & Support</span>
            </button>
            <button
              id="sidebar-signout"
              onClick={handleLogout}
              className="w-full flex items-center gap-3.5 px-4 py-3 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-sm font-medium rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              <span>Log Out Securely</span>
            </button>
          </div>
        </aside>

        {/* VIEW BODY CONTENT */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* TOP NAVBAR */}
          <header id="main-header" className="h-16 border-b border-white/[0.05] bg-[#060813]/60 backdrop-blur-md flex items-center justify-between px-6 z-30 sticky top-0 shrink-0">
            {/* Left Nav Mobile Hamburger */}
            <div className="flex items-center gap-4">
              <button
                id="mobile-nav-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 text-slate-300 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div className="lg:hidden flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="font-display font-bold text-sm bg-gradient-to-r from-white block to-emerald-400 bg-clip-text text-transparent">AURA</span>
              </div>
            </div>

            {/* Right Nav Control Center */}
            <div className="flex items-center gap-4">
              {/* Notification bell and badge dropdown */}
              <div className="relative">
                <button
                  id="header-notification-bell"
                  onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                  className="p-2 text-slate-300 hover:text-emerald-400 hover:bg-emerald-500/5 rounded-full relative transition-all cursor-pointer"
                >
                  <Bell className="w-5.5 h-5.5" />
                  {unreadNotes.length > 0 && (
                    <span className="absolute top-1 right-1 w-4.5 h-4.5 bg-rose-500 text-[10px] text-white font-bold flex items-center justify-center rounded-full animate-pulse border border-slate-900">
                      {unreadNotes.length}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotificationDropdown && (
                    <motion.div
                      id="notifications-dropdown-menu"
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-3 w-80 bg-[#0F1426] border border-white/[0.08] rounded-2xl p-4 shadow-xl z-50 overflow-hidden"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-white/[0.05] mb-2">
                        <span className="font-display font-semibold text-sm">Notifications</span>
                        <span className="text-[10px] font-mono text-emerald-400">{unreadNotes.length} New</span>
                      </div>
                      
                      <div className="max-h-72 overflow-y-auto space-y-2">
                        {notifications.length === 0 ? (
                          <div className="py-6 text-center text-slate-500 text-xs">No notifications yet.</div>
                        ) : (
                          notifications.map((note) => (
                            <div 
                              key={note.id}
                              className={`p-2.5 rounded-xl text-xs transition-colors relative cursor-pointer ${
                                note.isRead ? 'bg-white/[0.01]' : 'bg-emerald-500/5 border border-emerald-400/20'
                              }`}
                              onClick={() => markNotificationRead(note.id)}
                            >
                              <div className="font-medium text-slate-200 flex justify-between gap-1 items-start">
                                <span>{note.title}</span>
                                {!note.isRead && (
                                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0" />
                                )}
                              </div>
                              <p className="text-slate-400 mt-1 leading-relaxed text-[11px]">{note.message}</p>
                              <div className="text-[9px] text-slate-500 mt-1.5 font-mono">
                                {new Date(note.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Verified profile button */}
              <div 
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/[0.05] transition-all cursor-pointer"
                id="header-profile-action"
              >
                <div className="w-8.5 h-8.5 rounded-full bg-slate-800 text-emerald-400 font-bold flex items-center justify-center border border-white/[0.05]">
                  {user?.name?.slice(0, 2).toUpperCase() || 'US'}
                </div>
                <div className="hidden sm:block text-left max-w-28 truncate">
                  <div className="font-medium text-xs leading-none text-slate-200 truncate">{user?.name}</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-0.5 font-mono truncate">
                    {unverified ? 'KYC Needed' : 'Verified'}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* MAIN PAGE CONTAINER WITH ANIMATION */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto pb-24 lg:pb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="max-w-6xl mx-auto"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* MOBILE NAV BOTTOM TABS */}
      <nav id="mobile-tabs-nav" className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#090D1A]/95 backdrop-blur-lg border-t border-white/[0.08] flex items-center justify-around z-40 px-2 shadow-2xl">
        {menuItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <button
              id={`mobile-tab-link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-2.5 rounded-xl transition-all ${
                active ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] mt-1 truncate max-w-16">{item.title}</span>
            </button>
          );
        })}
      </nav>

      {/* MOBILE DRAWER SIDEBAR */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-[#000] z-45"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed bottom-0 left-0 top-0 w-80 bg-[#090D1A] border-r border-white/[0.08] z-50 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto"
            >
              <div>
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.05]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="font-display font-semibold tracking-tight text-white">AURA Wallet</span>
                  </div>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.05] rounded-xl"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const active = location.pathname === item.path;
                    return (
                      <button
                        key={item.path}
                        onClick={() => {
                          navigate(item.path);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          active 
                            ? 'bg-emerald-500/10 border-l-4 border-emerald-400 text-emerald-300' 
                            : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.01]'
                        }`}
                      >
                        <Icon className="w-5 h-5 text-slate-400" />
                        <span>{item.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-6 border-t border-white/[0.05] space-y-2">
                <button
                  onClick={() => {
                    navigate('/profile');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3.5 px-4 py-3 text-slate-400 hover:text-slate-200 text-sm font-medium rounded-xl hover:bg-white/[0.01]"
                >
                  <HelpCircle className="w-5 h-5" />
                  <span>Help & Support</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3.5 px-4 py-3 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-sm font-medium rounded-xl transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Log Out Securely</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
