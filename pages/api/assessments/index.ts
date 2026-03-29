import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth, requireOrganization } from '@/lib/api/middleware';
import { createAssessment, listAssessments } from '@/lib/assessment/multiple';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireAuth(req, res);
  if (!user) return;
  const orgId = await requireOrganization(user, res);
  if (!orgId) return;

  if (req.method === 'POST') {
    const { pensionSetupId, title } = req.body;
    if (!pensionSetupId || !title) return res.status(400).json({ error: 'pensionSetupId and title are required' });
    const assessment = await createAssessment(user.id, orgId, pensionSetupId, title);
    return res.status(201).json(assessment);
  }

  if (req.method === 'GET') {
    const includeArchived = req.query.includeArchived === 'true';
    const assessments = await listAssessments(user.id, includeArchived);
    return res.status(200).json(assessments);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
