import type { NextApiRequest, NextApiResponse } from 'next';
import { validateWebhookSignature, processPaymentSuccess, processPaymentFailure } from '@/lib/stripe';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const signature = req.headers['stripe-signature'] as string;
  if (!signature) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  const rawBody = await getRawBody(req);

  if (!validateWebhookSignature(signature, rawBody)) {
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  const event = JSON.parse(rawBody.toString());

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { license } = await processPaymentSuccess(session.id);
        console.log(`License issued: ${license.id} for user ${license.userId}`);
        break;
      }
      case 'checkout.session.expired':
      case 'payment_intent.payment_failed': {
        const session = event.data.object;
        await processPaymentFailure(session.id);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}
