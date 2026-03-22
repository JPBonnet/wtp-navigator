/**
 * Save & Resume
 *
 * Persistence layer for questionnaire assessment progress.
 * Supports saving partial responses and resuming later.
 */

interface SavedAssessment {
  assessmentId: string;
  responses: Record<string, string>;
  lastModified: Date;
  completionPercentage: number;
}

const EXPECTED_FIELDS = [
  'company_name',
  'employee_count',
  'scheme_type',
  'current_provider',
  'participant_count',
  'migration_timeline',
  'key_concerns',
  'specific_needs',
  'budget_range',
  'previous_experience',
  'communication_preference',
  'decision_makers',
  'timeline_constraints',
  'other_requirements',
  'contact_email',
];

const store = new Map<string, SavedAssessment>();

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

  store.set(assessmentId, saved);
  return saved;
}

export async function resumeAssessment(
  assessmentId: string,
): Promise<SavedAssessment | null> {
  if (!assessmentId) {
    throw new Error('assessmentId is required');
  }
  return store.get(assessmentId) ?? null;
}
