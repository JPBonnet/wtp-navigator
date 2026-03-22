/**
 * Wtp Navigator - Database Operations Tests
 *
 * Tests for Supabase database operations including CRUD,
 * Row-Level Security (RLS) policies, transactions, and
 * constraint enforcement.
 */

import {
  resetAllMocks,
  mockDb,
  createMockUser,
  createMockPensionSetup,
  createMockAssessmentResult,
} from './setup';

// ─── Module stubs (to be implemented) ─────────────────────────────

import {
  createUser,
  getUserById,
  getUserByEmail,
} from '@/lib/database/users';

import {
  createAssessment,
  getAssessmentById,
  getAssessmentsByOrganization,
  updateAssessmentStatus,
} from '@/lib/database/assessments';

import {
  insertResponse,
  updateResponse,
  getResponsesByAssessment,
} from '@/lib/database/responses';

import {
  storeAssessmentResult,
  getAssessmentResult,
} from '@/lib/database/results';

import {
  withTransaction,
} from '@/lib/database/transaction';

// ─── Mock Supabase Client ────────────────────────────────────────

const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
  maybeSingle: jest.fn(),
  rpc: jest.fn(),
};

jest.mock('@/lib/supabase/client', () => ({
  supabase: mockSupabase,
}));

// ─── User CRUD ───────────────────────────────────────────────────

describe('UserDatabase', () => {
  beforeEach(() => {
    resetAllMocks();
    jest.clearAllMocks();
  });

  test('creates a new user and returns the created record', async () => {
    const userData = {
      email: 'pieter@pensioenbeheer.nl',
      organizationId: 'org_test_001',
      role: 'owner' as const,
    };

    mockSupabase.single.mockResolvedValue({
      data: { id: 'user_new_001', ...userData, created_at: new Date().toISOString() },
      error: null,
    });

    const user = await createUser(userData);

    expect(user.id).toBeDefined();
    expect(user.email).toBe('pieter@pensioenbeheer.nl');
    expect(user.organizationId).toBe('org_test_001');
  });

  test('retrieves a user by ID', async () => {
    const mockUser = createMockUser();

    mockSupabase.single.mockResolvedValue({
      data: mockUser,
      error: null,
    });

    const user = await getUserById('user_test_001');

    expect(user).not.toBeNull();
    expect(user.id).toBe('user_test_001');
    expect(user.email).toBe('jan@example.nl');
  });

  test('retrieves a user by email', async () => {
    const mockUser = createMockUser({ email: 'sanne@adviesbureau.nl' });

    mockSupabase.single.mockResolvedValue({
      data: mockUser,
      error: null,
    });

    const user = await getUserByEmail('sanne@adviesbureau.nl');

    expect(user).not.toBeNull();
    expect(user.email).toBe('sanne@adviesbureau.nl');
  });

  test('returns null when user is not found by ID', async () => {
    mockSupabase.maybeSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    const user = await getUserById('nonexistent_user');

    expect(user).toBeNull();
  });

  test('throws error on duplicate email insertion', async () => {
    mockSupabase.single.mockResolvedValue({
      data: null,
      error: { code: '23505', message: 'duplicate key value violates unique constraint' },
    });

    await expect(
      createUser({ email: 'jan@example.nl', organizationId: 'org_test_001', role: 'owner' })
    ).rejects.toThrow('duplicate');
  });

  test('throws error when required fields are null', async () => {
    mockSupabase.single.mockResolvedValue({
      data: null,
      error: { code: '23502', message: 'null value in column "email" violates not-null constraint' },
    });

    await expect(
      createUser({ email: null as any, organizationId: 'org_test_001', role: 'owner' })
    ).rejects.toThrow('null');
  });
});

// ─── Assessment CRUD ─────────────────────────────────────────────

describe('AssessmentDatabase', () => {
  beforeEach(() => {
    resetAllMocks();
    jest.clearAllMocks();
  });

  test('creates an assessment linked to a pension setup and organization', async () => {
    const assessmentData = {
      pensionSetupId: 'setup_test_001',
      organizationId: 'org_test_001',
      riskScore: 7,
      gaps: [{ category: 'contribution', severity: 'high' }],
      recommendations: [{ action: 'Restructure contributions', priority: 'critical' }],
      createdBy: 'user_test_001',
    };

    mockSupabase.single.mockResolvedValue({
      data: { id: 'assess_new_001', ...assessmentData, created_at: new Date().toISOString() },
      error: null,
    });

    const assessment = await createAssessment(assessmentData);

    expect(assessment.id).toBeDefined();
    expect(assessment.organizationId).toBe('org_test_001');
    expect(assessment.riskScore).toBe(7);
  });

  test('fetches assessments filtered by organization (RLS scope)', async () => {
    mockSupabase.select.mockReturnThis();
    mockSupabase.eq.mockResolvedValue({
      data: [
        { id: 'assess_001', organizationId: 'org_test_001', riskScore: 5 },
        { id: 'assess_002', organizationId: 'org_test_001', riskScore: 8 },
      ],
      error: null,
    });

    const assessments = await getAssessmentsByOrganization('org_test_001');

    expect(assessments).toHaveLength(2);
    assessments.forEach((a: { organizationId: string }) => {
      expect(a.organizationId).toBe('org_test_001');
    });
  });

  test('updates assessment status', async () => {
    mockSupabase.single.mockResolvedValue({
      data: { id: 'assess_001', status: 'completed' },
      error: null,
    });

    const updated = await updateAssessmentStatus('assess_001', 'completed');

    expect(updated.status).toBe('completed');
  });

  // RLS security: user cannot access assessments from another organization
  test('returns empty result when querying assessments for a different organization', async () => {
    mockSupabase.eq.mockResolvedValue({
      data: [],
      error: null,
    });

    const assessments = await getAssessmentsByOrganization('org_other_999');

    expect(assessments).toHaveLength(0);
  });

  test('rejects assessment with risk_score outside valid range (1-10)', async () => {
    mockSupabase.single.mockResolvedValue({
      data: null,
      error: { code: '23514', message: 'new row violates check constraint "assessments_risk_score_check"' },
    });

    await expect(
      createAssessment({
        pensionSetupId: 'setup_test_001',
        organizationId: 'org_test_001',
        riskScore: 15,
        gaps: [],
        recommendations: [],
        createdBy: 'user_test_001',
      })
    ).rejects.toThrow('check constraint');
  });
});

