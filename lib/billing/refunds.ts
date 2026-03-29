import { initializeStripe } from '../stripe';

export interface Refund {
  id: string;
  paymentIntentId: string;
  amountCents: number;
  currency: string;
  status: string;
  reason: string | null;
  createdAt: Date;
}

export async function processRefund(
  paymentIntentId: string,
  amountCents?: number,
  reason?: string
): Promise<Refund> {
  const stripe = initializeStripe();

  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    ...(amountCents && { amount: amountCents }),
    ...(reason && { reason: reason as any }),
  });

  return mapRefund(refund);
}

export async function listRefunds(paymentIntentId?: string): Promise<Refund[]> {
  const stripe = initializeStripe();

  const params: any = { limit: 100 };
  if (paymentIntentId) {
    params.payment_intent = paymentIntentId;
  }

  const result = await stripe.refunds.list(params);
  return result.data.map(mapRefund);
}

export async function updateRefundStatus(
  refundId: string,
  metadata: Record<string, string>
): Promise<Refund> {
  const stripe = initializeStripe();
  const refund = await stripe.refunds.update(refundId, { metadata });
  return mapRefund(refund);
}

function mapRefund(ref: any): Refund {
  return {
    id: ref.id,
    paymentIntentId: ref.payment_intent as string,
    amountCents: ref.amount,
    currency: ref.currency,
    status: ref.status,
    reason: ref.reason || null,
    createdAt: new Date(ref.created * 1000),
  };
}
