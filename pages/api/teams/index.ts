import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth, requireOrganization } from '@/lib/api/middleware';
import { createTeam, listTeams } from '@/lib/teams/management';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireAuth(req, res);
  if (!user) return;
  const orgId = await requireOrganization(user, res);
  if (!orgId) return;

  if (req.method === 'POST') {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const team = await createTeam(name, orgId, user.id);
    return res.status(201).json(team);
  }

  if (req.method === 'GET') {
    const teams = await listTeams(orgId);
    return res.status(200).json(teams);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
