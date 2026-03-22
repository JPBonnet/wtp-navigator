import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/lib/api/middleware';
import { createActionItem, listPending } from '@/lib/actions/tracker';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireAuth(req, res);
  if (!user) return;

  if (req.method === 'POST') {
    const { assessmentId, title, description, priority, dueDate } = req.body;
    if (!assessmentId || !title) return res.status(400).json({ error: 'assessmentId and title are required' });
    const item = await createActionItem(assessmentId, user.id, title, description || '', priority, dueDate ? new Date(dueDate) : null);
    return res.status(201).json(item);
  }

  if (req.method === 'GET') {
    const items = await listPending(user.id);
    return res.status(200).json(items);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
