/**
 * Compliance Rule Engine
 *
 * Evaluates pension assessment responses against compliance rules
 * using configurable logic (equals, and, or, not, compare).
 */

export interface BaseCondition {
  field: string;
  value: unknown;
  operator?: string;
}

export interface Rule {
  id?: string;
  type: string;
  field?: string;
  value?: unknown;
  operator?: string;
  conditions?: Array<Rule | BaseCondition>;
  condition?: Rule | BaseCondition;
}

export interface RuleResult {
  ruleId: string;
  status: 'pass' | 'fail';
}

type Responses = Record<string, unknown>;

function evaluateCondition(condition: BaseCondition, responses: Responses): boolean {
  const actual = responses[condition.field];
  if (condition.operator) {
    return evaluateComparison(actual as number, condition.operator, condition.value as number);
  }
  return actual === condition.value;
}

function evaluateComparison(actual: number, operator: string, expected: number): boolean {
  switch (operator) {
    case '>': return actual > expected;
    case '<': return actual < expected;
    case '>=': return actual >= expected;
    case '<=': return actual <= expected;
    case '==': return actual === expected;
    case '!=': return actual !== expected;
    default: return false;
  }
}

export function evaluateRule(rule: Rule, responses: Responses): boolean {
  switch (rule.type) {
    case 'equals':
      return responses[rule.field!] === rule.value;

    case 'compare':
      return evaluateComparison(
        responses[rule.field!] as number,
        rule.operator!,
        rule.value as number,
      );

    case 'and':
      return rule.conditions!.every((c) => {
        if ('type' in c && c.type) {
          return evaluateRule(c as Rule, responses);
        }
        return evaluateCondition(c as BaseCondition, responses);
      });

    case 'or':
      return rule.conditions!.some((c) => {
        if ('type' in c && c.type) {
          return evaluateRule(c as Rule, responses);
        }
        return evaluateCondition(c as BaseCondition, responses);
      });

    case 'not': {
      const inner = rule.condition!;
      if ('type' in inner && (inner as Rule).type) {
        return !evaluateRule(inner as Rule, responses);
      }
      return !evaluateCondition(inner as BaseCondition, responses);
    }

    default:
      return false;
  }
}

export function evaluateRuleSet(rules: Rule[], responses: Responses): RuleResult[] {
  return rules.map((rule) => ({
    ruleId: rule.id!,
    status: evaluateRule(rule, responses) ? 'pass' : 'fail',
  }));
}
