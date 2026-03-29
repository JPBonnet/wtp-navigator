import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/lib/api/middleware';
import { removeMember } from '@/lib/teams/management';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireAuth(req, res);
  if (!user) return;

  if (req.method === 'DELETE') {
    const teamId = req.query.id as string;
    const userId = req.query.userId as string;
    try {
      await removeMember(teamId, userId);
      return res.status(204).end();
    } catch (e: any) {
      return res.status(404).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
