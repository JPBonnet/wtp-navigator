import { initializeStripe } from '../stripe';

export interface Subscription {
  id: string;
  customerId: string;
  priceId: string;
  status: string;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export type PlanInterval = 'month' | 'year';

const PLANS: Record<string, { priceId: string; name: string }> = {
  basic: { priceId: 'price_basic', name: 'Basic' },
  professional: { priceId: 'price_professional', name: 'Professional' },
  enterprise: { priceId: 'price_enterprise', name: 'Enterprise' },
};

export async function createSubscription(
  customerId: string,
  plan: string,
  paymentMethodId?: string
): Promise<Subscription> {
  const stripe = initializeStripe();
  const planConfig = PLANS[plan];
  if (!planConfig) {
    throw new Error(`Unknown plan: ${plan}`);
  }

  if (paymentMethodId) {
    await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });
  }

  const sub = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: planConfig.priceId }],
    expand: ['latest_invoice.payment_intent'],
  });

  return mapSubscription(sub);
}

export async function cancelSubscription(subscriptionId: string): Promise<Subscription> {
  const stripe = initializeStripe();
  const sub = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
  return mapSubscription(sub);
}

export async function changePlan(
  subscriptionId: string,
  newPlan: string
): Promise<Subscription> {
  const stripe = initializeStripe();
  const planConfig = PLANS[newPlan];
  if (!planConfig) {
    throw new Error(`Unknown plan: ${newPlan}`);
  }

  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  const updated = await stripe.subscriptions.update(subscriptionId, {
    items: [{ id: sub.items.data[0].id, price: planConfig.priceId }],
    proration_behavior: 'create_prorations',
  });

  return mapSubscription(updated);
}

function mapSubscription(sub: any): Subscription {
  return {
    id: sub.id,
    customerId: sub.customer as string,
    priceId: sub.items.data[0].price.id,
    status: sub.status,
    currentPeriodEnd: new Date(sub.current_period_end * 1000),
    cancelAtPeriodEnd: sub.cancel_at_period_end,
  };
}
