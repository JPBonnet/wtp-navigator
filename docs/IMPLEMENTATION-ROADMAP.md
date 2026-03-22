# Wtp Navigator — Implementation Roadmap

> **Last updated:** March 2026
> **Target MVP launch:** End of May 2026
> **Project type:** B2B SaaS — Pension Migration Compliance & Advisory Platform

---

## Executive Summary

Wtp Navigator is a software platform that helps Dutch employers navigate the transition to the new pension system mandated by the *Wet toekomst pensioenen* (Wtp). The tool provides automated compliance assessments, migration planning, and actionable reports — replacing expensive consultancy engagements with a self-service product at a fraction of the cost.

This roadmap defines four implementation phases spanning from initial development through post-launch growth, with concrete sprint plans, technical milestones, resource allocation, and financial projections.

---

## Timeline Overview

| Phase | Timeframe | Focus |
|-------|-----------|-------|
| **Phase 1** | Weeks 1–4 (Mar 23 – Apr 19, 2026) | MVP Foundation |
| **Phase 2** | Weeks 5–8 (Apr 20 – May 17, 2026) | Enhanced UX & Analytics |
| **Phase 3** | Weeks 9–12 (May 18 – Jun 14, 2026) | Integrations & Automation |
| **Phase 4** | Post-launch (Jun 2026 onward) | Growth & Optimization |

**Key dates:**
- **Week 4 (Apr 19):** Assessment engine complete and internally testable
- **Week 8 (May 17):** Full UI/UX complete — MVP launch candidate
- **Week 12 (Jun 14):** All integrations working — full product release
- **Week 16 (Jul 12):** Launch-ready with marketing pipeline active

---

## Phase 1: MVP Foundation (Weeks 1–4)

### Goal
Deliver a working end-to-end flow: a user purchases the assessment, completes the questionnaire, receives a compliance report via email.

### Features
- **Core assessment engine** — questionnaire + rule-based analysis
- **Compliance checker** — validation against current Wtp legislation
- **Basic user dashboard** — view assessment status and results
- **One-time purchase flow** — Stripe Checkout integration
- **Email delivery of results** — automated report sent on completion

### Sprint Breakdown

#### Sprint 1 (Week 1–2): Foundation & Assessment Engine

**Tasks:**
1. **Project scaffolding & infrastructure**
   - Initialize Next.js application with TypeScript
   - Configure Supabase project (database, auth, storage)
   - Set up CI/CD pipeline (GitHub Actions → Vercel)
   - Configure environment management (dev/staging/prod)
   - Set up error tracking (Sentry) and logging

2. **Database schema design & migration**
   - Design core tables: `users`, `organizations`, `assessments`, `responses`, `results`
   - Create Supabase migrations
   - Implement Row Level Security (RLS) policies
   - Seed reference data (Wtp regulatory requirements, pension scheme types)

3. **Assessment engine — questionnaire module**
   - Build questionnaire data model (sections, questions, answer types, conditional logic)
   - Implement question rendering engine (supports text, select, multi-select, numeric, date inputs)
   - Add progress tracking and section navigation
   - Implement save-and-resume functionality (persist partial responses)
   - Build questionnaire validation layer

4. **Assessment engine — analysis module**
   - Define compliance rule set based on Wtp requirements
   - Implement scoring algorithm (per-section and overall compliance score)
   - Build gap analysis logic (identify specific non-compliant areas)
   - Generate structured assessment output (JSON) for report rendering

**Dependencies:** None — this is the starting sprint.

**Deliverable:** A working assessment that can be completed and produces a compliance score with gap analysis.

#### Sprint 2 (Week 3–4): Payment, Dashboard & Email

**Tasks:**
1. **Stripe integration — one-time purchase**
   - Create Stripe product and price objects
   - Implement Stripe Checkout session creation (server-side)
   - Build purchase landing page with pricing information
   - Handle Stripe webhooks (`checkout.session.completed`, `payment_intent.succeeded`)
   - Implement purchase verification before granting assessment access
   - Add receipt/invoice generation

2. **User dashboard**
   - Implement authentication flow (Supabase Auth — email/password + magic link)
   - Build dashboard layout with navigation
   - Create assessment overview page (status: purchased → in-progress → completed)
   - Build results display page (compliance score, gap analysis, recommendations)
   - Add account settings page (profile, organization details)

3. **Email delivery system**
   - Set up transactional email provider (Resend or Postmark)
   - Design email templates: welcome, purchase confirmation, assessment complete, results ready
   - Implement results email with inline summary and link to full report
   - Build email queue/retry mechanism
   - Add unsubscribe handling for compliance

