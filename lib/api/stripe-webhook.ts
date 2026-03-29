import Stripe from 'stripe';

const stripe = new (Stripe as any)(process.env.STRIPE_SECRET_KEY || '');

export async function handleStripeWebhookRoute(req: any, res: any) {
  const sig = req.headers?.['stripe-signature'];

  let event;
  try {
    const body = await req.json();
    event = stripe.webhooks.constructEvent(
      JSON.stringify(body),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err) {
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      // Process completed checkout
      break;
    }
    default:
      // Unhandled event type - acknowledge receipt
      break;
  }

  return res.status(200).json({ received: true });
}
