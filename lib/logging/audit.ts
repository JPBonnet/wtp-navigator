/**
 * Activity / Audit Logging
 * Logs all admin actions with actor, action, entity, and changes
 */

export interface AuditLogEntry {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  created_at: string;
}

export interface AuditLogParams {
  page?: number;
  limit?: number;
  actorId?: string;
  entityType?: string;
  action?: string;
}

const auditStore: AuditLogEntry[] = [];
let auditCounter = 0;

export function resetAuditStore() {
  auditStore.length = 0;
  auditCounter = 0;
}

export async function logAction(params: {
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
}): Promise<AuditLogEntry> {
  auditCounter++;
  const entry: AuditLogEntry = {
    id: `audit_${auditCounter}`,
    actorId: params.actorId,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    changes: params.changes,
    ipAddress: params.ipAddress,
    created_at: new Date().toISOString(),
  };
  auditStore.push(entry);
  return { ...entry };
}

export async function getAuditLogs(params: AuditLogParams = {}): Promise<{ logs: AuditLogEntry[]; total: number; page: number; limit: number }> {
  const { page = 1, limit = 50, actorId, entityType, action } = params;

  let filtered = [...auditStore];
  if (actorId) filtered = filtered.filter(e => e.actorId === actorId);
  if (entityType) filtered = filtered.filter(e => e.entityType === entityType);
  if (action) filtered = filtered.filter(e => e.action === action);

  // Most recent first
  filtered.sort((a, b) => b.created_at.localeCompare(a.created_at));

  const total = filtered.length;
  const start = (page - 1) * limit;
  const logs = filtered.slice(start, start + limit);

  return { logs, total, page, limit };
}
