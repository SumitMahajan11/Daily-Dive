import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Disc } from 'lucide-react';

export const ProtectedRoute = ({ children, fallback }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#11131b] transition-opacity duration-300">
        <div className="relative w-16 h-16 flex items-center justify-center mb-4">
          <div className="absolute inset-0 rounded-full border-2 border-primary-container/20 animate-ping"></div>
          <div className="w-12 h-12 rounded-full border-2 border-primary-container/30 border-t-primary animate-spin"></div>
          <Disc size={20} className="text-primary absolute" />
        </div>
        <p className="font-mono text-xs text-on-surface-variant tracking-tight">Verifying Supabase session...</p>
      </div>
    );
  }

  if (!user && fallback) {
    return fallback;
  }

  return children;
};
