/**
 * Wtp Navigator - Assessment Engine Tests
 *
 * Tests for the compliance rule engine, scoring algorithm,
 * gap analysis, and assessment output generation.
 */

import { resetAllMocks, createMockAssessmentResult, createMockPensionSetup } from './setup';

// ─── Module stubs (to be implemented) ─────────────────────────────

import {
  evaluateRule,
  evaluateRuleSet,
} from '@/lib/assessment/compliance-rules';

import {
  calculateSectionScore,
  calculateOverallScore,
  scoreAssessment,
} from '@/lib/assessment/scoring';

import {
  analyzeGaps,
  rankGaps,
  getRemediationSuggestion,
} from '@/lib/assessment/gap-analysis';

import {
  generateAssessmentResult,
} from '@/lib/assessment/output';

// ─── ComplianceRuleEngine ─────────────────────────────────────────

describe('ComplianceRuleEngine', () => {
  test('evaluates simple equality rule: field equals expected value', () => {
    const rule = { type: 'equals', field: 'has_pension_plan', value: 'yes' };
    const responses = { has_pension_plan: 'yes' };

    expect(evaluateRule(rule, responses)).toBe(true);
  });

  test('fails simple equality rule when value does not match', () => {
    const rule = { type: 'equals', field: 'has_pension_plan', value: 'yes' };
    const responses = { has_pension_plan: 'no' };

    expect(evaluateRule(rule, responses)).toBe(false);
  });

  test('evaluates AND logic: all conditions must pass', () => {
    const rule = {
      type: 'and',
      conditions: [
        { field: 'scheme_type', value: 'defined_benefit' },
        { field: 'participant_count', operator: '>', value: 100 },
      ],
    };

    // Both conditions true
    expect(evaluateRule(rule, { scheme_type: 'defined_benefit', participant_count: 150 })).toBe(true);

    // First condition false
    expect(evaluateRule(rule, { scheme_type: 'defined_contribution', participant_count: 150 })).toBe(false);

    // Second condition false
    expect(evaluateRule(rule, { scheme_type: 'defined_benefit', participant_count: 50 })).toBe(false);
  });

  test('evaluates OR logic: at least one condition must pass', () => {
    const rule = {
      type: 'or',
      conditions: [
        { field: 'has_auto_enrollment', value: 'yes' },
        { field: 'is_pension_provider', value: 'yes' },
      ],
    };

    // First true, second false
    expect(evaluateRule(rule, { has_auto_enrollment: 'yes', is_pension_provider: 'no' })).toBe(true);

    // Both false
    expect(evaluateRule(rule, { has_auto_enrollment: 'no', is_pension_provider: 'no' })).toBe(false);

    // Both true
    expect(evaluateRule(rule, { has_auto_enrollment: 'yes', is_pension_provider: 'yes' })).toBe(true);
  });

  test('evaluates NOT logic: condition must be false to pass', () => {
    const rule = { type: 'not', condition: { field: 'is_exempt', value: 'yes' } };

    expect(evaluateRule(rule, { is_exempt: 'no' })).toBe(true);
    expect(evaluateRule(rule, { is_exempt: 'yes' })).toBe(false);
  });

  test('evaluates numeric comparison operators (>, <, >=, <=)', () => {
    const greaterThan = { type: 'compare', field: 'contribution_employer', operator: '>', value: 10 };

    expect(evaluateRule(greaterThan, { contribution_employer: 12.5 })).toBe(true);
    expect(evaluateRule(greaterThan, { contribution_employer: 8.0 })).toBe(false);
    expect(evaluateRule(greaterThan, { contribution_employer: 10 })).toBe(false);
  });

  test('evaluates a full rule set and returns per-rule results', () => {
    const rules = [
      { id: 'r1', type: 'equals', field: 'scheme_type', value: 'defined_benefit' },
      { id: 'r2', type: 'equals', field: 'has_communication_plan', value: 'yes' },
    ];
    const responses = { scheme_type: 'defined_benefit', has_communication_plan: 'no' };

    const results = evaluateRuleSet(rules, responses);

    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({ ruleId: 'r1', status: 'pass' });
    expect(results[1]).toEqual({ ruleId: 'r2', status: 'fail' });
  });
});

// ─── ScoringAlgorithm ─────────────────────────────────────────────

describe('ScoringAlgorithm', () => {
  test('calculates section score from weighted pass/fail rules', () => {
    const ruleResults = [
      { id: 'r1', weight: 50, status: 'pass' },
      { id: 'r2', weight: 50, status: 'fail' },
    ];
    const score = calculateSectionScore(ruleResults);

    expect(score).toBe(50); // 50% of weighted rules passed
  });

  test('calculates section score with unequal weights', () => {
    const ruleResults = [
      { id: 'r1', weight: 70, status: 'pass' },
      { id: 'r2', weight: 30, status: 'fail' },
    ];
    const score = calculateSectionScore(ruleResults);

    expect(score).toBe(70); // Only the 70-weight rule passed
  });

  test('returns 100 when all rules pass', () => {
    const ruleResults = [
      { id: 'r1', weight: 40, status: 'pass' },
      { id: 'r2', weight: 60, status: 'pass' },
    ];

    expect(calculateSectionScore(ruleResults)).toBe(100);
  });

  test('calculates overall score from weighted section scores', () => {
    const sections = [
      { name: 'governance', score: 100, weight: 30 },
      { name: 'rules', score: 80, weight: 40 },
      { name: 'automation', score: 60, weight: 30 },
    ];
    const overall = calculateOverallScore(sections);

    // (100*30 + 80*40 + 60*30) / (30+40+30) = (3000+3200+1800)/100 = 80
    expect(overall).toBe(80);
  });

  test('critical rule failure forces overall score to 0 and FAIL status', () => {
    const ruleResults = [
      { id: 'critical_1', critical: true, status: 'fail', weight: 20 },
      { id: 'normal_1', critical: false, status: 'pass', weight: 40 },
      { id: 'normal_2', critical: false, status: 'pass', weight: 40 },
    ];
    const result = scoreAssessment(ruleResults);

    expect(result.overallScore).toBe(0);
    expect(result.overallStatus).toBe('FAIL');
    expect(result.criticalFailures).toContain('critical_1');
  });

  test('returns PASS status when all rules pass and no critical failures', () => {
    const ruleResults = [
      { id: 'critical_1', critical: true, status: 'pass', weight: 30 },
      { id: 'normal_1', critical: false, status: 'pass', weight: 70 },
    ];
    const result = scoreAssessment(ruleResults);

    expect(result.overallScore).toBe(100);
    expect(result.overallStatus).toBe('PASS');
    expect(result.criticalFailures).toHaveLength(0);
  });
});

