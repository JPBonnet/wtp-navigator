/**
 * Admin Payment Tracking Tests
 */
import { listPayments, getPaymentStats, refundPayment, seedPayments, resetPaymentStore, AdminPayment } from '@/lib/admin/payments';

const testPayments: AdminPayment[] = [
  { id: 'p1', userId: 'u1', email: 'jan@example.nl', stripeSessionId: 'sess_1', amountCents: 99900, status: 'completed', created_at: '2026-01-10T00:00:00Z' },
  { id: 'p2', userId: 'u2', email: 'piet@example.nl', stripeSessionId: 'sess_2', amountCents: 49900, status: 'completed', created_at: '2026-01-15T00:00:00Z' },
  { id: 'p3', userId: 'u3', email: 'maria@example.nl', stripeSessionId: 'sess_3', amountCents: 99900, status: 'failed', created_at: '2026-01-20T00:00:00Z' },
  { id: 'p4', userId: 'u1', email: 'jan@example.nl', stripeSessionId: 'sess_4', amountCents: 29900, status: 'refunded', created_at: '2026-02-01T00:00:00Z' },
];

beforeEach(() => {
  seedPayments([...testPayments.map(p => ({ ...p }))]);
});

afterEach(() => resetPaymentStore());

describe('Admin Payment Tracking', () => {
  test('lists payments with pagination, filter, and sort', async () => {
    const result = await listPayments({ page: 1, limit: 2, sortBy: 'created_at', sortOrder: 'desc' });
    expect(result.payments).toHaveLength(2);
    expect(result.total).toBe(4);
    expect(result.payments[0].id).toBe('p4'); // most recent

    const completed = await listPayments({ status: 'completed' });
    expect(completed.total).toBe(2);

    const byAmount = await listPayments({ sortBy: 'amountCents', sortOrder: 'asc' });
    expect(byAmount.payments[0].amountCents).toBe(29900);
  });

  test('returns payment stats', async () => {
    const stats = await getPaymentStats();
    expect(stats.totalPayments).toBe(4);
    expect(stats.completedPayments).toBe(2);
    expect(stats.totalRevenue).toBe(149800); // 99900 + 49900
    expect(stats.refundedPayments).toBe(1);
    expect(stats.refundedAmount).toBe(29900);
    expect(stats.averageAmount).toBe(74900); // 149800 / 2
  });

  test('refunds a completed payment', async () => {
    const refunded = await refundPayment('p1');
    expect(refunded).not.toBeNull();
    expect(refunded!.status).toBe('refunded');

    // Cannot refund a failed payment
    const failedRefund = await refundPayment('p3');
    expect(failedRefund).toBeNull();

    // Cannot refund nonexistent
    const notFound = await refundPayment('nonexistent');
    expect(notFound).toBeNull();
  });
});
