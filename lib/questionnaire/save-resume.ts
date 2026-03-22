/**
 * Save & Resume
 *
 * Persistence layer for questionnaire assessment progress.
 * Supports saving partial responses and resuming later.
 */

import { db } from '@/lib/db';

interface SavedAssessment {
  assessmentId: string;
  responses: Record<string, string>;
  lastModified: Date;
  completionPercentage: number;
}

const EXPECTED_FIELDS = [
  'company_name',
  'scheme_type',
  'provider_name',
  'participant_count',
  'contribution_employer',
  'contribution_employee',
  'has_communication_plan',
  'effective_date',
];

export async function saveAssessmentProgress(
  assessmentId: string,
  responses: Record<string, string>,
): Promise<SavedAssessment> {
  if (!assessmentId) {
    throw new Error('assessmentId is required');
  }
  if (!responses || typeof responses !== 'object') {
    throw new Error('responses must be a valid object');
  }

  const filledCount = Object.keys(responses).filter(
    (key) => responses[key] != null && responses[key] !== '',
  ).length;

  const completionPercentage = Math.round(
    (filledCount / EXPECTED_FIELDS.length) * 100,
  );

  const saved: SavedAssessment = {
    assessmentId,
    responses,
    lastModified: new Date(),
    completionPercentage,
  };

  await db.save('assessment_progress', {
    id: assessmentId,
    assessmentId,
    responses: responses as unknown as Record<string, unknown>,
    lastModified: saved.lastModified,
    completionPercentage,
  });

  return saved;
}

export async function resumeAssessment(
  assessmentId: string,
): Promise<SavedAssessment | null> {
  if (!assessmentId) {
    throw new Error('assessmentId is required');
  }

  const data = await db.get('assessment_progress', assessmentId);
  if (!data) return null;

  return {
    assessmentId: data.assessmentId as string,
    responses: data.responses as unknown as Record<string, string>,
    lastModified: data.lastModified as Date,
    completionPercentage: data.completionPercentage as number,
  };
}
