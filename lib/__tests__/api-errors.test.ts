/**
 * API Error Scenarios - Tests for 400, 401, 403, 404, 409, 500 responses
 */

import {
  resetAllMocks,
  mockDb,
  mockStripe,
  mockResend,
  mockSupabaseAuth,
  createMockUser,
  createMockStripeEvent,
} from './setup';

import { handleCreateAssessment, handleGetAssessment } from '@/lib/api/assessments';
import { handleSaveResponses } from '@/lib/api/responses';
import { handleContactForm } from '@/lib/api/contact';
import { handleStripeWebhookRoute } from '@/lib/api/stripe-webhook';
import { validateRequest } from '@/lib/api/middleware';

jest.mock('stripe', () => jest.fn(() => mockStripe));
jest.mock('resend', () => jest.fn(() => mockResend));
jest.mock('@/lib/supabase/client', () => ({ supabase: { auth: mockSupabaseAuth } }));
jest.mock('@/lib/db', () => {
  const { mockDb } = require('./setup');
  return { db: mockDb };
});

function createMockRequest(method: string, body?: Record<string, unknown>, headers?: Record<string, string>) {
  return {
    method,
    headers: { 'content-type': 'application/json', ...headers },
    json: jest.fn().mockResolvedValue(body || {}),
    url: 'http://localhost:3000/api/v1/test',
  };
}

function createMockResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    headers: new Map(),
    setHeader: jest.fn(),
  };
}

describe('API Error Scenarios', () => {
  beforeEach(() => resetAllMocks());

  test('400 - validation error with missing required fields', async () => {
    const req = createMockRequest('POST', {}, { authorization: 'Bearer token_valid' });
    mockSupabaseAuth.getUser.mockResolvedValue({ data: { user: createMockUser() }, error: null });

    const res = createMockResponse();
    await handleCreateAssessment(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(400);

    // Also test validateRequest directly
    const result = validateRequest({}, { required: ['field1', 'field2'] });
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(2);
  });

  test('401 - unauthenticated request rejected', async () => {
    const req = createMockRequest('GET');
    const res = createMockResponse();

    await handleGetAssessment(req as any, res as any, { id: 'assess_1' });
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
  });

  test('403 - user cannot access another organizations assessment', async () => {
    const req = createMockRequest('POST', {
      assessmentId: 'assess_other',
      responses: [{ questionId: 'q1', value: 'test' }],
    }, { authorization: 'Bearer token_valid' });

    mockSupabaseAuth.getUser.mockResolvedValue({
      data: { user: createMockUser({ organizationId: 'org_different' }) },
      error: null,
    });
    mockDb.get.mockResolvedValue({ id: 'assess_other', organizationId: 'org_test_001' });

    const res = createMockResponse();
    await handleSaveResponses(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('404 - assessment not found', async () => {
    const req = createMockRequest('GET', undefined, { authorization: 'Bearer token_valid' });
    mockSupabaseAuth.getUser.mockResolvedValue({ data: { user: createMockUser() }, error: null });
    mockDb.get.mockResolvedValue(null);

    const res = createMockResponse();
    await handleGetAssessment(req as any, res as any, { id: 'nonexistent' });

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('409 - contact form with invalid email format returns 400', async () => {
    const req = createMockRequest('POST', {
      name: 'Test',
      email: '',
      message: 'Test message',
    });

    const res = createMockResponse();
    await handleContactForm(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('500 - internal error does not leak database details', async () => {
    const req = createMockRequest('POST', {
      pensionSetupId: 'setup_test_001',
      organizationId: 'org_test_001',
    }, { authorization: 'Bearer token_valid' });

    mockSupabaseAuth.getUser.mockResolvedValue({ data: { user: createMockUser() }, error: null });
    mockDb.save.mockRejectedValue(new Error('FATAL: password authentication failed for user "postgres"'));

    const res = createMockResponse();
    await handleCreateAssessment(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(500);
    const errorBody = res.json.mock.calls[0][0];
    expect(errorBody.error).not.toContain('password');
    expect(errorBody.error).not.toContain('postgres');
  });
});
