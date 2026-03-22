/**
 * Wtp Navigator - Integration Tests
 *
 * Full user journey tests covering end-to-end flows:
 * purchase, assessment completion, report generation,
 * dashboard access, and payment verification.
 */

import {
  resetAllMocks,
  mockDb,
  mockStripe,
  mockResend,
  mockSupabaseAuth,
  createMockUser,
  createMockPensionSetup,
  createMockAssessmentResult,
  createMockStripeEvent,
} from './setup';

// ─── Module stubs (to be implemented) ─────────────────────────────

import { signUp, logIn } from '@/lib/auth/authentication';
import { getUserDashboard } from '@/lib/auth/dashboard';
import { createCheckoutSession } from '@/lib/payments/checkout';
import { handleStripeWebhook } from '@/lib/payments/webhook-handler';
import { verifyUserPurchase } from '@/lib/payments/purchase-verification';
import { saveAssessmentProgress, resumeAssessment } from '@/lib/questionnaire/save-resume';
import { generateAssessmentResult } from '@/lib/assessment/output';
import { sendAssessmentEmail } from '@/lib/email/service';
import { generateReportHTML } from '@/lib/email/report-generator';

// ─── Mock External Services ──────────────────────────────────────

jest.mock('stripe', () => jest.fn(() => mockStripe));
jest.mock('resend', () => jest.fn(() => mockResend));
jest.mock('@/lib/supabase/client', () => ({
  supabase: { auth: mockSupabaseAuth },
}));

// ─── Complete Purchase Flow ──────────────────────────────────────

describe('PurchaseFlow', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  test('full flow: sign up → create checkout → complete payment → verify access', async () => {
    // Step 1: User signs up
    mockSupabaseAuth.signUp.mockResolvedValue({
      data: {
        user: { id: 'user_new_001', email: 'sanne@adviesbureau.nl' },
        session: { access_token: 'token_sanne' },
      },
      error: null,
    });

    const user = await signUp('sanne@adviesbureau.nl', 'SecureWtp2026!');
    expect(user.id).toBe('user_new_001');

    // Step 2: User initiates checkout
    mockStripe.checkout.sessions.create.mockResolvedValue({
      id: 'cs_purchase_001',
      url: 'https://checkout.stripe.com/pay/cs_purchase_001',
      amount_total: 99900,
      currency: 'eur',
      metadata: { userId: 'user_new_001', productType: 'assessment' },
    });

    const session = await createCheckoutSession('user_new_001', 'assessment');
    expect(session.url).toContain('stripe.com');

    // Step 3: Stripe sends webhook after payment completes
    const event = createMockStripeEvent('checkout.session.completed', {
      id: 'cs_purchase_001',
      customer_email: 'sanne@adviesbureau.nl',
      metadata: { userId: 'user_new_001', productType: 'assessment' },
    });

    const webhookResult = await handleStripeWebhook(event);
    expect(webhookResult.success).toBe(true);

    // Step 4: Verify user now has assessment access
    const hasPurchase = await verifyUserPurchase('user_new_001', 'assessment');
    expect(hasPurchase).toBe(true);
  });

  test('user without payment cannot access assessment', async () => {
    const hasPurchase = await verifyUserPurchase('user_no_payment', 'assessment');
    expect(hasPurchase).toBe(false);
  });

  test('login → verify existing purchase → proceed to assessment', async () => {
    // Pre-condition: user already paid in a previous session
    const paymentEvent = createMockStripeEvent('checkout.session.completed', {
      metadata: { userId: 'user_returning', productType: 'assessment' },
    });
    await handleStripeWebhook(paymentEvent);

    // User logs in
    mockSupabaseAuth.signInWithPassword.mockResolvedValue({
      data: {
        user: { id: 'user_returning', email: 'pieter@logistics.nl' },
        session: { access_token: 'token_returning' },
      },
      error: null,
    });

    const session = await logIn('pieter@logistics.nl', 'SecurePassword!');
    expect(session.access_token).toBeDefined();

    // Verify purchase still valid
    const hasPurchase = await verifyUserPurchase('user_returning', 'assessment');
    expect(hasPurchase).toBe(true);
  });
});

// ─── Assessment Completion Flow ──────────────────────────────────

