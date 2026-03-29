# Wtp Navigator - Test-Driven Development (TDD) Master Plan

**Project:** Wtp Navigator SaaS  
**Approach:** Test-First Development (Write tests before code)  
**Framework:** Jest + React Testing Library  
**Date:** 2026-03-22  
**Status:** Planning Phase - Ready to execute

---

## TDD Philosophy for Wtp Navigator

For a compliance product, tests are not optional. Every business rule, calculation, and data validation must be correct. TDD ensures:
- ✅ All code is testable by design
- ✅ Edge cases are discovered early
- ✅ Compliance logic is verified
- ✅ Refactoring is safe
- ✅ Documentation exists (tests are specs)

---

## Test Pyramid for Wtp Navigator

```
        🧪 E2E Tests (10%)
       Entire user journeys
      - Purchase → Assessment → Report
      - Admin workflows
      
     🎯 Integration Tests (30%)
    API Routes + Database
   - Assessment completion
   - Payment processing
   - Email notifications
   
  🧱 Unit Tests (60%)
 Individual functions
- Compliance rules
- Scoring algorithms
- Data validation
- Utility functions
```

---

## Phase 1: MVP Foundation - Test Breakdown

### 1. Core Assessment Engine Tests

#### 1.1 Questionnaire Module Tests

**File:** `lib/__tests__/questionnaire.test.ts`

**Test Categories:**

1. **Question Rendering Tests**
   ```typescript
   describe('QuestionRenderer', () => {
     test('renders text input question', () => {
       const q = { type: 'text', label: 'Company name', required: true };
       expect(renderQuestion(q)).toHaveInputField('text');
     });
     
     test('renders select question with options', () => {
       const q = { type: 'select', options: ['A', 'B', 'C'] };
       expect(renderQuestion(q)).toHaveSelectOptions(['A', 'B', 'C']);
     });
     
     test('renders multi-select with checkboxes', () => {
       const q = { type: 'multiselect', options: [...] };
       expect(renderQuestion(q)).toHaveCheckboxes();
     });
     
     test('renders conditional question only when parent matches', () => {
       const q = { type: 'text', conditional: { parentId: 'q1', value: 'yes' } };
       expect(shouldShow(q, { q1: 'yes' })).toBe(true);
       expect(shouldShow(q, { q1: 'no' })).toBe(false);
     });
   });
   ```

2. **Response Validation Tests**
   ```typescript
   describe('QuestionValidator', () => {
     test('validates required field is not empty', () => {
       const result = validateResponse({ required: true }, '');
       expect(result.valid).toBe(false);
       expect(result.error).toContain('required');
     });
     
     test('validates numeric response is number', () => {
       expect(validateNumeric('123')).toEqual({ valid: true, value: 123 });
       expect(validateNumeric('abc')).toEqual({ valid: false });
     });
     
     test('validates date format (YYYY-MM-DD)', () => {
       expect(validateDate('2026-03-22')).toEqual({ valid: true });
       expect(validateDate('22-03-2026')).toEqual({ valid: false });
     });
     
     test('validates email format', () => {
       expect(validateEmail('test@example.com')).toBe(true);
       expect(validateEmail('invalid')).toBe(false);
     });
   });
   ```

3. **Save & Resume Tests**
   ```typescript
   describe('SaveAndResume', () => {
     test('saves assessment responses to database', async () => {
       const responses = { q1: 'answer1', q2: 'answer2' };
       const saved = await saveAssessmentProgress(assessmentId, responses);
       expect(saved.lastModified).toBeRecent();
     });
     
     test('resumes from saved state with all responses', async () => {
       const saved = await saveAssessmentProgress(id, { q1: 'ans1' });
       const resumed = await resumeAssessment(id);
       expect(resumed.responses).toEqual({ q1: 'ans1' });
     });
     
     test('handles partial completion correctly', async () => {
       const partial = { q1: 'ans', q3: 'ans' }; // q2 missing
       const saved = await saveAssessmentProgress(id, partial);
       expect(saved.completionPercentage).toBeLessThan(100);
     });
   });
   ```

---

#### 1.2 Assessment Scoring & Analysis Tests

**File:** `lib/__tests__/assessment-engine.test.ts`

**Test Categories:**

