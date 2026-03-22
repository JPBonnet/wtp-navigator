/**
 * Wtp Navigator - API Route Tests
 *
 * Tests for Next.js API route handlers covering assessment CRUD,
 * response management, contact form, Stripe webhooks,
 * request validation, and error responses.
 */

import {
  resetAllMocks,
  mockDb,
  mockStripe,
  mockResend,
  mockSupabaseAuth,
  createMockUser,
  createMockPensionSetup,
  createMockAssessmentResult,
  createMockStripeEvent,
} from './setup';

// ─── Module stubs (to be implemented) ─────────────────────────────

import {
  handleCreateAssessment,
  handleGetAssessment,
  handleListAssessments,
} from '@/lib/api/assessments';

import {
  handleSaveResponses,
  handleGetResponses,
} from '@/lib/api/responses';

import {
  handleContactForm,
} from '@/lib/api/contact';

import {
  handleStripeWebhookRoute,
} from '@/lib/api/stripe-webhook';

import {
  validateRequest,
  requireAuth,
  requireOrganization,
} from '@/lib/api/middleware';

// ─── Mock External Services ──────────────────────────────────────

jest.mock('stripe', () => jest.fn(() => mockStripe));
jest.mock('resend', () => jest.fn(() => mockResend));
jest.mock('@/lib/supabase/client', () => ({
  supabase: { auth: mockSupabaseAuth },
}));
jest.mock('@/lib/db', () => {
  const { mockDb } = require('./setup');
  return { db: mockDb };
});

// ─── Request/Response Helpers ────────────────────────────────────

function createMockRequest(method: string, body?: Record<string, unknown>, headers?: Record<string, string>) {
  return {
    method,
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    json: jest.fn().mockResolvedValue(body || {}),
    url: 'http://localhost:3000/api/v1/test',
  };
}

function createMockResponse() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    headers: new Map(),
    setHeader: jest.fn(),
  };
  return res;
}

// ─── POST /api/assessments ───────────────────────────────────────

