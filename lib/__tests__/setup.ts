/**
 * Wtp Navigator - Test Setup & Utilities
 *
 * Common mock factories, test data fixtures, and helper functions
 * shared across all test suites.
 */

import { registerUserEmail } from '@/lib/email/user-store';

// ─── Mock Factories ───────────────────────────────────────────────

export function createMockUser(overrides: Record<string, unknown> = {}) {
  const user = {
    id: 'user_test_001',
    email: 'jan@example.nl',
    organizationId: 'org_test_001',
    role: 'owner' as const,
    createdAt: new Date('2026-01-15T10:00:00Z'),
    ...overrides,
  };
  registerUserEmail(user.id as string, user.email as string);
  return user;
}

export function createMockAssessmentResult(overrides: Record<string, unknown> = {}) {
  return {
    assessmentId: 'assess_test_001',
    pensionSetupId: 'setup_test_001',
    overallScore: 72,
    status: 'PARTIAL' as const,
    gaps: [
      { name: 'member_communication', severity: 'high', suggestion: 'Send member communication about transition timeline' },
      { name: 'contribution_structure', severity: 'medium', suggestion: 'Restructure contributions to flat-rate model' },
    ],
    completedAt: new Date('2026-03-22T14:30:00Z'),
    ...overrides,
  };
}

export function createMockPensionSetup(overrides: Record<string, unknown> = {}) {
  return {
    id: 'setup_test_001',
    companyId: 'company_test_001',
    organizationId: 'org_test_001',
    schemeType: 'defined_benefit' as const,
    providerName: 'Achmea Pensioen',
    providerType: 'insurer' as const,
    contributionEmployer: 12.5,
    contributionEmployee: 4.0,
    participantCount: 85,
    effectiveDate: '2018-01-01',
    status: 'draft' as const,
    ...overrides,
  };
}

export function createMockStripeEvent(type: string, data: Record<string, unknown> = {}) {
  return {
    id: `evt_test_${Date.now()}`,
    type,
    data: {
      object: {
        id: 'session_test_001',
        customer_email: 'jan@example.nl',
        amount_total: 99900,
        currency: 'eur',
        metadata: { userId: 'user_test_001', productType: 'assessment' },
        ...data,
      },
    },
    created: Math.floor(Date.now() / 1000),
  };
}

// ─── Mock Database Layer ──────────────────────────────────────────

const mockStore: Record<string, Record<string, unknown>> = {};

export const mockDb = {
  save: jest.fn(async (table: string, data: Record<string, unknown>) => {
    const id = data.id || `${table}_${Date.now()}`;
    mockStore[`${table}:${id}`] = { ...data, id };
    return { ...data, id };
  }),
  get: jest.fn(async (table: string, id: string): Promise<Record<string, unknown> | null> => {
    return mockStore[`${table}:${id}`] || null;
  }),
  reset: () => {
    Object.keys(mockStore).forEach((key) => delete mockStore[key]);
    mockDb.save.mockReset().mockImplementation(async (table: string, data: Record<string, unknown>) => {
      const id = data.id || `${table}_${Date.now()}`;
      mockStore[`${table}:${id}`] = { ...data, id };
      return { ...data, id };
    });
    mockDb.get.mockReset().mockImplementation(async (table: string, id: string): Promise<Record<string, unknown> | null> => {
      return mockStore[`${table}:${id}`] || null;
    });
  },
};

// ─── Mock External Services ───────────────────────────────────────

export const mockStripe = {
  checkout: {
    sessions: {
      create: jest.fn(),
    },
  },
  webhooks: {
    constructEvent: jest.fn(),
  },
};

export const mockResend = {
  emails: {
    send: jest.fn(),
  },
};

export const mockSupabaseAuth = {
  signUp: jest.fn(),
  signInWithPassword: jest.fn(),
  signInWithOtp: jest.fn(),
  getUser: jest.fn(),
  getSession: jest.fn(),
};

// ─── Test Helpers ─────────────────────────────────────────────────

import { resetPurchaseStore } from '@/lib/payments/purchase-verification';
import { resetWebhookState } from '@/lib/payments/webhook-handler';

/** Reset all mocks between tests */
export function resetAllMocks() {
  mockDb.reset();
  resetPurchaseStore();
  resetWebhookState();
  jest.clearAllMocks();
}

/** Assert a date is within the last N seconds (default: 5) */
export function expectRecentDate(date: Date, withinSeconds = 5) {
  const diff = Math.abs(Date.now() - date.getTime());
  expect(diff).toBeLessThan(withinSeconds * 1000);
}
