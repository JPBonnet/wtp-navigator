import { requireAuth } from './middleware';
import { db } from '@/lib/db';

export async function handleSaveResponses(req: any, res: any) {
  const user = await requireAuth(req, res);
  if (!user) return;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const { assessmentId, responses } = body as {
    assessmentId?: string;
    responses?: Array<{ questionId: string; value: string }>;
  };

  if (!responses || !Array.isArray(responses) || responses.length === 0) {
    return res.status(400).json({ error: 'responses array is required and must not be empty' });
  }

  // Check assessment ownership
  const assessment = await db.get('assessments', assessmentId || '');
  if (!assessment || assessment.organizationId !== user.organizationId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    for (const response of responses) {
      await db.save('responses', {
        assessmentId,
        questionId: response.questionId,
        value: response.value,
        savedAt: new Date().toISOString(),
      });
    }

    return res.status(200).json({ saved: responses.length });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function handleGetResponses(req: any, res: any) {
  const user = await requireAuth(req, res);
  if (!user) return;

  return res.status(200).json([]);
}
