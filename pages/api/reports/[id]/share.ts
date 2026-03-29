import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/lib/api/middleware';
import { generateShareLink, revokeShare } from '@/lib/sharing/reports';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireAuth(req, res);
  if (!user) return;
  const assessmentId = req.query.id as string;

  if (req.method === 'POST') {
    const { expiresInHours } = req.body || {};
    const share = await generateShareLink(assessmentId, user.id, expiresInHours);
    return res.status(201).json(share);
  }

  if (req.method === 'DELETE') {
    try {
      await revokeShare(assessmentId, user.id);
      return res.status(204).end();
    } catch (e: any) {
      return res.status(404).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
