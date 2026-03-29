/**
 * Questionnaire Renderer
 *
 * Transforms question definitions into renderable output
 * and handles conditional visibility logic.
 */

export interface Question {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  options?: string[];
  conditional?: {
    parentId: string;
    value: string;
  };
  hint?: string;
}

export interface RenderedQuestion {
  inputType: string;
  label: string;
  required: boolean;
  options?: string[];
}

export function renderQuestion(question: Question): RenderedQuestion {
  return {
    inputType: question.type,
    label: question.label,
    required: question.required ?? false,
    ...(question.options ? { options: question.options } : {}),
  };
}

export function shouldShow(
  question: Question,
  answers: Record<string, string>,
): boolean {
  if (!question.conditional) {
    return true;
  }
  return answers[question.conditional.parentId] === question.conditional.value;
}
