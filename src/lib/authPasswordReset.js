/**
 * Password Reset helpers and validation logic.
 * Zero external dependencies; safe for both browser runtime and Node unit testing.
 */

export function validatePasswordReset(newPassword, confirmPassword) {
  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
    return {
      valid: false,
      error: 'Password must be at least 8 characters.',
      field: 'newPassword'
    };
  }

  if (newPassword !== confirmPassword) {
    return {
      valid: false,
      error: 'Passwords do not match.',
      field: 'confirmPassword'
    };
  }

  return {
    valid: true,
    error: null,
    field: null
  };
}

export function parseAuthUrlError(customUrl = null) {
  let searchStr = '';
  let hashStr = '';

  if (customUrl) {
    try {
      const parsed = new URL(customUrl, 'https://daily-dive.local');
      searchStr = parsed.search || '';
      hashStr = parsed.hash || '';
    } catch {
      // If relative or raw fragment
      if (customUrl.includes('?')) searchStr = customUrl.split('?')[1] || '';
      if (customUrl.includes('#')) hashStr = customUrl.split('#')[1] || '';
    }
  } else if (typeof window !== 'undefined') {
    searchStr = window.location.search || '';
    hashStr = window.location.hash || '';
  }

  // 1. Check hash first (Supabase default redirect format)
  if (hashStr) {
    const raw = hashStr.replace(/^#\/?/, '');
    const queryPart = raw.includes('?') ? raw.split('?')[1] : raw;
    const params = new URLSearchParams(queryPart);
    const error = params.get('error');
    const description = params.get('error_description');
    const code = params.get('error_code');

    if (error || description) {
      return {
        error: error || 'error',
        code: code || '',
        description: description
          ? decodeURIComponent(description.replace(/\+/g, ' '))
          : 'The password reset link is invalid or has expired.',
      };
    }
  }

  // 2. Check search params
  if (searchStr) {
    const params = new URLSearchParams(searchStr.startsWith('?') ? searchStr.substring(1) : searchStr);
    const error = params.get('error');
    const description = params.get('error_description');
    const code = params.get('error_code');

    if (error || description) {
      return {
        error: error || 'error',
        code: code || '',
        description: description
          ? decodeURIComponent(description.replace(/\+/g, ' '))
          : 'The password reset link is invalid or has expired.',
      };
    }
  }

  return null;
}

export function nextRecoveryState(prev = false, event = '') {
  if (event === 'PASSWORD_RECOVERY') {
    return true;
  }
  if (event === 'SIGNED_OUT') {
    return false;
  }
  return Boolean(prev);
}

export function isUserAlreadyRegistered(dataOrUser) {
  const user = dataOrUser && typeof dataOrUser === 'object' && 'user' in dataOrUser
    ? dataOrUser.user
    : dataOrUser;
  return Boolean(user && Array.isArray(user.identities) && user.identities.length === 0);
}

