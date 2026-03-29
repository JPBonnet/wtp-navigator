/**
 * Admin Reports
 * CSV export for users and payments
 */

import { AdminUser } from '@/lib/admin/users';
import { AdminPayment } from '@/lib/admin/payments';

export function generateUsersCsv(users: AdminUser[]): string {
  const header = 'id,email,organizationId,role,status,verified,created_at';
  const rows = users.map(u =>
    `${u.id},${u.email},${u.organizationId},${u.role},${u.status},${u.verified},${u.created_at}`
  );
  return [header, ...rows].join('\n');
}

export function generatePaymentsCsv(payments: AdminPayment[]): string {
  const header = 'id,userId,email,stripeSessionId,amountCents,status,created_at';
  const rows = payments.map(p =>
    `${p.id},${p.userId},${p.email},${p.stripeSessionId},${p.amountCents},${p.status},${p.created_at}`
  );
  return [header, ...rows].join('\n');
}
