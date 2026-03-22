/**
 * Activity / Audit Logging Tests
 */
import { logAction, getAuditLogs, resetAuditStore } from '@/lib/logging/audit';

beforeEach(() => resetAuditStore());

describe('Audit Logging', () => {
  test('logs actions and retrieves them', async () => {
    await logAction({
      actorId: 'admin_1',
      action: 'user.ban',
      entityType: 'user',
      entityId: 'u1',
      changes: { status: { from: 'active', to: 'banned' } },
      ipAddress: '192.168.1.1',
    });

    await logAction({
      actorId: 'admin_1',
      action: 'ticket.create',
      entityType: 'ticket',
      entityId: 'ticket_1',
    });

    await logAction({
      actorId: 'admin_2',
      action: 'payment.refund',
      entityType: 'payment',
      entityId: 'p1',
      changes: { status: { from: 'completed', to: 'refunded' } },
    });

    const all = await getAuditLogs();
    expect(all.total).toBe(3);
    expect(all.logs).toHaveLength(3);
  });

  test('filters audit logs by actor, entity type, and action', async () => {
    await logAction({ actorId: 'admin_1', action: 'user.ban', entityType: 'user', entityId: 'u1' });
    await logAction({ actorId: 'admin_1', action: 'user.delete', entityType: 'user', entityId: 'u2' });
    await logAction({ actorId: 'admin_2', action: 'payment.refund', entityType: 'payment', entityId: 'p1' });

    const byActor = await getAuditLogs({ actorId: 'admin_1' });
    expect(byActor.total).toBe(2);

    const byEntity = await getAuditLogs({ entityType: 'payment' });
    expect(byEntity.total).toBe(1);

    const byAction = await getAuditLogs({ action: 'user.ban' });
    expect(byAction.total).toBe(1);
    expect(byAction.logs[0].entityId).toBe('u1');
  });
});
