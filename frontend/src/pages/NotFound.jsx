import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h2>
      <h3 className="text-lg font-bold text-slate-800 mt-2">Page Not Found</h3>
      <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6">
        The financial page or resource you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
      >
        <Home className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};
