/**
 * Wtp Navigator - Advanced Billing Tests
 *
 * Tests for subscriptions, bulk licensing, invoices,
 * payment methods, and refunds.
 */

import { generateBulkQuote } from '@/lib/billing/bulk';

// ─── Mock Stripe ─────────────────────────────────────────────────

const mockSubscription = {
  id: 'sub_test_001',
  customer: 'cus_test_001',
  status: 'active',
  current_period_end: Math.floor(Date.now() / 1000) + 86400 * 30,
  cancel_at_period_end: false,
  items: {
    data: [{ id: 'si_test_001', price: { id: 'price_professional' } }],
  },
};

const mockInvoice = {
  id: 'inv_test_001',
  customer: 'cus_test_001',
  amount_due: 99900,
  currency: 'eur',
  status: 'paid',
  invoice_pdf: 'https://stripe.com/invoice/pdf/inv_test_001',
  created: Math.floor(Date.now() / 1000),
  lines: { data: [{ description: 'Assessment License', amount: 99900, quantity: 1 }] },
};

const mockPaymentMethod = {
  id: 'pm_test_001',
  type: 'card',
  card: { brand: 'visa', last4: '4242', exp_month: 12, exp_year: 2027 },
  created: Math.floor(Date.now() / 1000),
};

const mockRefund = {
  id: 're_test_001',
  payment_intent: 'pi_test_001',
  amount: 99900,
  currency: 'eur',
  status: 'succeeded',
  reason: 'requested_by_customer',
  created: Math.floor(Date.now() / 1000),
};

const mockStripeApi = {
  subscriptions: {
    create: jest.fn().mockResolvedValue(mockSubscription),
    update: jest.fn().mockResolvedValue({ ...mockSubscription, cancel_at_period_end: true }),
    retrieve: jest.fn().mockResolvedValue(mockSubscription),
  },
  customers: {
    update: jest.fn().mockResolvedValue({}),
    retrieve: jest.fn().mockResolvedValue({
      id: 'cus_test_001',
      invoice_settings: { default_payment_method: 'pm_test_001' },
    }),
  },
  paymentMethods: {
    attach: jest.fn().mockResolvedValue(mockPaymentMethod),
    list: jest.fn().mockResolvedValue({ data: [mockPaymentMethod] }),
    detach: jest.fn().mockResolvedValue({ id: 'pm_test_001', deleted: true }),
  },
  paymentIntents: {
    create: jest.fn().mockResolvedValue({ id: 'pi_test_001', status: 'succeeded' }),
  },
  invoices: {
    list: jest.fn().mockResolvedValue({ data: [mockInvoice] }),
    retrieve: jest.fn().mockResolvedValue(mockInvoice),
    sendInvoice: jest.fn().mockResolvedValue(mockInvoice),
  },
  refunds: {
    create: jest.fn().mockResolvedValue(mockRefund),
    list: jest.fn().mockResolvedValue({ data: [mockRefund] }),
    update: jest.fn().mockResolvedValue({ ...mockRefund, metadata: { note: 'approved' } }),
  },
};

jest.mock('@/lib/stripe', () => ({
  initializeStripe: () => mockStripeApi,
}));

// Import after mocking
import { createSubscription, cancelSubscription, changePlan } from '@/lib/billing/subscriptions';
import { createBulkPurchase } from '@/lib/billing/bulk';
import { listInvoices, getInvoicePdf, emailInvoice } from '@/lib/billing/invoices';
import { savePaymentMethod, listPaymentMethods, deletePaymentMethod } from '@/lib/billing/payment-methods';
import { processRefund, listRefunds } from '@/lib/billing/refunds';

// ─── Subscription Tests ─────────────────────────────────────────

describe('Subscriptions', () => {
  beforeEach(() => jest.clearAllMocks());

  test('creates a subscription for a customer', async () => {
    const sub = await createSubscription('cus_test_001', 'professional');

    expect(mockStripeApi.subscriptions.create).toHaveBeenCalledWith({
      customer: 'cus_test_001',
      items: [{ price: 'price_professional' }],
      expand: ['latest_invoice.payment_intent'],
    });
    expect(sub.id).toBe('sub_test_001');
    expect(sub.status).toBe('active');
    expect(sub.priceId).toBe('price_professional');
  });

  test('cancels a subscription at period end', async () => {
    const sub = await cancelSubscription('sub_test_001');

    expect(mockStripeApi.subscriptions.update).toHaveBeenCalledWith('sub_test_001', {
      cancel_at_period_end: true,
    });
    expect(sub.cancelAtPeriodEnd).toBe(true);
  });

  test('changes subscription plan with proration', async () => {
    mockStripeApi.subscriptions.update.mockResolvedValueOnce({
      ...mockSubscription,
      items: { data: [{ id: 'si_test_001', price: { id: 'price_enterprise' } }] },
    });

    const sub = await changePlan('sub_test_001', 'enterprise');

    expect(mockStripeApi.subscriptions.update).toHaveBeenCalledWith('sub_test_001', {
      items: [{ id: 'si_test_001', price: 'price_enterprise' }],
      proration_behavior: 'create_prorations',
    });
    expect(sub.priceId).toBe('price_enterprise');
  });
});

