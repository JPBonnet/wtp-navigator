/**
 * Multiple Assessments - List and archive user assessments
 */

import { randomUUID } from 'crypto';

export interface UserAssessment {
  id: string;
  userId: string;
  organizationId: string;
  pensionSetupId: string;
  title: string;
  status: 'draft' | 'complete' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const assessments: Map<string, UserAssessment> = new Map();

export function resetAssessmentStore() {
  assessments.clear();
}

export async function createAssessment(
  userId: string,
  organizationId: string,
  pensionSetupId: string,
  title: string
): Promise<UserAssessment> {
  const assessment: UserAssessment = {
    id: randomUUID(),
    userId,
    organizationId,
    pensionSetupId,
    title,
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  assessments.set(assessment.id, assessment);
  return assessment;
}

export async function listAssessments(
  userId: string,
  includeArchived = false
): Promise<UserAssessment[]> {
  return Array.from(assessments.values()).filter(
    (a) =>
      a.userId === userId && (includeArchived || a.status !== 'archived')
  );
}

export async function archiveAssessment(
  assessmentId: string,
  userId: string
): Promise<UserAssessment> {
  const assessment = assessments.get(assessmentId);
  if (!assessment) throw new Error('Assessment not found');
  if (assessment.userId !== userId) throw new Error('Not authorized');

  assessment.status = 'archived';
  assessment.updatedAt = new Date();
  return assessment;
}

export async function getAssessment(id: string): Promise<UserAssessment | null> {
  return assessments.get(id) || null;
}
