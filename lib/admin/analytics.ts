/**
 * Admin Assessment Analytics
 * Overview stats, score distribution, and completion rates
 */

export interface AnalyticsOverview {
  totalAssessments: number;
  completedAssessments: number;
  averageScore: number;
  totalUsers: number;
  totalOrganizations: number;
}

export interface ScoreDistribution {
  range: string;
  count: number;
}

export interface CompletionRate {
  period: string;
  started: number;
  completed: number;
  rate: number;
}

interface AssessmentRecord {
  id: string;
  score: number;
  status: 'pending' | 'in_progress' | 'completed';
  organizationId: string;
  createdBy: string;
  created_at: string;
}

const assessmentStore: AssessmentRecord[] = [];

export function resetAnalyticsStore() {
  assessmentStore.length = 0;
}

export function seedAssessments(records: AssessmentRecord[]) {
  assessmentStore.length = 0;
  assessmentStore.push(...records);
}

export async function getOverview(): Promise<AnalyticsOverview> {
  const completed = assessmentStore.filter(a => a.status === 'completed');
  const uniqueUsers = new Set(assessmentStore.map(a => a.createdBy));
  const uniqueOrgs = new Set(assessmentStore.map(a => a.organizationId));
  const avgScore = completed.length > 0
    ? Math.round(completed.reduce((sum, a) => sum + a.score, 0) / completed.length)
    : 0;

  return {
    totalAssessments: assessmentStore.length,
    completedAssessments: completed.length,
    averageScore: avgScore,
    totalUsers: uniqueUsers.size,
    totalOrganizations: uniqueOrgs.size,
  };
}

export async function getScoreDistribution(): Promise<ScoreDistribution[]> {
  const ranges = [
    { range: '0-20', min: 0, max: 20 },
    { range: '21-40', min: 21, max: 40 },
    { range: '41-60', min: 41, max: 60 },
    { range: '61-80', min: 61, max: 80 },
    { range: '81-100', min: 81, max: 100 },
  ];

  const completed = assessmentStore.filter(a => a.status === 'completed');

  return ranges.map(r => ({
    range: r.range,
    count: completed.filter(a => a.score >= r.min && a.score <= r.max).length,
  }));
}

export async function getCompletionRates(): Promise<CompletionRate[]> {
  const byMonth = new Map<string, { started: number; completed: number }>();

  for (const a of assessmentStore) {
    const month = a.created_at.slice(0, 7);
    const entry = byMonth.get(month) || { started: 0, completed: 0 };
    entry.started++;
    if (a.status === 'completed') entry.completed++;
    byMonth.set(month, entry);
  }

  return Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, data]) => ({
      period,
      started: data.started,
      completed: data.completed,
      rate: data.started > 0 ? Math.round((data.completed / data.started) * 100) : 0,
    }));
}