1. **Compliance Rule Engine Tests**
   ```typescript
   describe('ComplianceRuleEngine', () => {
     test('evaluates simple rule: if answer is X, rule passes', () => {
       const rule = { type: 'equals', field: 'has_pension_plan', value: 'yes' };
       const responses = { has_pension_plan: 'yes' };
       expect(evaluateRule(rule, responses)).toBe(true);
     });
     
     test('evaluates AND logic: multiple conditions must pass', () => {
       const rule = {
         type: 'and',
         conditions: [
           { field: 'scheme_type', value: 'defined_benefit' },
           { field: 'active_members', operator: '>', value: 100 },
         ],
       };
       expect(evaluateRule(rule, { scheme_type: 'db', active_members: 150 })).toBe(true);
       expect(evaluateRule(rule, { scheme_type: 'dc', active_members: 150 })).toBe(false);
     });
     
     test('evaluates OR logic: at least one condition passes', () => {
       const rule = {
         type: 'or',
         conditions: [
           { field: 'has_auto_enrollment', value: 'yes' },
           { field: 'is_pension_provider', value: 'yes' },
         ],
       };
       expect(evaluateRule(rule, { has_auto_enrollment: 'yes', is_pension_provider: 'no' })).toBe(true);
     });
     
     test('evaluates NOT logic: condition must be false', () => {
       const rule = { type: 'not', condition: { field: 'is_compliant', value: 'yes' } };
       expect(evaluateRule(rule, { is_compliant: 'no' })).toBe(true);
     });
   });
   ```

2. **Scoring Algorithm Tests**
   ```typescript
   describe('ScoringAlgorithm', () => {
     test('calculates section score: pass/fail rules', () => {
       const rules = [
         { id: 'r1', weight: 50, status: 'pass' },
         { id: 'r2', weight: 50, status: 'fail' },
       ];
       const score = calculateSectionScore(rules);
       expect(score).toBe(50); // 50% passed
     });
     
     test('calculates overall score from section scores', () => {
       const sections = [
         { name: 'governance', score: 100, weight: 30 },
         { name: 'rules', score: 80, weight: 40 },
         { name: 'automation', score: 60, weight: 30 },
       ];
       const overall = calculateOverallScore(sections);
       expect(overall).toBe(82); // (100*30 + 80*40 + 60*30) / 100
     });
     
     test('scores based on critical rules (fail = automatic fail)', () => {
       const rules = [
         { id: 'critical1', critical: true, status: 'fail' },
         { id: 'normal1', critical: false, status: 'pass' },
       ];
       const result = scoreAssessment(rules);
       expect(result.overallScore).toBe(0); // Critical rule failed
       expect(result.overallStatus).toBe('FAIL');
     });
   });
   ```

3. **Gap Analysis Tests**
   ```typescript
   describe('GapAnalysis', () => {
     test('identifies failed rules as gaps', () => {
       const results = [
         { rule: 'governance_docs', status: 'pass' },
         { rule: 'member_communication', status: 'fail', severity: 'high' },
         { rule: 'fund_analysis', status: 'fail', severity: 'medium' },
       ];
       const gaps = analyzeGaps(results);
       expect(gaps).toHaveLength(2);
       expect(gaps[0].severity).toBe('high');
     });
     
     test('ranks gaps by severity (critical > high > medium > low)', () => {
       const gaps = [
         { name: 'member_comms', severity: 'medium' },
         { name: 'documentation', severity: 'critical' },
         { name: 'reporting', severity: 'low' },
       ];
       const ranked = rankGaps(gaps);
       expect(ranked[0].severity).toBe('critical');
       expect(ranked[2].severity).toBe('low');
     });
     
     test('provides remediation suggestions for each gap', () => {
       const gap = { rule: 'member_communication', severity: 'high' };
       const suggestion = getRemediationSuggestion(gap);
       expect(suggestion).toContain('Send member communication');
       expect(suggestion).toBeDefined();
     });
   });
   ```

4. **Assessment Output Tests**
   ```typescript
   describe('AssessmentOutput', () => {
     test('generates assessment result object with all required fields', () => {
       const result = generateAssessmentResult(responses, scoredRules);
       expect(result).toHaveProperty('assessmentId');
       expect(result).toHaveProperty('overallScore');
       expect(result).toHaveProperty('status');
       expect(result).toHaveProperty('gaps');
       expect(result).toHaveProperty('completedAt');
     });
     
     test('formats result for JSON serialization', () => {
       const result = generateAssessmentResult(responses, rules);
       expect(() => JSON.stringify(result)).not.toThrow();
     });
     
     test('includes all gap analysis in result', () => {
       const result = generateAssessmentResult(responses, rules);
       expect(result.gaps.length).toBeGreaterThan(0);
       expect(result.gaps[0]).toHaveProperty('name');
       expect(result.gaps[0]).toHaveProperty('severity');
       expect(result.gaps[0]).toHaveProperty('suggestion');
     });
   });
   ```

