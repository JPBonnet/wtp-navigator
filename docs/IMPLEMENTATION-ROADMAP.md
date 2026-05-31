# Wtp Navigator — Implementation Roadmap

> **Last updated:** 30 May 2026
> **Target MVP launch:** End of May 2026
> **Project type:** B2B SaaS — Pension Transition Decision-Support Platform (augments regulated Wft advice)
> **Author:** Jean-Pierre Bonnet (Founder / Solo Engineer)
> **Note:** Revalidated 30 May 2026. Canonical facts (deadline, domain model, competitors, market sizing) live in [ASSUMPTIONS-VALIDATION.md](./ASSUMPTIONS-VALIDATION.md) and [SOURCES.md](./SOURCES.md).

---

## Executive Summary

Wtp Navigator is a software platform that helps Dutch employers (target: SMBs with an **insured** scheme at an insurer/PPI) navigate the transition to the new pension system mandated by the *Wet toekomst pensioenen* (Wtp). The tool provides automated decision-support assessments, migration planning, and actionable reports — getting employers decision-ready for a fraction of a full €5,000–€25,000 advisory engagement, with a clean handoff to a Wft-licensed adviser where regulated advice is required. A €999 self-service product cannot lawfully *be* the regulated Wft advice an insured-scheme transition requires; it augments that advice rather than replacing it.

This roadmap defines four implementation phases spanning from initial development through post-launch growth, with concrete sprint plans, technical milestones, resource allocation, risk mitigation strategies, and financial projections. Every phase is scoped for a **single full-time engineer** with selective outsourcing for design and content.

### Why This Roadmap Exists

Building a revenue-generating SaaS product as a solo founder requires ruthless prioritization. This document serves three purposes:

1. **Feasibility contract** — each sprint is scoped to what one engineer can realistically deliver in two weeks, with buffer time built in for debugging, testing, and unexpected blockers.
2. **Decision log** — technology choices are justified with clear rationale, so future contributors (or future-you) understand why choices were made.
3. **Accountability framework** — success criteria are measurable and binary. At each phase gate, you either hit the bar or you don't — and the document tells you what to do if you don't.

---

## Timeline Overview

| Phase | Timeframe | Focus | Key Outcome |
|-------|-----------|-------|-------------|
| **Phase 1** | Weeks 1–4 (Mar 23 – Apr 19, 2026) | MVP Foundation | Working purchase → assessment → report flow |
| **Phase 2** | Weeks 5–8 (Apr 20 – May 17, 2026) | Enhanced UX & Analytics | Launch-ready product with admin tooling |
| **Phase 3** | Weeks 9–12 (May 18 – Jun 14, 2026) | Integrations & Automation | HR integrations, partner API, production hardening |
| **Phase 4** | Post-launch (Jun 2026 onward) | Growth & Optimization | Revenue scaling, upsells, partnerships |

### Key Dates

- **Week 4 (Apr 19):** Assessment engine complete and internally testable
- **Week 8 (May 17):** Full UI/UX complete — MVP launch candidate
- **Week 12 (Jun 14):** All integrations working — full product release
- **Week 16 (Jul 12):** Growth mode active with marketing pipeline running

### Monthly Customer Acquisition Targets

| Month | Target (New) | Cumulative | Revenue (Est.) | Notes |
|-------|-------------|------------|----------------|-------|
| **Jun 2026** | 5 | 5 | €5K | Soft launch — beta customers from network |
| **Jul 2026** | 10 | 15 | €10K | Public launch, LinkedIn campaign starts |
| **Aug 2026** | 15 | 30 | €15K | First accountant partnership referrals |
| **Sep 2026** | 20 | 50 | €20K | Content marketing gaining traction |
| **Oct 2026** | 25 | 75 | €25K | Industry event presence |
| **Nov 2026** | 30 | 105 | €30K | Word-of-mouth accelerating |
| **Dec 2026** | 25 | 130 | €25K | Holiday slowdown |
| **Jan 2027** | 35 | 165 | €35K | New year urgency + deadline awareness |
| **Feb 2027** | 40 | 205 | €40K | Deadline pressure increasing |
| **Mar 2027** | 45 | 250 | €45K | 9 months to Wtp deadline |
| **Q2 2027** | 120 | 370 | €120K | Peak demand quarter |
| **Q3 2027** | 100 | 470 | €100K | Deadline-driven surge |
| **Q4 2027** | 80 | 550 | €80K | Final compliance push before Jan 2028 |
| **Year 1 Total** | — | **550** | **€550K+** | Including upsell revenue (~€1,200 blended ARPU) |

These are base-case targets. Conservative scenario is 60% of these numbers (330 customers, ~€330K). Optimistic scenario is 150% (825 customers, ~€825K).

---

## Technology Stack — Choices & Rationale

Every technology choice below was evaluated against three criteria: (1) can a solo engineer be productive with it on day one, (2) does it scale to thousands of users without re-architecture, and (3) does it minimize operational overhead.

### Core Stack

