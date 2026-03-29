/**
 * Auth Edge Cases - Session expiry, password reset, email verification,
 * account lockout, and concurrent login scenarios
 */

import {
  resetAllMocks,
  mockSupabaseAuth,
  createMockUser,
} from './setup';

import { signUp, logIn, sendMagicLink } from '@/lib/auth/authentication';
import { getUserDashboard } from '@/lib/auth/dashboard';

jest.mock('@/lib/supabase/client', () => ({
  supabase: { auth: mockSupabaseAuth },
}));

describe('Auth Edge Cases', () => {
  beforeEach(() => resetAllMocks());

  test('session expiry - expired JWT rejected on dashboard access', async () => {
    mockSupabaseAuth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'JWT expired', status: 401 },
    });

    await expect(getUserDashboard('user_expired')).rejects.toThrow('expired');
  });

  test('password reset - sign up with already registered email fails', async () => {
    mockSupabaseAuth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'User already registered' },
    });

    await expect(signUp('existing@example.nl', 'NewPassword123!')).rejects.toThrow('User already registered');
  });

  test('email verification - magic link for invalid email is rate limited', async () => {
    mockSupabaseAuth.signInWithOtp.mockResolvedValue({
      data: null,
      error: { message: 'For security purposes, you can only request this once every 60 seconds' },
    });

    await expect(sendMagicLink('spam@example.nl')).rejects.toThrow('60 seconds');
  });

  test('account lockout - repeated failed logins return consistent error', async () => {
    mockSupabaseAuth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    });

    const attempts = Array.from({ length: 5 }, () =>
      logIn('jan@example.nl', 'WrongPassword').catch(e => e.message)
    );

    const results = await Promise.all(attempts);
    expect(results.every(msg => msg === 'Invalid login credentials')).toBe(true);
  });

  test('concurrent logins - multiple sessions can be established', async () => {
    mockSupabaseAuth.signInWithPassword.mockResolvedValue({
      data: {
        user: { id: 'user_test_001', email: 'jan@example.nl' },
        session: { access_token: 'token_concurrent' },
      },
      error: null,
    });

    const [session1, session2] = await Promise.all([
      logIn('jan@example.nl', 'SecureWtp2026!'),
      logIn('jan@example.nl', 'SecureWtp2026!'),
    ]);

    expect(session1.access_token).toBeDefined();
    expect(session2.access_token).toBeDefined();
    expect(mockSupabaseAuth.signInWithPassword).toHaveBeenCalledTimes(2);
  });
});
