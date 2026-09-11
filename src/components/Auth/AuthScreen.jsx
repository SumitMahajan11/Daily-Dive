import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Disc, Mail, Lock, Eye, EyeOff, LogIn, UserPlus, AlertCircle, CheckCircle, X } from 'lucide-react';

export const AuthScreen = ({ onAuthSuccess }) => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, getFriendlyErrorMessage } = useAuth();
  
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null); // { type: 'error' | 'success', message: '' }
  const [validationErrors, setValidationErrors] = useState({});

  const validate = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim() || !emailRegex.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!password || password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      if (mode === 'signup') {
        const data = await signUpWithEmail(email, password);
        if (data?.user && !data?.session) {
          setAlert({
            type: 'success',
            message: 'Account created! Please check your email for a verification link.'
          });
        } else {
          setAlert({
            type: 'success',
            message: 'Account created and signed in successfully!'
          });
          if (onAuthSuccess) onAuthSuccess();
        }
      } else {
        await signInWithEmail(email, password);
        if (onAuthSuccess) onAuthSuccess();
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: getFriendlyErrorMessage(err)
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAlert(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setAlert({
        type: 'error',
        message: getFriendlyErrorMessage(err)
      });
    }
  };

  const isSignup = mode === 'signup';

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-md mx-auto py-4">
      {/* Auth Card Container */}
      <div className="w-full bg-surface-container-low rounded-2xl p-6 sm:p-8 border border-outline-variant/40 shadow-xl shadow-black/10 dark:shadow-black/50 relative">
        
        {/* App Logo Badge & Title */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary-container/20 border border-primary-container/40 text-primary flex items-center justify-center mb-3 shadow-inner">
            <Disc size={28} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-on-surface">
            {isSignup ? 'Create your account' : 'Welcome to Life Learning'}
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            {isSignup
              ? 'Start spinning daily micro-learning topics and building streaks'
              : 'Sign in to spin topics and build your daily learning streak'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 rounded-xl bg-surface-container-highest border border-outline-variant/30 mb-5">
          <button
            type="button"
            onClick={() => { setMode('login'); setAlert(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              !isSignup
                ? 'text-primary bg-surface shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setAlert(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              isSignup
                ? 'text-primary bg-surface shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Alert Message Banner */}
        {alert && (
          <div
            className={`mb-4 p-3 rounded-xl text-xs flex items-start gap-2.5 transition-all ${
              alert.type === 'error'
                ? 'bg-error-container/20 border border-error/30 text-error'
                : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
            }`}
          >
            {alert.type === 'error' ? (
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-error" />
            ) : (
              <CheckCircle size={18} className="shrink-0 mt-0.5 text-emerald-400" />
            )}
            <div className="flex-1 text-[12px] leading-snug">{alert.message}</div>
            <button
              type="button"
              onClick={() => setAlert(null)}
              className="text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full h-11 bg-surface-container-high hover:bg-surface-bright active:scale-[0.99] border border-outline-variant/40 rounded-xl text-xs sm:text-sm font-medium text-on-surface flex items-center justify-center gap-3 transition-all cursor-pointer shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-outline-variant/30"></div>
          <span className="text-[11px] font-mono text-outline uppercase tracking-wider">or with email</span>
          <div className="flex-1 h-px bg-outline-variant/30"></div>
        </div>

        {/* Email / Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
          {/* Email Input */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-on-surface-variant mb-1.5 font-medium">
              Email address
            </label>
            <div className="relative flex items-center">
              <Mail size={18} className="absolute left-3 text-outline pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
                autoComplete="email"
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-surface-container-high border border-outline-variant/40 text-on-surface placeholder:text-outline text-xs sm:text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-sans"
              />
            </div>
            {validationErrors.email && (
              <p className="text-[11px] text-error mt-1 font-mono">{validationErrors.email}</p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-on-surface-variant font-medium">
                Password
              </label>
              <span className="text-[10px] font-mono text-outline">Min 6 characters</span>
            </div>
            <div className="relative flex items-center">
              <Lock size={18} className="absolute left-3 text-outline pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                className="w-full h-10 pl-9 pr-10 rounded-xl bg-surface-container-high border border-outline-variant/40 text-on-surface placeholder:text-outline text-xs sm:text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 text-outline hover:text-on-surface cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {validationErrors.password && (
              <p className="text-[11px] text-error mt-1 font-mono">{validationErrors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-11 mt-2 bg-primary-container hover:bg-primary-container/90 active:scale-[0.98] text-white rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-primary-container/20 disabled:opacity-50"
          >
            {submitting ? (
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
            ) : isSignup ? (
              <UserPlus size={18} />
            ) : (
              <LogIn size={18} />
            )}
            <span>{submitting ? 'Authenticating...' : isSignup ? 'Create Account' : 'Sign In'}</span>
          </button>
        </form>

        {/* Bottom Toggle Text */}
        <div className="mt-5 text-center text-xs text-on-surface-variant">
          <span>{isSignup ? 'Already have an account?' : "Don't have an account?"}</span>
          <button
            type="button"
            onClick={() => {
              setMode(isSignup ? 'login' : 'signup');
              setAlert(null);
            }}
            className="ml-1 text-primary hover:underline font-semibold cursor-pointer"
          >
            {isSignup ? 'Log in' : 'Sign up'}
          </button>
        </div>

      </div>
    </div>
  );
};
