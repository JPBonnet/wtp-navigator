import { requireAuth } from './middleware';
import { db } from '@/lib/db';

export async function handleCreateAssessment(req: any, res: any) {
  const user = await requireAuth(req, res);
  if (!user) return;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  if (!body.pensionSetupId) {
    return res.status(400).json({ error: 'pensionSetupId is required' });
  }

  try {
    const assessment = await db.save('assessments', {
      pensionSetupId: body.pensionSetupId,
      organizationId: body.organizationId || user.organizationId,
      createdBy: user.id,
      status: 'draft',
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json(assessment);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function handleGetAssessment(
  req: any,
  res: any,
  params: { id: string }
) {
  const user = await requireAuth(req, res);
  if (!user) return;

  try {
    const assessment = await db.get('assessments', params.id);

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (assessment.organizationId !== user.organizationId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    return res.status(200).json(assessment);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function handleListAssessments(req: any, res: any) {
  const user = await requireAuth(req, res);
  if (!user) return;

  try {
    return res.status(200).json([]);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