4. **Compliance report rendering**
   - Build report template (HTML) with compliance status per section
   - Include actionable recommendations per identified gap
   - Add regulatory references (specific Wtp articles)
   - Render report in-dashboard and prepare for email attachment

**Dependencies:** Sprint 1 (assessment engine must be functional).

**Deliverable:** Complete purchase-to-report flow. A user can buy, complete the assessment, and receive results via email and dashboard.

### Phase 1 Technical Milestone
> **Week 4 checkpoint:** End-to-end flow works — purchase → questionnaire → analysis → report → email. Internal team can complete the full journey.

---

## Phase 2: Enhanced UX & Analytics (Weeks 5–8)

### Goal
Polish the user experience, add migration planning capabilities, generate professional PDF reports, and build operational tooling (admin dashboard, analytics).

### Features
- **Migration planning module** — step-by-step transition guide
- **PDF report generation** — branded, downloadable compliance report
- **Admin dashboard** — manage customers, view assessments, handle support
- **Analytics & metrics tracking** — product usage, conversion, engagement
- **Multi-language support** — Dutch (primary) + English

### Sprint Breakdown

#### Sprint 3 (Week 5–6): Migration Planner & PDF Reports

**Tasks:**
1. **Migration planning module**
   - Design migration timeline template based on assessment results
   - Build step-by-step guide generator (tasks, deadlines, responsible parties)
   - Implement milestone tracking with status updates
   - Create dependency mapping between migration steps
   - Add regulatory deadline integration (Wtp transition dates)
   - Build migration checklist UI with progress indicators

2. **PDF report generation**
   - Select PDF generation approach (Puppeteer/Playwright for HTML-to-PDF or a library like `@react-pdf/renderer`)
   - Design branded PDF template (cover page, table of contents, sections)
   - Implement compliance report PDF with charts/visualizations
   - Add migration plan PDF export
   - Generate and store PDFs in Supabase Storage
   - Add PDF download endpoint with access control
   - Attach PDF to results email

3. **UI/UX polish — first pass**
   - Implement responsive design for all existing pages
   - Add loading states, error boundaries, and empty states
   - Improve form UX (inline validation, auto-save indicators)
   - Add toast notifications for key actions
   - Implement breadcrumb navigation

**Dependencies:** Phase 1 complete (assessment + report data available for PDF generation).

**Deliverable:** Users receive a professional PDF report and a tailored migration plan.

#### Sprint 4 (Week 7–8): Admin Dashboard, Analytics & i18n

