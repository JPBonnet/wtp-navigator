# Test Coverage Expansion Plan - 80%+ Target

**Deadline:** 14:00 GMT+1 (1h 15m)  
**Strategy:** Parallel implementation across 3 repos  
**Goal:** Increase coverage from ~60-75% to 80%+ all repos

---

## WTP NAVIGATOR - Target 80% (from ~60%)

### Current Coverage: ~60%
- MVP tests: 250+ tests
- Admin/Billing/Collab: ~50 tests
- **Gap:** Missing edge cases, integration, error handling

### New Tests Required: 35-40 tests

#### 1. Admin Features Expanded (8 tests)
**File:** `lib/__tests__/admin-comprehensive.test.ts`
- User ban/unban workflow
- Analytics data consistency
- Payment reconciliation edge cases
- Ticket escalation workflow
- Audit log filtering & pagination
- Health check failure scenarios
- Report generation with empty data
- Admin permission validation

#### 2. Billing Features Expanded (8 tests)
**File:** `lib/__tests__/billing-comprehensive.test.ts`
- Subscription cancellation (mid-cycle)
- Bulk licensing with max tier discounts
- Invoice generation from partial data
- Payment method deletion with active subscription
- Refund reversal on dispute
- Subscription renewal failures
- Concurrent payment processing
- Billing portal access control

#### 3. Collaboration Features Expanded (8 tests)
**File:** `lib/__tests__/collaboration-comprehensive.test.ts`
- Team member role updates
- Assessment archive & restore
- Share link expiry handling
- Action item bulk operations
- Note conflict resolution
- Template cloning with dependencies
- Assessment version rollback
- Team deletion cascading

#### 4. API Error Handling (6 tests)
**File:** `lib/__tests__/api-errors.test.ts`
- 400 Bad Request validation
- 401 Unauthorized scenarios
- 403 Forbidden (RLS violations)
- 404 Not Found resources
- 409 Conflict (concurrent updates)
- 500 Server error recovery

#### 5. Authentication Edge Cases (5 tests)
**File:** `lib/__tests__/auth-edge-cases.test.ts`
- Session expiry & refresh
- Password reset flow
- Email verification retry
- Account lockout after N attempts
- Concurrent login sessions

---

## CHATPRESS - Target 80%+ (from ~75%)

### Current Coverage: ~75%
- Strong test suite already in place
- **Gap:** WordPress sync edge cases, error recovery

### New Tests Required: 12-15 tests

#### 1. WordPress Integration Edge Cases (6 tests)
**File:** `__tests__/wordpress-integration-edge.test.ts`
- Sync conflict resolution
- Large post batch handling (1000+ posts)
- Rate limiting retry logic
- Media attachment failure recovery
- Category/tag hierarchy edge cases
- Custom field validation

#### 2. Email Delivery Resilience (4 tests)
**File:** `__tests__/email-delivery-edge.test.ts`
- Bounced email handling
- Unsubscribe list management
- Email template rendering errors
- Attachment size limits

#### 3. Platform Edge Cases (3 tests)
**File:** `__tests__/platform-edge-cases.test.ts`
- Telegram rate limiting
- WhatsApp message delivery confirmation
- Multi-provider failover

#### 4. Performance & Load (2 tests)
**File:** `__tests__/performance.test.ts`
- Large document processing
- Concurrent webhook handling

---

## KLS WEBSITE - Target 80%+ (from ~70%)

### Current Coverage: ~70%
- Calculator tests: 87 tests
- Component tests: Present
- **Gap:** UI edge cases, form validation, responsive design

### New Tests Required: 18-20 tests

#### 1. Calculator Edge Cases (8 tests)
**File:** `__tests__/calculators-edge-extended.test.ts`
- Transfer duty with exactly R1.21M boundary
- Bond calculation with 0% interest rate
- Valuation with conflicting data
- Notarial with maximum service count
- Calculator with null/undefined inputs
- Decimal precision edge cases (R0.01)
- Maximum value limits (R1000M property)
- Negative number handling

#### 2. Form Validation Comprehensive (6 tests)
**File:** `__tests__/form-validation-comprehensive.test.ts`
- Email field validation (invalid formats)
- Phone number international formats
- Name field Unicode handling
- Date field boundary validation
- File upload size/type validation
- CAPTCHA verification flow

#### 3. Responsive Design Tests (4 tests)
**File:** `__tests__/responsive-design.test.ts`
- Mobile viewport rendering (320px width)
- Tablet viewport rendering (768px width)
- Desktop viewport rendering (1920px width)
- Touch interaction on mobile

#### 4. Dark Mode & Accessibility (2 tests)
**File:** `__tests__/accessibility.test.ts`
- Dark mode contrast ratios (WCAG AA)
- Keyboard navigation completeness

---

## IMPLEMENTATION STRATEGY

### Phase 1: Parallel Test File Creation (30 min)
- 3 repos simultaneously
- Use worktrees for isolation
- Write all test files
- No implementation yet (TDD)

### Phase 2: Implementation (35 min)
- Code to pass tests
- Focus on covering gaps
- Ensure red → green cycle

### Phase 3: Coverage Verification (10 min)
- Run coverage reports
- Verify 80%+ target
- Generate coverage badges

---

## COVERAGE METRICS

### Before
| Repo | Coverage | Status |
|------|----------|--------|
| Wtp | ~60% | 🟡 Below target |
| ChatPress | ~75% | 🟡 Below target |
| KLS | ~70% | 🟡 Below target |
| **Average** | **~68%** | **🔴 Below 80%** |

### After (Target)
| Repo | Coverage | Status |
|------|----------|--------|
| Wtp | 80%+ | 🟢 Target met |
| ChatPress | 80%+ | 🟢 Target met |
| KLS | 80%+ | 🟢 Target met |
| **Average** | **80%+** | **🟢 ALL GREEN** |

---

## EXECUTION TIMELINE

- **12:42-12:50:** Create test files (8 min)
- **12:50-13:20:** Implement code (30 min)
- **13:20-13:55:** Run & verify tests (35 min)
- **13:55-14:00:** Generate reports & commit (5 min)

**Total: 58 minutes**

---

## TEST ORGANIZATION

### Wtp Navigator
- `lib/__tests__/admin-comprehensive.test.ts` (8 tests)
- `lib/__tests__/billing-comprehensive.test.ts` (8 tests)
- `lib/__tests__/collaboration-comprehensive.test.ts` (8 tests)
- `lib/__tests__/api-errors.test.ts` (6 tests)
- `lib/__tests__/auth-edge-cases.test.ts` (5 tests)

### ChatPress
- `__tests__/wordpress-integration-edge.test.ts` (6 tests)
- `__tests__/email-delivery-edge.test.ts` (4 tests)
- `__tests__/platform-edge-cases.test.ts` (3 tests)
- `__tests__/performance.test.ts` (2 tests)

### KLS Website
- `__tests__/calculators-edge-extended.test.ts` (8 tests)
- `__tests__/form-validation-comprehensive.test.ts` (6 tests)
- `__tests__/responsive-design.test.ts` (4 tests)
- `__tests__/accessibility.test.ts` (2 tests)

---

## SUCCESS CRITERIA

✅ All 3 repos have 80%+ test coverage  
✅ All new tests passing  
✅ No regression in existing tests  
✅ Coverage reports generated  
✅ All code pushed to GitHub

---

**Total new tests: 63 tests across 3 repos**  
**Estimated coverage gain: +20% average**  
**Timeline: 60 minutes execution time**

