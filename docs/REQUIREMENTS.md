# Product Requirements & Specification

**Document version:** 1.0
**Last updated:** 30 May 2026
**Status:** Active
**Owner:** Product
**Related:** [ASSUMPTIONS-VALIDATION.md](./ASSUMPTIONS-VALIDATION.md) ·
[PRODUCT-STRATEGY.md](./PRODUCT-STRATEGY.md) ·
[TECHNICAL-ARCHITECTURE.md](./TECHNICAL-ARCHITECTURE.md)

---

## 0. How to read this document

This is the canonical **functional and non-functional requirements** specification. It
supersedes the implicit requirements scattered across the strategy documents. Where this
document and a strategy/marketing document disagree, **this document wins** for product
scope, and [ASSUMPTIONS-VALIDATION.md](./ASSUMPTIONS-VALIDATION.md) wins for market/regulatory
facts.

Requirement IDs are stable. Priority uses MoSCoW: **M**ust / **S**hould / **C**ould / **W**on't
(this release).

---

## 1. Product definition & scope

### 1.1 What Wtp Navigator is

A web platform that helps a Dutch SMB employer with an **insured pension scheme**
(at an insurer or PPI) **orient, decide and prepare** for the Wet toekomst pensioenen (Wtp)
transition, and then **hand off cleanly to a Wft-licensed pension adviser** for the regulated
steps.

It is **not** regulated financial advice and does **not** replace a Wft adviser
(see [ASSUMPTIONS-VALIDATION.md](./ASSUMPTIONS-VALIDATION.md) A9). It is a triage,
decision-support, and document-preparation tool.

### 1.2 In scope (this product)

- Intake of the employer's current insured pension arrangement and workforce profile.
- A **Wtp readiness assessment** ("pensioen-APK") that explains where the employer stands and
  what decisions are required.
- **Decision support** for the two defining choices of an insured-scheme transition:
  (a) flat-premium design, and (b) **eerbiedigende werking vs. flat premium + compensation**.
- A **transition checklist and plan** mapped to the insured-scheme calendar (start ~Jul 2026,
  insurer submission by 1 Oct 2027, live by 1 Jan 2028).
- **Document drafts** (transitieplan skeleton, employee/OR-PVT communication) clearly marked
  as drafts for adviser review.
- **Routing/handoff to a Wft adviser** (and an optional expert-review path).

### 1.3 Explicitly out of scope (this product)

- **Invaren** / collective conversion of accrued rights (a pension-**fund** mechanism — not
  applicable to insured schemes; see A4).
- Actuarial certification, binding compensation calculations, or the signed insurer offer
  (these are the adviser's / insurer's regulated deliverables).
- Mandatory-sector (bedrijfstakpensioenfonds) employers with no employer discretion.
- Payroll/pension administration and ongoing scheme administration.

### 1.4 Personas served

Jan (owner-director), Sanne (HR manager), Pieter (CFO) — see
[CUSTOMER-PERSONAS.md](./CUSTOMER-PERSONAS.md). Secondary persona: the **pension adviser /
accountant** as a B2B2B user (see strategy A9 repositioning).

---

## 2. Domain model (authoritative)

These are the entities the product reasons about. They replace any earlier invaren-centric model.

| Entity | Meaning |
|---|---|
| **Employer** | The SMB; identified by KvK number, sector, employee count. |
| **Current scheme** | The existing insured arrangement (provider type: insurer/PPI; type: DB/DC/CDC; premium structure incl. age-progressive *staffel*). |
| **Workforce profile** | Aggregate age bands, tenure, salary bands — enough to reason about who is advantaged/disadvantaged by a flat premium. |
| **Transition choice** | The core decision object: `eerbiedigende_werking` (keep existing members on the staffel) **or** `flat_premium_with_compensation`. |
| **Compensation outline** | Non-binding indication of who may need compensation and on what basis (final figures = adviser). |
| **Transition plan (transitieplan)** | The structured document the employer must produce; the product drafts a skeleton. |
| **Consultation track** | Employee consent (instemming) + OR/PVT consultation status. |
| **Adviser handoff** | The packaged output sent to a Wft adviser / insurer. |

---

## 3. Functional requirements

### 3.1 Accounts & access

