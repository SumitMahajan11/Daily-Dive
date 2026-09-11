import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, WifiOff, Info } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const ToastContainer = () => {
  const { toasts } = useData();

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts && toasts.map(toast => {
          const bg =
            toast.type === 'error'
              ? 'bg-error-container text-on-error-container border-error/40'
              : toast.type === 'warning'
              ? 'bg-tertiary-container text-on-tertiary-container border-tertiary/40'
              : toast.type === 'success'
              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-500/40'
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
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40 }}
              className={`px-4 py-3 rounded-xl border shadow-2xl flex items-center gap-2.5 font-medium text-xs transition-colors duration-300 pointer-events-auto ${bg}`}
            >
              <Icon size={18} className="shrink-0" />
              <span>{toast.message}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
