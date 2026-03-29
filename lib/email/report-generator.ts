/**
 * Report Generator
 *
 * Generates HTML reports from assessment results.
 */

interface AssessmentGap {
  name: string;
  severity: string;
  suggestion: string;
}

interface AssessmentResult {
  assessmentId?: string;
  overallScore: number;
  status: string;
  gaps: AssessmentGap[];
  completedAt?: Date | string;
}

export function generateReportHTML(result: AssessmentResult): string {
  if (!result || result.overallScore == null || !Array.isArray(result.gaps)) {
    throw new Error('Invalid assessment result: missing required fields');
  }

  const gapRows = result.gaps
    .map(
      (g) => `
      <tr>
        <td>${escapeHtml(g.name)}</td>
        <td><span class="severity-${escapeHtml(g.severity)}">${escapeHtml(g.severity)}</span></td>
        <td>${escapeHtml(g.suggestion)}</td>
      </tr>`,
    )
    .join('');

  return `<html>
<head>
  <meta charset="UTF-8">
  <title>Wtp Assessment Report</title>
</head>
<body>
  <h1>Wtp Navigator — Assessment Report</h1>
  <section>
    <h2>Overall Score</h2>
    <p class="score">${result.overallScore}%</p>
    <p>Status: ${escapeHtml(result.status)}</p>
  </section>
  ${
    result.gaps.length > 0
      ? `<section>
    <h2>Compliance Gaps</h2>
    <table>
      <thead><tr><th>Gap</th><th>Severity</th><th>Recommendation</th></tr></thead>
      <tbody>${gapRows}</tbody>
    </table>
  </section>`
      : '<section><p>No compliance gaps identified. Full compliance achieved.</p></section>'
  }
</body>
</html>`;
}

export function generateAssessmentReportHTML(
  score: number,
  level: string,
  recommendations: string[],
): string {
  return `<html><body><h1>Assessment Report</h1><p>Score: ${score}</p><p>Level: ${escapeHtml(level)}</p></body></html>`;
}

function escapeHtml(str: string): string {
  if (typeof str !== 'string') return String(str);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
