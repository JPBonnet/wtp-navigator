/**
 * Assessment Output
 *
 * Generates the final assessment result object from responses and scored rules.
 */

import { calculateSectionScore } from './scoring';
import { analyzeGaps, rankGaps, getRemediationSuggestion } from './gap-analysis';

interface ScoredRule {
  id: string;
  status: string;
  weight: number;
  severity: string;
  rule: string;
}

interface GapOutput {
  name: string;
  severity: string;
  suggestion: string;
}

interface AssessmentResultOutput {
  assessmentId: string;
  overallScore: number;
  status: 'PASS' | 'PARTIAL' | 'FAIL';
  gaps: GapOutput[];
  completedAt: string;
}

export function generateAssessmentResult(
  responses: Record<string, unknown>,
  scoredRules: ScoredRule[],
): AssessmentResultOutput {
  const score = calculateSectionScore(
    scoredRules.map((r) => ({ id: r.id, weight: r.weight, status: r.status })),
  );

  const rawGaps = analyzeGaps(
    scoredRules.map((r) => ({ rule: r.rule, status: r.status, severity: r.severity })),
  );

  const ranked = rankGaps(rawGaps);

  const gaps: GapOutput[] = ranked.map((g) => ({
    name: g.rule!,
    severity: g.severity,
    suggestion: getRemediationSuggestion(g),
  }));

  let status: 'PASS' | 'PARTIAL' | 'FAIL';
  if (score === 100) {
    status = 'PASS';
  } else if (score === 0) {
    status = 'FAIL';
  } else {
    status = 'PARTIAL';
  }

  return {
    assessmentId: `assess_${Date.now()}`,
    overallScore: score,
    status,
    gaps,
    completedAt: new Date().toISOString(),
  };
}
