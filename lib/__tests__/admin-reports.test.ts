/**
 * Admin Reports (CSV Export) Tests
 */
import { generateUsersCsv, generatePaymentsCsv } from '@/lib/reports/admin';
import { AdminUser } from '@/lib/admin/users';
import { AdminPayment } from '@/lib/admin/payments';

describe('Admin Reports', () => {
  test('generates users CSV report', () => {
    const users: AdminUser[] = [
      { id: 'u1', email: 'jan@example.nl', organizationId: 'org1', role: 'owner', status: 'active', verified: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
      { id: 'u2', email: 'piet@example.nl', organizationId: 'org1', role: 'advisor', status: 'banned', verified: true, created_at: '2026-01-02T00:00:00Z', updated_at: '2026-01-02T00:00:00Z' },
    ];

    const csv = generateUsersCsv(users);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('id,email,organizationId,role,status,verified,created_at');
    expect(lines).toHaveLength(3);
    expect(lines[1]).toContain('jan@example.nl');
    expect(lines[2]).toContain('banned');
  });

  test('generates payments CSV report', () => {
    const payments: AdminPayment[] = [
      { id: 'p1', userId: 'u1', email: 'jan@example.nl', stripeSessionId: 'sess_1', amountCents: 99900, status: 'completed', created_at: '2026-01-10T00:00:00Z' },
    ];

    const csv = generatePaymentsCsv(payments);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('id,userId,email,stripeSessionId,amountCents,status,created_at');
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain('99900');
    expect(lines[1]).toContain('completed');
  });
});
