import type { NextApiRequest, NextApiResponse } from 'next';
import { createCheckoutSession } from '@/lib/stripe';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, assessmentId, email } = req.body;

  if (!userId || !assessmentId || !email) {
    return res.status(400).json({ error: 'Missing required fields: userId, assessmentId, email' });
  }

  try {
    const { sessionId, url } = await createCheckoutSession(userId, assessmentId);
    return res.status(200).json({ sessionId, checkoutUrl: url });
  } catch (error) {
    console.error('Checkout session creation failed:', error);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
