import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/lib/api/middleware';
import { markComplete } from '@/lib/actions/tracker';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireAuth(req, res);
  if (!user) return;

  if (req.method === 'PATCH') {
    try {
      const item = await markComplete(req.query.id as string, user.id);
      return res.status(200).json(item);
    } catch (e: any) {
      return res.status(404).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
