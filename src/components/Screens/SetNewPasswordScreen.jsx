import React, { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { validatePasswordReset } from '../../lib/authPasswordReset';

export const SetNewPasswordScreen = ({ onSuccess, onGoToForgot }) => {
  const {
    updatePassword,
    signOut,
    clearRecovering,
    getFriendlyErrorMessage,
  } = useAuth();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorAlert, setErrorAlert] = useState('');
  const [successAlert, setSuccessAlert] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorAlert('');
    setSuccessAlert('');
    setNewPasswordError('');
    setConfirmPasswordError('');

    const validation = validatePasswordReset(newPassword, confirmPassword);
    if (!validation.valid) {
      if (validation.field === 'newPassword') {
        setNewPasswordError(validation.error);
      } else if (validation.field === 'confirmPassword') {
        setConfirmPasswordError(validation.error);
      } else {
        setErrorAlert(validation.error);
      }
      return;
    }

    setLoading(true);
    try {
      await updatePassword(newPassword);
      setSuccessAlert('Password updated successfully!');
      
      // Step 3: After success: signOut, clear recovering, go to login view
      await signOut();
      clearRecovering();
      
      if (onSuccess) {
        onSuccess('Password updated. Log in with your new password.');
      }
    } catch (err) {
      const friendlyMsg = getFriendlyErrorMessage ? getFriendlyErrorMessage(err) : (err?.message || 'Failed to update password.');
      setErrorAlert(friendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="set-new-password-screen"
      data-testid="set-new-password-screen"
      className="flex flex-col items-center justify-center w-full max-w-md mx-auto px-4 pt-4 pb-12"
    >
      <div className="w-full bg-surface-container-low rounded-2xl p-6 sm:p-8 border border-outline-variant/30 shadow-lg relative">
        {/* Header Icon & Title */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary-container/20 border border-primary-container/30 text-primary flex items-center justify-center mb-3 shadow-inner">
            <KeyRound size={24} />
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-on-surface">
            Set new password
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1 max-w-xs">
            Create a secure password with at least 8 characters.
          </p>
        </div>



        {/* Error Alert State */}
        {errorAlert && (
          <div
            id="reset-password-error-alert"
            data-testid="reset-password-error-alert"
            role="alert"
            className="mb-4 p-3 rounded-xl text-xs flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400"
          >
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div className="flex-1 text-[12px] leading-snug">{errorAlert}</div>
          </div>
        )}

        {/* Success Alert State */}
        {successAlert && (
          <div
            id="reset-password-success-alert"
            data-testid="reset-password-success-alert"
            role="alert"
            className="mb-4 p-3 rounded-xl text-xs flex items-start gap-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
          >
            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
            <div className="flex-1 text-[12px] leading-snug">{successAlert}</div>
          </div>
        )}

        {/* Form */}
        <form
          id="set-new-password-form"
          data-testid="set-new-password-form"
          onSubmit={handleSubmit}
          className="space-y-4"
          noValidate
        >
          {/* New Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="new-password"
                className="block text-[11px] font-mono uppercase tracking-wider text-on-surface-variant font-medium"
              >
                New password
              </label>
              <span className="text-[10px] font-mono text-outline">Min 8 characters</span>
            </div>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-3 text-outline pointer-events-none" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                id="new-password"
                data-testid="new-password-input"
                required
                disabled={loading}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setNewPasswordError('');
                }}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                className="w-full h-10 pl-9 pr-10 rounded-xl bg-surface-container-high border border-outline-variant/40 text-on-surface placeholder:text-outline text-xs sm:text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-sans disabled:opacity-50"
              />
              <button
                type="button"
                id="toggle-new-password-btn"
                data-testid="toggle-new-password-btn"
                onClick={() => setShowNewPassword(!showNewPassword)}
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 text-outline hover:text-on-surface cursor-pointer p-0.5"
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {newPasswordError && (
              <p
                id="new-password-error"
                data-testid="new-password-error"
                className="text-[11px] text-red-500 mt-1 font-mono"
              >
                {newPasswordError}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirm-password"
              className="block text-[11px] font-mono uppercase tracking-wider text-on-surface-variant mb-1.5 font-medium"
            >
              Confirm new password
            </label>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-3 text-outline pointer-events-none" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirm-password"
                data-testid="confirm-password-input"
                required
                disabled={loading}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setConfirmPasswordError('');
                }}
                placeholder="Repeat new password"
                autoComplete="new-password"
                className="w-full h-10 pl-9 pr-10 rounded-xl bg-surface-container-high border border-outline-variant/40 text-on-surface placeholder:text-outline text-xs sm:text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-sans disabled:opacity-50"
              />
              <button
                type="button"
                id="toggle-confirm-password-btn"
                data-testid="toggle-confirm-password-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                className="absolute right-3 text-outline hover:text-on-surface cursor-pointer p-0.5"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {confirmPasswordError && (
              <p
                id="confirm-password-error"
                data-testid="confirm-password-error"
                className="text-[11px] text-red-500 mt-1 font-mono"
              >
                {confirmPasswordError}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="set-new-password-submit-btn"
            data-testid="set-new-password-submit-btn"
            disabled={loading}
            className="w-full h-11 mt-2 bg-primary hover:opacity-90 active:scale-[0.98] text-white rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Updating password...</span>
              </span>
            ) : (
              <span>Update password</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