// ─── Response Operations ─────────────────────────────────────────

describe('ResponseDatabase', () => {
  beforeEach(() => {
    resetAllMocks();
    jest.clearAllMocks();
  });

  test('inserts a questionnaire response for an assessment', async () => {
    mockSupabase.single.mockResolvedValue({
      data: {
        id: 'resp_001',
        assessmentId: 'assess_test_001',
        questionId: 'q_scheme_type',
        value: 'defined_benefit',
      },
      error: null,
    });

    const response = await insertResponse('assess_test_001', 'q_scheme_type', 'defined_benefit');

    expect(response.assessmentId).toBe('assess_test_001');
    expect(response.value).toBe('defined_benefit');
  });

  test('updates an existing response value', async () => {
    mockSupabase.single.mockResolvedValue({
      data: {
        id: 'resp_001',
        assessmentId: 'assess_test_001',
        questionId: 'q_scheme_type',
        value: 'defined_contribution',
      },
      error: null,
    });

    const updated = await updateResponse('resp_001', 'defined_contribution');

    expect(updated.value).toBe('defined_contribution');
  });

  test('retrieves all responses for an assessment', async () => {
    mockSupabase.eq.mockResolvedValue({
      data: [
        { id: 'resp_001', questionId: 'q_scheme_type', value: 'defined_benefit' },
        { id: 'resp_002', questionId: 'q_provider_name', value: 'APG' },
        { id: 'resp_003', questionId: 'q_participant_count', value: '250' },
      ],
      error: null,
    });

    const responses = await getResponsesByAssessment('assess_test_001');

    expect(responses).toHaveLength(3);
    expect(responses[0].questionId).toBe('q_scheme_type');
  });
});

// ─── Assessment Result Storage ───────────────────────────────────

describe('AssessmentResultStorage', () => {
  beforeEach(() => {
    resetAllMocks();
    jest.clearAllMocks();
  });

  test('stores a complete assessment result with gaps and recommendations', async () => {
    const result = createMockAssessmentResult();

    mockSupabase.single.mockResolvedValue({
      data: { id: 'result_001', ...result },
      error: null,
    });

    const stored = await storeAssessmentResult(result);

    expect(stored.id).toBeDefined();
    expect(stored.overallScore).toBe(72);
    expect(stored.gaps).toHaveLength(2);
  });

  test('retrieves a stored assessment result by assessment ID', async () => {
    const result = createMockAssessmentResult();

    mockSupabase.single.mockResolvedValue({
      data: result,
      error: null,
    });

    const retrieved = await getAssessmentResult('assess_test_001');

    expect(retrieved).not.toBeNull();
    expect(retrieved.overallScore).toBe(72);
    expect(retrieved.status).toBe('PARTIAL');
  });
});

// ─── Database Transactions ───────────────────────────────────────

describe('DatabaseTransactions', () => {
  beforeEach(() => {
    resetAllMocks();
    jest.clearAllMocks();
  });

  test('commits transaction when all operations succeed', async () => {
    mockSupabase.rpc.mockResolvedValue({ data: 'committed', error: null });

    const result = await withTransaction(async (tx) => {
      await tx.insert('assessments', { id: 'assess_tx_001', riskScore: 5 });
      await tx.insert('responses', { assessmentId: 'assess_tx_001', questionId: 'q1', value: 'yes' });
      return { success: true };
    });

    expect(result.success).toBe(true);
  });

  test('rolls back transaction when any operation fails', async () => {
    mockSupabase.rpc.mockResolvedValue({
      data: null,
      error: { message: 'transaction rolled back' },
    });

    await expect(
      withTransaction(async (tx) => {
        await tx.insert('assessments', { id: 'assess_tx_002', riskScore: 5 });
        throw new Error('Simulated failure during response insert');
      })
    ).rejects.toThrow('Simulated failure');
  });
});
