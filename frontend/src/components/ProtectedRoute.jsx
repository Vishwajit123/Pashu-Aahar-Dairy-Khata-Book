import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { user, loading, isConfigured, isGuest } = useAuth();
  const location = useLocation();

  // If Supabase Anon Key isn't provided yet, allow access to avoid breaking the local app
  if (!isConfigured) {
    return children;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Checking authentication session...</p>
        </div>
      </div>
    );
  }

  if (!user && !isGuest) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
