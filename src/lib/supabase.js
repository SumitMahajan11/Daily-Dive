import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  typeof supabaseUrl === 'string' &&
  supabaseUrl.trim().length > 0 &&
  typeof supabaseAnonKey === 'string' &&
  supabaseAnonKey.trim().length > 0
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl.trim(), supabaseAnonKey.trim(), {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function getFriendlyErrorMessage(err) {
  if (!err) return 'An unexpected error occurred. Please try again.';
  const msg = (err.message || String(err)).toLowerCase();

  if (
    msg.includes('invalid login credentials') ||
    msg.includes('invalid claim') ||
    msg.includes('invalid_grant')
  ) {
    return 'Incorrect email or password. Please verify your credentials and try again.';
  }
  if (msg.includes('user already registered') || msg.includes('already exists')) {
    return 'An account with this email address already exists. Try logging in instead.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Please check your email inbox to confirm your account before logging in.';
  }
  if (msg.includes('password should be at least') || msg.includes('weak_password')) {
    return 'Password must be at least 6 characters long.';
  }
  if (msg.includes('invalid email') || msg.includes('unable to validate email')) {
    return 'Please enter a valid email address.';
  }
  if (msg.includes('network') || msg.includes('failed to fetch')) {
    return 'Network connection issue. Please check your internet connection.';
  }
  if (msg.includes('rate limit') || msg.includes('too many requests')) {
    return 'Too many attempts. Please wait a few moments before trying again.';
  }
  return err.message || 'An unexpected error occurred. Please try again.';
}
