/**
 * Scoring Algorithm
 *
 * Calculates section and overall scores from weighted rule results.
 * Handles critical rule failures that force a FAIL status.
 */

export interface WeightedRuleResult {
  id: string;
  weight: number;
  status: string;
  critical?: boolean;
}

export interface SectionScore {
  name: string;
  score: number;
  weight: number;
}

export interface AssessmentScore {
  overallScore: number;
  overallStatus: 'PASS' | 'FAIL' | 'PARTIAL';
  criticalFailures: string[];
}

export function calculateSectionScore(ruleResults: WeightedRuleResult[]): number {
  const totalWeight = ruleResults.reduce((sum, r) => sum + r.weight, 0);
  if (totalWeight === 0) return 0;

  const passedWeight = ruleResults
    .filter((r) => r.status === 'pass')
    .reduce((sum, r) => sum + r.weight, 0);

  return Math.round((passedWeight / totalWeight) * 100);
}

export function calculateOverallScore(sections: SectionScore[]): number {
  const totalWeight = sections.reduce((sum, s) => sum + s.weight, 0);
  if (totalWeight === 0) return 0;

  const weightedSum = sections.reduce((sum, s) => sum + s.score * s.weight, 0);
  return Math.round(weightedSum / totalWeight);
}

export function scoreAssessment(ruleResults: WeightedRuleResult[]): AssessmentScore {
  const criticalFailures = ruleResults
    .filter((r) => r.critical && r.status === 'fail')
    .map((r) => r.id);

  if (criticalFailures.length > 0) {
    return {
      overallScore: 0,
      overallStatus: 'FAIL',
      criticalFailures,
    };
  }

  const score = calculateSectionScore(ruleResults);

  return {
    overallScore: score,
    overallStatus: score === 100 ? 'PASS' : 'PARTIAL',
    criticalFailures: [],
  };
}
