import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  validatePasswordReset,
  parseAuthUrlError,
  nextRecoveryState
} from '../src/lib/authPasswordReset.js';

describe('Password Reset Helper Functions (App-Used Logic)', () => {

  describe('validatePasswordReset', () => {
    test('rejects empty, non-string, or passwords shorter than 8 characters', () => {
      const inputs = ['', '1234567', null, undefined];
      for (const pwd of inputs) {
        const res = validatePasswordReset(pwd, pwd);
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.error, 'Password must be at least 8 characters.');
        assert.strictEqual(res.field, 'newPassword');
      }
    });

    test('rejects mismatched passwords with confirmPassword field error', () => {
      const res = validatePasswordReset('ValidPassword123', 'DifferentPassword456');
      assert.strictEqual(res.valid, false);
      assert.strictEqual(res.error, 'Passwords do not match.');
      assert.strictEqual(res.field, 'confirmPassword');
    });

    test('accepts matching passwords of 8 characters or more', () => {
      const res = validatePasswordReset('ValidPassword123', 'ValidPassword123');
      assert.strictEqual(res.valid, true);
      assert.strictEqual(res.error, null);
      assert.strictEqual(res.field, null);
    });
  });

  describe('parseAuthUrlError', () => {
    test('parses error, error_code, and error_description from URL hash fragment', () => {
      const hashUrl = 'https://daily-dive.vercel.app/#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired';
      const parsed = parseAuthUrlError(hashUrl);

      assert.ok(parsed, 'Expected error object from hash URL');
      assert.strictEqual(parsed.error, 'access_denied');
      assert.strictEqual(parsed.code, 'otp_expired');
      assert.strictEqual(parsed.description, 'Email link is invalid or has expired');
    });

    test('parses error and error_description from URL query parameters', () => {
      const queryUrl = 'https://daily-dive.vercel.app/?error=access_denied&error_description=Invalid+token';
      const parsed = parseAuthUrlError(queryUrl);

      assert.ok(parsed, 'Expected error object from query URL');
      assert.strictEqual(parsed.error, 'access_denied');
      assert.strictEqual(parsed.description, 'Invalid token');
    });

    test('returns null for normal URLs without error parameters', () => {
      assert.strictEqual(parseAuthUrlError('https://daily-dive.vercel.app/#/login'), null);
      assert.strictEqual(parseAuthUrlError('https://daily-dive.vercel.app/#spin'), null);
      assert.strictEqual(parseAuthUrlError('https://daily-dive.vercel.app/?ref=producthunt'), null);
    });
  });

  describe('nextRecoveryState', () => {
    test('transitions to true on PASSWORD_RECOVERY event', () => {
      assert.strictEqual(nextRecoveryState(false, 'PASSWORD_RECOVERY'), true);
      assert.strictEqual(nextRecoveryState(true, 'PASSWORD_RECOVERY'), true);
    });

    test('transitions to false on SIGNED_OUT event', () => {
      assert.strictEqual(nextRecoveryState(true, 'SIGNED_OUT'), false);
      assert.strictEqual(nextRecoveryState(false, 'SIGNED_OUT'), false);
    });

    test('preserves existing recovery state on other auth events', () => {
      const otherEvents = ['SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED', 'INITIAL_SESSION'];
      for (const event of otherEvents) {
        assert.strictEqual(nextRecoveryState(true, event), true);
        assert.strictEqual(nextRecoveryState(false, event), false);
      }
    });

    test('defaults to false when prev is omitted or falsey', () => {
      assert.strictEqual(nextRecoveryState(), false);
      assert.strictEqual(nextRecoveryState(undefined, 'SIGNED_IN'), false);
    });
  });

});
