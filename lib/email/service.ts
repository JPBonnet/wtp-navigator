/**
 * Email Service
 *
 * Sends assessment reports and payment confirmations via Resend.
 */

import Resend from 'resend';

const resend = new (Resend as any)(process.env.RESEND_API_KEY || '');

interface AssessmentResult {
  assessmentId: string;
  overallScore: number;
  status: string;
  gaps: Array<{ name: string; severity: string; suggestion: string }>;
  completedAt?: Date | string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendAssessmentEmail(
  userId: string,
  result: AssessmentResult,
): Promise<EmailResult> {
  try {
    const html = buildAssessmentEmailHTML(result);

    const response = await resend.emails.send({
      from: 'Wtp Navigator <noreply@wtpnavigator.nl>',
      to: getUserEmail(userId),
      subject: `Your Wtp Assessment Report — Score: ${result.overallScore}%`,
      html,
    });

    return {
      success: true,
      messageId: response?.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

export async function sendAssessmentReport(
  email: string,
  assessmentId: string,
  reportHtml: string,
): Promise<void> {
  await resend.emails.send({
    from: 'Wtp Navigator <noreply@wtpnavigator.nl>',
    to: email,
    subject: 'Your Wtp Navigator Assessment Report',
    html: reportHtml,
  });
}

export async function sendPaymentConfirmation(
  email: string,
  licenseeId: string,
  amount: number,
): Promise<void> {
  await resend.emails.send({
    from: 'Wtp Navigator <noreply@wtpnavigator.nl>',
    to: email,
    subject: 'Payment Confirmation — Wtp Navigator',
    html: `<p>Thank you for your payment of €${(amount / 100).toFixed(2)}. Your license ID: ${licenseeId}</p>`,
  });
}

function getUserEmail(userId: string): string {
  // In production, resolve user email from database
  return userId;
}

function buildAssessmentEmailHTML(result: AssessmentResult): string {
  const gapRows = result.gaps
    .map(
      (g) =>
        `<tr><td>${g.name}</td><td>${g.severity}</td><td>${g.suggestion}</td></tr>`,
    )
    .join('');

  return `<html><body>
    <h1>Wtp Assessment Report</h1>
    <p>Overall Score: ${result.overallScore}%</p>
    <p>Status: ${result.status}</p>
    <p><a href="/reports/${result.assessmentId}">View full report</a></p>
    ${
      result.gaps.length > 0
        ? `<table><thead><tr><th>Gap</th><th>Severity</th><th>Suggestion</th></tr></thead><tbody>${gapRows}</tbody></table>`
        : '<p>No compliance gaps identified.</p>'
    }
  </body></html>`;
}
