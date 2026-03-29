import type { NextApiRequest, NextApiResponse } from 'next';
import { getSharedReport } from '@/lib/sharing/reports';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const token = req.query.token as string;
    const report = await getSharedReport(token);
    if (!report) return res.status(404).json({ error: 'Report not found or expired' });
    return res.status(200).json(report);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