**Tasks:**
1. **Admin dashboard**
   - Implement admin authentication and role-based access control
   - Build customer management view (list, search, filter by status)
   - Create assessment detail view (admin can view any user's assessment)
   - Add manual assessment status management (re-open, invalidate)
   - Build basic support tools (impersonate user view, resend emails)
   - Add revenue overview (Stripe data aggregation)

2. **Analytics & metrics tracking**
   - Integrate product analytics (PostHog or Mixpanel)
   - Define and implement key events: signup, purchase, assessment start, assessment complete, report download
   - Build conversion funnel tracking (visit → purchase → complete → download)
   - Add admin analytics dashboard (DAU, conversion rates, revenue metrics)
   - Implement assessment completion metrics (average time, drop-off points)
   - Set up weekly automated metrics email to stakeholders

3. **Multi-language support (Dutch + English)**
   - Set up i18n framework (`next-intl` or `next-i18next`)
   - Extract all user-facing strings to translation files
   - Translate UI to Dutch (primary language) and English
   - Translate questionnaire content (questions, options, help text)
   - Translate report content (recommendations, regulatory references)
   - Translate email templates
   - Add language switcher to UI
   - Implement locale-aware formatting (dates, numbers, currency)

4. **UI/UX polish — second pass**
   - User testing feedback incorporation
   - Accessibility audit and fixes (WCAG 2.1 AA)
   - Performance optimization (Core Web Vitals)
   - SEO setup (meta tags, sitemap, structured data)

**Dependencies:** Sprint 3 (migration planner feeds into admin views).

**Deliverable:** Production-ready UI with admin tooling, analytics, and bilingual support.

### Phase 2 Technical Milestone
> **Week 8 checkpoint:** Full UI/UX complete. MVP is launch-ready. All user-facing features polished, admin can manage customers, analytics flowing.

---

## Phase 3: Integrations & Automation (Weeks 9–12)

### Goal
Connect to external HR systems, automate compliance verification, and expose an API for partners.

### Features
- **HR system integrations** — Personio, BambooHR
- **Automated compliance verification** — scheduled re-checks
- **Data import/export** — CSV/Excel upload and download
- **API for partners** — RESTful API with authentication

### Sprint Breakdown

#### Sprint 5 (Week 9–10): HR Integrations & Data Import/Export

**Tasks:**
1. **HR system integration — Personio**
   - Research Personio API (employee data, contracts, benefits)
   - Implement OAuth2 connection flow
   - Build data mapping layer (Personio fields → assessment inputs)
   - Auto-populate assessment questionnaire from Personio data
   - Handle incremental sync (detect changes)
   - Add connection management UI (connect, disconnect, sync status)

2. **HR system integration — BambooHR**
   - Research BambooHR API (similar scope to Personio)
   - Implement API key-based authentication
   - Build data mapping layer
   - Auto-populate assessment from BambooHR data
   - Add to connection management UI

3. **Data import/export**
   - Build CSV import for employee/pension data (with validation and error reporting)
   - Build Excel import (`.xlsx` parsing via SheetJS)
   - Implement CSV/Excel export for assessment results
   - Add bulk data validation with detailed error messages
   - Create import templates (downloadable sample files)
   - Build import history and audit log

4. **Integration framework**
   - Design abstract integration interface (for adding future HR systems)
   - Implement webhook receiver for real-time updates from HR systems
   - Build integration health monitoring (connection status, last sync, errors)
   - Add integration-specific error handling and retry logic

**Dependencies:** Phase 2 complete (admin dashboard needed for integration management).

**Deliverable:** Users can connect their HR system or upload data files to auto-populate assessments.

#### Sprint 6 (Week 11–12): Automation, API & Launch Prep

**Tasks:**
1. **Automated compliance verification**
   - Implement scheduled re-assessment (cron job — monthly or on regulatory update)
   - Build change detection (flag differences from previous assessment)
   - Create compliance status monitoring dashboard
   - Implement alert system (email notifications when compliance status changes)
   - Add regulatory update ingestion (manual process to update rule set when Wtp guidance changes)

2. **Partner API**
   - Design RESTful API (OpenAPI 3.0 specification)
   - Implement API authentication (API keys with scoping)
   - Build endpoints: create assessment, submit responses, get results, get compliance status
   - Add rate limiting and usage tracking
   - Generate API documentation (Swagger UI or Redoc)
   - Create partner onboarding flow (API key management in admin)
   - Build sandbox environment for partner testing

3. **Launch preparation**
   - Security audit (OWASP top 10 review, penetration testing basics)
   - GDPR compliance review (data processing, retention policies, DPA template)
   - Performance load testing (target: 100 concurrent users)
   - Backup and disaster recovery procedures
   - Monitoring and alerting setup (uptime, error rates, response times)
   - Create runbook for common operational tasks
   - Final staging environment validation

**Dependencies:** Sprint 5 (integrations inform automation scope).

**Deliverable:** Full product with integrations, partner API, and launch-ready operational posture.

### Phase 3 Technical Milestone
> **Week 12 checkpoint:** All integrations working. API documented and testable. System is production-hardened.

---

## Phase 4: Growth & Optimization (Post-Launch)

### Goal
Drive revenue growth through upselling, partnerships, mobile access, and AI-powered insights.

### Features
- **Upsell modules** — implementation support packages, training programs
- **Partnership integrations** — pension providers, advisory firms
- **Mobile app** — responsive PWA or native app
- **AI-powered recommendations** — personalized action plans using LLMs

### Planned Initiatives

#### Q3 2026 (Jul–Sep): Upsell & Partnerships

1. **Upsell modules**
   - Implementation support package (guided migration with expert review)
   - Training module (on-demand video + quizzes for HR teams)
   - Premium compliance monitoring (real-time alerts, quarterly reviews)
   - Subscription billing via Stripe (monthly/annual plans)
   - In-app upsell flows (contextual prompts based on assessment results)

2. **Partnership integrations**
   - Pension provider data feeds (scheme details, transition timelines)
   - Advisory firm white-label offering
   - Accounting software integrations (Exact Online, Twinfield)
   - Partner referral tracking and commission system

#### Q4 2026 (Oct–Dec): Mobile & AI

3. **Mobile app**
   - Progressive Web App (PWA) as first step
   - Push notifications for compliance alerts and migration deadlines
   - Offline assessment capability
   - Evaluate native app (React Native) based on user demand

4. **AI-powered recommendations**
   - Integrate LLM (Claude API) for natural-language report summaries
   - Build AI chatbot for Wtp questions (RAG over regulatory documents)
   - Generate personalized migration timelines based on organization profile
   - Predictive analytics (risk scoring, effort estimation)

#### 2027: Scale Phase

5. **Platform expansion**
   - Multi-tenant architecture for enterprise customers
   - Custom assessment templates (configurable by partners)
   - Marketplace for third-party add-ons
   - International expansion (Belgium, Germany — similar pension reforms)

### Phase 4 Technical Milestone
> **Week 16 checkpoint (Jul 12, 2026):** Launch-ready with active customer pipeline. Upsell modules in development. First partnership integrations live.

---

## Resource Allocation

### Team Structure

| Role | Allocation | Source |
|------|-----------|--------|
| **Full-stack engineer** | Full-time (40h/week) | In-house (you) |
| **Designer / Product** | Part-time (10–15h/week) | Outsource or freelance |
| **Sales / Marketing** | Part-time (10–15h/week) | Outsource or split with engineering time |

### Time Distribution by Phase

| Phase | Engineering | Design | Sales/Marketing |
|-------|-------------|--------|-----------------|
| Phase 1 | 90% | 10% | 0% |
| Phase 2 | 70% | 20% | 10% |
| Phase 3 | 80% | 5% | 15% |
| Phase 4 | 60% | 10% | 30% |

### Key Considerations
- **Phase 1–2:** Engineering-heavy. Designer needed for UI/UX review and branding. No active sales yet — focus on building.
- **Phase 3:** Begin pre-launch marketing. Build landing page, create content, start outreach to potential early adopters.
- **Phase 4:** Shift toward growth. Engineer focuses on features that drive revenue (upsells, integrations). Sales/marketing ramps up significantly.

---

## Budget Estimate

### Development & Tools (One-time + Recurring)

| Item | Estimated Cost | Notes |
|------|---------------|-------|
| Vercel Pro | €20/month | Hosting, deployments |
| Supabase Pro | €25/month | Database, auth, storage |
| Stripe fees | 1.4% + €0.25/tx | Payment processing |
| Resend / Postmark | €20/month | Transactional email |
| PostHog / analytics | €0/month (free tier) | Product analytics |
| Sentry | €26/month | Error tracking |
| Domain + DNS | €50/year | Primary domain |
| Design tools (Figma) | €15/month | UI design |
| Freelance designer | €3–5K | UI/UX design package |
| Legal (terms, DPA, privacy) | €2–3K | One-time legal review |
| **Total infrastructure** | **~€500–1,000/month** | |
| **Total development** | **€10–20K** | Tools, services, freelancers |

### Marketing

| Item | Estimated Cost | Notes |
|------|---------------|-------|
| LinkedIn ads | €2–5K | Targeted B2B campaigns |
| Content creation | €1–2K | Blog posts, guides, case studies |
| SEO tools | €100/month | Keyword research, tracking |
| Landing page / conversion optimization | €500–1K | A/B testing tools |
| Event sponsorship / webinars | €1–2K | Industry events |
| **Total marketing** | **€5–10K** | First 6 months |

### Contingency

| Item | Amount |
|------|--------|
| Unexpected costs, scope changes, delays | €5,000 |

### Total Budget Summary

| Category | Amount |
|----------|--------|
| Development | €10–20K |
| Marketing | €5–10K |
| Infrastructure (Year 1) | €6–12K |
| Contingency | €5K |
| **Total Year 1** | **€26–47K** |

---

## Revenue Forecast

### Pricing Model
- **One-time assessment:** €999 per organization (SMB pricing)
- **Premium tier:** €1,999 (includes implementation support)
- **Enterprise:** Custom pricing (€5,000+)

### Customer Acquisition Projections

| Period | Customers | Revenue (est.) | Cumulative |
|--------|-----------|----------------|------------|
| Month 1–3 (Jun–Aug 2026) | 10–30 | €10–30K | €10–30K |
| Month 4–6 (Sep–Nov 2026) | 50–100 | €50–100K | €60–130K |
| Month 7–12 (Dec 2026–May 2027) | 150–300 | €150–300K | €210–430K |
| **Year 1 Total** | **210–430** | **€210–430K** | **€210–430K** |
| Year 1–2 cumulative | 500–1,000+ | €2–3M | **€2–3M** |

### Revenue Growth Drivers
- **Regulatory urgency:** Wtp deadline creates time pressure — employers must act.
- **Upsell revenue:** Premium/enterprise tiers increase average deal size.
- **Recurring revenue:** Compliance monitoring subscriptions (Phase 4) create MRR.
- **Partner channel:** Advisory firms and pension providers drive referral volume.

### Break-Even Analysis
- At €999/assessment and ~€3K/month operating cost, break-even is reached at **4 customers/month**.
- Expected to reach break-even in **Month 1** post-launch.

---

## Dependencies & Risks

### Dependencies

| Dependency | Impact | Mitigation |
|-----------|--------|------------|
| Wtp regulatory clarity | Assessment rules depend on final regulation text | Monitor government publications; build rules engine to be easily updatable |
| Stripe availability (NL) | Payment processing | Stripe is fully available in NL — low risk |
| HR system API access | Integration quality depends on API capabilities | Start with well-documented APIs (Personio, BambooHR); use CSV fallback |
| Freelance designer availability | UI/UX quality and timeline | Identify and engage designer early; have backup candidates |
| Customer willingness to self-serve | Product-market fit | Validate with 5–10 pilot customers before full launch |

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Competition from traditional consultants** | High | Medium | Compete on price (10x cheaper), speed (instant vs. weeks), and scalability |
| **Customer education needed** | High | Medium | Invest in content marketing, webinars, free compliance checklist as lead magnet |
| **Regulatory changes after launch** | Medium | High | Modular rule engine; budget time for regulatory updates |
| **Integration complexity** | Medium | Medium | Start with 2 HR systems; use adapter pattern for extensibility |
| **Single-engineer risk** | Medium | High | Document architecture decisions; write tests; keep codebase simple |
| **Scope creep** | High | Medium | Strict phase gates; only advance to next phase when current is complete |
| **Low initial conversion** | Medium | High | Offer free compliance score (lead gen); follow up with sales outreach |

---

## Success Criteria

### Phase 1 (Week 4)
- [ ] Assessment engine produces accurate compliance scores
- [ ] Stripe payment flow works end-to-end
- [ ] Results delivered via email within 5 minutes of completion
- [ ] 3+ internal test runs completed without errors

### Phase 2 (Week 8 — MVP Launch)
- [ ] 5 beta customers have completed assessments
- [ ] PDF reports rated "professional" by beta testers
- [ ] Admin dashboard operational
- [ ] Dutch + English fully translated
- [ ] Page load times under 2 seconds (p95)

### Phase 3 (Week 12)
- [ ] At least 1 HR integration live with real customer data
- [ ] Partner API documented and tested by 1+ partner
- [ ] Automated compliance checks running on schedule
- [ ] Security audit passed with no critical findings

### Post-Launch Targets
- [ ] **50 customers by August 2026**
- [ ] **300 customers by December 2027**
- [ ] **€2M+ cumulative revenue**
- [ ] Net Promoter Score (NPS) > 40
- [ ] Customer acquisition cost (CAC) < €200
- [ ] Assessment completion rate > 80%

---

## Technical Architecture (Summary)

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14+ (App Router), TypeScript, Tailwind CSS |
| Backend | Next.js API Routes / Server Actions, Supabase Edge Functions |
| Database | PostgreSQL (Supabase) |
| Auth | Supabase Auth (email, magic link) |
| Payments | Stripe (Checkout, Webhooks) |
| Email | Resend or Postmark |
| Storage | Supabase Storage (PDFs, uploads) |
| Hosting | Vercel |
| Analytics | PostHog |
| Monitoring | Sentry |
| CI/CD | GitHub Actions |
| i18n | next-intl |

---

## Sprint Calendar

| Sprint | Weeks | Dates | Focus |
|--------|-------|-------|-------|
| Sprint 1 | 1–2 | Mar 23 – Apr 5 | Project setup, assessment engine |
| Sprint 2 | 3–4 | Apr 6 – Apr 19 | Stripe, dashboard, email |
| Sprint 3 | 5–6 | Apr 20 – May 3 | Migration planner, PDF reports |
| Sprint 4 | 7–8 | May 4 – May 17 | Admin, analytics, i18n |
| Sprint 5 | 9–10 | May 18 – May 31 | HR integrations, data import/export |
| Sprint 6 | 11–12 | Jun 1 – Jun 14 | Automation, API, launch prep |

**MVP Launch Target:** End of May 2026 (after Sprint 4–5, with core features live).

---

## Next Steps

1. **This week:** Finalize tech stack decisions, set up project infrastructure, begin Sprint 1
2. **By end of Week 2:** Assessment engine functional, questionnaire completable
3. **By end of Week 4:** First end-to-end purchase → report flow working
4. **By end of Week 6:** Recruit 5 beta testers from network
5. **By end of Week 8:** MVP launch to beta customers

---

*This roadmap is a living document. Update it as priorities shift, feedback comes in, and market conditions change. Review and revise at each phase gate.*