| Layer | Technology | Why This Choice | Alternatives Considered |
|-------|-----------|-----------------|------------------------|
| **Frontend** | Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui | App Router enables server components (faster loads, less client JS). TypeScript catches bugs at compile time. Tailwind + shadcn/ui provides professional UI components without custom design work — critical for a solo engineer. | Remix (less mature ecosystem), SvelteKit (smaller talent pool), plain React + Vite (no SSR out of the box) |
| **Backend** | Next.js API Routes / Server Actions | Co-located with frontend — no separate backend service to deploy and manage. Server Actions simplify form handling and data mutations. Reduces operational complexity for a solo engineer. | Separate Express/Fastify server (more infra to manage), Supabase Edge Functions only (limited debugging) |
| **Database** | PostgreSQL via Supabase | Supabase provides managed Postgres with built-in auth, storage, and real-time — one vendor for multiple needs. RLS (Row Level Security) enables multi-tenant data isolation at the database level without application-layer checks. PostgreSQL's JSON support handles flexible questionnaire schemas. | PlanetScale/MySQL (no RLS equivalent), MongoDB (relational data is a better fit for compliance rules), raw AWS RDS (more ops overhead) |
| **Auth** | Supabase Auth (email/password + magic link) | Zero additional vendor. Supports email/password for traditional users and magic link for frictionless access. SAML SSO can be added later for enterprise customers without migration. | Auth0 (expensive at scale, €23/1000 MAU), Clerk (vendor lock-in risk), NextAuth (more configuration, session management complexity) |
| **Payments** | Stripe Checkout + Webhooks | Industry standard for B2B SaaS. Stripe Checkout handles PCI compliance, supports Dutch payment methods (iDEAL via Stripe), and provides a hosted payment page — no custom payment UI needed. Webhook-driven architecture decouples payment from fulfillment. | Mollie (NL-focused but smaller ecosystem), Adyen (enterprise-oriented, complex setup), manual invoicing (doesn't scale) |
| **Email** | Resend | Modern transactional email with React-based templates (write emails as React components). Excellent deliverability, simple API. Free tier covers early usage (3,000 emails/month). | Postmark (slightly better deliverability but more expensive), SendGrid (bloated, deliverability issues), SES (complex setup) |
| **Storage** | Supabase Storage | Already using Supabase — no additional vendor. Handles PDF report storage with signed URLs for secure download. S3-compatible API means easy migration if needed. | AWS S3 (separate vendor + IAM complexity), Cloudflare R2 (cheaper but separate vendor) |
| **Hosting** | Vercel | First-class Next.js support (same company). Preview deployments per PR. Edge network for fast loads in NL and globally. Generous free tier, Pro at €20/month. | Netlify (less optimized for Next.js), AWS Amplify (more complex), self-hosted (too much ops for solo engineer) |
| **Analytics** | PostHog | Open-source, generous free tier (1M events/month). Product analytics + session recording + feature flags in one tool. EU hosting option for GDPR compliance. | Mixpanel (expensive after free tier), Amplitude (complex), Google Analytics (limited for product analytics) |
| **Monitoring** | Sentry | Industry standard for error tracking. Next.js SDK with automatic instrumentation. Alerts on new errors so issues are caught before customers report them. | LogRocket (expensive), Datadog (overkill for early stage), console.log (not viable for production) |
| **CI/CD** | GitHub Actions → Vercel | GitHub Actions runs tests and linting on every PR. Vercel auto-deploys on merge to main. Preview deployments for every PR enable visual review before merging. | GitLab CI (would require repo migration), CircleCI (separate vendor), Jenkins (self-hosted overhead) |
| **i18n** | next-intl | Purpose-built for Next.js App Router. Supports server components, static rendering, and type-safe translations. Lightweight compared to alternatives. | next-i18next (legacy Pages Router focus), react-intl (more boilerplate), custom solution (reinventing the wheel) |

### Why Not a Separate Backend?

A common question: why not build a separate API (e.g., NestJS, FastAPI) instead of using Next.js for everything?

For a solo engineer building an MVP, **co-location wins**. Having frontend and backend in one codebase means:
- One deployment pipeline, not two
- Shared TypeScript types between client and server (no API contract drift)
- Server Components can fetch data directly without an API round-trip
- One set of environment variables to manage
- Faster iteration speed — change the UI and the data layer in the same PR

The trade-off is that a monolithic Next.js app is harder to scale horizontally than a decoupled API. But at the expected scale (hundreds, not millions of users), Next.js on Vercel handles the load comfortably. If the product reaches a scale where separation is needed, the Server Actions and API Routes can be extracted into a standalone service without rewriting business logic.

### Why Supabase Over Firebase?

Both are "backend-as-a-service" platforms. Supabase wins for this project because:
- **PostgreSQL** — relational data (compliance rules, assessment relationships) maps naturally to SQL. Firebase's Firestore requires denormalization that adds complexity.
- **Row Level Security** — multi-tenant data isolation is enforced at the database level, not in application code. This is critical for a compliance product where data leaks are unacceptable.
- **SQL migrations** — schema changes are version-controlled and repeatable. Firestore has no schema enforcement.
- **Open source** — no vendor lock-in. The database can be exported and run anywhere PostgreSQL runs.
- **Pricing** — Supabase Pro at €25/month vs. Firebase's unpredictable pay-per-read pricing model.

---

## Phase 1: MVP Foundation (Weeks 1–4)

### Goal

Deliver a working end-to-end flow: a user purchases the assessment, completes the questionnaire, and receives a compliance report via email and in the dashboard.

### Feasibility Analysis (Solo Engineer)

Phase 1 is the most critical phase to get right. Here's the honest time budget for one engineer working 40 hours/week (160 hours total over 4 weeks):

| Task Category | Estimated Hours | % of Total |
|--------------|----------------|------------|
| Project scaffolding & infrastructure | 12h | 7.5% |
| Database schema & migrations | 10h | 6.3% |
| Assessment engine (questionnaire) | 28h | 17.5% |
| Assessment engine (analysis/scoring) | 20h | 12.5% |
| Stripe integration | 16h | 10.0% |
| User dashboard & auth | 24h | 15.0% |
| Email system | 10h | 6.3% |
| Report rendering (HTML, not PDF) | 12h | 7.5% |
| Testing & bug fixes | 16h | 10.0% |
| **Buffer (unplanned work)** | **12h** | **7.5%** |
| **Total** | **160h** | **100%** |

**Key scope decisions for feasibility:**
- PDF generation is deferred to Phase 2. HTML reports in the dashboard and email are sufficient for MVP.
- The admin dashboard is deferred to Phase 2. Use Supabase's built-in dashboard for data inspection during Phase 1.
- i18n is deferred to Phase 2. Build in English first; add Dutch when the UI is stable.
- The questionnaire content (actual Wtp compliance questions) can be hardcoded as JSON initially. A dynamic questionnaire builder is not needed for MVP.

### Features

- **Core assessment engine** — questionnaire + rule-based compliance analysis
- **Compliance checker** — validation against current Wtp legislation
- **Basic user dashboard** — view assessment status and results
- **One-time purchase flow** — Stripe Checkout integration
- **Email delivery of results** — automated report sent on completion

### Sprint Breakdown

#### Sprint 1 (Week 1–2): Foundation & Assessment Engine

**Tasks:**

1. **Project scaffolding & infrastructure** (12h)
   - Initialize Next.js application with TypeScript and App Router
   - Configure Supabase project (database, auth, storage)
   - Set up CI/CD pipeline (GitHub Actions → Vercel)
   - Configure environment management (dev/staging/prod)
   - Set up Sentry error tracking
   - Create basic project structure: `/app`, `/lib`, `/components`, `/types`

2. **Database schema design & migration** (10h)
   - Design core tables: `users`, `organizations`, `assessments`, `responses`, `results`
   - Create Supabase migrations with `supabase db diff`
   - Implement Row Level Security (RLS) policies — users can only access their own organization's data
   - Seed reference data (Wtp regulatory requirements, pension scheme types)
   - Design the `questionnaire_definitions` table to hold question structure as JSONB

3. **Assessment engine — questionnaire module** (28h)
   - Build questionnaire data model (sections, questions, answer types, conditional logic)
   - Implement question rendering engine (supports text, select, multi-select, numeric, date inputs)
   - Add progress tracking and section navigation
   - Implement save-and-resume functionality (persist partial responses to Supabase on each section completion)
   - Build client-side validation layer (required fields, format checks)
   - Create the initial Wtp questionnaire content (~30–50 questions across 5–7 sections)

4. **Assessment engine — analysis module** (20h)
   - Define compliance rule set based on Wtp requirements (as a typed ruleset in code)
   - Implement scoring algorithm (per-section and overall compliance score, 0–100)
   - Build gap analysis logic (identify specific non-compliant areas with severity levels)
   - Generate structured assessment output (typed TypeScript objects) for report rendering
   - Write unit tests for the scoring algorithm — this is the core IP of the product

**Dependencies:** None — this is the starting sprint.

**Deliverable:** A working assessment that can be completed in the browser and produces a compliance score with gap analysis.

#### Sprint 2 (Week 3–4): Payment, Dashboard & Email

**Tasks:**

1. **Stripe integration — one-time purchase** (16h)
   - Create Stripe product and price objects (€999 assessment)
   - Implement Stripe Checkout session creation via Server Action
   - Build purchase landing page with pricing information and value proposition
   - Handle Stripe webhooks (`checkout.session.completed`, `payment_intent.succeeded`)
   - Implement purchase verification middleware — gate assessment access behind payment
   - Store payment records in Supabase for audit trail

2. **User dashboard & authentication** (24h)
   - Implement authentication flow (Supabase Auth — email/password + magic link)
   - Build dashboard layout with sidebar navigation
   - Create assessment overview page (status: purchased → in-progress → completed)
   - Build results display page (compliance score visualization, gap analysis list, recommendations)
   - Add basic account settings page (profile, organization details)
   - Implement protected routes (redirect unauthenticated users to login)

3. **Email delivery system** (10h)
   - Set up Resend with verified sending domain
   - Build email templates as React components: welcome, purchase confirmation, results ready
   - Implement results email with inline compliance summary and link to full report in dashboard
   - Add basic retry logic for failed email sends (3 attempts with exponential backoff)

4. **Compliance report rendering — HTML** (12h)
   - Build report template as a React component with compliance status per section
   - Include actionable recommendations per identified gap
   - Add regulatory references (specific Wtp articles and clauses)
   - Render report in the dashboard as a dedicated page
   - Include the report summary in the results email

**Dependencies:** Sprint 1 (assessment engine must be functional).

**Deliverable:** Complete purchase-to-report flow. A user can buy, complete the assessment, and receive results via email and dashboard.

### Phase 1 Success Criteria

| Criterion | Target | How to Measure |
|-----------|--------|----------------|
| Assessment engine accuracy | 90%+ correct compliance scoring | Cross-check 10 test cases against manual expert assessment |
| End-to-end flow | Works without errors | 5+ internal test runs completed from purchase to report |
| Payment processing | Stripe webhooks received and processed | Verify in Stripe Dashboard + Supabase records |
| Email delivery | Results email arrives within 5 minutes | Test with 3+ email providers (Gmail, Outlook, corporate) |
| Page load performance | < 3 seconds on 4G connection | Lighthouse audit on key pages |
| Code quality | No critical bugs, tests pass | CI pipeline green, Sentry error-free |

### Phase 1 Risk Mitigation

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|-----------|--------|---------------------|
| **Questionnaire scope creep** — adding too many questions | High | Medium | Cap at 50 questions for MVP. Additional questions are a Phase 2 enhancement. Use user testing to identify which questions are essential vs. nice-to-have. |
| **Wtp rule complexity** — compliance rules harder to encode than expected | Medium | High | Start with the 10 most impactful rules. A partial assessment that covers the critical areas is more valuable than an incomplete attempt at full coverage. Consult domain expert for rule validation (budget 4–6 hours of expert time at €150/hour). |
| **Stripe webhook reliability** — missed payment events | Low | High | Implement idempotent webhook handlers. Add a manual "verify payment" admin action as a fallback. Use Stripe's webhook retry mechanism (up to 3 days). Log all webhook events for debugging. |
| **Sprint 1 overrun** — assessment engine takes longer than estimated | Medium | High | The 12-hour buffer is allocated here first. If Sprint 1 overruns by more than 8 hours, descope the conditional logic in the questionnaire (use a linear question flow instead). |
| **Email deliverability** — results emails landing in spam | Medium | Medium | Use Resend's verified domain feature. Set up SPF, DKIM, and DMARC records before sending any emails. Test with mail-tester.com before launch. |

### Phase 1 Technical Milestone

> **Week 4 checkpoint:** End-to-end flow works — purchase → questionnaire → analysis → report → email. Internal team can complete the full journey without errors. If this milestone is not met, do not proceed to Phase 2 until it is.

---

## Phase 2: Enhanced UX & Analytics (Weeks 5–8)

### Goal

Polish the user experience, add professional PDF reports, build operational tooling (admin dashboard, analytics), and implement Dutch language support. This phase transforms the MVP from "it works" to "it's ready for paying customers."

### Feasibility Analysis (Solo Engineer)

| Task Category | Estimated Hours | % of Total |
|--------------|----------------|------------|
| Migration planning module | 24h | 15.0% |
| PDF report generation | 16h | 10.0% |
| UI/UX polish (responsive, loading states, etc.) | 20h | 12.5% |
| Admin dashboard | 24h | 15.0% |
| Analytics integration | 10h | 6.3% |
| i18n (Dutch + English) | 20h | 12.5% |
| Accessibility & performance | 12h | 7.5% |
| Testing & bug fixes | 20h | 12.5% |
| **Buffer (unplanned work)** | **14h** | **8.8%** |
| **Total** | **160h** | **100%** |

**Key scope decisions:**
- The migration planner generates a static timeline based on assessment results. Interactive milestone tracking (drag-and-drop, status updates) is deferred to Phase 3 or later.
- Admin dashboard covers read operations (view customers, assessments) and basic actions (resend email, impersonate). Advanced admin features (bulk operations, revenue dashboards) are deferred.
- Analytics starts with event tracking only. Custom dashboards and conversion funnels are built in PostHog's UI, not as custom code.

### Features

- **Migration planning module** — step-by-step transition guide based on assessment results
- **PDF report generation** — branded, downloadable compliance report
- **Admin dashboard** — manage customers, view assessments, handle support
- **Analytics & metrics tracking** — product usage, conversion, engagement
- **Multi-language support** — Dutch (primary) + English
- **UI/UX polish** — responsive design, loading states, accessibility

### Sprint Breakdown

#### Sprint 3 (Week 5–6): Migration Planner & PDF Reports

**Tasks:**

1. **Migration planning module** (24h)
   - Design migration timeline template based on assessment results and gap analysis
   - Build step-by-step guide generator (tasks, estimated deadlines, responsible parties)
   - Create dependency mapping between migration steps (e.g., "works council consultation" must precede "employee communication")
   - Add regulatory deadline integration (Wtp transition dates — hard deadline Jan 1, 2028)
   - Build migration checklist UI with progress indicators
   - Generate the migration plan as part of the assessment output (no separate purchase required)

2. **PDF report generation** (16h)
   - Use `@react-pdf/renderer` for PDF generation (runs server-side, no Puppeteer/browser dependency — simpler deployment on Vercel)
   - Design branded PDF template: cover page with organization name, table of contents, compliance sections, migration plan, appendices
   - Implement compliance report PDF with score visualizations (bar charts per section)
   - Include migration plan timeline in PDF
   - Generate and store PDFs in Supabase Storage with signed URLs
   - Add PDF download button in dashboard and link in results email
   - Why `@react-pdf/renderer` over Puppeteer: no headless browser needed, works in serverless (Vercel), React components for templating (consistent with rest of stack), smaller bundle size

3. **UI/UX polish — first pass** (20h)
   - Implement responsive design for all existing pages (mobile-first — many HR managers check email on phone)
   - Add loading states, error boundaries, and empty states
   - Improve form UX: inline validation, auto-save indicators, progress bar
   - Add toast notifications for key actions (purchase confirmed, assessment submitted, report ready)
   - Implement breadcrumb navigation for multi-step flows

**Dependencies:** Phase 1 complete (assessment + report data available for PDF generation).

**Deliverable:** Users receive a professional PDF report and a tailored migration plan alongside their compliance assessment.

#### Sprint 4 (Week 7–8): Admin Dashboard, Analytics & i18n

**Tasks:**

1. **Admin dashboard** (24h)
   - Implement admin role in Supabase Auth (custom claim or `admin` flag on `users` table)
   - Build customer management view (list, search, filter by assessment status)
   - Create assessment detail view (admin can view any user's assessment results)
   - Add manual actions: resend results email, mark assessment as needs-review, add admin notes
   - Build basic impersonation (admin views dashboard as a specific user — read-only for support)
   - Add revenue overview (Stripe payment data aggregated by week/month — fetched via Stripe API, not stored)

2. **Analytics & metrics tracking** (10h)
   - Integrate PostHog SDK (client-side and server-side events)
   - Define and implement key events: `signup`, `purchase_started`, `purchase_completed`, `assessment_started`, `section_completed`, `assessment_completed`, `report_downloaded`
   - Set up conversion funnel in PostHog: visit → signup → purchase → start → complete → download
   - Configure weekly email digest in PostHog (DAU, conversion rates, revenue proxy)
   - Add assessment completion metrics: track time per section to identify drop-off points

3. **Multi-language support — Dutch + English** (20h)
   - Set up `next-intl` with App Router integration
   - Extract all user-facing strings to translation files (`/messages/nl.json`, `/messages/en.json`)
   - Translate UI strings to Dutch (primary language — this is the primary market)
   - Translate questionnaire content (questions, options, help text)
   - Translate report content and email templates
   - Add language switcher to header
   - Implement locale-aware formatting (dates: `dd-mm-yyyy` for NL, numbers: `1.000,00` for NL)
   - Set Dutch as default locale, detect browser preference

4. **Accessibility & performance** (12h)
   - Accessibility audit using axe-core — fix all critical and serious issues (WCAG 2.1 AA)
   - Keyboard navigation for all interactive elements
   - Performance optimization: optimize images, minimize client-side JS, lazy-load below-fold content
   - Core Web Vitals targets: LCP < 2.5s, FID < 100ms, CLS < 0.1
   - SEO setup: meta tags, `robots.txt`, sitemap, structured data for product pages

**Dependencies:** Sprint 3 (migration planner and PDF are needed for a complete admin view).

**Deliverable:** Production-ready UI with admin tooling, analytics, bilingual support, and accessibility compliance.

### Phase 2 Success Criteria

| Criterion | Target | How to Measure |
|-----------|--------|----------------|
| Beta customer assessments | 5+ completed by real users | Count in Supabase |
| PDF report quality | Rated "professional" by 4/5 beta testers | Qualitative feedback survey |
| Admin dashboard | All CRUD operations work | Manual testing checklist |
| Dutch translation | 100% of user-facing strings translated | Automated check for missing translation keys |
| Page load performance | LCP < 2.5s (p95) | Vercel Analytics + Lighthouse |
| Accessibility | Zero critical/serious axe violations | Automated CI check |
| Analytics | All key events firing correctly | PostHog event verification |
| Beta customer feedback | NPS > 30 among beta users | Survey after assessment completion |

### Phase 2 Risk Mitigation

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|-----------|--------|---------------------|
| **PDF generation issues on Vercel** — serverless timeout or memory limits | Medium | Medium | `@react-pdf/renderer` runs in-process (no browser). If reports are too large, split generation into sections and merge. Fallback: generate PDFs via a Supabase Edge Function with longer timeout limits. |
| **Translation quality** — machine translation of compliance terms is inaccurate | High | Medium | Do NOT machine-translate questionnaire content. Write Dutch content first (it's the primary market), then translate to English. Budget 8 hours for a native Dutch speaker to review compliance terminology. |
| **Beta tester recruitment** — can't find 5 willing beta testers | Medium | High | Start outreach in Week 3 (during Phase 1). Target: identify 10 candidates to get 5 committed testers. Sources: personal network, LinkedIn, local business associations (KvK). Offer: free assessment + 30-minute consultation call. |
| **Admin dashboard scope creep** — temptation to build a full-featured admin | High | Medium | The admin dashboard in Phase 2 is for support and monitoring only. Revenue dashboards, bulk operations, and partner management are Phase 3+. If in doubt, use the Supabase dashboard directly. |
| **i18n integration breaks existing UI** — translation strings change layout | Medium | Low | Use `next-intl` namespace approach. Test Dutch translations (which are often longer than English) on all screen sizes. Add i18n to CI pipeline to catch missing keys. |

### Phase 2 Technical Milestone

> **Week 8 checkpoint:** Full UI/UX complete. MVP is launch-ready for beta customers. All user-facing features polished, admin can manage customers, analytics flowing, Dutch + English fully supported. **This is the MVP launch gate.** If this milestone is met, begin soft launch to beta customers.

---

## Phase 3: Integrations & Automation (Weeks 9–12)

### Goal

Connect to external HR systems, add data import/export capabilities, build a partner API, and harden the system for production scale. This phase transforms the product from "standalone tool" to "connected platform."

### Feasibility Analysis (Solo Engineer)

Phase 3 is the most ambitious phase. HR integrations involve third-party API dependencies that are inherently unpredictable. The scope is designed with explicit fallbacks.

| Task Category | Estimated Hours | % of Total |
|--------------|----------------|------------|
| HR integration — Personio | 20h | 12.5% |
| HR integration — BambooHR | 16h | 10.0% |
| Data import/export (CSV/Excel) | 16h | 10.0% |
| Partner API | 24h | 15.0% |
| Automated compliance checks | 12h | 7.5% |
| Security audit & GDPR | 16h | 10.0% |
| Performance testing & monitoring | 10h | 6.3% |
| Launch preparation | 12h | 7.5% |
| Testing & bug fixes | 20h | 12.5% |
| **Buffer** | **14h** | **8.8%** |
| **Total** | **160h** | **100%** |

**Key scope decisions:**
- If HR integrations prove more complex than estimated, **CSV/Excel import is the fallback** — it delivers 80% of the value (auto-population of assessment fields) without API dependencies.
- The partner API starts with read-only endpoints (get assessment results, get compliance status). Write endpoints (create assessment, submit responses) are added based on partner demand.
- Security audit is a self-assessment against OWASP Top 10, not a paid external pentest. External pentest can be budgeted for Phase 4 if revenue supports it.

### Features

- **HR system integrations** — Personio, BambooHR (with CSV fallback)
- **Data import/export** — CSV/Excel upload and download
- **Automated compliance verification** — scheduled re-checks
- **Partner API** — RESTful API with API key authentication
- **Production hardening** — security audit, GDPR review, load testing

### Sprint Breakdown

#### Sprint 5 (Week 9–10): HR Integrations & Data Import/Export

**Tasks:**

1. **HR system integration — Personio** (20h)
   - Research Personio API: employee data, contracts, benefits, compensation
   - Implement OAuth2 connection flow (redirect-based authorization)
   - Build data mapping layer (Personio employee fields → assessment questionnaire inputs)
   - Auto-populate assessment questionnaire from Personio data (pre-fill, user confirms)
   - Handle incremental sync (detect changes since last sync, prompt re-assessment if material)
   - Add connection management UI (connect, disconnect, sync status, last synced timestamp)

2. **HR system integration — BambooHR** (16h)
   - Implement API key-based authentication (simpler than Personio's OAuth)
   - Build data mapping layer (same interface as Personio — adapter pattern)
   - Auto-populate assessment from BambooHR data
   - Add to connection management UI
   - BambooHR is second priority — if Personio takes longer than estimated, BambooHR can be deferred to Phase 4

3. **Data import/export** (16h)
   - Build CSV import for employee/pension data with validation and clear error reporting
   - Build Excel import (`.xlsx` parsing via SheetJS library)
   - Implement CSV/Excel export for assessment results and migration plan
   - Add bulk data validation with row-level error messages ("Row 15: invalid pension scheme type")
   - Create downloadable import templates with example data and column descriptions
   - This is the **critical fallback** if HR integrations are delayed — every customer can use CSV import

4. **Integration framework** (included in above estimates)
   - Design abstract integration interface (`HRIntegration` TypeScript interface) so adding future HR systems (AFAS, Visma) follows a consistent pattern
   - Build integration health monitoring (connection status, last sync, error count)
   - Add integration-specific error handling and retry logic (rate limits, token refresh)

**Dependencies:** Phase 2 complete (admin dashboard needed for integration management views).

**Deliverable:** Users can connect their HR system or upload data files to auto-populate assessments, significantly reducing manual data entry.

#### Sprint 6 (Week 11–12): Automation, API & Launch Prep

**Tasks:**

1. **Automated compliance verification** (12h)
   - Implement scheduled re-assessment via Vercel Cron Jobs (monthly check)
   - Build change detection (compare current assessment results against previous run, flag differences)
   - Create compliance status monitoring in the dashboard (green/yellow/red indicator)
   - Implement email alerts when compliance status changes (e.g., regulatory update makes a previously compliant area non-compliant)
   - Add regulatory update ingestion process (manual update of rule set when Wtp guidance changes — document the process as a runbook)

2. **Partner API** (24h)
   - Design RESTful API with OpenAPI 3.0 specification
   - Implement API authentication (API keys with per-partner scoping, stored hashed in database)
   - Build core endpoints: `GET /assessments`, `GET /assessments/:id/results`, `GET /assessments/:id/compliance-status`, `POST /assessments` (create on behalf of customer)
   - Add rate limiting (100 requests/minute per API key) and usage tracking
   - Generate API documentation (Swagger UI served at `/api/docs`)
   - Create partner onboarding flow in admin dashboard (generate API key, set permissions)
   - Build sandbox mode (separate test environment flag, no real payments)

3. **Launch preparation — security & compliance** (16h)
   - OWASP Top 10 self-assessment: verify input sanitization, CSRF protection, authentication, authorization (RLS), secure headers, dependency audit (`npm audit`)
   - GDPR compliance review: document data processing activities, create privacy policy, draft Data Processing Agreement (DPA) template for B2B customers, implement data export (GDPR right of access) and data deletion (right to erasure) endpoints
   - Review and implement data retention policies (assessment data retained for 7 years per Dutch tax/pension regulations, with option for customer-initiated deletion)

4. **Launch preparation — operational readiness** (22h, including buffer)
   - Performance load testing: simulate 100 concurrent users completing assessments (use k6 or Artillery)
   - Set up monitoring and alerting: Vercel uptime monitoring, Sentry error rate alerts (> 5 errors/minute), Supabase database connection monitoring
   - Create operational runbook: how to deploy, how to rollback, how to handle common support requests, how to update compliance rules
   - Final staging environment validation: complete 3 full end-to-end runs on staging (purchase → assessment → report) before marking as production-ready
   - Backup verification: confirm Supabase automated backups are running, test point-in-time recovery

**Dependencies:** Sprint 5 (integrations inform automation scope and admin views).

**Deliverable:** Full product with integrations, partner API, and launch-ready operational posture.

### Phase 3 Success Criteria

| Criterion | Target | How to Measure |
|-----------|--------|----------------|
| HR integration | At least 1 integration live with real customer data OR CSV import used by 3+ beta customers | Usage logs |
| Partner API | Documented, tested by 1+ partner in sandbox | Partner feedback |
| Automated checks | Monthly compliance re-check runs without manual intervention | Cron job logs |
| Security | No critical/high findings in OWASP self-assessment | Documented review |
| GDPR | Privacy policy published, DPA template available, data export/deletion endpoints working | Manual testing |
| Load testing | System handles 100 concurrent users with p95 response time < 3 seconds | k6 test results |
| Operational readiness | Runbook complete, monitoring active, backups verified | Checklist sign-off |

### Phase 3 Risk Mitigation

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|-----------|--------|---------------------|
| **HR API access delays** — Personio/BambooHR partner approval takes weeks | High | Medium | Apply for API access in Week 1 of the project (not Week 9). If access isn't granted by Sprint 5, prioritize CSV import and defer HR integrations. CSV import covers 80% of the use case. |
| **API design churn** — partner requirements change the API shape | Medium | Medium | Design the API with versioning from day one (`/v1/`). Start with read-only endpoints. Only add write endpoints after a real partner has validated the read API. |
| **Load testing reveals bottlenecks** — database queries too slow | Medium | Medium | Add database indexes based on query patterns identified during testing. Supabase Pro includes connection pooling. If needed, add caching (Vercel KV) for frequently-read data like questionnaire definitions. |
| **GDPR complexity** — legal review takes longer/costs more than expected | Medium | Medium | Draft the privacy policy and DPA using templates from the Dutch DPA (Autoriteit Persoonsgegevens). Legal review budget: €1,500–€2,500. If legal review is delayed, launch with template-based documents and get formal review within 30 days of launch. |
| **Solo engineer burnout** — 12 weeks of intense solo development | High | High | Build in 2 "recovery days" per sprint (not counted in estimates). If Phase 3 scope feels overwhelming, defer BambooHR integration and the partner API sandbox to post-launch. The core product works without these. |

### Phase 3 Technical Milestone

> **Week 12 checkpoint:** All core integrations working. API documented and testable. System is production-hardened with security review, GDPR compliance, and operational monitoring in place. **This is the full product release gate.**

---

## Phase 4: Growth & Optimization (Post-Launch)

### Goal

Drive revenue growth through upselling, partnerships, mobile access, and AI-powered insights. Shift from "building the product" to "growing the business."

### Features

- **Upsell modules** — implementation support packages, training programs
- **Partnership integrations** — pension providers, advisory firms
- **Mobile app** — responsive PWA for on-the-go access
- **AI-powered recommendations** — personalized action plans using LLMs

### Planned Initiatives

#### Q3 2026 (Jul–Sep): Upsell & Partnerships

**Monthly Customer Targets:** Jul: 10, Aug: 15, Sep: 20 (cumulative: 50 by end of Sep)

1. **Upsell modules**
   - Implementation support package: guided migration with expert review (€499 add-on, target 20% attach rate)
   - Employee communication package: templates for works council and employee notifications (€299, target 30% attach rate)
   - Premium compliance monitoring: real-time alerts + quarterly review call (€499/year subscription, target 15% attach rate)
   - Subscription billing via Stripe (monthly/annual plans) for recurring upsells
   - In-app contextual upsell prompts based on assessment results (e.g., "Your works council communication gap could be addressed with our Employee Communication Package")

2. **Partnership integrations**
   - Accountant referral program: 15–20% commission per referral, tracked via unique referral codes
   - Pension provider data feeds: scheme details, transition timelines (start with 2 major NL providers)
   - Advisory firm white-label offering: their branding, our engine (€5,000+ per firm, annual license)
   - Partner portal in admin dashboard: referral tracking, commission reporting, co-branded materials

#### Q4 2026 (Oct–Dec): Mobile & AI

**Monthly Customer Targets:** Oct: 25, Nov: 30, Dec: 25 (cumulative: 130 by end of Dec)

3. **Mobile experience**
   - Progressive Web App (PWA) configuration: add `manifest.json`, service worker for offline shell
   - Push notifications for compliance alerts and migration deadlines
   - Optimize questionnaire UI for touch interaction (larger tap targets, swipe navigation)
   - Evaluate native app (React Native) based on user demand — only build if >30% of users access via mobile

4. **AI-powered recommendations**
   - Integrate Claude API for natural-language report summaries (transform structured gap analysis into readable narrative)
   - Build AI chatbot for Wtp questions using RAG over regulatory documents (Wtp text, government guidance, DNB publications)
   - Generate personalized migration timelines based on organization profile (size, industry, pension scheme type)
   - Predictive analytics: risk scoring (likelihood of missing deadlines), effort estimation (hours of work per migration step)

#### 2027: Scale Phase

**Customer Targets:** 250 by Jun 2027, 500+ by Dec 2027

5. **Platform expansion**
   - Multi-tenant architecture for enterprise customers (parent company manages subsidiaries)
   - Custom assessment templates (configurable by partners — pension providers can add scheme-specific questions)
   - Marketplace for third-party add-ons (legal document review, actuarial calculations)
   - International expansion research: Belgium pension reform (2028–2030), Germany Betriebsrentenstärkungsgesetz — assess market size and regulatory similarity before committing resources

### Phase 4 Success Criteria

| Criterion | Target | How to Measure |
|-----------|--------|----------------|
| Customer acquisition | 50 by Sep 2026, 130 by Dec 2026 | Supabase user count |
| Revenue | €130K+ cumulative by Dec 2026 | Stripe dashboard |
| Upsell attach rate | > 15% blended across all upsells | Purchase records |
| Partner referrals | 20%+ of new customers via partners by Q4 2026 | Referral code tracking |
| NPS | > 40 | Quarterly survey |
| Assessment completion rate | > 80% (of started assessments) | PostHog funnel |
| Customer acquisition cost | < €200 blended | Marketing spend / new customers |
| Churn (subscription upsells) | < 5% monthly | Stripe subscription data |

### Phase 4 Risk Mitigation

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|-----------|--------|---------------------|
| **Low organic demand** — marketing doesn't generate enough leads | Medium | High | Offer a **free compliance score** (abbreviated 5-minute assessment) as a lead magnet. Capture email, show partial results, gate full assessment behind payment. Target: 10–15% conversion from free to paid. |
| **Partnership deals stall** — accountants slow to adopt | High | Medium | Start with 3–5 accountant partnerships, not 50. Offer the first cohort generous terms (25% commission, co-marketing). Use their success stories to recruit the next wave. |
| **AI features underwhelm** — LLM output isn't trustworthy enough for compliance context | Medium | Medium | Position AI features as "draft" and "assistant" — never as authoritative compliance advice. All AI-generated content includes a disclaimer. Human review is always available via premium support. |
| **Competition emerges** — a well-funded competitor launches a similar product | Medium | High | Speed is the moat. By the time a competitor launches, Wtp Navigator should have 100+ customers, case studies, and partnership lock-in. Focus on customer success (NPS > 40) to build word-of-mouth defensibility. |
| **Market window closes** — companies delay Wtp compliance until 2027 | Medium | Medium | This actually extends the revenue window. Position marketing around deadline urgency: "Only X months left to comply." As the deadline approaches, urgency increases and conversion rates improve. |

### Phase 4 Technical Milestone

> **Week 16 checkpoint (Jul 12, 2026):** Growth mode active. First paying customers onboarded. Marketing pipeline generating leads. Upsell modules in development. First partnership agreement signed.

---

## Resource Allocation

### Team Structure

| Role | Allocation | Source | When Needed |
|------|-----------|--------|-------------|
| **Full-stack engineer** | Full-time (40h/week) | In-house (founder) | Phase 1 onward |
| **Designer / Product** | Part-time (10–15h/week) | Freelance | Phase 1–2 (design package) |
| **Pension domain expert** | Advisory (4–8h/month) | Freelance consultant | Phase 1 onward (rule validation) |
| **Sales / Marketing** | Part-time (10–15h/week) | Founder + freelance content | Phase 3 onward |
| **Customer support** | Part-time (10h/week) | Founder initially, hire Q4 2026 | Phase 4 onward |
| **Junior developer** | Full-time | Hire when revenue supports it | Q1 2027 (if >€15K MRR) |

### Time Distribution by Phase

| Phase | Engineering | Design | Sales/Marketing | Support |
|-------|-------------|--------|-----------------|---------|
| Phase 1 | 90% | 10% | 0% | 0% |
| Phase 2 | 70% | 20% | 10% | 0% |
| Phase 3 | 75% | 5% | 15% | 5% |
| Phase 4 | 50% | 10% | 25% | 15% |

### Hiring Triggers

Do not hire based on timeline — hire based on revenue milestones:

| Milestone | Hire | Rationale |
|-----------|------|-----------|
| €10K MRR | Freelance content writer | Engineering time should not be spent on blog posts |
| €15K MRR | Part-time customer support | Support volume will exceed what founder can handle alongside engineering |
| €25K MRR | Junior developer | Feature velocity needs to increase for competitive positioning |
| €50K MRR | Marketing lead | Growth strategy needs dedicated attention |

---

## Budget Estimate

### Development & Tools (Monthly Recurring)

| Item | Cost/Month | Notes |
|------|-----------|-------|
| Vercel Pro | €20 | Hosting, deployments, analytics |
| Supabase Pro | €25 | Database, auth, storage, edge functions |
| Resend | €20 | Transactional email (scales with volume) |
| Sentry | €26 | Error tracking and performance monitoring |
| PostHog | €0 | Free tier (1M events/month — sufficient for Year 1) |
| Domain + DNS (Cloudflare) | €4 | Primary domain, amortized |
| **Total monthly infra** | **~€95** | Scales modestly with usage |

### One-Time Costs

| Item | Cost | Notes |
|------|------|-------|
| Freelance UI/UX designer | €3,000–€5,000 | Design system, key screens, branding |
| Legal review (terms, privacy, DPA) | €2,000–€3,000 | Dutch business lawyer |
| Domain expert consultation | €1,000–€1,500 | Pension specialist for rule validation |
| Design tools (Figma) | €15/month | UI design and collaboration |
| **Total one-time** | **€6,000–€10,000** | |

### Marketing (First 6 Months Post-Launch)

| Item | Cost | Notes |
|------|------|-------|
| LinkedIn ads | €3,000–€6,000 | Targeted B2B campaigns (Dutch SMBs, HR managers) |
| Content creation | €1,500–€3,000 | Blog posts, guides, case studies (freelance writer) |
| SEO tools (Ahrefs/SE Ranking) | €600 | Keyword research, competitor tracking |
| Landing page optimization | €500–€1,000 | A/B testing tools (Vercel Experiments) |
| Events / webinars | €1,000–€2,000 | Industry events, hosted webinars |
| **Total marketing (6 months)** | **€7,000–€13,000** | |

### Contingency

| Item | Amount |
|------|--------|
| Unexpected costs, scope changes, delays | €5,000 |

### Total Budget Summary

| Category | Amount |
|----------|--------|
| Infrastructure (Year 1) | €1,200 |
| One-time development costs | €6,000–€10,000 |
| Marketing (first 6 months) | €7,000–€13,000 |
| Contingency | €5,000 |
| **Total to launch + first 6 months** | **€19,000–€29,000** |

Note: Stripe processing fees (1.4% + €0.25/transaction in EU) are not included as they are deducted from revenue, not paid upfront.

---

## Revenue Forecast

### Pricing Model

| Tier | Price | Includes |
|------|-------|----------|
| **Core Assessment** | €999 | Full compliance assessment, migration plan, PDF report, 90-day email support |
| **Premium** | €1,499 | Core + implementation support package + employee communication templates |
| **Enterprise** | €5,000+ | Custom pricing, multi-entity support, dedicated account manager, SAML SSO |

### Blended Revenue Per Customer

Assuming upsell attach rates: 20% implementation support (€499), 30% employee comms (€299), 15% annual monitoring (€499):

**Blended ARPU:** €999 + (0.20 × €499) + (0.30 × €299) + (0.15 × €499) = **€999 + €100 + €90 + €75 = ~€1,264**

### Revenue Projections (Base Case)

| Period | New Customers | Revenue | Cumulative Revenue |
|--------|-------------|---------|-------------------|
| Jun 2026 | 5 | €6,300 | €6,300 |
| Jul 2026 | 10 | €12,600 | €18,900 |
| Aug 2026 | 15 | €19,000 | €37,900 |
| Sep 2026 | 20 | €25,300 | €63,200 |
| Oct 2026 | 25 | €31,600 | €94,800 |
| Nov 2026 | 30 | €37,900 | €132,700 |
| Dec 2026 | 25 | €31,600 | €164,300 |
| Q1 2027 | 120 | €151,700 | €316,000 |
| Q2 2027 | 120 | €151,700 | €467,700 |
| Q3 2027 | 100 | €126,400 | €594,100 |
| Q4 2027 | 80 | €101,100 | **€695,200** |

**Year 1 total (Jun 2026–May 2027): ~€470K**
**18-month total (Jun 2026–Dec 2027): ~€695K**

### Scenario Analysis

| Scenario | Year 1 Revenue | 18-Month Revenue | Customers (18 months) |
|----------|---------------|-------------------|----------------------|
| **Conservative (60%)** | €280K | €420K | 330 |
| **Base case** | €470K | €695K | 550 |
| **Optimistic (150%)** | €700K | €1.04M | 825 |

### Break-Even Analysis

- **Monthly fixed costs:** ~€3,000–€4,000 (infrastructure + marketing amortized)
- **Variable cost per customer:** ~€85–€130 (hosting marginal cost, support time, email)
- **Contribution margin per customer:** ~€1,100–€1,180
- **Break-even point:** **3–4 customers per month**
- **Expected to reach break-even:** Month 1 post-launch (target: 5 customers in June 2026)

### Revenue Growth Drivers

1. **Regulatory urgency:** Wtp deadline (Jan 1, 2028) creates genuine time pressure — employers must act, and the window is narrowing.
2. **Upsell revenue:** Premium/enterprise tiers and add-on packages increase ARPU by ~26% above base price.
3. **Recurring revenue:** Compliance monitoring subscriptions (€499/year) create MRR starting Q3 2026, building a revenue floor.
4. **Partner channel:** Accountant referral program (15–20% commission) can drive 25%+ of customers at lower CAC than direct marketing.
5. **Word of mouth:** In the Dutch SMB market, business owners talk to each other. High NPS (>40) drives organic referrals.

---

## Dependencies & Risks — Consolidated View

### Critical Dependencies

| Dependency | Phase Affected | Impact if Delayed | Lead Time | Action Required |
|-----------|---------------|-------------------|-----------|-----------------|
| Wtp regulatory clarity | Phase 1 | Assessment rules may be incomplete | Ongoing | Monitor government publications weekly; build rule engine to be easily updatable; consult domain expert quarterly |
| Freelance designer | Phase 1–2 | UI quality and launch timeline delayed | 2–4 weeks | Identify and engage by Week 1; have backup candidate identified; use shadcn/ui defaults if designer is unavailable |
| HR system API access (Personio, BambooHR) | Phase 3 | Integration timeline delayed | 2–6 weeks for approval | Apply for API access in Week 1 of project; use CSV import as guaranteed fallback |
| Beta testers (5 companies) | Phase 2 | Cannot validate product-market fit | 2–3 weeks to recruit | Begin outreach in Week 3; target 10 candidates to get 5 committed |
| Legal review (terms, DPA, privacy) | Phase 3 | Cannot launch without privacy policy | 2–4 weeks | Engage lawyer in Week 4; use template-based documents as interim solution |
| Pension domain expert | Phase 1 | Rule accuracy risk | 1–2 weeks | Identify expert through professional network; budget €150/hour for 6–10 hours total |

### Risk Register

| # | Risk | Likelihood | Impact | Phase | Mitigation | Contingency (if risk materializes) |
|---|------|-----------|--------|-------|------------|-----------------------------------|
| R1 | **Competition from traditional consultants** who lower prices | High | Medium | All | Compete on speed (instant vs. weeks), consistency (algorithm vs. human), and scalability. Price is 10x lower. | Emphasize self-service convenience and 24/7 availability. Add "consultant review" upsell for customers who want human validation. |
| R2 | **Customer education needed** — SMBs don't know they need this | High | Medium | Phase 4 | Content marketing, webinars, free compliance checklist as lead magnet. Partner with accountants who already have the trust relationship. | Double down on accountant partnerships. They are the trusted advisors who can recommend the tool. |
| R3 | **Regulatory changes after launch** — Wtp rules are amended | Medium | High | All | Modular rule engine with version-controlled rule sets. Domain expert monitors regulatory changes. | Emergency rule update process: hotfix deployment within 48 hours of regulatory change. Customer notification email for affected assessments. |
| R4 | **Single-engineer risk** — bus factor of 1 | Medium | High | All | Document architecture decisions in code comments and ADRs. Write tests for critical paths (scoring algorithm, payment flow). Keep codebase simple and conventional (Next.js standard patterns). | If founder is unavailable for >2 weeks: codebase is conventional enough for a contract developer to maintain. Supabase and Vercel handle infrastructure automatically. |
| R5 | **Scope creep** — feature requests from beta testers expand MVP | High | Medium | Phase 1–2 | Strict phase gates: do not advance until current phase success criteria are met. Maintain a "Phase 4+ backlog" for good ideas that aren't MVP-critical. | If scope creep has already caused delays: cut the lowest-priority feature from the current phase (see "What to Cut" section below). |
| R6 | **Low initial conversion** — free traffic doesn't convert to purchases | Medium | High | Phase 4 | Offer free abbreviated compliance score (5-minute assessment) as lead gen. Follow up with email sequence. Add social proof (customer count, testimonials). | Reduce price to €499 for first 50 customers ("early adopter pricing"). If still no conversion, the value proposition needs rethinking — pivot to a different delivery model (e.g., consultant-assisted instead of self-serve). |
| R7 | **Data security incident** — customer pension data is exposed | Low | Critical | All | RLS enforced at database level. All API endpoints require authentication. Regular dependency audits (`npm audit`). Sentry monitors for unusual patterns. | Incident response plan: notify affected customers within 72 hours (GDPR requirement). Engage cybersecurity consultant. Publish post-mortem. Offer free credit monitoring if personal data was exposed. |
| R8 | **Burnout** — sustained 40h/week solo development is unsustainable | High | High | All | Build in 2 rest days per sprint (not counted in estimates). Take at least 1 full day off per week. Automate repetitive tasks (CI/CD, deployments, monitoring). | If burnout occurs: take a 1-week break. Hire a freelance developer to handle the highest-priority items. Reduce scope of current phase. |

### What to Cut (Emergency Descoping Guide)

If any phase is running behind schedule, cut features in this order (least critical first):

**Phase 1:**
1. Cut conditional logic in questionnaire (use linear flow)
2. Cut email receipt/invoice generation (Stripe sends its own receipts)
3. Cut magic link auth (keep email/password only)
4. Do NOT cut: assessment scoring engine, Stripe payment flow, results display

**Phase 2:**
1. Cut weekly automated metrics email (use PostHog dashboard directly)
2. Cut English translation (launch Dutch-only, add English in Phase 3)
3. Cut admin impersonation (use Supabase dashboard for support)
4. Do NOT cut: PDF report generation, Dutch translation, admin customer list

**Phase 3:**
1. Cut BambooHR integration (keep Personio + CSV)
2. Cut partner API sandbox environment (partners test against staging)
3. Cut automated compliance re-checks (run manually monthly)
4. Do NOT cut: CSV import/export, security audit, GDPR compliance, Personio integration

---

## Success Criteria — Full Summary

### Phase 1 (Week 4 — Apr 19, 2026)
- [ ] Assessment engine produces accurate compliance scores (validated against 10 manual test cases)
- [ ] Stripe payment flow works end-to-end (purchase → webhook → access granted)
- [ ] Results delivered via email within 5 minutes of assessment completion
- [ ] 5+ internal test runs completed without critical errors
- [ ] CI/CD pipeline running (tests pass, auto-deploy on merge)

### Phase 2 (Week 8 — May 17, 2026 — MVP Launch Gate)
- [ ] 5 beta customers have completed assessments and provided feedback
- [ ] PDF reports rated "professional" by 4/5 beta testers
- [ ] Admin dashboard operational (view customers, view assessments, resend emails)
- [ ] Dutch translation 100% complete for all user-facing strings
- [ ] Page load times under 2.5 seconds (LCP, p95)
- [ ] Zero critical accessibility violations (axe-core automated audit)
- [ ] PostHog analytics capturing all key events correctly
- [ ] Beta customer NPS > 30

### Phase 3 (Week 12 — Jun 14, 2026 — Full Release Gate)
- [ ] At least 1 HR integration live with real customer data OR CSV import used by 3+ customers
- [ ] Partner API documented, tested by 1+ partner in sandbox
- [ ] Automated compliance checks running on schedule (monthly cron)
- [ ] Security self-assessment passed (no critical/high findings)
- [ ] GDPR requirements met (privacy policy, DPA template, data export/deletion)
- [ ] Load test passed (100 concurrent users, p95 < 3s)
- [ ] Operational runbook complete and tested

### Post-Launch Quarterly Targets

| Quarter | Customers (Cumulative) | Revenue (Cumulative) | NPS | Completion Rate | CAC |
|---------|----------------------|---------------------|-----|-----------------|-----|
| Q3 2026 | 50 | €63K | > 30 | > 70% | < €250 |
| Q4 2026 | 130 | €165K | > 35 | > 75% | < €220 |
| Q1 2027 | 250 | €316K | > 40 | > 80% | < €200 |
| Q2 2027 | 370 | €468K | > 40 | > 80% | < €180 |
| Q3 2027 | 470 | €594K | > 45 | > 85% | < €170 |
| Q4 2027 | 550 | €695K | > 45 | > 85% | < €160 |

---

## Technical Architecture (Summary)

| Layer | Technology | Key Config |
|-------|-----------|------------|
| Frontend | Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui | Server Components by default, Client Components only where interactivity needed |
| Backend | Next.js API Routes / Server Actions | Co-located with frontend, Supabase Edge Functions for webhooks |
| Database | PostgreSQL (Supabase) | RLS policies for multi-tenant isolation, JSONB for flexible schemas |
| Auth | Supabase Auth (email, magic link) | JWT-based sessions, admin role via custom claims |
| Payments | Stripe (Checkout, Webhooks) | €999 one-time, webhook-driven fulfillment |
| Email | Resend | React email templates, verified domain, SPF/DKIM/DMARC |
| Storage | Supabase Storage (PDFs, uploads) | Signed URLs for secure access, automatic cleanup policy |
| Hosting | Vercel | Preview deployments, edge network, Cron Jobs for scheduled tasks |
| Analytics | PostHog | EU hosting, client + server events, conversion funnels |
| Monitoring | Sentry | Next.js SDK, error alerting, performance monitoring |
| CI/CD | GitHub Actions → Vercel | Lint + test on PR, auto-deploy on merge to main |
| i18n | next-intl | Dutch (default) + English, server component support |
| PDF | @react-pdf/renderer | Server-side generation, stored in Supabase Storage |

---

## Sprint Calendar

| Sprint | Weeks | Dates | Focus | Phase Gate |
|--------|-------|-------|-------|------------|
| Sprint 1 | 1–2 | Mar 23 – Apr 5 | Project setup, assessment engine | — |
| Sprint 2 | 3–4 | Apr 6 – Apr 19 | Stripe, dashboard, email | **Phase 1 gate** |
| Sprint 3 | 5–6 | Apr 20 – May 3 | Migration planner, PDF reports | — |
| Sprint 4 | 7–8 | May 4 – May 17 | Admin, analytics, i18n | **Phase 2 gate (MVP launch)** |
| Sprint 5 | 9–10 | May 18 – May 31 | HR integrations, data import/export | — |
| Sprint 6 | 11–12 | Jun 1 – Jun 14 | Automation, API, launch prep | **Phase 3 gate (full release)** |

**MVP Launch Target:** End of May 2026 (after Sprint 4, with core features live and beta-validated).

---

## Next Steps (Week 1 Checklist)

1. **Day 1:** Initialize Next.js project, configure Supabase, set up GitHub repo with CI/CD
2. **Day 1:** Apply for Personio API partner access (lead time: 2–6 weeks)
3. **Day 2:** Create Stripe account, configure webhook endpoints, create test products
4. **Day 2:** Identify and contact 3 freelance designer candidates
5. **Day 3:** Begin database schema design (core tables + RLS policies)
6. **Day 3:** Identify pension domain expert for rule validation
7. **Day 4–5:** Start building questionnaire rendering engine
8. **End of Week 1:** Draft initial Wtp questionnaire content (~30 questions)
9. **End of Week 2:** Assessment engine functional — questions render, responses save, scores calculate
10. **End of Week 3:** Begin beta tester outreach (target: 10 candidates from network)

---

## Document Maintenance

This roadmap is a living document. Review and update at each phase gate:

- **Phase 1 gate (Week 4):** Update feasibility estimates based on actual velocity. Adjust Phase 2 scope if needed.
- **Phase 2 gate (Week 8):** Incorporate beta customer feedback. Re-prioritize Phase 3 features based on what customers actually want.
- **Phase 3 gate (Week 12):** Evaluate go-to-market readiness. Update customer targets based on pipeline.
- **Monthly (post-launch):** Update customer acquisition numbers. Compare actuals to projections. Adjust marketing spend.

**Version history:**
- v1.0 (March 2026) — Initial roadmap
- v1.1 (March 22, 2026) — Refined with feasibility analysis, risk mitigation, tech stack rationale, monthly customer targets, success criteria per phase, emergency descoping guide
- v1.2 (30 May 2026) — Revalidated against canonical facts: deadline confirmed 1 Jan 2028 (extended from 1 Jan 2027, now in an AMvB and movable), positioning softened to "augment, not replace" regulated Wft advice, insured-scheme target clarified. See [ASSUMPTIONS-VALIDATION.md](./ASSUMPTIONS-VALIDATION.md) and [SOURCES.md](./SOURCES.md).

---

*Total estimated development effort: 480 engineering hours across 12 weeks (3 phases × 160 hours). Total budget to launch: €19,000–€29,000. Break-even: 3–4 customers/month. Target: 550 customers and €695K revenue within 18 months of launch.*