---

### 2. Payment & Stripe Integration Tests

**File:** `lib/__tests__/stripe.test.ts`

**Test Categories:**

1. **Stripe Checkout Tests**
   ```typescript
   describe('StripeCheckout', () => {
     test('creates checkout session with correct amount', async () => {
       const session = await createCheckoutSession(userId, 'assessment');
       expect(session.amount_total).toBe(99900); // €999 in cents
       expect(session.currency).toBe('eur');
     });
     
     test('redirects to Stripe hosted checkout page', async () => {
       const session = await createCheckoutSession(userId, 'assessment');
       expect(session.url).toContain('stripe.com/pay');
     });
     
     test('attaches metadata (userId, productType)', async () => {
       const session = await createCheckoutSession(userId, 'assessment');
       expect(session.metadata).toEqual({
         userId,
         productType: 'assessment',
       });
     });
   });
   ```

2. **Webhook Handler Tests**
   ```typescript
   describe('StripeWebhookHandler', () => {
     test('processes checkout.session.completed webhook', async () => {
       const event = createMockStripeEvent('checkout.session.completed', {
         id: 'session_123',
         customer_email: 'user@example.com',
         metadata: { userId: 'user_1' },
       });
       
       const result = await handleStripeWebhook(event);
       expect(result.success).toBe(true);
       expect(result.action).toBe('grant_assessment_access');
     });
     
     test('grants assessment access to user after payment', async () => {
       const event = createMockStripeEvent('checkout.session.completed', {
         metadata: { userId: 'user_1' },
       });
       
       await handleStripeWebhook(event);
       const user = await getUserPurchases('user_1');
       expect(user.purchases).toContainEqual(
         expect.objectContaining({ status: 'completed' })
       );
     });
     
     test('logs webhook for audit trail', async () => {
       const event = createMockStripeEvent('payment_intent.succeeded', {});
       await handleStripeWebhook(event);
       
       const logged = await getWebhookLogs();
       expect(logged).toContainEqual(
         expect.objectContaining({ eventType: 'payment_intent.succeeded' })
       );
     });
   });
   ```

3. **Purchase Verification Tests**
   ```typescript
   describe('PurchaseVerification', () => {
     test('verifies user has purchased before allowing assessment', async () => {
       const hasPurchase = await verifyUserPurchase('user_1', 'assessment');
       expect(hasPurchase).toBe(true);
     });
     
     test('denies access if user has not purchased', async () => {
       const hasPurchase = await verifyUserPurchase('unpaid_user', 'assessment');
       expect(hasPurchase).toBe(false);
     });
   });
   ```

---

### 3. User Authentication & Dashboard Tests

**File:** `lib/__tests__/auth.test.ts`

**Test Categories:**

1. **Authentication Tests**
   ```typescript
   describe('Authentication', () => {
     test('user signs up with email/password', async () => {
       const user = await signUp('test@example.com', 'SecurePass123');
       expect(user.email).toBe('test@example.com');
       expect(user.id).toBeDefined();
     });
     
     test('user logs in with correct credentials', async () => {
       const session = await logIn('test@example.com', 'SecurePass123');
       expect(session.access_token).toBeDefined();
     });
     
     test('login fails with incorrect password', async () => {
       const attempt = await logIn('test@example.com', 'WrongPassword');
       expect(attempt).toThrow('Invalid credentials');
     });
     
     test('supports magic link login', async () => {
       const sent = await sendMagicLink('test@example.com');
       expect(sent.success).toBe(true);
       // In test, extract token from email
       const session = await signInWithMagicLink(testToken);
       expect(session.access_token).toBeDefined();
     });
   });
   ```

