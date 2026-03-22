import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/lib/api/middleware';
import { downloadTemplate } from '@/lib/templates/manager';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireAuth(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    const result = await downloadTemplate(req.query.id as string);
    if (!result) return res.status(404).json({ error: 'Template not found' });
    return res.status(200).json(result);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
