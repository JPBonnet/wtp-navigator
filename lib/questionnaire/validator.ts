/**
 * Questionnaire Validator
 *
 * Validation functions for questionnaire responses
 * including type-specific validators.
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface NumericValidationResult {
  valid: boolean;
  value?: number;
  error?: string;
}

export function validateResponse(
  question: { required?: boolean; type: string },
  value: string,
): ValidationResult {
  if (question.required && (!value || value.trim() === '')) {
    return { valid: false, error: 'This field is required' };
  }
  return { valid: true };
}

export function validateNumeric(value: string): NumericValidationResult {
  if (value === '' || value == null) {
    return { valid: false, error: 'Value is required' };
  }
  const num = Number(value);
  if (isNaN(num)) {
    return { valid: false, error: 'Must be a valid number' };
  }
  return { valid: true, value: num };
}

export function validateDate(value: string): ValidationResult {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(value)) {
    return { valid: false, error: 'Date must be in YYYY-MM-DD format' };
  }
  return { valid: true };
}

export function validateEmail(value: string): boolean {
  if (!value) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

export function validatePercentage(value: number): ValidationResult {
  if (value < 0 || value > 100) {
    return { valid: false, error: 'Percentage must be between 0 and 100' };
  }
  return { valid: true };
}
