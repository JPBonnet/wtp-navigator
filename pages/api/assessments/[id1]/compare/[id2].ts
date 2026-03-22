import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/lib/api/middleware';
import { compareAssessments } from '@/lib/assessment/compare';

// In production, fetch from DB. Here we accept snapshots via query params or body.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireAuth(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    const { snapshotA, snapshotB } = req.body || {};
    if (!snapshotA || !snapshotB) {
      return res.status(400).json({ error: 'snapshotA and snapshotB are required in body' });
    }
    const result = compareAssessments(snapshotA, snapshotB);
    return res.status(200).json(result);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
