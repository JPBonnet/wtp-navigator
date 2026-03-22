/**
 * Wtp Navigator - Email & Report Generation Tests
 *
 * Tests for sending assessment completion emails
 * and generating HTML reports from assessment results.
 * Resend email service is mocked.
 */

import {
  resetAllMocks,
  mockResend,
  createMockUser,
  createMockAssessmentResult,
} from './setup';

// ─── Module stubs (to be implemented) ─────────────────────────────

import {
  sendAssessmentEmail,
} from '@/lib/email/service';

import {
  generateReportHTML,
} from '@/lib/email/report-generator';

// ─── Mock Resend SDK ──────────────────────────────────────────────

jest.mock('resend', () => {
  return jest.fn(() => mockResend);
});

// ─── EmailService ─────────────────────────────────────────────────

describe('EmailService', () => {
  const user = createMockUser();
  const assessmentResult = createMockAssessmentResult();

  beforeEach(() => {
    resetAllMocks();
  });

  test('sends assessment completion email successfully', async () => {
    mockResend.emails.send.mockResolvedValue({
      id: 'email_001',
    });

    const sent = await sendAssessmentEmail(user.id, assessmentResult);

    expect(sent.success).toBe(true);
    expect(sent.messageId).toBeDefined();
  });

  test('email content includes the overall score', async () => {
    mockResend.emails.send.mockResolvedValue({ id: 'email_002' });

    const sent = await sendAssessmentEmail(user.id, assessmentResult);

    // Verify the email was called with content containing the score
    expect(mockResend.emails.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: user.email,
      })
    );

    // The email body should reference the score
    const callArgs = mockResend.emails.send.mock.calls[0][0];
    const emailBody = callArgs.html || callArgs.text || '';
    expect(emailBody).toContain('72'); // overallScore from mock
  });

  test('email content includes a report download link', async () => {
    mockResend.emails.send.mockResolvedValue({ id: 'email_003' });

    const sent = await sendAssessmentEmail(user.id, assessmentResult);

    const callArgs = mockResend.emails.send.mock.calls[0][0];
    const emailBody = callArgs.html || callArgs.text || '';
    expect(emailBody).toContain('/reports/');
  });

  test('returns failure result when email service is unavailable', async () => {
    mockResend.emails.send.mockRejectedValue(
      new Error('Service unavailable')
    );

    const sent = await sendAssessmentEmail(user.id, assessmentResult);

    expect(sent.success).toBe(false);
    expect(sent.error).toBeDefined();
  });
});

// ─── ReportGeneration ─────────────────────────────────────────────

describe('ReportGeneration', () => {
  const assessmentResult = createMockAssessmentResult();

  test('generates valid HTML document from assessment result', () => {
    const html = generateReportHTML(assessmentResult);

    expect(html).toContain('<html');
    expect(html).toContain('</html>');
    expect(html).toContain('Overall Score');
  });

  test('includes gap names and suggestions in the report', () => {
    const html = generateReportHTML(assessmentResult);

    for (const gap of assessmentResult.gaps) {
      expect(html).toContain(gap.name);
      expect(html).toContain(gap.suggestion);
    }
  });

  test('includes severity indicators for each gap', () => {
    const html = generateReportHTML(assessmentResult);

    for (const gap of assessmentResult.gaps) {
      expect(html).toContain(gap.severity);
    }
  });

  test('generates report for assessment with no gaps', () => {
    const perfectResult = createMockAssessmentResult({
      overallScore: 100,
      status: 'PASS',
      gaps: [],
    });

    const html = generateReportHTML(perfectResult);

    expect(html).toContain('<html');
    expect(html).toContain('100');
    expect(html).not.toContain('member_communication');
  });
});
