import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/lib/api/middleware';
import { compareVersions } from '@/lib/assessment/history';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireAuth(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    const assessmentId = req.query.id as string;
    const v1 = parseInt(req.query.v1 as string, 10);
    const v2 = parseInt(req.query.v2 as string, 10);

    if (isNaN(v1) || isNaN(v2)) return res.status(400).json({ error: 'Invalid version numbers' });

    const result = await compareVersions(assessmentId, v1, v2);
    if (!result) return res.status(404).json({ error: 'Version not found' });
    return res.status(200).json(result);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
