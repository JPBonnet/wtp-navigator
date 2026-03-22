import Stripe from 'stripe';
import type { License, PaymentResult } from './stripe-types';

let stripeInstance: Stripe | null = null;

export function initializeStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16' as any,
    });
  }
  return stripeInstance;
}

export async function createCheckoutSession(
  userId: string,
  assessmentId: string
): Promise<{ sessionId: string; url: string }> {
  const stripe = initializeStripe();

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card', 'ideal'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          unit_amount: 99900,
          product_data: {
            name: 'Wtp Navigator Assessment',
            description: 'Comprehensive pension transition assessment and compliance report',
          },
        },
        quantity: 1,
      },
    ],
    metadata: { userId, assessmentId },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
  });

  return { sessionId: session.id, url: session.url! };
}

export function validateWebhookSignature(
  signature: string,
  body: string | Buffer
): boolean {
  const stripe = initializeStripe();
  try {
    stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    return true;
  } catch {
    return false;
  }
}

export async function processPaymentSuccess(
  sessionId: string
): Promise<{ license: License; expiresAt: Date }> {
  const stripe = initializeStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const userId = session.metadata?.userId;

  if (!userId) {
    throw new Error('Missing userId in session metadata');
  }

  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  const license: License = {
    id: `lic_${Date.now()}`,
    userId,
    expiresAt,
    active: true,
  };

  return { license, expiresAt };
}

export async function processPaymentFailure(sessionId: string): Promise<void> {
  // Payment failure is recorded via webhook handler.
  // Structured logging should be added when a logging framework is configured.
}

export async function createCustomer(
  userId: string,
  email: string
): Promise<string> {
  const stripe = initializeStripe();
  const customer = await stripe.customers.create({
    email,
    metadata: { userId },
  });
  return customer.id;
}

export async function getAllCharges(
  customerId: string
): Promise<Stripe.Charge[]> {
  const stripe = initializeStripe();
  const charges = await stripe.charges.list({ customer: customerId });
  return charges.data;
}
