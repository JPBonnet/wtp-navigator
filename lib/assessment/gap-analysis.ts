/**
 * Gap Analysis
 *
 * Identifies compliance gaps from failed rules, ranks them by severity,
 * and provides remediation suggestions.
 */

export interface RuleResultWithSeverity {
  rule: string;
  status: string;
  severity: string;
}

export interface Gap {
  rule?: string;
  name?: string;
  severity: string;
}

const SEVERITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const REMEDIATION_SUGGESTIONS: Record<string, string> = {
  member_communication:
    'Develop and distribute a comprehensive member communication plan covering transition timeline, impact on benefits, and available support channels.',
  contribution_structure:
    'Review and restructure contribution rates to align with the new flat-rate or age-independent premium model required under Wtp.',
  governance_docs:
    'Update governance documentation to reflect the new pension scheme structure and decision-making processes.',
  fund_analysis:
    'Conduct a detailed fund analysis to evaluate investment strategy alignment with the new DC framework.',
  reporting:
    'Establish compliant reporting processes for the new pension arrangement, including participant-level reporting.',
};

const DEFAULT_SUGGESTION =
  'Review this area against current Wtp requirements and consult with a pension advisor if needed to ensure compliance.';

export function analyzeGaps(ruleResults: RuleResultWithSeverity[]): RuleResultWithSeverity[] {
  return ruleResults.filter((r) => r.status === 'fail');
}

export function rankGaps<T extends Gap>(gaps: T[]): T[] {
  return [...gaps].sort((a, b) => {
    const aOrder = SEVERITY_ORDER[a.severity] ?? 99;
    const bOrder = SEVERITY_ORDER[b.severity] ?? 99;
    return aOrder - bOrder;
  });
}

export function getRemediationSuggestion(gap: Gap): string {
  const key = gap.rule || gap.name || '';
  return REMEDIATION_SUGGESTIONS[key] || DEFAULT_SUGGESTION;
}