describe('POST /api/assessments', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  test('creates a new assessment and returns 201 with assessment data', async () => {
    const req = createMockRequest('POST', {
      pensionSetupId: 'setup_test_001',
      organizationId: 'org_test_001',
    }, { authorization: 'Bearer token_valid' });

    mockSupabaseAuth.getUser.mockResolvedValue({
      data: { user: createMockUser() },
      error: null,
    });

    const res = createMockResponse();
    await handleCreateAssessment(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        pensionSetupId: 'setup_test_001',
      })
    );
  });

  test('returns 401 when no authorization header is present', async () => {
    const req = createMockRequest('POST', {
      pensionSetupId: 'setup_test_001',
    });

    const res = createMockResponse();
    await handleCreateAssessment(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) })
    );
  });

  test('returns 400 when pensionSetupId is missing', async () => {
    const req = createMockRequest('POST', {}, {
      authorization: 'Bearer token_valid',
    });

    mockSupabaseAuth.getUser.mockResolvedValue({
      data: { user: createMockUser() },
      error: null,
    });

    const res = createMockResponse();
    await handleCreateAssessment(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 500 when database operation fails', async () => {
    const req = createMockRequest('POST', {
      pensionSetupId: 'setup_test_001',
      organizationId: 'org_test_001',
    }, { authorization: 'Bearer token_valid' });

    mockSupabaseAuth.getUser.mockResolvedValue({
      data: { user: createMockUser() },
      error: null,
    });

    mockDb.save.mockRejectedValue(new Error('Database connection lost'));

    const res = createMockResponse();
    await handleCreateAssessment(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── POST /api/assessments/[id]/responses ────────────────────────

describe('POST /api/assessments/[id]/responses', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  test('saves multiple responses and returns 200', async () => {
    const req = createMockRequest('POST', {
      assessmentId: 'assess_test_001',
      responses: [
        { questionId: 'q_scheme_type', value: 'defined_benefit' },
        { questionId: 'q_provider', value: 'APG' },
        { questionId: 'q_participants', value: '150' },
      ],
    }, { authorization: 'Bearer token_valid' });

    mockSupabaseAuth.getUser.mockResolvedValue({
      data: { user: createMockUser() },
      error: null,
    });

    mockDb.get.mockResolvedValue({
      id: 'assess_test_001',
      organizationId: 'org_test_001',
    });

    const res = createMockResponse();
    await handleSaveResponses(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        saved: 3,
      })
    );
  });

  test('returns 400 when responses array is empty', async () => {
    const req = createMockRequest('POST', {
      assessmentId: 'assess_test_001',
      responses: [],
    }, { authorization: 'Bearer token_valid' });

    mockSupabaseAuth.getUser.mockResolvedValue({
      data: { user: createMockUser() },
      error: null,
    });

    const res = createMockResponse();
    await handleSaveResponses(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 403 when user does not own the assessment', async () => {
    const req = createMockRequest('POST', {
      assessmentId: 'assess_other_org',
      responses: [{ questionId: 'q1', value: 'test' }],
    }, { authorization: 'Bearer token_valid' });

    mockSupabaseAuth.getUser.mockResolvedValue({
      data: { user: createMockUser({ organizationId: 'org_different' }) },
      error: null,
    });

    mockDb.get.mockResolvedValue({
      id: 'assess_other_org',
      organizationId: 'org_test_001',
    });

    const res = createMockResponse();
    await handleSaveResponses(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});

// ─── GET /api/assessments/[id] ───────────────────────────────────

describe('GET /api/assessments/[id]', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  test('returns assessment data with responses for authenticated user', async () => {
    const req = createMockRequest('GET', undefined, {
      authorization: 'Bearer token_valid',
    });

    mockSupabaseAuth.getUser.mockResolvedValue({
      data: { user: createMockUser() },
      error: null,
    });

    mockDb.get.mockResolvedValue({
      id: 'assess_test_001',
      pensionSetupId: 'setup_test_001',
      organizationId: 'org_test_001',
      riskScore: 7,
      status: 'completed',
    });

    const res = createMockResponse();
    await handleGetAssessment(req as any, res as any, { id: 'assess_test_001' });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'assess_test_001' })
    );
  });

  test('returns 404 when assessment does not exist', async () => {
    const req = createMockRequest('GET', undefined, {
      authorization: 'Bearer token_valid',
    });

    mockSupabaseAuth.getUser.mockResolvedValue({
      data: { user: createMockUser() },
      error: null,
    });

    mockDb.get.mockResolvedValue(null);

    const res = createMockResponse();
    await handleGetAssessment(req as any, res as any, { id: 'nonexistent' });

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('returns 401 when session token is expired', async () => {
    const req = createMockRequest('GET', undefined, {
      authorization: 'Bearer expired_token',
    });

    mockSupabaseAuth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'JWT expired' },
    });

    const res = createMockResponse();
    await handleGetAssessment(req as any, res as any, { id: 'assess_test_001' });

    expect(res.status).toHaveBeenCalledWith(401);
  });
});

// ─── POST /api/contact ───────────────────────────────────────────

