/**
 * Wtp Navigator - Questionnaire Module Tests
 *
 * Tests for question rendering, response validation,
 * and save/resume functionality for the pension assessment questionnaire.
 */

import { resetAllMocks, mockDb, expectRecentDate } from './setup';

// ─── Module stubs (to be implemented) ─────────────────────────────
// These imports will resolve once implementation code exists.
// Until then, tests serve as the specification.

import {
  renderQuestion,
  shouldShow,
} from '@/lib/questionnaire/renderer';

import {
  validateResponse,
  validateNumeric,
  validateDate,
  validateEmail,
  validatePercentage,
} from '@/lib/questionnaire/validator';

import {
  saveAssessmentProgress,
  resumeAssessment,
} from '@/lib/questionnaire/save-resume';

// ─── QuestionRenderer ─────────────────────────────────────────────

describe('QuestionRenderer', () => {
  test('renders a text input question with correct type and label', () => {
    const question = { id: 'q1', type: 'text', label: 'Bedrijfsnaam', required: true };
    const rendered = renderQuestion(question);

    expect(rendered.inputType).toBe('text');
    expect(rendered.label).toBe('Bedrijfsnaam');
    expect(rendered.required).toBe(true);
  });

  test('renders a select question with all options present', () => {
    const question = {
      id: 'q2',
      type: 'select',
      label: 'Pensioenregeling type',
      options: ['defined_benefit', 'defined_contribution', 'cdc', 'hybrid'],
    };
    const rendered = renderQuestion(question);

    expect(rendered.inputType).toBe('select');
    expect(rendered.options).toEqual(['defined_benefit', 'defined_contribution', 'cdc', 'hybrid']);
    expect(rendered.options).toHaveLength(4);
  });

  test('renders multi-select question with checkbox inputs', () => {
    const question = {
      id: 'q3',
      type: 'multiselect',
      label: 'Toepasselijke regelingen',
      options: ['auto_enrollment', 'excedent', 'early_retirement'],
    };
    const rendered = renderQuestion(question);

    expect(rendered.inputType).toBe('multiselect');
    expect(rendered.options).toHaveLength(3);
  });

  test('shows conditional question only when parent answer matches', () => {
    const conditionalQuestion = {
      id: 'q4',
      type: 'text',
      label: 'Naam pensioenfonds',
      conditional: { parentId: 'q_provider_type', value: 'pension_fund' },
    };

    // Parent answer matches — question should be visible
    expect(shouldShow(conditionalQuestion, { q_provider_type: 'pension_fund' })).toBe(true);

    // Parent answer does not match — question should be hidden
    expect(shouldShow(conditionalQuestion, { q_provider_type: 'insurer' })).toBe(false);

    // Parent answer missing — question should be hidden
    expect(shouldShow(conditionalQuestion, {})).toBe(false);
  });

  test('shows non-conditional question regardless of answers', () => {
    const simpleQuestion = { id: 'q1', type: 'text', label: 'Bedrijfsnaam' };

    expect(shouldShow(simpleQuestion, {})).toBe(true);
    expect(shouldShow(simpleQuestion, { q1: 'anything' })).toBe(true);
  });
});

// ─── QuestionValidator ────────────────────────────────────────────

describe('QuestionValidator', () => {
  test('rejects empty value for required field', () => {
    const result = validateResponse({ required: true, type: 'text' }, '');

    expect(result.valid).toBe(false);
    expect(result.error).toContain('required');
  });

  test('accepts empty value for optional field', () => {
    const result = validateResponse({ required: false, type: 'text' }, '');

    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  test('validates numeric input correctly', () => {
    expect(validateNumeric('85')).toEqual({ valid: true, value: 85 });
    expect(validateNumeric('0')).toEqual({ valid: true, value: 0 });
    expect(validateNumeric('abc')).toEqual(expect.objectContaining({ valid: false }));
    expect(validateNumeric('')).toEqual(expect.objectContaining({ valid: false }));
  });

  test('validates date format as YYYY-MM-DD', () => {
    expect(validateDate('2026-03-22')).toEqual({ valid: true });
    expect(validateDate('2018-01-01')).toEqual({ valid: true });

    // Invalid formats
    expect(validateDate('22-03-2026')).toEqual(expect.objectContaining({ valid: false }));
    expect(validateDate('2026/03/22')).toEqual(expect.objectContaining({ valid: false }));
    expect(validateDate('not-a-date')).toEqual(expect.objectContaining({ valid: false }));
  });

  test('validates email format', () => {
    expect(validateEmail('jan@example.nl')).toBe(true);
    expect(validateEmail('sanne.de.vries@bedrijf.com')).toBe(true);

    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('@no-local.com')).toBe(false);
    expect(validateEmail('no-domain@')).toBe(false);
    expect(validateEmail('')).toBe(false);
  });

  test('validates percentage is between 0 and 100', () => {
    expect(validatePercentage(12.5)).toEqual({ valid: true });
    expect(validatePercentage(0)).toEqual({ valid: true });
    expect(validatePercentage(100)).toEqual({ valid: true });

    expect(validatePercentage(-1)).toEqual(expect.objectContaining({ valid: false }));
    expect(validatePercentage(101)).toEqual(expect.objectContaining({ valid: false }));
  });
});

// ─── SaveAndResume ────────────────────────────────────────────────

describe('SaveAndResume', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  test('saves assessment responses and returns timestamp', async () => {
    const assessmentId = 'assess_001';
    const responses = {
      company_name: 'TechBV',
      scheme_type: 'defined_benefit',
      participant_count: '85',
    };

    const saved = await saveAssessmentProgress(assessmentId, responses);

    expect(saved.assessmentId).toBe(assessmentId);
    expect(saved.responses).toEqual(responses);
    expect(saved.lastModified).toBeInstanceOf(Date);
  });

  test('resumes assessment with all previously saved responses', async () => {
    const assessmentId = 'assess_002';
    const responses = { company_name: 'LogistiekBV', scheme_type: 'defined_contribution' };

    await saveAssessmentProgress(assessmentId, responses);
    const resumed = await resumeAssessment(assessmentId);

    expect(resumed).not.toBeNull();
    expect(resumed!.assessmentId).toBe(assessmentId);
    expect(resumed!.responses).toEqual(responses);
  });

  test('calculates completion percentage for partial responses', async () => {
    const assessmentId = 'assess_003';
    // Only 2 of ~5 expected fields filled
    const partialResponses = { company_name: 'BouwBV', scheme_type: 'hybrid' };

    const saved = await saveAssessmentProgress(assessmentId, partialResponses);

    expect(saved.completionPercentage).toBeLessThan(100);
    expect(saved.completionPercentage).toBeGreaterThan(0);
  });

  test('overwrites previous save when saving again for same assessment', async () => {
    const assessmentId = 'assess_004';

    await saveAssessmentProgress(assessmentId, { company_name: 'OldName' });
    const updated = await saveAssessmentProgress(assessmentId, { company_name: 'NewName' });

    expect(updated.responses.company_name).toBe('NewName');
  });

  test('returns null when resuming a non-existent assessment', async () => {
    const resumed = await resumeAssessment('non_existent_id');

    expect(resumed).toBeNull();
  });
});
