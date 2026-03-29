/**
 * Billing Comprehensive Tests - Extended coverage for subscriptions,
 * bulk discounts, invoices, payment methods, refunds, and error cases
 */

import { generateBulkQuote } from '@/lib/billing/bulk';

const mockSubscription = {
  id: 'sub_test_001',
  customer: 'cus_test_001',
  status: 'active',
  current_period_end: Math.floor(Date.now() / 1000) + 86400 * 30,
  cancel_at_period_end: false,
  items: { data: [{ id: 'si_test_001', price: { id: 'price_professional' } }] },
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
    attach: jest.fn().mockResolvedValue({ id: 'pm_test_002', type: 'card', card: { brand: 'mastercard', last4: '5555', exp_month: 6, exp_year: 2028 }, created: Math.floor(Date.now() / 1000) }),
    list: jest.fn().mockResolvedValue({ data: [] }),
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

import { createSubscription, cancelSubscription, changePlan } from '@/lib/billing/subscriptions';
import { createBulkPurchase } from '@/lib/billing/bulk';
import { listInvoices, getInvoicePdf, emailInvoice } from '@/lib/billing/invoices';
import { savePaymentMethod, listPaymentMethods, deletePaymentMethod } from '@/lib/billing/payment-methods';
import { processRefund, listRefunds, updateRefundStatus } from '@/lib/billing/refunds';

describe('Billing Comprehensive', () => {
  beforeEach(() => jest.clearAllMocks());

  test('subscription cancellation returns correct cancel state', async () => {
    const sub = await cancelSubscription('sub_test_001');
    expect(sub.cancelAtPeriodEnd).toBe(true);
    expect(sub.id).toBe('sub_test_001');
    expect(mockStripeApi.subscriptions.update).toHaveBeenCalledWith('sub_test_001', {
      cancel_at_period_end: true,
    });
  });

  test('bulk discount tiers apply correctly at boundaries', () => {
    const q4 = generateBulkQuote(4);
    expect(q4.discountPercent).toBe(0);
    expect(q4.unitPriceCents).toBe(99900);

    const q5 = generateBulkQuote(5);
    expect(q5.discountPercent).toBe(5);
    expect(q5.unitPriceCents).toBe(Math.round(99900 * 0.95));

    const q10 = generateBulkQuote(10);
    expect(q10.discountPercent).toBe(10);
    expect(q10.totalCents).toBe(q10.unitPriceCents * 10);

    const q50 = generateBulkQuote(50);
    expect(q50.discountPercent).toBe(20);

    const q100 = generateBulkQuote(100);
    expect(q100.discountPercent).toBe(30);
    expect(q100.totalCents).toBe(Math.round(99900 * 0.70) * 100);
  });

  test('invoice generation retrieves and maps invoice data', async () => {
    const invoices = await listInvoices('cus_test_001');
    expect(invoices).toHaveLength(1);
    expect(invoices[0].id).toBe('inv_test_001');
    expect(invoices[0].amountCents).toBe(99900);
    expect(invoices[0].currency).toBe('eur');
    expect(invoices[0].lines).toHaveLength(1);
    expect(invoices[0].lines[0].description).toBe('Assessment License');
  });

  test('payment method deletion detaches from Stripe', async () => {
    const result = await deletePaymentMethod('pm_test_001');
    expect(result.deleted).toBe(true);
    expect(mockStripeApi.paymentMethods.detach).toHaveBeenCalledWith('pm_test_001');
  });

  test('refund metadata update via updateRefundStatus', async () => {
    const updated = await updateRefundStatus('re_test_001', { note: 'approved' });
    expect(mockStripeApi.refunds.update).toHaveBeenCalledWith('re_test_001', {
      metadata: { note: 'approved' },
    });
    expect(updated.id).toBe('re_test_001');
  });

  test('subscription creation with unknown plan throws error', async () => {
    await expect(createSubscription('cus_test_001', 'nonexistent_plan')).rejects.toThrow('Unknown plan');
  });

  test('concurrent payment method operations remain isolated', async () => {
    const [pm1, pm2] = await Promise.all([
      savePaymentMethod('cus_test_001', 'pm_test_002'),
      savePaymentMethod('cus_test_001', 'pm_test_002'),
    ]);
    expect(pm1.id).toBe('pm_test_002');
    expect(pm2.id).toBe('pm_test_002');
    expect(mockStripeApi.paymentMethods.attach).toHaveBeenCalledTimes(2);
  });

  test('invoice PDF throws when not available', async () => {
    mockStripeApi.invoices.retrieve.mockResolvedValueOnce({ ...mockInvoice, invoice_pdf: null });
    await expect(getInvoicePdf('inv_no_pdf')).rejects.toThrow('Invoice PDF not available');
  });
});
