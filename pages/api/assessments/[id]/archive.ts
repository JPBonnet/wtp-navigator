import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/lib/api/middleware';
import { archiveAssessment } from '@/lib/assessment/multiple';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireAuth(req, res);
  if (!user) return;

  if (req.method === 'PATCH') {
    try {
      const assessment = await archiveAssessment(req.query.id as string, user.id);
      return res.status(200).json(assessment);
    } catch (e: any) {
      return res.status(404).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
