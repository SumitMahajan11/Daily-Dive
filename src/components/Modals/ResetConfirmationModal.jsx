import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export const ResetConfirmationModal = ({ isOpen = true, onClose, onConfirm }) => {
  const [deleting, setDeleting] = useState(false);

  // Escape key handler to close modal smoothly
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !deleting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, deleting]);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={deleting ? undefined : onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface-container-lowest/80 backdrop-blur-sm px-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-modal-title"
        className="w-full max-w-sm rounded-xl bg-surface-container border border-error/40 p-5 shadow-2xl space-y-4"
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-error-container/20 border border-error/40 flex items-center justify-center text-error shrink-0 mt-0.5">
            <AlertTriangle size={20} />
          </div>
          <div className="space-y-1">
            <h3 id="reset-modal-title" className="font-display font-bold text-lg text-on-surface">Reset All Local Data?</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              This will permanently delete all topic progress records, review history, and streaks. This cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="px-3.5 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-semibold border border-outline-variant/40 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleting}
            className="px-3.5 py-1.5 rounded-lg bg-error text-on-error hover:opacity-90 text-xs font-semibold transition-opacity cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            {deleting && <RefreshCw size={14} className="animate-spin" />}
            <span>{deleting ? 'Deleting...' : 'Yes, delete everything'}</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
