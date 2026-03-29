import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/lib/api/middleware';
import { addMember, getTeamMembers } from '@/lib/teams/management';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireAuth(req, res);
  if (!user) return;
  const teamId = req.query.id as string;

  if (req.method === 'POST') {
    const { userId, role } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    try {
      const member = await addMember(teamId, userId, role);
      return res.status(201).json(member);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  }

  if (req.method === 'GET') {
    const members = await getTeamMembers(teamId);
    return res.status(200).json(members);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
