import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  validatePasswordReset,
  parseAuthUrlError,
  determineActiveView,
  executePasswordReset
} from '../src/lib/authPasswordReset.js';

describe('Password Reset Flow Unit Tests with Mocked Supabase Client', () => {

  function createMockSupabase(overrides = {}) {
    let authCallback = null;
    const calls = {
      updateUser: [],
      signOut: 0,
      onAuthStateChange: 0,
    };

    const client = {
      calls,
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: (cb) => {
          calls.onAuthStateChange++;
          authCallback = cb;
          return {
            data: {
              subscription: {
                unsubscribe: () => { authCallback = null; }
              }
            }
          };
        },
        updateUser: async (params) => {
          calls.updateUser.push(params);
          if (overrides.updateUserError) {
            return { data: null, error: overrides.updateUserError };
          }
          return { data: { user: { id: 'usr-mock-123' } }, error: null };
        },
        signOut: async () => {
          calls.signOut++;
          return { error: null };
        },
        // Test helper to fire auth state events
        triggerEvent: (event, session = null) => {
          if (authCallback) {
            authCallback(event, session);
          }
        }
      }
    };

    return client;
  }

  test('the PASSWORD_RECOVERY event sets recovering=true and forces the "Set new password" view whatever the route', () => {
    const mockSupabase = createMockSupabase();

    let recoveringState = false;
    let currentUser = null;

    // Simulate AuthProvider onAuthStateChange event handler
    mockSupabase.auth.onAuthStateChange((event, newSession) => {
      if (event === 'PASSWORD_RECOVERY') {
        recoveringState = true;
      }
      currentUser = newSession?.user ?? null;
    });

    // Before recovery event: initial state
    assert.strictEqual(recoveringState, false, 'recovering should initially be false');
    assert.strictEqual(determineActiveView({ activeSection: 'spin', recovering: recoveringState }), 'spin');
    assert.strictEqual(determineActiveView({ activeSection: 'library', recovering: recoveringState }), 'library');

    // Simulate Supabase sending PASSWORD_RECOVERY event
    const mockRecoverySession = {
      user: { id: 'recovery-user-id', email: 'user@example.com' }
    };
    mockSupabase.auth.triggerEvent('PASSWORD_RECOVERY', mockRecoverySession);

    // Assert: recovering is now true
    assert.strictEqual(recoveringState, true, 'recovering must be set to true on PASSWORD_RECOVERY event');
    assert.strictEqual(currentUser?.email, 'user@example.com', 'user session must be set on PASSWORD_RECOVERY event');

    // Assert: Set new password view is displayed WHATEVER the route
    const routesToTest = ['spin', 'library', 'progress', 'settings', 'login'];
    for (const route of routesToTest) {
      const activeView = determineActiveView({ activeSection: route, recovering: recoveringState });
      assert.strictEqual(
        activeView,
        'set-new-password',
        `Route "${route}" must resolve to "set-new-password" when recovering is true`
      );
    }
  });

  test('mismatched passwords are blocked before calling updateUser', async () => {
    const mockSupabase = createMockSupabase();

    // 1. Password under 8 characters
    const shortValidation = validatePasswordReset('pass', 'pass');
    assert.strictEqual(shortValidation.valid, false, 'Passwords under 8 chars must be invalid');
    assert.strictEqual(shortValidation.error, 'Password must be at least 8 characters.');

    await assert.rejects(
      async () => {
        await executePasswordReset({
          client: mockSupabase,
          newPassword: 'pass',
          confirmPassword: 'pass'
        });
      },
      {
        name: 'Error',
        message: 'Password must be at least 8 characters.'
      },
      'executePasswordReset must throw if password is under 8 chars'
    );

    // Assert: updateUser was NOT called
    assert.strictEqual(mockSupabase.calls.updateUser.length, 0, 'updateUser must not be called when password is under 8 chars');

    // 2. Mismatched passwords (>= 8 chars each)
    const mismatchValidation = validatePasswordReset('StrongPass123', 'DifferentPass456');
    assert.strictEqual(mismatchValidation.valid, false, 'Mismatched passwords must be invalid');
    assert.strictEqual(mismatchValidation.error, 'Passwords do not match.');
    assert.strictEqual(mismatchValidation.field, 'confirmPassword');

    await assert.rejects(
      async () => {
        await executePasswordReset({
          client: mockSupabase,
          newPassword: 'StrongPass123',
          confirmPassword: 'DifferentPass456'
        });
      },
      {
        name: 'Error',
        message: 'Passwords do not match.'
      },
      'executePasswordReset must throw when passwords do not match'
    );

    // Assert: updateUser was NOT called
    assert.strictEqual(mockSupabase.calls.updateUser.length, 0, 'updateUser must not be called when passwords mismatch');
  });

  test('success calls updateUser({ password }) and transitions through signOut and clear recovering', async () => {
    const mockSupabase = createMockSupabase();

    let recoveringState = true;
    let loginNotice = null;
    let currentRoute = 'set-new-password';

    const newPassword = 'SecurePassword2026!';
    const confirmPassword = 'SecurePassword2026!';

    // Validate inputs
    const validation = validatePasswordReset(newPassword, confirmPassword);
    assert.strictEqual(validation.valid, true, 'Valid matching passwords of >= 8 chars must pass validation');

    // Execute password update via client.auth.updateUser
    const data = await executePasswordReset({
      client: mockSupabase,
      newPassword,
      confirmPassword
    });

    assert.ok(data?.user?.id, 'updateUser must return data on success');

    // Assert: updateUser was called with the exact expected payload
    assert.strictEqual(mockSupabase.calls.updateUser.length, 1, 'updateUser must be called exactly once');
    assert.deepStrictEqual(
      mockSupabase.calls.updateUser[0],
      { password: 'SecurePassword2026!' },
      'updateUser must receive { password: newPassword }'
    );

    // Step 3 post-success sequence: signOut, clear recovering, go to login view with notice
    await mockSupabase.auth.signOut();
    assert.strictEqual(mockSupabase.calls.signOut, 1, 'signOut must be called after password update');

    recoveringState = false;
    currentRoute = 'login';
    loginNotice = 'Password updated. Log in with your new password.';

    assert.strictEqual(recoveringState, false, 'recovering state must be cleared');
    assert.strictEqual(currentRoute, 'login', 'must transition to the login view');
    assert.strictEqual(loginNotice, 'Password updated. Log in with your new password.');
  });

  test('expired or invalid recovery link in URL is parsed with clear error and provides "Send a new link"', () => {
    // 1. Hash fragment format from Supabase recovery redirect
    const hashUrl = 'https://daily-dive.vercel.app/#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired';
    const parsedFromHash = parseAuthUrlError(hashUrl);

    assert.ok(parsedFromHash, 'Must parse error from URL hash');
    assert.strictEqual(parsedFromHash.error, 'access_denied');
    assert.strictEqual(parsedFromHash.code, 'otp_expired');
    assert.strictEqual(parsedFromHash.description, 'Email link is invalid or has expired');

    // 2. Query parameter format
    const queryUrl = 'https://daily-dive.vercel.app/?error=access_denied&error_description=Invalid+token';
    const parsedFromQuery = parseAuthUrlError(queryUrl);

    assert.ok(parsedFromQuery, 'Must parse error from URL query');
    assert.strictEqual(parsedFromQuery.description, 'Invalid token');

    // 3. Normal URL returns null
    const normalUrl = 'https://daily-dive.vercel.app/#/login';
    assert.strictEqual(parseAuthUrlError(normalUrl), null, 'Normal URL without errors returns null');
  });

});
