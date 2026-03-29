import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/lib/api/middleware';
import { getHistory } from '@/lib/assessment/history';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireAuth(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    const history = await getHistory(req.query.id as string);
    return res.status(200).json(history);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
