import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Plus, Calendar, Bell, ShieldCheck, LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import { expenseApi } from '../services/api';

const PAGE_TITLES = {
  '/': { title: 'Dairy & Feed Day-Book (दैनिक रोकड़ बही)', subtitle: 'Real-time sales, cashbook collections, and farmer credit ledger' },
  '/customers': { title: 'Customer & Khata Ledger (ग्राहक बहीखाता)', subtitle: 'Farmer ledger accounts, Udhaar dues, and payment settlement' },
  '/expenses': { title: 'Sales Day-Book Register (बिक्री रजिस्टर)', subtitle: 'Complete log of cattle feed sacks, mustard cakes, and daily milk bills' },
  '/add-expense': { title: 'Record Sale / Issue Bill (नया बिल)', subtitle: 'Issue invoice for cattle feed bags, choker, supplements, or milk supply' },
  '/categories': { title: 'Products & Price Catalog (दर सूची)', subtitle: 'Standard cattle feed rates, stock units, and department analytics' },
  '/reports': { title: 'Financial & Sales Reports (लेखा रिपोर्ट)', subtitle: 'Monthly revenue, cash vs credit breakdown, and ledger export' },
  '/settings': { title: 'Business Profile & Settings (दुकान सेटिंग्स)', subtitle: 'Store configurations, receipt notes, and database backups' },
};

export const Navbar = ({ setIsMobileOpen }) => {
  const location = useLocation();
  const { user, signOut, isConfigured, isGuest } = useAuth();
  const [isBackendOnline, setIsBackendOnline] = React.useState(null);

  React.useEffect(() => {
    let isMounted = true;
    const probe = async () => {
      const ok = await expenseApi.checkHealth();
      if (isMounted) setIsBackendOnline(ok);
    };
    probe();
    const interval = setInterval(probe, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [location.pathname]);
  
  const currentMeta = PAGE_TITLES[location.pathname] || {
    title: 'Pashu Aahar & Dairy Ledger',
    subtitle: 'Track feed sales and farmer balances'
  };

  const todayStr = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const userDisplayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || (isGuest ? 'Guest' : 'Shop Owner');

  return (
    <header className="h-16 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all">
      {/* Left section: mobile hamburger & title */}
      <div className="flex items-center space-x-3 min-w-0">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden p-2 rounded-2xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight truncate">
            {currentMeta.title}
          </h1>
          <p className="text-[11px] text-slate-500 font-medium hidden sm:block truncate">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Right section: date, add expense button, auth status */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        {/* Date display */}
        <div className="hidden xl:flex items-center space-x-1.5 text-xs font-semibold text-slate-600 bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200/60">
          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
          <span>{todayStr}</span>
        </div>

        {/* Backend Port 8080 Status Pill */}
        <div
          className={`hidden md:flex items-center space-x-1.5 text-[11px] font-bold px-2.5 py-1 rounded-xl border transition-all ${
            isBackendOnline === true
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200/70'
              : isBackendOnline === false
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-slate-100 text-slate-500 border-slate-200'
          }`}
          title={
            isBackendOnline === true
              ? 'Spring Boot Backend: Online & Healthy on Port 8080'
              : 'Spring Boot Backend: Offline or Starting on Port 8080'
          }
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isBackendOnline === true
                ? 'bg-emerald-500'
                : isBackendOnline === false
                ? 'bg-rose-500 animate-pulse'
                : 'bg-amber-400'
            }`}
          />
          <span>{isBackendOnline === true ? 'Backend: 8080' : isBackendOnline === false ? 'Backend Offline' : 'Checking API'}</span>
        </div>


        {/* User Auth Profile / Login Button */}
        {user ? (
          <div className="flex items-center space-x-1.5 p-1 rounded-2xl bg-slate-100/80 border border-slate-200/80 text-xs">
            <div className="flex items-center space-x-2 px-2 py-0.5">
              <div className="w-6 h-6 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-[11px] shadow-sm">
                {userDisplayName.charAt(0).toUpperCase()}
              </div>
              <span className="font-bold text-slate-700 max-w-[120px] truncate hidden md:inline">
                {userDisplayName}
              </span>
            </div>
            <button
              onClick={() => signOut()}
              title="Sign Out"
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : isGuest ? (
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl hidden sm:inline">
              Guest Mode
            </span>
            <Link
              to="/login"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </Link>
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all"
          >
            <LogIn className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sign In</span>
          </Link>
        )}

        {/* Quick Record Sale button */}
        {location.pathname !== '/add-expense' && (
          <Link
            to="/add-expense"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">New Bill [F2]</span>
          </Link>
        )}
      </div>
    </header>
  );
};
