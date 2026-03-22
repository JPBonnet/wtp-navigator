/**
 * Wtp Navigator - Authentication & Dashboard Tests
 *
 * Tests for user sign-up, login, magic link auth,
 * and user dashboard data retrieval. Supabase Auth is mocked.
 */

import {
  resetAllMocks,
  mockSupabaseAuth,
  createMockUser,
  createMockAssessmentResult,
} from './setup';

// ─── Module stubs (to be implemented) ─────────────────────────────

import {
  signUp,
  logIn,
  sendMagicLink,
  signInWithMagicLink,
} from '@/lib/auth/authentication';

import {
  getUserDashboard,
  getAssessment,
} from '@/lib/auth/dashboard';

// ─── Mock Supabase Auth ───────────────────────────────────────────

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: mockSupabaseAuth,
  },
}));

// ─── Authentication ───────────────────────────────────────────────

describe('Authentication', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  test('signs up a new user with email and password', async () => {
    mockSupabaseAuth.signUp.mockResolvedValue({
      data: {
        user: { id: 'user_new_001', email: 'pieter@logistiek.nl' },
        session: { access_token: 'token_new_001' },
      },
      error: null,
    });

    const user = await signUp('pieter@logistiek.nl', 'SecureWtp2026!');

    expect(user.email).toBe('pieter@logistiek.nl');
    expect(user.id).toBeDefined();
  });

  test('logs in with correct credentials and returns session token', async () => {
    mockSupabaseAuth.signInWithPassword.mockResolvedValue({
      data: {
        user: { id: 'user_test_001', email: 'jan@example.nl' },
        session: { access_token: 'token_session_001' },
      },
      error: null,
    });

    const session = await logIn('jan@example.nl', 'SecureWtp2026!');

    expect(session.access_token).toBeDefined();
    expect(session.access_token).toBe('token_session_001');
  });

  test('login fails with incorrect password and throws error', async () => {
    mockSupabaseAuth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    });

    await expect(
      logIn('jan@example.nl', 'WrongPassword')
    ).rejects.toThrow('Invalid login credentials');
  });

  test('sends magic link email for passwordless login', async () => {
    mockSupabaseAuth.signInWithOtp.mockResolvedValue({
      data: {},
      error: null,
    });

    const result = await sendMagicLink('sanne@itconsultancy.nl');

    expect(result.success).toBe(true);
    expect(mockSupabaseAuth.signInWithOtp).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'sanne@itconsultancy.nl' })
    );
  });

  test('sign-up fails with already registered email', async () => {
    mockSupabaseAuth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'User already registered' },
    });

    await expect(
      signUp('existing@example.nl', 'SecurePass123')
    ).rejects.toThrow('User already registered');
  });
});

// ─── UserDashboard ────────────────────────────────────────────────

describe('UserDashboard', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  test('returns dashboard with assessment status and score', async () => {
    const user = createMockUser();
    const dashboard = await getUserDashboard(user.id);

    expect(dashboard).toHaveProperty('assessments');
    expect(Array.isArray(dashboard.assessments)).toBe(true);

    if (dashboard.assessments.length > 0) {
      expect(dashboard.assessments[0]).toHaveProperty('status');
      expect(dashboard.assessments[0]).toHaveProperty('score');
    }
  });

  test('returns assessment with downloadable report URL', async () => {
    const assessment = await getAssessment('assess_test_001');

    expect(assessment).toBeDefined();
    expect(assessment.reportUrl).toBeDefined();
    expect(assessment.reportUrl).toContain('download');
  });

  test('returns empty assessments array for user with no assessments', async () => {
    const dashboard = await getUserDashboard('user_no_assessments');

    expect(dashboard.assessments).toEqual([]);
  });
});
