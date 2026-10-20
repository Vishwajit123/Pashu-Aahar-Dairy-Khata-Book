import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Wheat,
  Milk,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Receipt,
  Users,
  CheckCircle2,
  Building2,
  PhoneCall,
  Clock,
  Coins
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../services/supabaseClient';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { signIn, signUp, isConfigured, continueAsGuest } = useAuth();

  const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
  };

  const handleResend = async () => {
    if (!formData.email) {
      toast.error('Please enter your email above to resend confirmation link.');
      return;
    }
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email,
      });
      if (error) throw error;
      toast.success('Verification link resent. Please check your inbox and spam folder.');
    } catch (err) {
      toast.error(err.message || 'Failed to resend confirmation email.');
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isConfigured) {
      setErrorMessage(
        'Authentication service is currently offline. Please check system configuration or use Offline Demo Mode.'
      );
      return;
    }

    if (!formData.email || !formData.password) {
      setErrorMessage('Please provide both your registered email address and password.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        await signIn({
          email: formData.email,
          password: formData.password,
        });
        toast.success('Welcome back! Logged in to your business ledger.');
        navigate(from, { replace: true });
      } else {
        const signupResult = await signUp({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
        });

        if (signupResult?.session) {
          toast.success('Account created successfully! Welcome to your fresh ledger.');
          navigate(from, { replace: true });
        } else {
          toast.success('Account registered! If confirmation is required, check your email to activate.');
          setMode('signin');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
      toast.error(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between selection:bg-emerald-600 selection:text-white">
      {/* Top Header Bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
            <Wheat className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="font-extrabold text-sm sm:text-base text-white tracking-tight">
              पशु आहार एवं डेयरी व्यापार (Pashu Aahar & Dairy Vyapar)
            </span>
            <span className="text-[11px] text-slate-400 block -mt-0.5">
              Commercial Bahi-Khata & Billing Management System
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-4 text-xs text-slate-400">
          <span className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Multi-Tenant Private Ledger</span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-300 font-medium">FY 2026-27</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Business Overview & Product Modules */}
          <div className="lg:col-span-6 space-y-6 text-slate-200">
            <div className="space-y-3">
              <span className="inline-block px-3 py-1 rounded-md bg-emerald-950 border border-emerald-700/60 text-emerald-400 text-xs font-semibold">
                Dairy & Cattle Feed Trader Software
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Daily Sales, Milk Bills & Farmer Khata Ledger.
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-lg">
                Complete billing and udhaar accounting designed for feed retail shops, dairy collection centres, and livestock suppliers.
              </p>
            </div>

            {/* Feature Modules Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/70">
                <div className="flex items-center space-x-2.5 mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Wheat className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-xs text-white">पशु आहार बिक्री (Feed Sacks)</h3>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  50kg bags, Sarson khal, gehun choker, pellets & mineral mixture rates.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/70">
                <div className="flex items-center space-x-2.5 mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                    <Milk className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-xs text-white">दूध रजिस्टर (Milk Register)</h3>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Cow & Buffalo milk supply, per-litre rate calculation and billing.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/70">
                <div className="flex items-center space-x-2.5 mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-xs text-white">उधारी बहीखाता (Udhaar Ledger)</h3>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Track farmer dues, payment collections, and outstanding khata balance.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/70">
                <div className="flex items-center space-x-2.5 mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-xs text-white">ग्राहक सूची (Customer Book)</h3>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Farmer phone directory, village address, notes, and transaction history.
                </p>
              </div>
            </div>

            {/* Support guarantee banner */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center space-x-3 text-xs text-slate-400 max-w-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Each registered account gets a dedicated, isolated private ledger that starts fresh.</span>
            </div>
          </div>

          {/* Right Column: Clean Business Login / Register Card */}
          <div className="lg:col-span-6 max-w-md w-full mx-auto">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl">
              
              {/* Header inside Card */}
              <div className="mb-5">
                <div className="flex items-center space-x-2.5 mb-1.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    {mode === 'signin' ? 'Shop Owner Sign In' : 'Register New Business'}
                  </h2>
                </div>
                <p className="text-xs text-slate-400">
                  {mode === 'signin'
                    ? 'Enter your registered shop email to open your day-book.'
                    : 'Create your free account. Starts fresh with a blank ledger.'}
                </p>
              </div>

              {/* Segmented Mode Toggle */}
              <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 mb-5">
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setErrorMessage(''); }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    mode === 'signin'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setErrorMessage(''); }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    mode === 'signup'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Create New Account
                </button>
              </div>

              {/* Verification alert banner if required */}
              {errorMessage && errorMessage.toLowerCase().includes('email not confirmed') ? (
                <div className="mb-4 p-3.5 rounded-xl bg-amber-950/40 border border-amber-800 text-amber-200 text-xs space-y-2">
                  <div className="flex items-center space-x-2 font-bold text-amber-300">
                    <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Email Verification Required</span>
                  </div>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed">
                    A confirmation link was sent to <strong>{formData.email}</strong>. Please check your inbox or spam folder to activate your account.
                  </p>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-[11px] hover:bg-amber-400 transition-colors disabled:opacity-50"
                  >
                    {resending ? 'Sending...' : 'Resend Verification Email'}
                  </button>
                </div>
              ) : errorMessage ? (
                <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-start space-x-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{errorMessage}</span>
                </div>
              ) : null}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Shop / Dairy Business Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="e.g. Kisan Pashu Aahar & Dairy"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs text-white placeholder-slate-500 outline-none transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="owner@example.com"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs text-white placeholder-slate-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                      className="w-full pl-9 pr-9 py-2.5 rounded-lg bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs text-white placeholder-slate-500 outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-2.5 px-4 rounded-lg font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{mode === 'signin' ? 'Sign In to Ledger' : 'Create Business Account'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Guest / Offline Access Option */}
                <div className="pt-2 text-center border-t border-slate-900">
                  <button
                    type="button"
                    onClick={() => {
                      continueAsGuest();
                      navigate(from, { replace: true });
                    }}
                    className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors py-1 px-2.5 rounded hover:bg-slate-900"
                  >
                    <span>⚡ Continue in Offline Demo Mode</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </form>

              {/* Security & Support Note */}
              <div className="mt-5 pt-3.5 border-t border-slate-900 text-center">
                <p className="text-[11px] text-slate-500 flex items-center justify-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Secure 256-Bit SSL Encrypted Ledger • 100% Private Data</span>
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/80 px-4 sm:px-8 py-3 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© 2026 Pashu Aahar & Dairy Vyapar Management System. Built for Indian Dairy & Livestock Retailers.</span>
        <div className="flex items-center space-x-4 text-[11px] text-slate-400">
          <span>Helpline: +91 98000 12345</span>
          <span>•</span>
          <span>support@pashuaahar.in</span>
        </div>
      </footer>
    </div>
  );
};

export default Login;
