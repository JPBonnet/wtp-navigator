# Wtp Navigator — Product Strategy

**Document version:** 1.1
**Last updated:** 30 May 2026
**Status:** Active
**Owner:** Product & Strategy Team

> **Revalidated 30 May 2026.** Market, regulatory and competitive claims in this document have
> been checked against external sources. The defining customer decision is **eerbiedigende
> werking vs. flat premium + compensation** (not "invaren," which is a pension-*fund* mechanism
> and does not apply to the insured schemes we target). See
> [ASSUMPTIONS-VALIDATION.md](./ASSUMPTIONS-VALIDATION.md) and [SOURCES.md](./SOURCES.md).

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Target Market](#target-market)
4. [Solution Overview](#solution-overview)
5. [Key Features](#key-features)
6. [Customer Personas](#customer-personas)
7. [Revenue Model](#revenue-model)
8. [Market Opportunity](#market-opportunity)
9. [Competitive Landscape](#competitive-landscape)
10. [Go-to-Market Strategy](#go-to-market-strategy)
11. [Success Criteria](#success-criteria)
12. [Risk Mitigation](#risk-mitigation)
13. [Roadmap](#roadmap)

---

## 1. Executive Summary

Wtp Navigator is a pension migration SaaS platform designed to guide Dutch small and medium-sized businesses (MKB) through the complex process of transitioning their pension arrangements in response to the Wet toekomst pensioenen (Wtp). The new pension legislation, which entered into force on 1 July 2023, mandates that all Dutch pension schemes transition from defined benefit (DB) to defined contribution (DC) arrangements before the regulatory deadline of 1 January 2028.

For the approximately 1,000–5,000 Dutch SMBs in our target segment — companies with between 10 and 250 employees — this transition represents a significant operational, legal, and financial challenge. Many of these businesses lack dedicated HR or pension expertise, yet face the same regulatory obligations as large enterprises with entire departments devoted to pension administration.

Wtp Navigator addresses this gap by providing an automated, guided platform that handles system assessment, migration planning, compliance verification, and change management — at a fraction of the cost of traditional pension consultancy. At a one-time fee of €999 per customer, the platform delivers high-margin revenue while remaining accessible to cost-conscious SMBs.

The total addressable market represents a revenue opportunity of €2–3 million over an 18-month commercial window, with target acquisition of 200–300 customers by December 2027.

---

## 2. Problem Statement

### 2.1 The Dutch Pension System in Transition

The Netherlands has long maintained one of the most comprehensive pension systems in the world, consistently ranked in the top tier of the Mercer Global Pension Index. The system rests on three pillars: the state pension (AOW), occupational pensions administered through pension funds and insurers, and individual savings.

The Wet toekomst pensioenen (Wtp) — the Future of Pensions Act — represents the most fundamental reform of the Dutch occupational pension system in decades. The legislation transitions the entire second pillar from defined benefit (DB) schemes, where retirees are guaranteed a specific pension amount, to defined contribution (DC) arrangements, where contributions are invested and the eventual pension depends on investment returns.

This transition affects every employer in the Netherlands that participates in an occupational pension scheme. The law requires that all existing pension arrangements be converted to one of two new contract types — the solidaire premieregeling (solidarity contribution scheme) or the flexibele premieregeling (flexible contribution scheme) — before the statutory deadline.

### 2.2 The APK Deadline and Regulatory Pressure

The term "pensioen-APK" (pension MOT test, by analogy with the vehicle roadworthiness inspection) has become common shorthand for the assessment every employer must undertake to evaluate their current pension arrangement against the new legal requirements. This assessment must be completed well in advance of the 1 January 2028 transition deadline to allow sufficient time for implementation.

Key regulatory milestones (the implementation deadline was **extended by one year, from
1 January 2027 to 1 January 2028** — Tweede Kamer 20 May 2025, Eerste Kamer 2 December 2025;
the dates now sit in an AMvB and can be moved again). For the employers we target — those with
a scheme at an **insurer or PPI** — the relevant calendar is:

- **1 July 2023:** Wtp entered into force.
- **~1 July 2026:** Recommended **start** of the adjustment process (the labour-conditions
  track typically takes many months). This window is opening now.
- **1 October 2027:** Deadline to submit the signed offer + transition plan (*transitieplan*)
  to the insurer / PPI.
- **1 January 2028:** All schemes must operate under the new framework.

The window for employers to act is narrowing. Employers who delay risk non-compliance, which can result in regulatory sanctions, liability toward employees, and reputational damage. The principal counter-risk is a **further extension via the AMvB**, which would soften urgency (see §12).

### 2.3 MKB Pain Points

For small and medium-sized businesses, the pension transition presents a uniquely challenging set of problems:

**Complexity without expertise.** The Wtp transition requires understanding of pension law, actuarial concepts, employee communication requirements, and administrative processes. Most SMBs lack in-house pension expertise and rely on external advisors — who are themselves under capacity pressure from the sheer volume of transitions underway.

**Cost of traditional advice.** Pension consultancy firms typically charge €5,000–€25,000 or more for a full transition advisory engagement, depending on scheme complexity and the number of employees. For a business with 20–50 employees, this represents a disproportionate expense for what is fundamentally a compliance obligation.

**Time pressure on leadership.** Business owners and HR managers in SMBs are generalists. The pension transition competes for attention with daily operations, customer service, and growth initiatives. The topic is perceived as complex, abstract, and difficult to prioritize — until the deadline forces action.

**Employee communication burden.** The Wtp requires employers to communicate changes to employees, obtain input from works councils (ondernemingsraad) or employee representative bodies (personeelsvertegenwoordiging), and document that the transition process meets the legal standard of "evenwichtige belangenafweging" (balanced consideration of interests).

**Fragmented information.** Guidance is spread across government websites, pension fund communications, insurer portals, and advisory firm marketing materials. There is no single, authoritative, step-by-step resource tailored to the SMB context.

---

## 3. Target Market

### 3.1 Market Definition

Wtp Navigator targets Dutch SMBs (MKB-bedrijven) with the following characteristics:

| Attribute | Range |
|---|---|
| Employee count | 10–250 (primary: 20–100) |
| Pension arrangement | Insured scheme (verzekerde regeling) or industry-wide pension fund (bedrijfstakpensioenfonds) with employer-specific obligations |
| Internal HR capacity | Limited; no dedicated pension specialist |
| Decision-maker | Owner-director (DGA), HR manager, or CFO |
| Geography | Netherlands-wide, with concentration in the Randstad and regional economic centres |

### 3.2 Market Size

Industry data gives a well-evidenced anchor: insurers and PPIs administer pension schemes for
**~1.5 million employees across ~65,000 companies**, of which **~50,000 insured schemes must be
adapted** for the Wtp (source: Verbond van Verzekeraars — see [SOURCES.md](./SOURCES.md)).

- These ~65,000 employers are the addressable universe (employers with discretion over an
  insured scheme — as opposed to mandatory industry-fund participation with little employer
  choice). The **large majority are SMBs**.
- Precise counts in the 10–250-employee band are not published, but it is the dominant share
  of the insured-scheme population, so the realistic target pool is **substantially larger than
  earlier drafts assumed** (which estimated 30,000–50,000 arrangements and 5,000–10,000 SMBs).

Our serviceable addressable market (SAM) is the subset that needs guided support, can self-serve
a digital solution, and is not already locked into a full advisory engagement — realistically
on the order of **5,000–15,000 businesses**. The binding constraint on capture is **reachability
and the Wft advice requirement** (§12), not the size of the pool.

### 3.3 Market Timing

The market window is driven by the regulatory calendar. Demand is expected to peak between mid-2026 and late 2027, as the 1 January 2028 deadline approaches and remaining businesses seek to comply. Early movers in 2025–2026 will tend to be larger or more compliance-conscious SMBs; the tail of the market will include businesses that have procrastinated or underestimated the scope of the transition.

This creates an **18-month primary commercial window** (approximately Q2 2026–Q4 2027), after which the bulk of transition activity will have concluded.

---

## 4. Solution Overview

Wtp Navigator is a web-based SaaS platform that provides end-to-end guidance for the pension transition process. The platform is designed to replicate — at scale and at a fraction of the cost — the advisory workflow that a pension consultant would deliver in a one-on-one engagement.

### 4.1 Core Value Proposition

- **Affordable compliance.** A complete pension transition pathway at €999 — a fraction of traditional consultancy fees.
- **Guided automation.** Step-by-step workflow that transforms a complex regulatory process into manageable tasks.
- **Compliance assurance.** Built-in checks against current regulatory requirements, reducing the risk of errors or omissions.
- **Time efficiency.** Designed for non-specialists; no pension expertise required to use the platform effectively.
- **Documentation trail.** Automatically generates the documentation required for regulatory and employee communication purposes.

### 4.2 Platform Architecture

The platform follows a structured workflow:

1. **Intake & Assessment** — The employer provides information about their current pension arrangement, workforce composition, and organisational context.
2. **Analysis & Recommendation** — The platform analyses the current arrangement against Wtp requirements and generates a tailored transition plan.
3. **Implementation Support** — Guided steps for executing the transition, including insurer or pension fund coordination, employee communication, and works council consultation.
4. **Compliance Verification** — Automated checks to confirm that the transition meets legal requirements, with a compliance report for the employer's records.
5. **Handover & Archive** — Final documentation package, including transition records, communication logs, and compliance certificates.

---

## 5. Key Features

### 5.1 System Assessment (Pensioen-APK)

The platform's assessment module captures the employer's current pension arrangement details and evaluates them against Wtp requirements. This includes:

- Pension scheme type identification (DB, DC, hybrid).
- Contribution structure analysis.
- Accrued rights inventory.
- Gap analysis between current arrangement and Wtp-compliant alternatives.
- Risk profile assessment for the transition.

The assessment produces a clear, actionable report that identifies what needs to change and the available options.

### 5.2 Migration Planning

Based on the assessment, the platform generates a personalised migration plan:

- Timeline with milestones aligned to regulatory deadlines.
- Task breakdown with ownership assignments (employer, insurer, pension fund, advisor).
- Decision points with contextual explanation of trade-offs.
- Integration with the employer's calendar and project management workflow.

### 5.3 Compliance Checks

Regulatory compliance is embedded throughout the platform:

- **Real-time validation** of inputs and decisions against current Wtp requirements.
- **Evenwichtige belangenafweging check** — guided framework to ensure balanced consideration of all stakeholder interests.
- **Employee communication compliance** — templates and checklists for legally required notifications and consultations.
- **Works council / PVT process tracking** — step-by-step guidance for the required employee representation process.
- **DNB and AFM alignment** — checks against published supervisory guidance and regulatory expectations.

### 5.4 Change Management & Communication

The human side of the pension transition is often the most difficult:

- **Employee communication templates** — plain-language letters, emails, and presentation materials explaining pension changes.
- **FAQ generator** — context-aware FAQ documents tailored to the specific transition scenario.
- **Works council briefing packs** — materials to support the formal consultation process.
- **Manager briefing guides** — concise summaries for line managers who will field employee questions.
- **Multilingual support** — templates available in Dutch and English to accommodate international workforces.

### 5.5 Document Generation & Archive

- Automated generation of all required transition documentation.
- Compliance report suitable for auditor or regulator review.
- Secure, long-term archival of transition records in line with data retention requirements.

---

## 6. Customer Personas

### Persona 1: Jan — Owner-Director of a Manufacturing SMB

- **Company:** 45 employees, metalworking company in Brabant.
- **Pension situation:** Insured DB scheme with a mid-tier insurer, in place since 2008.
- **Pain point:** Jan has received letters from his insurer about the pension transition but finds them incomprehensible. His bookkeeper handles payroll but has no pension expertise. A pension advisor quoted €8,000 for a transition engagement.
- **Need:** An affordable, step-by-step solution that tells him exactly what to do and when, without requiring him to become a pension expert.
- **Decision driver:** Cost and simplicity. Jan will pay for a solution that saves him time and reduces his risk of getting it wrong.

### Persona 2: Sanne — HR Manager at a Professional Services Firm

- **Company:** 120 employees, IT consultancy in Amsterdam.
- **Pension situation:** DC scheme with partial employer match, administered through a PPI.
- **Pain point:** Sanne understands the basics of the transition but is overwhelmed by the compliance requirements, particularly the works council process and the evenwichtige belangenafweging documentation. She is managing the transition alongside her regular HR responsibilities.
- **Need:** A compliance-focused tool that ensures nothing is missed, generates the required documentation, and provides a defensible audit trail.
- **Decision driver:** Risk reduction and time savings. Sanne's company can afford advisory fees, but she wants to avoid a lengthy, expensive consulting engagement if a digital tool can deliver comparable assurance.

### Persona 3: Pieter — CFO of a Growing Logistics Company

- **Company:** 200 employees across three locations, rapid growth.
- **Pension situation:** Mix of arrangements inherited from acquisitions — two different insured schemes and a BPF obligation for part of the workforce.
- **Pain point:** Pieter needs to rationalise the pension landscape while simultaneously complying with Wtp. He has budget for advisory support but wants to understand the landscape himself before engaging a consultant.
- **Need:** A diagnostic tool that maps his current pension landscape, identifies the key decisions, and provides a framework for evaluating options — potentially as a precursor to engaging specialist advice for the most complex elements.
- **Decision driver:** Clarity and control. Pieter wants to enter any advisory engagement as an informed buyer, not a passive recipient of recommendations.

---

## 7. Revenue Model

### 7.1 Pricing Structure

| Component | Price | Description |
|---|---|---|
| Wtp Navigator — Standard | **€999** (one-time, excl. BTW) | Full platform access: assessment, migration planning, compliance checks, document generation, and 12 months of regulatory update alerts. |
| Optional: Expert Review Add-on | €499 | One-time review of generated transition plan by a certified pension advisor (pensioenadviseur). |
| Optional: Extended Support | €299/year | Continued access to platform updates and regulatory monitoring beyond the initial 12 months. |

### 7.2 Pricing Rationale

The €999 price point is designed to be:

- **10–20x cheaper** than a traditional pension advisory engagement (€5,000–€25,000).
- **Accessible** to SMBs with limited discretionary budgets — comparable to the cost of a single day of external consultancy.
- **Psychologically one-time** — no subscription fatigue, no recurring commitment, aligning with the fact that the pension transition is itself a one-time event.
- **High-margin** — with a software-delivered solution and minimal per-customer variable cost, gross margins are expected to exceed 85%.

### 7.3 Unit Economics

| Metric | Value |
|---|---|
| Average revenue per customer | €999 |
| Estimated COGS per customer | ~€100 (hosting, support, document processing) |
| Gross margin per customer | ~€899 (90%) |
| Customer acquisition cost (CAC) target | €150–€300 |
| Lifetime value / CAC ratio | 3–6x |

---

## 8. Market Opportunity

### 8.1 Revenue Potential

Based on the target market of 1,000–5,000 reachable SMBs:

| Scenario | Customers | Revenue (core product) | Revenue (incl. add-ons) |
|---|---|---|---|
| Conservative | 200 | €199,800 | ~€250,000 |
| Base case | 500 | €499,500 | ~€650,000 |
| Optimistic | 1,500 | €1,498,500 | ~€2,000,000 |
| Stretch | 2,500+ | €2,497,500+ | ~€3,000,000+ |

The **base-to-optimistic range of €2–3 million** in total revenue is achievable over the 18-month primary commercial window (Q2 2026–Q4 2027), assuming effective go-to-market execution and market adoption rates of 10–30% within the serviceable addressable market.

### 8.2 Revenue Timeline

Revenue is expected to follow a pattern aligned with regulatory urgency:

- **Q2–Q4 2026:** Early adopters. ~20% of total revenue. These are compliance-conscious businesses that act early.
- **Q1–Q2 2027:** Growth phase. ~45% of total revenue. Market awareness peaks, urgency increases.
- **Q3–Q4 2027:** Deadline rush. ~35% of total revenue. Procrastinators and late discoverers convert under time pressure.

### 8.3 Beyond the Transition Window

While the Wtp transition is a time-bound event, the platform creates optionality for:

- **Ongoing compliance monitoring** — post-transition, employers will need to maintain compliance with the new pension framework.
- **Pension administration tooling** — the customer base and platform infrastructure can be extended toward ongoing pension management.
- **Adjacent regulatory compliance** — the guided compliance model can be adapted for other regulatory obligations facing Dutch SMBs.

---

## 9. Competitive Landscape

### 9.1 Competitor Analysis

| Competitor | Type | Strengths | Weaknesses |
|---|---|---|---|
| **Wft-licensed pension advisers** (Aon, Mercer, WTW, Montae, Sprenkels, plus thousands of local Adfiz members) | Regulated advisory | Deep expertise, *can give the regulated advice we cannot*, run the labour-conditions track, insurer relationships | Expensive (€5K–€25K+), capacity-constrained, not designed for SMB self-serve |
| **Insurer-/PPI-provided guidance** (a.s.r., Nationale-Nederlanden, Zwitserleven, Centraal Beheer) | Embedded tools + adviser networks | Free to policyholders, integrated, drive the required signed offer | Tied to the insurer's own products, not independent |
| **Specialised Wtp platforms — incl. `Pensioennavigator.nl`** | Direct competitors | Already model premium/compensation effects, draft plans & agreements; near-identical name | Direct overlap with our scope; **a brand-collision risk for us** (see §12) |
| **Free official resources** (`werkenaanonspensioen.nl`; Adfiz/Verbond transitieplan templates) | Free, authoritative | No cost, trusted, erode our "we draft the documents" value prop | Informational, not a guided end-to-end workflow |
| **Accountants and boekhouders** | Generalist advisors | Existing trusted SMB relationship | Pension is outside core competency; usually refer out |

### 9.2 Competitive Positioning

Wtp Navigator occupies a distinct position in the market:

- **More affordable to start than a full adviser engagement** — a low-cost way to get
  decision-ready before (or alongside) engaging a Wft adviser.
- **Independent of any single insurer** — covers the orientation and decision process rather
  than steering toward one provider's product.
- **More structured than DIY / free templates** — turns scattered official guidance and the
  Adfiz/Verbond templates into a guided, step-by-step workflow.
- **Complements rather than competes with the adviser** — it packages a clean handoff (and an
  optional expert-review path) instead of pretending to deliver regulated advice.

The real competitive risks are concrete, not just "market inertia": (1) a **near-namesake
direct competitor**, `Pensioennavigator.nl`, already in this space; (2) the **Wft advice
requirement**, which means we must position as triage/augmentation + handoff rather than
consultant replacement; and (3) **free official resources and insurer-provided guidance** that
many employers will use by default. See §12.

---

## 10. Go-to-Market Strategy

### 10.1 Distribution Channels

| Channel | Approach | Expected contribution |
|---|---|---|
| **Content marketing & SEO** | Pension transition guides, regulatory explainers, blog content targeting "Wtp MKB" and related search terms | 30% of leads |
| **Accountant partnerships** | Referral programme with accountancy firms who advise SMB clients — commission-based or co-branded | 25% of leads |
| **Industry associations** | Partnerships with MKB-Nederland, sector associations, and KvK (Chamber of Commerce) | 20% of leads |
| **Direct outreach** | Targeted campaigns to businesses identified via KvK registrations, LinkedIn, and trade databases | 15% of leads |
| **Insurer / pension fund referrals** | Partnerships where insurers or pension funds refer employers to Wtp Navigator for the employer-side transition process | 10% of leads |

### 10.2 Sales Motion

The primary sales motion is **self-service with light-touch support**:

1. Prospect discovers Wtp Navigator through content, referral, or outreach.
2. Free assessment preview — a lightweight version of the pension-APK that demonstrates the platform's value.
3. Conversion to paid account at €999 for full platform access.
4. Onboarding flow guides the customer through the transition process.
5. Optional upsell to Expert Review add-on at €499.

For larger SMBs (100+ employees), a **consultative sales motion** may be warranted, with a brief discovery call to confirm fit and address questions before purchase.

---

## 11. Success Criteria

### 11.1 Key Performance Indicators

| Metric | Target (by Dec 2027) | Measurement |
|---|---|---|
| Total customers acquired | 200–300 (minimum viable); 500+ (target) | Platform registrations with completed purchase |
| Revenue | €200K–€300K (minimum); €500K+ (target) | Gross revenue |
| Customer satisfaction (NPS) | ≥50 | Post-completion survey |
| Compliance completion rate | ≥80% of customers complete the full workflow | Platform analytics |
| Time to compliance | Median ≤8 weeks from onboarding to compliance report | Platform analytics |
| Customer acquisition cost | ≤€300 | Marketing spend / customers acquired |

### 11.2 Milestones

| Date | Milestone |
|---|---|
| Q2 2026 | Platform launch (MVP with core features) |
| Q3 2026 | 50 paying customers; first accountant partnerships live |
| Q4 2026 | 150 paying customers; Expert Review add-on launched |
| Q1 2027 | 300 paying customers; industry association partnerships active |
| Q2 2027 | 500 paying customers; full feature set complete |
| Q4 2027 | 700+ paying customers; wind-down of acquisition; transition to retention/extension |

---

## 12. Risk Mitigation

### 12.1 Regulatory Risk

| Risk | Impact | Mitigation |
|---|---|---|
| Further deadline extension (the 2027→2028 extension already happened, and dates now live in an AMvB the government can move again) | Reduces urgency; extends the window but slows adoption | Monitor the AMvB and DNB/SZW signals (see [SOURCES.md](./SOURCES.md)); lead with the *insured-scheme* milestones (start ~Jul 2026, insurer submission 1 Oct 2027) rather than the soft 2028 end date; position as "be ready early" |
| Regulatory changes during transition | Platform guidance becomes outdated | Dedicated regulatory monitoring; automated update pipeline; advisory board with pension law expertise |
| Supervisory enforcement approach unclear | Businesses may not take compliance seriously | Track DNB/AFM communications; incorporate enforcement signals into urgency messaging |

### 12.2 Market Risk

| Risk | Impact | Mitigation |
|---|---|---|
| Low awareness / market inertia | Businesses don't act until too late | Invest in awareness channels; partner with trusted intermediaries (accountants, industry bodies) |
| "Good enough" insurer tools | Businesses use free insurer tools instead | Differentiate on independence, comprehensiveness, and compliance assurance |
| Price sensitivity | €999 perceived as too high for a digital tool | Emphasise 10–20x savings vs. consultancy; offer free assessment preview to demonstrate value before purchase |
| Competition from consultants lowering prices | Margin pressure | Maintain cost advantage through automation; focus on segments underserved by consultants |
| **Brand collision with `Pensioennavigator.nl`** (a live, directly-adjacent product) | SEO/trademark/confusion risk | Clear the name (trademark + domain search) before any brand spend; consider a distinct name |
| **Wft advice requirement** — employers effectively need a licensed adviser; a self-serve tool cannot *be* the regulated advice | Caps the "replace the consultant" model | Reposition as triage/augmentation + handoff; make the Wft expert-review path and B2B2B adviser tooling core, not optional (see §12.4) |

### 12.3 Operational Risk

| Risk | Impact | Mitigation |
|---|---|---|
| Platform quality / accuracy | Compliance errors damage trust and create liability | Rigorous QA; advisory board review of all compliance logic; clear liability disclaimers; optional Expert Review add-on |
| Support capacity at scale | Customer support overwhelmed during peak periods | Invest in self-service support (knowledge base, in-app guidance); tiered support model |
| Talent acquisition | Difficulty hiring pension + tech talent | Partner with pension domain experts on advisory basis; core team focuses on platform engineering |

### 12.4 Legal & Liability Risk

Wtp Navigator provides guided software tooling, not regulated financial advice. The platform's terms of service clearly delineate this boundary. The optional Expert Review add-on is delivered by licensed pensioenadviseurs operating under their own professional liability insurance. This structure limits the company's regulatory exposure while still providing customers with access to professional review when needed.

---

## 13. Roadmap

### Phase 1: Foundation (Q1–Q2 2026)

- Core platform development (assessment, migration planning, compliance checks).
- Regulatory content creation and legal review.
- Beta testing with 10–20 pilot customers.
- Accountant partnership programme design.
- Go-to-market preparation (website, content, SEO).

### Phase 2: Launch & Growth (Q3 2026–Q2 2027)

- Public launch and customer acquisition.
- Expert Review add-on launch.
- Partnership activation (accountants, industry associations).
- Continuous regulatory updates and feature refinement.
- Customer feedback integration and platform iteration.

### Phase 3: Scale & Optimise (Q3–Q4 2027)

- Peak acquisition period (deadline-driven urgency).
- Full feature set including advanced compliance reporting.
- Scaling support infrastructure for peak demand.
- Begin development of post-transition product extensions.

### Phase 4: Transition & Extension (Q1 2028+)

- Shift from acquisition to retention and expansion.
- Launch ongoing compliance monitoring product.
- Evaluate adjacent market opportunities.
- Leverage customer base and platform for next-stage growth.

---

## Appendix: Glossary

| Term | Definition |
|---|---|
| **Wtp** | Wet toekomst pensioenen — the Future of Pensions Act |
| **MKB** | Midden- en Kleinbedrijf — Dutch SMBs |
| **APK** | Algemene Periodieke Keuring — periodic inspection; used colloquially for pension scheme health check |
| **DB** | Defined Benefit — pension scheme guaranteeing a specific retirement income |
| **DC** | Defined Contribution — pension scheme based on invested contributions |
| **DNB** | De Nederlandsche Bank — the Dutch central bank and pension supervisor |
| **AFM** | Autoriteit Financiële Markten — the Dutch financial markets authority |
| **BPF** | Bedrijfstakpensioenfonds — industry-wide pension fund |
| **PPI** | Premiepensioeninstelling — premium pension institution |
| **DGA** | Directeur-grootaandeelhouder — owner-director |
| **KvK** | Kamer van Koophandel — Dutch Chamber of Commerce |
| **BTW** | Belasting over de Toegevoegde Waarde — Dutch VAT |

---

*This document is a living strategy guide and will be updated as market conditions, regulatory developments, and product evolution warrant.*