describe('POST /api/contact', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  test('submits contact form and returns 200', async () => {
    const req = createMockRequest('POST', {
      name: 'Jan de Vries',
      email: 'jan@pensioenbedrijf.nl',
      company: 'Pensioen Advies BV',
      message: 'Ik wil graag meer informatie over de Wtp assessment tool.',
    });

    mockResend.emails.send.mockResolvedValue({ id: 'contact_email_001' });

    const res = createMockResponse();
    await handleContactForm(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockResend.emails.send).toHaveBeenCalled();
  });

  test('returns 400 when email is missing from contact form', async () => {
    const req = createMockRequest('POST', {
      name: 'Jan de Vries',
      message: 'Test message',
    });

    const res = createMockResponse();
    await handleContactForm(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 400 when message is missing from contact form', async () => {
    const req = createMockRequest('POST', {
      name: 'Jan de Vries',
      email: 'jan@test.nl',
    });

    const res = createMockResponse();
    await handleContactForm(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

// ─── POST /api/stripe/webhook ────────────────────────────────────

describe('POST /api/stripe/webhook', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  test('processes valid checkout.session.completed webhook', async () => {
    const event = createMockStripeEvent('checkout.session.completed', {
      metadata: { userId: 'user_test_001', productType: 'assessment' },
    });

    mockStripe.webhooks.constructEvent.mockReturnValue(event);

    const req = createMockRequest('POST', event, {
      'stripe-signature': 'sig_valid_test',
    });

    const res = createMockResponse();
    await handleStripeWebhookRoute(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('returns 400 when stripe signature verification fails', async () => {
    mockStripe.webhooks.constructEvent.mockImplementation(() => {
      throw new Error('Webhook signature verification failed');
    });

    const req = createMockRequest('POST', {}, {
      'stripe-signature': 'sig_invalid',
    });

    const res = createMockResponse();
    await handleStripeWebhookRoute(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 200 for unhandled but valid event types', async () => {
    const event = createMockStripeEvent('invoice.paid', {});
    mockStripe.webhooks.constructEvent.mockReturnValue(event);

    const req = createMockRequest('POST', event, {
      'stripe-signature': 'sig_valid_test',
    });

    const res = createMockResponse();
    await handleStripeWebhookRoute(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});

// ─── Request Validation Middleware ───────────────────────────────

describe('RequestValidation', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  test('validates required fields are present in request body', () => {
    const body = { pensionSetupId: 'setup_001', organizationId: 'org_001' };
    const schema = { required: ['pensionSetupId', 'organizationId'] };

    const result = validateRequest(body, schema);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('returns validation errors for missing required fields', () => {
    const body = { pensionSetupId: 'setup_001' };
    const schema = { required: ['pensionSetupId', 'organizationId'] };

    const result = validateRequest(body, schema);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('organizationId is required');
  });

  test('requireAuth rejects request without authorization header', async () => {
    const req = createMockRequest('GET');
    const res = createMockResponse();

    const user = await requireAuth(req as any, res as any);

    expect(user).toBeNull();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('requireAuth returns user for valid token', async () => {
    const req = createMockRequest('GET', undefined, {
      authorization: 'Bearer token_valid',
    });
    const res = createMockResponse();

    mockSupabaseAuth.getUser.mockResolvedValue({
      data: { user: createMockUser() },
      error: null,
    });

    const user = await requireAuth(req as any, res as any);

    expect(user).not.toBeNull();
    expect(user.id).toBe('user_test_001');
  });

  test('requireOrganization returns 403 when user has no organization', async () => {
    const user = createMockUser({ organizationId: null });
    const res = createMockResponse();

    const org = await requireOrganization(user, res as any);

    expect(org).toBeNull();
    expect(res.status).toHaveBeenCalledWith(403);
  });
});

// ─── Error Response Consistency ──────────────────────────────────

describe('ErrorResponses', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  test('401 responses include an error message', async () => {
    const req = createMockRequest('GET');
    const res = createMockResponse();

    await handleGetAssessment(req as any, res as any, { id: 'assess_test_001' });

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) })
    );
  });

  test('500 responses do not leak internal error details', async () => {
    const req = createMockRequest('POST', {
      pensionSetupId: 'setup_test_001',
      organizationId: 'org_test_001',
    }, { authorization: 'Bearer token_valid' });

    mockSupabaseAuth.getUser.mockResolvedValue({
      data: { user: createMockUser() },
      error: null,
    });

    mockDb.save.mockRejectedValue(new Error('FATAL: connection to database lost (pg_hba.conf)'));

    const res = createMockResponse();
    await handleCreateAssessment(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(500);
    const errorResponse = res.json.mock.calls[0][0];
    // Should not expose internal database details
    expect(errorResponse.error).not.toContain('pg_hba.conf');
  });
});
