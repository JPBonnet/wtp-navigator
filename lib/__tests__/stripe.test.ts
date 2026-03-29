/**
 * Wtp Navigator - Stripe Payment Integration Tests
 *
 * Tests for checkout session creation, webhook handling,
 * and purchase verification. All Stripe interactions are mocked.
 */

import {
  resetAllMocks,
  mockStripe,
  createMockStripeEvent,
  createMockUser,
} from './setup';

// ─── Module stubs (to be implemented) ─────────────────────────────

import {
  createCheckoutSession,
} from '@/lib/payments/checkout';

import {
  handleStripeWebhook,
  getWebhookLogs,
} from '@/lib/payments/webhook-handler';

import {
  verifyUserPurchase,
  getUserPurchases,
} from '@/lib/payments/purchase-verification';

// ─── Mock Stripe SDK ──────────────────────────────────────────────

jest.mock('stripe', () => {
  return jest.fn(() => mockStripe);
});

// ─── StripeCheckout ───────────────────────────────────────────────

describe('StripeCheckout', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  test('creates checkout session with correct amount (€999 = 99900 cents) and EUR currency', async () => {
    mockStripe.checkout.sessions.create.mockResolvedValue({
      id: 'cs_test_001',
      url: 'https://checkout.stripe.com/pay/cs_test_001',
      amount_total: 99900,
      currency: 'eur',
      metadata: { userId: 'user_test_001', productType: 'assessment' },
    });

    const session = await createCheckoutSession('user_test_001', 'assessment');

    expect(session.amount_total).toBe(99900);
    expect(session.currency).toBe('eur');
  });

  test('returns a Stripe-hosted checkout URL', async () => {
    mockStripe.checkout.sessions.create.mockResolvedValue({
      id: 'cs_test_002',
      url: 'https://checkout.stripe.com/pay/cs_test_002',
      amount_total: 99900,
      currency: 'eur',
      metadata: { userId: 'user_test_001', productType: 'assessment' },
    });

    const session = await createCheckoutSession('user_test_001', 'assessment');

    expect(session.url).toBeDefined();
    expect(session.url).toContain('stripe.com');
  });

  test('attaches userId and productType as metadata', async () => {
    mockStripe.checkout.sessions.create.mockResolvedValue({
      id: 'cs_test_003',
      url: 'https://checkout.stripe.com/pay/cs_test_003',
      amount_total: 99900,
      currency: 'eur',
      metadata: { userId: 'user_test_001', productType: 'assessment' },
    });

    const session = await createCheckoutSession('user_test_001', 'assessment');

    expect(session.metadata).toEqual({
      userId: 'user_test_001',
      productType: 'assessment',
    });
  });

  test('throws error when Stripe API call fails', async () => {
    mockStripe.checkout.sessions.create.mockRejectedValue(
      new Error('Stripe API error: card_declined')
    );

    await expect(
      createCheckoutSession('user_test_001', 'assessment')
    ).rejects.toThrow('Stripe API error');
  });
});

// ─── StripeWebhookHandler ─────────────────────────────────────────

describe('StripeWebhookHandler', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  test('processes checkout.session.completed and grants assessment access', async () => {
    const event = createMockStripeEvent('checkout.session.completed', {
      id: 'cs_test_completed',
      customer_email: 'jan@example.nl',
      metadata: { userId: 'user_test_001', productType: 'assessment' },
    });

    const result = await handleStripeWebhook(event);

    expect(result.success).toBe(true);
    expect(result.action).toBe('grant_assessment_access');
  });

  test('records purchase in user purchases after successful payment', async () => {
    const event = createMockStripeEvent('checkout.session.completed', {
      metadata: { userId: 'user_test_001', productType: 'assessment' },
    });

    await handleStripeWebhook(event);
    const purchases = await getUserPurchases('user_test_001');

    expect(purchases).toContainEqual(
      expect.objectContaining({ status: 'completed', productType: 'assessment' })
    );
  });

  test('logs webhook event for audit trail', async () => {
    const event = createMockStripeEvent('payment_intent.succeeded', {});

    await handleStripeWebhook(event);
    const logs = await getWebhookLogs();

    expect(logs).toContainEqual(
      expect.objectContaining({ eventType: 'payment_intent.succeeded' })
    );
  });

  test('handles unknown webhook event types gracefully', async () => {
    const event = createMockStripeEvent('unknown.event.type', {});

    const result = await handleStripeWebhook(event);

    expect(result.success).toBe(true);
    expect(result.action).toBe('ignored');
  });

  test('returns error result when webhook processing fails', async () => {
    // Simulate a malformed event
    const malformedEvent = { id: null, type: null, data: null };

    const result = await handleStripeWebhook(malformedEvent as any);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

// ─── PurchaseVerification ─────────────────────────────────────────

describe('PurchaseVerification', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  test('returns true when user has a completed purchase for the product', async () => {
    // Simulate a completed purchase already stored
    const event = createMockStripeEvent('checkout.session.completed', {
      metadata: { userId: 'user_paid', productType: 'assessment' },
    });
    await handleStripeWebhook(event);

    const hasPurchase = await verifyUserPurchase('user_paid', 'assessment');

    expect(hasPurchase).toBe(true);
  });

  test('returns false when user has no purchases', async () => {
    const hasPurchase = await verifyUserPurchase('user_no_purchase', 'assessment');

    expect(hasPurchase).toBe(false);
  });

  test('returns false when user purchased a different product', async () => {
    const event = createMockStripeEvent('checkout.session.completed', {
      metadata: { userId: 'user_other', productType: 'expert_review' },
    });
    await handleStripeWebhook(event);

    const hasPurchase = await verifyUserPurchase('user_other', 'assessment');

    expect(hasPurchase).toBe(false);
  });
});
