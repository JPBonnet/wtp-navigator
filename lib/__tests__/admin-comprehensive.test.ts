/**
 * Admin Comprehensive Tests - Extended coverage for user management,
 * analytics, payments, tickets, audit, health, reports, and permissions
 */
import { listUsers, updateUser, deleteUser, getUser, seedUsers, resetUserStore, AdminUser } from '@/lib/admin/users';
import { getOverview, seedAssessments, resetAnalyticsStore } from '@/lib/admin/analytics';
import { listPayments, getPaymentStats, refundPayment, seedPayments, resetPaymentStore, AdminPayment } from '@/lib/admin/payments';
import { createTicket, updateTicketStatus, addComment, resetTicketStore, getTickets } from '@/lib/admin/tickets';
import { logAction, getAuditLogs, resetAuditStore } from '@/lib/logging/audit';
import { getHealthStatus, getRecentErrors, recordError, resetHealthStore } from '@/lib/monitoring/health';
import { generateUsersCsv, generatePaymentsCsv } from '@/lib/reports/admin';

const testUsers: AdminUser[] = [
  { id: 'u1', email: 'jan@example.nl', organizationId: 'org1', role: 'owner', status: 'active', verified: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'u2', email: 'piet@example.nl', organizationId: 'org1', role: 'advisor', status: 'active', verified: true, created_at: '2026-01-02T00:00:00Z', updated_at: '2026-01-02T00:00:00Z' },
  { id: 'u3', email: 'maria@example.nl', organizationId: 'org2', role: 'viewer', status: 'unverified', verified: false, created_at: '2026-01-03T00:00:00Z', updated_at: '2026-01-03T00:00:00Z' },
];

const testPayments: AdminPayment[] = [
  { id: 'p1', userId: 'u1', email: 'jan@example.nl', stripeSessionId: 'sess_1', amountCents: 99900, status: 'completed', created_at: '2026-01-10T00:00:00Z' },
  { id: 'p2', userId: 'u2', email: 'piet@example.nl', stripeSessionId: 'sess_2', amountCents: 49900, status: 'completed', created_at: '2026-01-15T00:00:00Z' },
  { id: 'p3', userId: 'u3', email: 'maria@example.nl', stripeSessionId: 'sess_3', amountCents: 99900, status: 'failed', created_at: '2026-01-20T00:00:00Z' },
];

describe('Admin Comprehensive', () => {
  test('bans user, verifies audit trail, then unbans', async () => {
    seedUsers([...testUsers.map(u => ({ ...u }))]);
    resetAuditStore();

    const banned = await updateUser('u1', { status: 'banned' });
    expect(banned!.status).toBe('banned');

    await logAction({ actorId: 'admin_1', action: 'user.ban', entityType: 'user', entityId: 'u1', changes: { status: { from: 'active', to: 'banned' } } });

    const unbanned = await updateUser('u1', { status: 'active' });
    expect(unbanned!.status).toBe('active');

    await logAction({ actorId: 'admin_1', action: 'user.unban', entityType: 'user', entityId: 'u1', changes: { status: { from: 'banned', to: 'active' } } });

    const logs = await getAuditLogs({ entityType: 'user' });
    expect(logs.total).toBe(2);

    resetUserStore();
    resetAuditStore();
  });

  test('analytics returns consistent data with empty store', async () => {
    seedAssessments([]);
    const overview = await getOverview();
    expect(overview.totalAssessments).toBe(0);
    expect(overview.completedAssessments).toBe(0);
    expect(overview.averageScore).toBe(0);
    expect(overview.totalUsers).toBe(0);
    expect(overview.totalOrganizations).toBe(0);
    resetAnalyticsStore();
  });

  test('payment reconciliation - refund updates stats correctly', async () => {
    seedPayments([...testPayments.map(p => ({ ...p }))]);

    const statsBefore = await getPaymentStats();
    expect(statsBefore.completedPayments).toBe(2);
    expect(statsBefore.totalRevenue).toBe(149800);

    await refundPayment('p1');

    const statsAfter = await getPaymentStats();
    expect(statsAfter.completedPayments).toBe(1);
    expect(statsAfter.refundedPayments).toBe(1);
    expect(statsAfter.totalRevenue).toBe(49900);

    resetPaymentStore();
  });

  test('ticket escalation - status transitions through lifecycle', async () => {
    resetTicketStore();

    const ticket = await createTicket({
      subject: 'Urgent: data loss',
      description: 'Assessment data disappeared after save',
      contactEmail: 'jan@example.nl',
      priority: 'high',
    });
    expect(ticket.status).toBe('open');

    const inProgress = await updateTicketStatus(ticket.id, { status: 'in_progress', assignedTo: 'admin_1' });
    expect(inProgress!.status).toBe('in_progress');
    expect(inProgress!.assignedTo).toBe('admin_1');

    await addComment(ticket.id, 'admin_1', 'Investigating the issue');

    const resolved = await updateTicketStatus(ticket.id, { status: 'resolved' });
    expect(resolved!.status).toBe('resolved');

    const closed = await updateTicketStatus(ticket.id, { status: 'closed' });
    expect(closed!.status).toBe('closed');

    resetTicketStore();
  });

  test('audit log filtering with pagination', async () => {
    resetAuditStore();

    for (let i = 0; i < 5; i++) {
      await logAction({ actorId: 'admin_1', action: 'user.update', entityType: 'user', entityId: `u${i}` });
    }
    await logAction({ actorId: 'admin_2', action: 'payment.refund', entityType: 'payment', entityId: 'p1' });

    const page1 = await getAuditLogs({ page: 1, limit: 3 });
    expect(page1.logs).toHaveLength(3);
    expect(page1.total).toBe(6);

    const page2 = await getAuditLogs({ page: 2, limit: 3 });
    expect(page2.logs).toHaveLength(3);

    const byActor = await getAuditLogs({ actorId: 'admin_2' });
    expect(byActor.total).toBe(1);
    expect(byActor.logs[0].action).toBe('payment.refund');

    resetAuditStore();
  });

  test('health status degrades with many recent errors', async () => {
    resetHealthStore();

    const healthy = await getHealthStatus();
    expect(healthy.status).toBe('healthy');

    for (let i = 0; i < 15; i++) {
      recordError({ message: `Error ${i}`, endpoint: '/api/test', statusCode: 500 });
    }

    const degraded = await getHealthStatus();
    expect(degraded.status).toBe('degraded');

    resetHealthStore();
  });

  test('report generation with empty data returns header only', () => {
    const usersCsv = generateUsersCsv([]);
    const lines = usersCsv.split('\n');
    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain('id,email');

    const paymentsCsv = generatePaymentsCsv([]);
    const pLines = paymentsCsv.split('\n');
    expect(pLines).toHaveLength(1);
    expect(pLines[0]).toContain('id,userId');
  });

  test('permission validation - update nonexistent user returns null', async () => {
    seedUsers([...testUsers.map(u => ({ ...u }))]);

    const result = await updateUser('nonexistent', { status: 'banned' });
    expect(result).toBeNull();

    const deleteResult = await deleteUser('nonexistent');
    expect(deleteResult).toBe(false);

    const getResult = await getUser('nonexistent');
    expect(getResult).toBeNull();

    resetUserStore();
  });
});