// ─── GapAnalysis ──────────────────────────────────────────────────

describe('GapAnalysis', () => {
  test('identifies failed rules as gaps', () => {
    const ruleResults = [
      { rule: 'governance_docs', status: 'pass', severity: 'medium' },
      { rule: 'member_communication', status: 'fail', severity: 'high' },
      { rule: 'fund_analysis', status: 'fail', severity: 'medium' },
      { rule: 'contribution_structure', status: 'pass', severity: 'low' },
    ];
    const gaps = analyzeGaps(ruleResults);

    expect(gaps).toHaveLength(2);
    expect(gaps.map((g: { rule: string }) => g.rule)).toEqual(['member_communication', 'fund_analysis']);
  });

  test('returns empty array when all rules pass', () => {
    const ruleResults = [
      { rule: 'governance_docs', status: 'pass', severity: 'medium' },
      { rule: 'contribution_structure', status: 'pass', severity: 'low' },
    ];

    expect(analyzeGaps(ruleResults)).toHaveLength(0);
  });

  test('ranks gaps by severity: critical > high > medium > low', () => {
    const gaps = [
      { name: 'reporting', severity: 'low' },
      { name: 'member_comms', severity: 'medium' },
      { name: 'documentation', severity: 'critical' },
      { name: 'contribution_cap', severity: 'high' },
    ];
    const ranked = rankGaps(gaps);

    expect(ranked[0].severity).toBe('critical');
    expect(ranked[1].severity).toBe('high');
    expect(ranked[2].severity).toBe('medium');
    expect(ranked[3].severity).toBe('low');
  });

  test('provides remediation suggestion for member_communication gap', () => {
    const gap = { rule: 'member_communication', severity: 'high' };
    const suggestion = getRemediationSuggestion(gap);

    expect(suggestion).toBeDefined();
    expect(typeof suggestion).toBe('string');
    expect(suggestion.length).toBeGreaterThan(10);
  });

  test('provides remediation suggestion for contribution_structure gap', () => {
    const gap = { rule: 'contribution_structure', severity: 'medium' };
    const suggestion = getRemediationSuggestion(gap);

    expect(suggestion).toBeDefined();
    expect(suggestion.length).toBeGreaterThan(10);
  });

  test('returns generic suggestion for unknown gap rule', () => {
    const gap = { rule: 'unknown_future_rule', severity: 'low' };
    const suggestion = getRemediationSuggestion(gap);

    // Should still return something useful, not crash
    expect(suggestion).toBeDefined();
    expect(typeof suggestion).toBe('string');
  });
});

// ─── AssessmentOutput ─────────────────────────────────────────────

describe('AssessmentOutput', () => {
  const mockResponses = {
    company_name: 'TechBV',
    scheme_type: 'defined_benefit',
    provider_name: 'Achmea Pensioen',
    participant_count: '85',
    contribution_employer: '12.5',
  };

  const mockScoredRules = [
    { id: 'r1', status: 'pass', weight: 50, severity: 'medium', rule: 'governance_docs' },
    { id: 'r2', status: 'fail', weight: 50, severity: 'high', rule: 'member_communication' },
  ];

  test('generates assessment result with all required fields', () => {
    const result = generateAssessmentResult(mockResponses, mockScoredRules);

    expect(result).toHaveProperty('assessmentId');
    expect(result).toHaveProperty('overallScore');
    expect(result).toHaveProperty('status');
    expect(result).toHaveProperty('gaps');
    expect(result).toHaveProperty('completedAt');
  });

  test('result is JSON-serializable without errors', () => {
    const result = generateAssessmentResult(mockResponses, mockScoredRules);

    expect(() => JSON.stringify(result)).not.toThrow();

    const parsed = JSON.parse(JSON.stringify(result));
    expect(parsed.overallScore).toBeDefined();
  });

  test('includes all identified gaps with name, severity, and suggestion', () => {
    const result = generateAssessmentResult(mockResponses, mockScoredRules);

    expect(result.gaps.length).toBeGreaterThan(0);
    for (const gap of result.gaps) {
      expect(gap).toHaveProperty('name');
      expect(gap).toHaveProperty('severity');
      expect(gap).toHaveProperty('suggestion');
    }
  });

  test('assigns correct status based on score (PASS / PARTIAL / FAIL)', () => {
    const allPass = mockScoredRules.map((r) => ({ ...r, status: 'pass' }));
    const passResult = generateAssessmentResult(mockResponses, allPass);
    expect(passResult.status).toBe('PASS');

    const allFail = mockScoredRules.map((r) => ({ ...r, status: 'fail' }));
    const failResult = generateAssessmentResult(mockResponses, allFail);
    expect(['FAIL', 'PARTIAL']).toContain(failResult.status);
  });
});
