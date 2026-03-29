/**
 * Assessment Comparison - Diff two assessments to show trends and improvement
 */

export interface ComparisonResult {
  assessmentA: string;
  assessmentB: string;
  scoreDiff: number;
  trend: 'improving' | 'declining' | 'stable';
  gapsResolved: string[];
  newGaps: string[];
  persistentGaps: string[];
  improvements: string[];
}

interface AssessmentSnapshot {
  id: string;
  overallScore: number;
  gaps: Array<{ name?: string; category: string; severity: string }>;
  completedAt: Date;
}

export function compareAssessments(
  a: AssessmentSnapshot,
  b: AssessmentSnapshot
): ComparisonResult {
  const scoreDiff = b.overallScore - a.overallScore;

  const gapNamesA = new Set(a.gaps.map((g) => g.name || g.category));
  const gapNamesB = new Set(b.gaps.map((g) => g.name || g.category));

  const gapsResolved = Array.from(gapNamesA).filter((g) => !gapNamesB.has(g));
  const newGaps = Array.from(gapNamesB).filter((g) => !gapNamesA.has(g));
  const persistentGaps = Array.from(gapNamesA).filter((g) => gapNamesB.has(g));

  const improvements: string[] = [];
  if (scoreDiff > 0) improvements.push(`Score improved by ${scoreDiff} points`);
  if (gapsResolved.length > 0)
    improvements.push(`${gapsResolved.length} gap(s) resolved`);

  let trend: 'improving' | 'declining' | 'stable';
  if (scoreDiff > 2) trend = 'improving';
  else if (scoreDiff < -2) trend = 'declining';
  else trend = 'stable';

  return {
    assessmentA: a.id,
    assessmentB: b.id,
    scoreDiff,
    trend,
    gapsResolved,
    newGaps,
    persistentGaps,
    improvements,
  };
}
