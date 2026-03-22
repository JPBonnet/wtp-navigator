import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth, requireOrganization } from '@/lib/api/middleware';
import { listTemplates, createCustomTemplate } from '@/lib/templates/manager';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireAuth(req, res);
  if (!user) return;
  const orgId = await requireOrganization(user, res);
  if (!orgId) return;

  if (req.method === 'GET') {
    const templates = await listTemplates(orgId);
    return res.status(200).json(templates);
  }

  if (req.method === 'POST') {
    const { name, description, category, content } = req.body;
    if (!name || !content) return res.status(400).json({ error: 'name and content are required' });
    const template = await createCustomTemplate(name, description || '', category || 'custom', content, user.id, orgId);
    return res.status(201).json(template);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