// ─── Bulk Licensing Tests ────────────────────────────────────────

describe('Bulk Licensing', () => {
  beforeEach(() => jest.clearAllMocks());

  test('generates bulk quote with volume discount', () => {
    const quote = generateBulkQuote(25);

    expect(quote.quantity).toBe(25);
    expect(quote.discountPercent).toBe(15);
    expect(quote.unitPriceCents).toBe(Math.round(99900 * 0.85));
    expect(quote.totalCents).toBe(quote.unitPriceCents * 25);
  });

  test('creates bulk purchase with license keys', async () => {
    const quote = generateBulkQuote(10);
    const purchase = await createBulkPurchase('cus_test_001', quote);

    expect(mockStripeApi.paymentIntents.create).toHaveBeenCalledWith({
      amount: quote.totalCents,
      currency: 'eur',
      customer: 'cus_test_001',
      metadata: {
        quoteId: quote.id,
        quantity: '10',
        type: 'bulk_purchase',
      },
    });
    expect(purchase.licenseKeys).toHaveLength(10);
    expect(purchase.status).toBe('completed');
  });

  test('applies correct discount tiers', () => {
    expect(generateBulkQuote(3).discountPercent).toBe(0);
    expect(generateBulkQuote(5).discountPercent).toBe(5);
    expect(generateBulkQuote(10).discountPercent).toBe(10);
    expect(generateBulkQuote(20).discountPercent).toBe(15);
    expect(generateBulkQuote(50).discountPercent).toBe(20);
    expect(generateBulkQuote(100).discountPercent).toBe(30);
  });
});

// ─── Invoice Tests ───────────────────────────────────────────────

describe('Invoices', () => {
  beforeEach(() => jest.clearAllMocks());

  test('lists invoices for a customer', async () => {
    const invoices = await listInvoices('cus_test_001');

    expect(mockStripeApi.invoices.list).toHaveBeenCalledWith({
      customer: 'cus_test_001',
      limit: 100,
    });
    expect(invoices).toHaveLength(1);
    expect(invoices[0].amountCents).toBe(99900);
    expect(invoices[0].status).toBe('paid');
  });

  test('gets invoice PDF URL', async () => {
    const result = await getInvoicePdf('inv_test_001');

    expect(result.url).toBe('https://stripe.com/invoice/pdf/inv_test_001');
  });

  test('emails invoice via Stripe', async () => {
    const result = await emailInvoice('inv_test_001');

    expect(mockStripeApi.invoices.sendInvoice).toHaveBeenCalledWith('inv_test_001');
    expect(result.sent).toBe(true);
  });
});

// ─── Payment Method Tests ────────────────────────────────────────

describe('Payment Methods', () => {
  beforeEach(() => jest.clearAllMocks());

  test('saves a payment method to customer', async () => {
    const pm = await savePaymentMethod('cus_test_001', 'pm_test_001');

    expect(mockStripeApi.paymentMethods.attach).toHaveBeenCalledWith('pm_test_001', {
      customer: 'cus_test_001',
    });
    expect(pm.id).toBe('pm_test_001');
    expect(pm.card?.last4).toBe('4242');
  });

  test('lists payment methods for customer', async () => {
    const methods = await listPaymentMethods('cus_test_001');

    expect(methods).toHaveLength(1);
    expect(methods[0].isDefault).toBe(true);
    expect(methods[0].card?.brand).toBe('visa');
  });

  test('deletes a payment method', async () => {
    const result = await deletePaymentMethod('pm_test_001');

    expect(mockStripeApi.paymentMethods.detach).toHaveBeenCalledWith('pm_test_001');
    expect(result.deleted).toBe(true);
  });
});

// ─── Refund Tests ────────────────────────────────────────────────

describe('Refunds', () => {
  beforeEach(() => jest.clearAllMocks());

  test('processes a full refund', async () => {
    const refund = await processRefund('pi_test_001');

    expect(mockStripeApi.refunds.create).toHaveBeenCalledWith({
      payment_intent: 'pi_test_001',
    });
    expect(refund.status).toBe('succeeded');
    expect(refund.amountCents).toBe(99900);
  });

  test('lists refunds for a payment intent', async () => {
    const refunds = await listRefunds('pi_test_001');

    expect(mockStripeApi.refunds.list).toHaveBeenCalledWith({
      limit: 100,
      payment_intent: 'pi_test_001',
    });
    expect(refunds).toHaveLength(1);
    expect(refunds[0].reason).toBe('requested_by_customer');
  });
});
