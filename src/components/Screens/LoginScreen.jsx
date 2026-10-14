import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, LogIn, UserPlus, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { parseAuthUrlError, isUserAlreadyRegistered } from '../../lib/authPasswordReset';

export const LoginScreen = ({ onBack, onSuccess, initialNotice, initialMode }) => {
  const {
    user,
    isConfigured,
    signInWithPassword,
    signUpWithPassword,
    signInWithGoogle,
    resetPassword,
    getFriendlyErrorMessage,
  } = useAuth();

  const [mode, setMode] = useState(() => initialMode || 'login'); // 'login' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(() => (
    initialNotice ? { type: 'success', message: initialNotice } : null
  ));
  const [urlError, setUrlError] = useState(() => parseAuthUrlError());
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (initialNotice) {
      setAlert({ type: 'success', message: initialNotice });
    }
  }, [initialNotice]);

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);

  const handleSendNewLink = () => {
    setUrlError(null);
    setMode('forgot');
    setAlert(null);
    if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
      window.history.replaceState(null, '', window.location.pathname + '#/login');
    }
  };

  const validateForm = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) {
      setEmailError('Please enter your email address.');
      isValid = false;
    } else if (!emailRegex.test(trimmedEmail)) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    }

    if (mode !== 'forgot') {
      if (!password) {
        setPasswordError('Please enter your password.');
        isValid = false;
      } else if (password.length < 6) {
        setPasswordError('Password must be at least 6 characters.');
        isValid = false;
      }
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!validateForm()) return;

    if (!isConfigured) {
      setAlert({
        type: 'error',
        message: 'Supabase authentication is not configured yet. Please provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.',
      });
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const data = await signUpWithPassword(email.trim(), password);
        if (isUserAlreadyRegistered(data)) {
          setAlert({
            type: 'error',
            message: 'An account with this email already exists. Try logging in.',
          });
        } else if (data?.user && !data?.session) {
          setAlert({
            type: 'success',
            message: 'Account created! Please check your email for a verification confirmation link.',
          });
        } else {
          setAlert({
            type: 'success',
            message: 'Account created and signed in successfully!',
          });
          if (onSuccess) {
            setTimeout(onSuccess, 500);
          }
        }
      } else if (mode === 'login') {
        await signInWithPassword(email.trim(), password);
        setAlert({
          type: 'success',
          message: 'Signed in successfully!',
        });
        if (onSuccess) {
          setTimeout(onSuccess, 400);
        }
      } else if (mode === 'forgot') {
        await resetPassword(email.trim());
        setAlert({
          type: 'success',
          message: 'Password reset link sent! Check your inbox to reset your password.',
        });
      }
    } catch (err) {
      console.error('[Auth Error]', { name: err?.name, message: err?.message, status: err?.status });
      const friendlyMsg = getFriendlyErrorMessage(err);
      setAlert({
        type: 'error',
        message: friendlyMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAlert(null);
    if (!isConfigured) {
      setAlert({
        type: 'error',
        message: 'Supabase is not configured yet. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.',
      });
      return;
    }

    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('[Auth Error]', { name: err?.name, message: err?.message, status: err?.status });
      setAlert({
        type: 'error',
        message: getFriendlyErrorMessage(err),
      });
      setLoading(false);
    }
  };

  if (!isConfigured) {
    return (
      <div
        id="login-screen"
        data-testid="login-screen"
        className="flex flex-col items-center justify-center w-full max-w-md mx-auto px-4 pt-2 pb-12"
      >
        {/* Top Back Nav */}
        <div className="w-full flex items-center justify-between mb-4">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              data-testid="auth-back-button"
              aria-label="Back to home"
              className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-on-surface font-medium transition-colors cursor-pointer py-1"
            >
              <ArrowLeft size={16} />
              <span>Back to Daily Dive</span>
            </button>
          )}
        </div>

        {/* Unconfigured Notice */}
        <div className="w-full rounded-3xl bg-surface-container-lowest/80 border border-outline-variant/30 shadow-xl p-6 sm:p-8 backdrop-blur-md text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary-container/20 border border-primary-container/30 flex items-center justify-center text-primary shadow-sm">
            <LogIn size={26} />
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-on-surface mb-2">
            Sign-in isn't set up yet.
          </h1>

          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-6">
            Supabase environment variables are missing. All daily dive spins, libraries, and topics remain 100% functional and offline.
          </p>

          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="w-full h-11 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer shadow-md shadow-primary/20"
            >
              Return to Daily Dive
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      id="login-screen"
      data-testid="login-screen"
      className="flex flex-col items-center justify-center w-full max-w-md mx-auto px-4 pt-2 pb-12"
    >
      {/* Top Back Nav */}
      <div className="w-full flex items-center justify-between mb-4">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            data-testid="auth-back-button"
            aria-label="Back to home"
            className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-on-surface font-medium transition-colors cursor-pointer py-1"
          >
            <ArrowLeft size={16} />
            <span>Back to Daily Dive</span>
          </button>
        )}
      </div>

      {/* Auth Card Container */}
      <div className="w-full bg-surface-container-low rounded-2xl p-6 sm:p-8 border border-outline-variant/30 shadow-lg relative">
        
        {/* App Title & Subheading */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary-container/20 border border-primary-container/30 text-primary flex items-center justify-center mb-3 shadow-inner">
            <LogIn size={24} />
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-on-surface">
            {mode === 'signup'
              ? 'Create your account'
              : mode === 'forgot'
              ? 'Reset your password'
              : 'Welcome to Daily Dive'}
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1 max-w-xs">
            {mode === 'signup'
              ? 'Sign up to build your learning journey. Spin and study remain fully available without an account.'
              : mode === 'forgot'
              ? 'Enter your email address and we will send you a password reset link.'
              : 'Sign in to access your account. Spin and learning remain 100% free and local-first.'}
          </p>
        </div>

        {/* Tab Switcher (Log in / Sign up) */}
        {mode !== 'forgot' && (
          <div className="flex p-1 rounded-xl bg-surface-container-high border border-outline-variant/30 mb-5">
            <button
              id="auth-tab-login-btn"
              data-testid="auth-tab-login-btn"
              type="button"
              onClick={() => {
                setMode('login');
                setAlert(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'text-primary bg-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Log In
            </button>
            <button
              id="auth-tab-signup-btn"
              data-testid="auth-tab-signup-btn"
              type="button"
              onClick={() => {
                setMode('signup');
                setAlert(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'text-primary bg-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Expired or Invalid Link Notice */}
        {urlError && (
          <div
            id="auth-expired-link-box"
            data-testid="auth-expired-link-box"
            role="alert"
            className="mb-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs sm:text-sm space-y-3"
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div className="flex-1 font-medium leading-relaxed">
                {urlError.description || 'This password reset link is invalid or has expired.'}
              </div>
            </div>
            <button
              type="button"
              id="send-new-link-btn"
              data-testid="send-new-link-btn"
              onClick={handleSendNewLink}
              className="w-full sm:w-auto px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
            >
              Send a new link
            </button>
          </div>
        )}

        {/* Alert Message Banner */}
        {alert && (
          <div
            id="auth-alert-box"
            data-testid="auth-alert-box"
            role="alert"
            className={`mb-4 p-3 rounded-xl text-xs flex items-start gap-2.5 transition-all ${
              alert.type === 'error'
                ? 'bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400'
                : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
            }`}
          >
            {alert.type === 'error' ? (
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-[12px] leading-snug">{alert.message}</div>
            <button
              type="button"
              onClick={() => setAlert(null)}
              aria-label="Dismiss alert"
              className="text-on-surface-variant hover:text-on-surface cursor-pointer p-0.5"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Google OAuth Button (Method 2) */}
        {mode !== 'forgot' && (
          <>
            <button
              id="google-auth-btn"
              data-testid="google-auth-btn"
              type="button"
              disabled={loading}
              onClick={handleGoogleSignIn}
              className="w-full h-11 bg-surface-container-high hover:bg-surface-container-highest active:scale-[0.99] border border-outline-variant/40 rounded-xl text-xs sm:text-sm font-medium text-on-surface flex items-center justify-center gap-3 transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-outline-variant/30" />
              <span className="text-[11px] font-mono text-outline uppercase tracking-wider">or with email</span>
              <div className="flex-1 h-px bg-outline-variant/30" />
            </div>
          </>
        )}

        {/* Email / Password Form (Method 1) */}
        <form id="auth-form" data-testid="auth-form" onSubmit={handleSubmit} className="space-y-3.5" noValidate>
          {/* Email Input */}
          <div>
            <label htmlFor="auth-email" className="block text-[11px] font-mono uppercase tracking-wider text-on-surface-variant mb-1.5 font-medium">
              Email address
            </label>
            <div className="relative flex items-center">
              <Mail size={16} className="absolute left-3 text-outline pointer-events-none" />
              <input
                type="email"
                id="auth-email"
                data-testid="auth-email-input"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-surface-container-high border border-outline-variant/40 text-on-surface placeholder:text-outline text-xs sm:text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-sans"
              />
            </div>
            {emailError && (
              <p className="text-[11px] text-red-500 mt-1 font-mono" id="email-validation-msg" data-testid="email-validation-msg">
                {emailError}
              </p>
            )}
          </div>

          {/* Password Input (only when not in forgot password mode) */}
          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="auth-password" className="block text-[11px] font-mono uppercase tracking-wider text-on-surface-variant font-medium">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setAlert(null);
                    }}
                    className="text-[11px] text-primary hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
                {mode === 'signup' && (
                  <span className="text-[10px] font-mono text-outline">Min 6 characters</span>
                )}
              </div>
              <div className="relative flex items-center">
                <Lock size={16} className="absolute left-3 text-outline pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="auth-password"
                  data-testid="auth-password-input"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  className="w-full h-10 pl-9 pr-10 rounded-xl bg-surface-container-high border border-outline-variant/40 text-on-surface placeholder:text-outline text-xs sm:text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-sans"
                />
                <button
                  type="button"
                  id="toggle-pwd-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 text-outline hover:text-on-surface cursor-pointer p-0.5"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordError && (
                <p className="text-[11px] text-red-500 mt-1 font-mono" id="pwd-validation-msg" data-testid="pwd-validation-msg">
                  {passwordError}
                </p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            id="auth-submit-btn"
            data-testid="auth-submit-btn"
            disabled={loading}
            className="w-full h-11 mt-2 bg-primary hover:opacity-90 active:scale-[0.98] text-white rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </span>
            ) : mode === 'signup' ? (
              <>
                <UserPlus size={16} />
                <span>Create Account</span>
              </>
            ) : mode === 'forgot' ? (
              <>
                <Mail size={16} />
                <span>Send Reset Link</span>
              </>
            ) : (
              <>
                <LogIn size={16} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Bottom Switch Link */}
        <div className="mt-5 text-center text-xs text-on-surface-variant">
          {mode === 'forgot' ? (
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setAlert(null);
              }}
              className="text-primary hover:underline font-semibold cursor-pointer"
            >
              Back to Sign In
            </button>
          ) : mode === 'login' ? (
            <>
              <span>Don't have an account? </span>
              <button
                type="button"
                id="auth-switch-btn"
                data-testid="auth-switch-btn"
                onClick={() => {
                  setMode('signup');
                  setAlert(null);
                }}
                className="text-primary hover:underline font-semibold cursor-pointer ml-1"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              <span>Already have an account? </span>
              <button
                type="button"
                id="auth-switch-btn"
                data-testid="auth-switch-btn"
                onClick={() => {
                  setMode('login');
                  setAlert(null);
                }}
                className="text-primary hover:underline font-semibold cursor-pointer ml-1"
              >
                Log in
              </button>
            </>
          )}
        </div>

        {/* Local-First Notice Footer */}
        <div className="mt-6 pt-4 border-t border-outline-variant/20 flex items-center justify-center text-center text-[11px] font-mono text-outline">
          <span>Signing in is optional. All daily dive spins and topics work locally offline.</span>
        </div>

      </div>
    </div>
  );
};
