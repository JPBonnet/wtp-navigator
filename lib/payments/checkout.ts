import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2023-10-16' as any,
});

export async function createCheckoutSession(userId: string, productType: string) {
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
    metadata: {
      userId,
      productType,
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.wtpnavigator.nl'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.wtpnavigator.nl'}/checkout/cancel`,
  });

  return session;
}
