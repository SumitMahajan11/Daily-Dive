import React from 'react';
import { AlertCircle, CheckCircle, WifiOff, Info } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const ToastContainer = () => {
  const { toasts } = useData();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => {
        const bg =
          toast.type === 'error'
            ? 'bg-error-container text-on-error-container border-error/40'
            : toast.type === 'warning'
            ? 'bg-tertiary-container text-on-tertiary-container border-tertiary/40'
            : toast.type === 'success'
            ? 'bg-emerald-950 text-emerald-200 border-emerald-500/40'
            : 'bg-surface-container-high text-on-surface border-outline-variant/40';

        const Icon =
          toast.type === 'error'
            ? AlertCircle
            : toast.type === 'warning'
            ? WifiOff
            : toast.type === 'success'
            ? CheckCircle
            : Info;

        return (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-xl border shadow-2xl flex items-center gap-2.5 font-medium text-xs transition-all duration-300 pointer-events-auto ${bg}`}
          >
            <Icon size={18} className="shrink-0" />
            <span>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
};