2. **Dashboard Tests**
   ```typescript
   describe('UserDashboard', () => {
     test('displays assessment status and score', async () => {
       const dashboard = await getUserDashboard(userId);
       expect(dashboard.assessments).toHaveLength(1);
       expect(dashboard.assessments[0]).toHaveProperty('status');
       expect(dashboard.assessments[0]).toHaveProperty('score');
     });
     
     test('shows download link for report', async () => {
       const assessment = await getAssessment(assessmentId);
       expect(assessment.reportUrl).toBeDefined();
       expect(assessment.reportUrl).toContain('download');
     });
   });
   ```

---

### 4. Email & Report Tests

**File:** `lib/__tests__/email.test.ts`

**Test Categories:**

1. **Email Sending Tests**
   ```typescript
   describe('EmailService', () => {
     test('sends assessment completion email', async () => {
       const sent = await sendAssessmentEmail(userId, assessmentResult);
       expect(sent.success).toBe(true);
       expect(sent.messageId).toBeDefined();
     });
     
     test('includes score in email', async () => {
       const sent = await sendAssessmentEmail(userId, result);
       expect(sent.content).toContain('Overall Score: 75%');
     });
     
     test('includes download link in email', async () => {
       const sent = await sendAssessmentEmail(userId, result);
       expect(sent.content).toContain('download');
       expect(sent.content).toContain('/reports/');
     });
   });
   ```

2. **Report Generation Tests**
   ```typescript
   describe('ReportGeneration', () => {
     test('generates HTML report from assessment result', () => {
       const html = generateReportHTML(assessmentResult);
       expect(html).toContain('<html>');
       expect(html).toContain('Overall Score');
       expect(html).toContain('Gaps');
     });
     
     test('includes all gaps in report with suggestions', () => {
       const html = generateReportHTML(assessmentResult);
       for (const gap of assessmentResult.gaps) {
         expect(html).toContain(gap.name);
         expect(html).toContain(gap.suggestion);
       }
     });
   });
   ```

---

## Test Execution Plan

### Immediate (Today - Sprint 1 Setup)

1. **Create test infrastructure**
   - Set up Jest configuration
   - Create test helper utilities
   - Set up test database (separate Supabase project)
   - Mock external services (Stripe, email)

2. **Write and verify tests for:**
   - Questionnaire module (rendering, validation, save/resume)
   - Scoring algorithm (section score, overall score, critical rules)
   - Gap analysis (gap identification, ranking, suggestions)

### This Week (Sprint 1 Coding)

3. **Code implementation paired with test execution**
   - Each feature: tests first, then implementation
   - Red → Green → Refactor cycle
   - Run test suite after each commit

### Next Week (Sprint 2)

4. **Payment & email tests**
   - Stripe integration tests
   - Email delivery tests
   - Report generation tests

---

## Test Infrastructure

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/lib', '<rootDir>/app'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
  },
  collectCoverageFrom: [
    'lib/**/*.ts',
    'app/**/*.ts',
    '!**/*.test.ts',
    '!**/node_modules/**',
  ],
};
```

### Mock Strategy

- **Stripe:** Use `stripe-mock` npm package
- **Email:** Jest mocks for Resend client
- **Database:** Use separate test Supabase project with real PostgreSQL
- **Authentication:** Supabase test token fixtures

### Coverage Target

- **Minimum:** 80% line coverage for core logic (assessments, scoring, payments)
- **Target:** 95% for compliance-critical features
- **Integration tests:** 100% of user journeys (purchase → assessment → report)

---

## Test Files to Create

| File | Purpose | Tests | ETA |
|------|---------|-------|-----|
| `questionnaire.test.ts` | Question rendering & validation | 15+ | 2h |
| `assessment-engine.test.ts` | Scoring & analysis | 20+ | 3h |
| `stripe.test.ts` | Payment integration | 10+ | 2h |
| `auth.test.ts` | Authentication | 8+ | 1.5h |
| `email.test.ts` | Email & reports | 8+ | 1.5h |
| `integration.test.ts` | Full user flow | 5+ | 2h |

**Total: ~12 hours test writing** (then implementation follows)

---

## Success Criteria

✅ All tests written before implementation  
✅ 100% of tests passing  
✅ >80% code coverage for core logic  
✅ All critical paths tested  
✅ Edge cases documented in tests  
✅ Ready to code Phase 1 features  

---

**Status:** Ready to execute TDD approach  
**Next Step:** Spawn Claude Code to write tests  
**Command:** `claude --print --permission-mode bypassPermissions "Build complete Jest test suite for Wtp Navigator Phase 1..."`
