import React, { useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export const ResetConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  const [deleting, setDeleting] = useState(false);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-container-lowest/80 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm rounded-xl bg-surface-container border border-error/40 p-5 shadow-2xl space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-error-container/20 border border-error/40 flex items-center justify-center text-error shrink-0 mt-0.5">
            <AlertTriangle size={20} />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-base text-on-surface">Reset All Local Data?</h3>
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
      </div>
    </div>
  );
};