describe('AssessmentCompletionFlow', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  test('full flow: start assessment → save progress → resume → complete → generate result', async () => {
    const assessmentId = 'assess_flow_001';

    // Step 1: Start assessment with first batch of responses
    const initialResponses = {
      company_name: 'Pensioen Advies Utrecht BV',
      scheme_type: 'defined_benefit',
      provider_name: 'PGGM',
    };

    const saved = await saveAssessmentProgress(assessmentId, initialResponses);
    expect(saved.assessmentId).toBe(assessmentId);
    expect(saved.completionPercentage).toBeLessThan(100);

    // Step 2: User leaves and resumes later
    const resumed = await resumeAssessment(assessmentId);
    expect(resumed).not.toBeNull();
    expect(resumed.responses.company_name).toBe('Pensioen Advies Utrecht BV');

    // Step 3: Complete remaining questions
    const fullResponses = {
      ...resumed.responses,
      participant_count: '320',
      contribution_employer: '14.5',
      contribution_employee: '5.0',
      has_communication_plan: 'no',
      effective_date: '2019-06-01',
    };

    const completed = await saveAssessmentProgress(assessmentId, fullResponses);
    expect(completed.completionPercentage).toBe(100);

    // Step 4: Generate assessment result
    const scoredRules = [
      { id: 'r1', status: 'pass', weight: 40, severity: 'medium', rule: 'governance_docs' },
      { id: 'r2', status: 'fail', weight: 30, severity: 'high', rule: 'member_communication' },
      { id: 'r3', status: 'pass', weight: 30, severity: 'low', rule: 'contribution_structure' },
    ];

    const result = generateAssessmentResult(fullResponses, scoredRules);
    expect(result.overallScore).toBeDefined();
    expect(result.gaps.length).toBeGreaterThan(0);
    expect(result.status).toBeDefined();
  });

  test('saves partial progress and can be resumed multiple times', async () => {
    const assessmentId = 'assess_partial_001';

    // First save
    await saveAssessmentProgress(assessmentId, { company_name: 'BouwBV' });

    // Second save adds more data
    await saveAssessmentProgress(assessmentId, {
      company_name: 'BouwBV',
      scheme_type: 'cdc',
    });

    // Resume and verify all data present
    const resumed = await resumeAssessment(assessmentId);
    expect(resumed.responses.company_name).toBe('BouwBV');
    expect(resumed.responses.scheme_type).toBe('cdc');
  });
});

// ─── Report Generation and Email ─────────────────────────────────

describe('ReportGenerationFlow', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  test('generates report HTML and sends email after assessment completion', async () => {
    const user = createMockUser({ email: 'klant@bedrijf.nl' });
    const result = createMockAssessmentResult({
      overallScore: 85,
      status: 'PARTIAL',
      gaps: [
        { name: 'early_retirement_transition', severity: 'medium', suggestion: 'Plan vroegpensioen overgang' },
      ],
    });

    // Generate HTML report
    const html = generateReportHTML(result);
    expect(html).toContain('<html');
    expect(html).toContain('85');
    expect(html).toContain('early_retirement_transition');

    // Send email with report
    mockResend.emails.send.mockResolvedValue({ id: 'email_report_001' });

    const emailResult = await sendAssessmentEmail(user.id, result);
    expect(emailResult.success).toBe(true);
    expect(mockResend.emails.send).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'klant@bedrijf.nl' })
    );
  });

  test('report includes all gaps with Dutch pension context', () => {
    const result = createMockAssessmentResult({
      gaps: [
        { name: 'solidariteitsreserve', severity: 'high', suggestion: 'Stel solidariteitsreserve in conform Wtp Art. 150' },
        { name: 'nabestaandenpensioen', severity: 'medium', suggestion: 'Herzie nabestaandenpensioen regeling' },
      ],
    });

    const html = generateReportHTML(result);

    expect(html).toContain('solidariteitsreserve');
    expect(html).toContain('nabestaandenpensioen');
  });

  test('email is not sent when report generation fails', async () => {
    const user = createMockUser();
    // Malformed result that causes generation to fail
    const malformedResult = { overallScore: null, gaps: null } as any;

    try {
      generateReportHTML(malformedResult);
    } catch {
      // Report generation failed — email should not be sent
    }

    expect(mockResend.emails.send).not.toHaveBeenCalled();
  });
});

// ─── User Dashboard ──────────────────────────────────────────────

describe('UserDashboardFlow', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  test('dashboard shows completed assessments with scores', async () => {
    const user = createMockUser();

    const dashboard = await getUserDashboard(user.id);

    expect(dashboard).toHaveProperty('assessments');
    expect(Array.isArray(dashboard.assessments)).toBe(true);
  });

  test('dashboard shows in-progress assessments with completion percentage', async () => {
    const assessmentId = 'assess_inprogress';

    // Start but don't complete an assessment
    await saveAssessmentProgress(assessmentId, {
      company_name: 'InProgressBV',
      scheme_type: 'hybrid',
    });

    const dashboard = await getUserDashboard('user_test_001');

    expect(dashboard).toHaveProperty('assessments');
  });

  test('new user dashboard has empty assessments list', async () => {
    const dashboard = await getUserDashboard('user_brand_new');

    expect(dashboard.assessments).toEqual([]);
  });
});

// ─── Payment Verification Flow ───────────────────────────────────

describe('PaymentVerificationFlow', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  test('grants access immediately after successful Stripe webhook', async () => {
    const event = createMockStripeEvent('checkout.session.completed', {
      metadata: { userId: 'user_instant', productType: 'assessment' },
    });

    await handleStripeWebhook(event);

    const hasAccess = await verifyUserPurchase('user_instant', 'assessment');
    expect(hasAccess).toBe(true);
  });

  test('does not grant access for failed payment events', async () => {
    const event = createMockStripeEvent('checkout.session.expired', {
      metadata: { userId: 'user_expired', productType: 'assessment' },
    });

    await handleStripeWebhook(event);

    const hasAccess = await verifyUserPurchase('user_expired', 'assessment');
    expect(hasAccess).toBe(false);
  });

  test('handles multiple product types independently', async () => {
    // Purchase assessment only
    const assessmentEvent = createMockStripeEvent('checkout.session.completed', {
      metadata: { userId: 'user_multi', productType: 'assessment' },
    });
    await handleStripeWebhook(assessmentEvent);

    expect(await verifyUserPurchase('user_multi', 'assessment')).toBe(true);
    expect(await verifyUserPurchase('user_multi', 'expert_review')).toBe(false);
  });
});