- **FR-AUTH-1 (M):** Email/password and magic-link sign-in (Supabase Auth).
- **FR-AUTH-2 (M):** Multi-tenant isolation; every record scoped by `organization_id` with
  RLS enforced at the database (see [TECHNICAL-ARCHITECTURE.md](./TECHNICAL-ARCHITECTURE.md)).
- **FR-AUTH-3 (S):** Roles: owner / admin / advisor / viewer.
- **FR-AUTH-4 (S):** An **adviser** role can be invited into an employer's workspace (B2B2B).

### 3.2 Intake

- **FR-IN-1 (M):** Capture current scheme: provider type (insurer/PPI), scheme type, premium
  structure (flat vs. age-progressive staffel), key dates.
- **FR-IN-2 (M):** Capture workforce profile by age/salary band (no individual PII required
  for the core assessment — data minimisation, see NFR-PRIV-1).
- **FR-IN-3 (M):** Save & resume; partial completion persists.
- **FR-IN-4 (S):** CSV/Excel import of aggregate workforce data; validated (Zod) with clear
  error reporting.
- **FR-IN-5 (C):** Branching/conditional questions; questionnaire capped at ~50 questions.

### 3.3 Readiness assessment ("pensioen-APK")

- **FR-AS-1 (M):** Classify the current scheme and determine **which Wtp obligations apply**
  to this employer.
- **FR-AS-2 (M):** Produce a **readiness score** and a prioritised **gap list** (what is
  missing / decided / outstanding), with plain-language explanations.
- **FR-AS-3 (M):** The compliance rule set is **versioned** (e.g. `wtp-2026.1`) and every
  result records the rule version used.
- **FR-AS-4 (M):** Output is reproducible and serialisable (stored as a structured result).
- **FR-AS-5 (S):** Each gap links to the relevant decision (3.4) or document (3.6).

### 3.4 Transition-choice decision support

- **FR-DC-1 (M):** Explain the two routes — **eerbiedigende werking** vs. **flat premium +
  compensation** — including the practical trade-offs (no compensation obligation but two
  parallel schemes, vs. one scheme but a compensation/communication burden).
- **FR-DC-2 (M):** Given the workforce profile, **indicate** which groups are likely
  advantaged/disadvantaged by a flat premium (orientational, **non-binding**).
- **FR-DC-3 (M):** Every quantitative indication is labelled "indicative — to be confirmed by
  a Wft adviser." No output may be presented as regulated advice (see NFR-COMP-1).
- **FR-DC-4 (S):** Scenario comparison (eerbiedigende werking vs. compensation) side-by-side,
  exportable.

### 3.5 Plan, timeline & tracking

- **FR-PL-1 (M):** Generate a transition plan/checklist aligned to the insured-scheme
  calendar: recommended start ~**1 Jul 2026**, transitieplan to insurer/PPI by
  **1 Oct 2027**, live by **1 Jan 2028**. Dates are configurable (they live in an AMvB and
  can change — see A2).
- **FR-PL-2 (M):** Tasks with owners (employer / adviser / insurer / OR-PVT) and status
  tracking; dependencies modelled so a critical path can be shown.
- **FR-PL-3 (S):** Reminders/notifications tied to milestone dates.
- **FR-PL-4 (S):** OR/PVT consultation and employee-consent (instemming) tracking.

### 3.6 Document preparation

- **FR-DOC-1 (M):** Generate a **transitieplan skeleton** pre-filled from intake + decisions,
  clearly watermarked **"Concept — te beoordelen door een Wft-adviseur."**
- **FR-DOC-2 (S):** Employee and OR/PVT communication drafts (Dutch primary, English optional).
- **FR-DOC-3 (S):** Export to PDF (server-side, e.g. `@react-pdf/renderer`) and a board/
  management summary.
- **FR-DOC-4 (C):** Re-use Adfiz/Verbond template structures where publicly available, to
  stay aligned with market-standard wording.

### 3.7 Adviser handoff (the regulated boundary)

- **FR-HO-1 (M):** Package the assessment, decisions and draft documents into a single export
  for a Wft adviser / insurer.
- **FR-HO-2 (S):** Optional **Expert Review**: route the package to a partner Wft adviser
  (this is the compliant path to regulated advice, not a mere upsell — see A9).
- **FR-HO-3 (C):** Adviser/accountant partner portal (B2B2B): manage multiple employer
  workspaces.

### 3.8 Payments

- **FR-PAY-1 (M):** One-time purchase via Stripe Checkout (iDEAL supported); webhook-driven
  fulfilment; €999 base price (excl. BTW), configurable.
