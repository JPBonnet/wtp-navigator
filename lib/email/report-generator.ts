// Report generation for assessments
export function generateAssessmentReportHTML(score: number, level: string, recommendations: string[]): string {
  return `<html><body><h1>Assessment Report</h1><p>Score: ${score}</p><p>Level: ${level}</p></body></html>`;
}
