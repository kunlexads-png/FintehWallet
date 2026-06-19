import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useWalletStore from './store/useWalletStore';
import Layout from './components/ui/Layout';

// Pages
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Wallets from './pages/Wallets';
import Transfers from './pages/Transfers';
import Cards from './pages/Cards';
import Utilities from './pages/Utilities';
import Investments from './pages/Investments';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

import { ShieldCheck, RefreshCw } from 'lucide-react';

// Protected Route Shield
interface GuardProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: GuardProps) {
  const { token, loading } = useWalletStore();
  
  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return <Layout>{children}</Layout>;
}

export default function App() {
  const { init, token } = useWalletStore();

  useEffect(() => {
    // Bootstrap active cached sessions on load
    init();
  }, [init]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Entry */}
        <Route path="/auth" element={<Auth />} />

        {/* Dashboard Panels Layout Nodes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/wallets" 
          element={
            <ProtectedRoute>
              <Wallets />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/transfers" 
          element={
            <ProtectedRoute>
              <Transfers />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/cards" 
          element={
            <ProtectedRoute>
              <Cards />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/utilities" 
          element={
            <ProtectedRoute>
              <Utilities />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/investments" 
          element={
            <ProtectedRoute>
              <Investments />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } 
        />

        {/* Redirect unmatched entries */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