- **FR-PAY-2 (M):** A **free orientation/triage tier** (lead magnet) that demonstrates value
  before purchase.
- **FR-PAY-3 (S):** Optional add-ons (Expert Review, extended monitoring) as separate line items.

### 3.9 Admin

- **FR-ADM-1 (S):** Admin dashboard: users, payments, assessment analytics, support tickets,
  health, audit log. (Largely already implemented — keep, do not expand prematurely.)

---

## 4. Non-functional requirements

### 4.1 Compliance & positioning (highest priority)

- **NFR-COMP-1 (M):** The product must **not present itself as, or output, regulated financial
  advice**. Every recommendation/figure is marked indicative and routes to a Wft adviser.
  Terms of service state the boundary explicitly.
- **NFR-COMP-2 (M):** Compliance rules are versioned and dated; the active Wtp ruleset version
  is visible on every report.
- **NFR-COMP-3 (S):** A documented update process re-checks regulatory dates (which sit in an
  AMvB and can change) on a defined cadence, sourced from
  [SOURCES.md](./SOURCES.md).

### 4.2 Privacy & data protection

- **NFR-PRIV-1 (M):** Data minimisation — the core assessment uses **aggregate** workforce
  bands, not individual employee PII, wherever possible.
- **NFR-PRIV-2 (M):** EU data residency (Supabase eu-central-1 / Frankfurt); TLS in transit,
  AES-256 at rest; DPAs in onboarding; right-to-erasure via cascade delete.
- **NFR-PRIV-3 (S):** Immutable audit log of mutations with actor + timestamp.

### 4.3 Security

- **NFR-SEC-1 (M):** RLS tenant isolation on every table; RBAC; signed URLs for stored files.
- **NFR-SEC-2 (S):** MFA available; rate limiting; secrets never in the repo.

### 4.4 Quality & reliability

- **NFR-QA-1 (M):** Compliance-critical logic (assessment/decision rules) covered by tests;
  target ≥80% overall, with the rule engine held to a higher bar.
- **NFR-QA-2 (M):** Rule logic validated by a pension domain expert before any release that
  changes regulatory behaviour.
- **NFR-QA-3 (S):** Performance: page load P75 < 1.5s; assessment P95 < 3s.

### 4.5 Internationalisation & accessibility

- **NFR-I18N-1 (M):** Dutch primary; English secondary (international workforces).
- **NFR-A11Y-1 (S):** WCAG 2.1 AA target.

---

## 5. Acceptance criteria for the MVP

The MVP is "done" when an SMB employer can:

1. Create an account and complete intake for an insured scheme (FR-AUTH-1, FR-IN-1/2/3).
2. Receive a readiness assessment with a versioned ruleset, score and prioritised gaps
   (FR-AS-1/2/3).
3. Be walked through the **eerbiedigende werking vs. compensation** decision with an
   indicative, clearly-non-binding view of affected groups (FR-DC-1/2/3).
4. Get a milestone-based plan on the correct insured-scheme calendar (FR-PL-1).
5. Generate a watermarked transitieplan skeleton and export it (FR-DOC-1/3).
6. Pay €999 via Stripe and package a clean handoff to a Wft adviser (FR-PAY-1, FR-HO-1).

…with **NFR-COMP-1** (no unregulated advice), **NFR-PRIV-1/2** and **NFR-QA-1/2** satisfied
throughout.

---

## 6. Traceability — Wtp obligation → requirement

| Wtp obligation (insured-scheme employer) | Requirement(s) |
|---|---|
| Move future accrual to flat premium | FR-IN-1, FR-DC-1 |
| Choose eerbiedigende werking vs. compensation | FR-DC-1/2/3/4 |
| Produce a transitieplan | FR-DOC-1, FR-PL-1 |
| Employee consent (instemming) + OR/PVT consultation | FR-PL-4, FR-DOC-2 |
| Submit signed offer + plan to insurer/PPI by 1 Oct 2027 | FR-PL-1, FR-HO-1 |
| Operate under new framework by 1 Jan 2028 | FR-PL-1 |
| Obtain regulated advice (Wft) | FR-HO-1/2 (handoff, not in-product advice) |

---

*This specification is versioned; material changes to Wtp obligations or dates must update
both this document and [ASSUMPTIONS-VALIDATION.md](./ASSUMPTIONS-VALIDATION.md).*
