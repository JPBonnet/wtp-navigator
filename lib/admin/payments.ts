/**
 * Admin Payment Tracking
 * List, stats, and refund operations for payments
 */

export interface AdminPayment {
  id: string;
  userId: string;
  email: string;
  stripeSessionId: string;
  amountCents: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: string;
}

export interface PaymentStats {
  totalRevenue: number;
  totalPayments: number;
  completedPayments: number;
  refundedPayments: number;
  refundedAmount: number;
  averageAmount: number;
}

export interface PaymentListParams {
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: 'created_at' | 'amountCents';
  sortOrder?: 'asc' | 'desc';
}

const paymentStore: AdminPayment[] = [];

export function resetPaymentStore() {
  paymentStore.length = 0;
}

export function seedPayments(payments: AdminPayment[]) {
  paymentStore.length = 0;
  paymentStore.push(...payments);
}

export async function listPayments(params: PaymentListParams = {}): Promise<{ payments: AdminPayment[]; total: number; page: number; limit: number }> {
  const { page = 1, limit = 20, status, sortBy = 'created_at', sortOrder = 'desc' } = params;

  let filtered = [...paymentStore];
  if (status) filtered = filtered.filter(p => p.status === status);

  filtered.sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortOrder === 'desc' ? -cmp : cmp;
  });

  const total = filtered.length;
  const start = (page - 1) * limit;
  const payments = filtered.slice(start, start + limit);

  return { payments, total, page, limit };
}

export async function getPaymentStats(): Promise<PaymentStats> {
  const completed = paymentStore.filter(p => p.status === 'completed');
  const refunded = paymentStore.filter(p => p.status === 'refunded');

  return {
    totalRevenue: completed.reduce((sum, p) => sum + p.amountCents, 0),
    totalPayments: paymentStore.length,
    completedPayments: completed.length,
    refundedPayments: refunded.length,
    refundedAmount: refunded.reduce((sum, p) => sum + p.amountCents, 0),
    averageAmount: completed.length > 0
      ? Math.round(completed.reduce((sum, p) => sum + p.amountCents, 0) / completed.length)
      : 0,
  };
}

export async function refundPayment(id: string): Promise<AdminPayment | null> {
  const payment = paymentStore.find(p => p.id === id);
  if (!payment) return null;
  if (payment.status !== 'completed') return null;

  payment.status = 'refunded';
  return { ...payment };
}
