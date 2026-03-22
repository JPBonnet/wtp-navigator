# Business Plan

## Wtp Navigator — Comprehensive Business Plan

---

## 1. Executive Summary

Wtp Navigator is a B2B SaaS platform that helps Dutch small and medium-sized businesses (10–250 employees) navigate the mandatory pension reform (Wet toekomst pensioenen). Every employer in the Netherlands must transition their pension arrangements to the new system before 1 January 2028, creating a time-bound market opportunity of €2–3M+ over 18 months.

**The Problem:** Dutch SMBs face a complex, high-stakes regulatory deadline. Traditional pension consultants charge €5,000–€25,000, pricing out the majority of the market. Most SMBs are procrastinating because they can't afford professional help and don't have the expertise to DIY.

**The Solution:** Wtp Navigator delivers consultant-quality pension transition guidance through an intelligent, self-service platform — for a one-time fee of €999. Our assessment engine analyzes a company's current pension arrangement, identifies compliance gaps, generates a migration plan, and produces the required documentation.

**The Opportunity:** 1,000–5,000 eligible SMBs represent a serviceable market of €1–5M. With 85%+ gross margins and a blended customer acquisition cost of €120–180, the unit economics are highly attractive.

**Financial Summary:**

| Metric | Year 1 | Year 2 | Cumulative |
|--------|--------|--------|------------|
| Customers | 210–430 | 300–600 | 510–1,030 |
| Revenue | €210K–€430K | €1M–€2M+ | €2M–€3M+ |
| Gross Margin | 83–85% | 85–87% | 85%+ |
| Net Profit | €80K–€200K | €500K–€1.2M | €600K–€1.5M+ |

**Ask:** This business plan outlines the path from MVP launch (May 2026) to market leadership in the Dutch Wtp transition space, requiring an initial investment of €26,000–€47,000 in development and marketing.

---

## 2. Company Vision & Mission

### Vision

To be the definitive technology platform that Dutch businesses trust for pension compliance — making complex regulatory transitions accessible, affordable, and stress-free.

### Mission

We empower Dutch SMBs to navigate pension reform with confidence by providing intelligent, affordable, and comprehensive transition tools that eliminate the need for expensive consultants.

### Core Values

1. **Accessibility:** Complex compliance should not require a €10,000 budget or a pension law degree
2. **Clarity:** Every output we produce must be understandable by a non-specialist
3. **Reliability:** Our compliance assessments must be accurate and legally sound
4. **Urgency:** We respect the deadline our customers face and help them act decisively
5. **Transparency:** One price, clear scope, no hidden fees

### Long-Term Vision (Beyond Wtp)

While the Wtp transition creates our initial market opportunity, the platform architecture is designed for extensibility:

- **Phase 1 (2026–2028):** Wtp pension transition (core business)
- **Phase 2 (2028–2029):** Ongoing pension compliance monitoring and optimization
- **Phase 3 (2029+):** Broader HR compliance platform (expanding to other regulatory domains: working conditions, employment law changes, ESG reporting requirements)

---

## 3. Product Overview

### What We Build

Wtp Navigator is a web-based platform with four core modules:

#### 3.1 Assessment Engine

The heart of the product. Companies answer structured questions about their current pension arrangement, and our engine:

- Analyzes their current pension type, contributions, and accrual structure
- Identifies which aspects need to change under the Wtp
- Flags potential risks (e.g., employees close to retirement who may be disadvantaged)
- Generates a comprehensive compliance gap analysis

**Key Feature:** The assessment adapts dynamically — questions are contextual based on previous answers, minimizing time investment while maximizing accuracy.

#### 3.2 Compliance Verifier

A real-time compliance checker that validates pension arrangements against all Wtp requirements:

- Checks transition plan completeness against regulatory checklists
- Verifies compensation calculations for fairness
- Validates employee communication plans against AFM requirements
- Flags potential issues before they become regulatory problems

#### 3.3 Migration Planner

A step-by-step project plan for the pension transition:

- Customized timeline based on company size and complexity
- Task assignments (what the company does, what the pension provider does, what the works council does)
- Automated reminders and progress tracking
- Milestone-based approach with clear deliverables at each stage

#### 3.4 Document Generator

Produces all required documentation:

- Transition plan (transitieplan) — the core regulatory document
- Employee communication letters and FAQs
- Works council consultation documents
- Pension provider notification letters
- Board/management summary reports

### Technology Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Frontend | Next.js + React + TypeScript | Fast, SEO-friendly, type-safe |
| Backend | Next.js API routes + Supabase | Serverless, cost-effective |
| Database | PostgreSQL (Supabase) | Reliable, scalable, Row Level Security |
| Hosting | Vercel | Zero-config deployment, global CDN |
| Auth | Supabase Auth | Built-in, secure, multi-tenant |
| Styling | Tailwind CSS | Rapid UI development |

See [TECHNICAL-ARCHITECTURE.md](./TECHNICAL-ARCHITECTURE.md) for detailed technical specifications.

---

## 4. Market Opportunity

### The Wtp Reform

The Wet toekomst pensioenen (Future of Pensions Act) mandates that every Dutch employer transition their pension arrangements to the new defined contribution system by 1 January 2028. This affects hundreds of thousands of companies, but our target market is the underserved SMB segment.

### Total Addressable Market (TAM)

| Segment | Size | Value |
|---------|------|-------|
| All Dutch businesses needing Wtp transition | ~60,000 | €60M+ (at €999/each) |
| SMBs with 10–250 employees | ~15,000–20,000 | €15–20M |
| **Our serviceable market** | **1,000–5,000** | **€1–5M** |

### Why 1,000–5,000?

Our serviceable market is constrained by:
- Companies already using industry pension funds (sector-level transition, not our market)
- Companies already engaged with consultants (hard to switch mid-process)
- Companies with <10 employees (often use simplified pension products, lower urgency)
- Companies with >250 employees (usually have in-house HR/pension expertise)

The 1,000–5,000 range represents companies that need help, can't afford consultants, and are actively seeking alternatives.

### Market Timing

The opportunity window is 18 months (Q3 2026 – Q4 2027), with demand accelerating toward the deadline:

- **Q3–Q4 2026:** Early adopters (15% of market)
- **Q1–Q2 2027:** Mainstream (35% of market)
- **Q3–Q4 2027:** Late majority and deadline-driven surge (40% of market)
- **2028+:** Post-deadline remediation (10% of market)

For detailed market research, see [MARKET-RESEARCH.md](./MARKET-RESEARCH.md).

---

## 5. Business Model

### Revenue Model

**Primary Revenue: €999 One-Time Fee**

| Component | Included |
|-----------|----------|
| Full pension assessment | ✅ |
| Compliance gap analysis | ✅ |
| Migration plan | ✅ |
| Document generation | ✅ |
| 90-day email support | ✅ |

**Secondary Revenue: Upsells & Add-Ons**

| Add-On | Price | Expected Attach Rate |
|--------|-------|---------------------|
| Premium support (6 months) | €499 | 20% |
| Employee communication package | €299 | 30% |
| Annual compliance monitoring | €499/year | 15% |
| Multi-entity bundle (3+) | 15% discount | 5% |

**Average Revenue Per Customer:** €1,200–€1,400 (including upsells)

### Why One-Time Pricing?

1. **Reduces friction:** No ongoing commitment = easier purchase decision
2. **Matches the need:** Pension transition is a one-time event
3. **Builds trust:** "Pay once, get everything" is transparent and fair
4. **Enables urgency:** "Act now" messaging is cleaner than subscription pitches
5. **High margins justify it:** 85%+ gross margin means €999 is highly profitable per customer

### Margin Analysis

| Cost Component | Per Customer | % of Revenue |
|----------------|-------------|--------------|
| Infrastructure (hosting, compute) | €10–€20 | 1–2% |
| Support (email, scaled) | €30–€50 | 3–5% |
| Payment processing | €25–€30 | 2.5–3% |
| Content/compliance updates | €20–€30 | 2–3% |
| **Total COGS** | **€85–€130** | **8.5–13%** |
| **Gross Profit** | **€870–€915** | **87–91.5%** |

At scale (100+ customers/month), gross margin exceeds 85%.

---

## 6. Revenue Projections

### Year 1 (July 2026 – June 2027)

| Quarter | New Customers | Cumulative | Quarterly Revenue | Cumulative Revenue |
|---------|---------------|------------|-------------------|--------------------|
| Q3 2026 | 15 | 15 | €18,000 | €18,000 |
| Q4 2026 | 50 | 65 | €60,000 | €78,000 |
| Q1 2027 | 65 | 130 | €78,000 | €156,000 |
| Q2 2027 | 80 | 210 | €96,000 | €252,000 |

**Year 1 Total (Base Case): €252,000**

Including upsells (~20% attach rate average): **€210,000–€430,000**

### Year 2 (July 2027 – June 2028)

| Quarter | New Customers | Quarterly Revenue | Notes |
|---------|---------------|-------------------|-------|
| Q3 2027 | 150 | €180,000 | Deadline urgency surge |
| Q4 2027 | 200 | €240,000 | Peak demand period |
| Q1 2028 | 100 | €120,000 | Post-deadline remediation |
| Q2 2028 | 50 | €60,000 | Trailing demand |

**Year 2 Total (Base Case): €600,000–€1,200,000**

Including upsells and premium pricing for rush service: **€1,000,000–€2,000,000+**

### Cumulative Revenue (18-Month Primary Window)

| Scenario | Total Customers | Total Revenue | Net Profit |
|----------|----------------|---------------|------------|
| Conservative | 300 | €360,000 | €150,000 |
| Base case | 600 | €800,000 | €450,000 |
| Optimistic | 1,000 | €1,400,000 | €900,000 |
| Best case | 1,500+ | €2,100,000+ | €1,400,000+ |

**Target: €2–3M cumulative revenue over the full opportunity window.**

---

## 7. Go-to-Market Strategy Summary

### Phase 1: Foundation (Pre-Launch, March–June 2026)
- Build MVP with core assessment engine and compliance checker
- Recruit 5–10 beta customers from personal network
- Develop marketing assets and sales materials
- Establish first 3–5 partnership conversations

### Phase 2: Launch (Q3 2026)
- Public launch with LinkedIn content campaign
- Free pension audit as primary lead magnet
- Activate first referral partnerships
- Target: 15 paying customers by end of Q3

### Phase 3: Growth (Q4 2026 – Q2 2027)
- Scale LinkedIn advertising (€2,000–€4,000/month)
- Expand partnership network to 10+ active partners
- Attend industry events (HR Live, Pensioen Pro Forum)
- Launch referral program for existing customers
- Target: 200+ customers by end of Q2 2027

### Phase 4: Urgency Capture (Q3–Q4 2027)
- Shift messaging to deadline urgency
- Introduce rush/premium pricing tier (+25%)
- Maximize capacity for high-volume onboarding
- Deploy "last chance" marketing campaigns
- Target: 400+ cumulative customers by deadline

For the complete go-to-market plan, see [GO-TO-MARKET-STRATEGY.md](./GO-TO-MARKET-STRATEGY.md).

---

## 8. Team & Resources

### Current Team

| Role | Person | Capacity | Responsibilities |
|------|--------|----------|-----------------|
| Founder / CEO | Jean-Pierre Bonnet | Full-time | Strategy, sales, product direction |
| Development | Founder + AI tools | Full-time | Full-stack development (Next.js, Supabase) |

### Planned Hires (As Revenue Allows)

| Role | Timing | Monthly Cost | Trigger |
|------|--------|-------------|---------|
| Part-time customer support | Q4 2026 | €1,500–€2,500 | >30 active customers |
| Freelance content/marketing | Q4 2026 | €1,000–€2,000 | Partnership pipeline active |
| Junior developer | Q1 2027 | €3,000–€4,000 | Product feature backlog growing |
| Pension domain expert (advisor) | Q3 2026 | €500–€1,000 | Compliance validation needs |

### Advisory Network

- **Pension law advisor:** Part-time engagement for compliance validation and regulatory monitoring
- **Marketing advisor:** Fractional CMO or marketing consultant for campaign strategy
- **Accounting/financial advisor:** Standard business accounting and tax compliance

### Resource Philosophy

The business is designed to be capital-efficient:
- **No office:** Fully remote, founder works from home
- **Minimal team:** AI-assisted development reduces the need for a large engineering team
- **SaaS infrastructure:** Pay-as-you-go cloud costs scale with revenue
- **Outsource non-core:** Design, legal, accounting — all freelance/part-time until revenue justifies full-time

---

## 9. Financial Projections

### Profit & Loss Projection

#### Year 1 (July 2026 – June 2027)

| Category | Conservative | Base Case | Optimistic |
|----------|-------------|-----------|------------|
| **Revenue** | | | |
| Product revenue (€999 × customers) | €150,000 | €252,000 | €430,000 |
| Upsell revenue | €25,000 | €50,000 | €90,000 |
| **Total Revenue** | **€175,000** | **€302,000** | **€520,000** |
| | | | |
| **Cost of Goods Sold** | | | |
| Infrastructure | €5,000 | €8,000 | €12,000 |
| Support costs | €8,000 | €15,000 | €25,000 |
| Payment processing | €5,000 | €8,000 | €14,000 |
| **Total COGS** | **€18,000** | **€31,000** | **€51,000** |
| **Gross Profit** | **€157,000** | **€271,000** | **€469,000** |
| **Gross Margin** | **89.7%** | **89.7%** | **90.2%** |
| | | | |
| **Operating Expenses** | | | |
| Marketing & advertising | €25,000 | €40,000 | €60,000 |
| Development (tools & services) | €5,000 | €8,000 | €10,000 |
| Domain expert / advisor | €6,000 | €8,000 | €10,000 |
| Part-time support hire | €0 | €10,000 | €18,000 |
| Freelance content/design | €5,000 | €8,000 | €12,000 |
| Admin, legal, accounting | €5,000 | €6,000 | €8,000 |
| SaaS tools & subscriptions | €3,000 | €4,000 | €5,000 |
| **Total OpEx** | **€49,000** | **€84,000** | **€123,000** |
| | | | |
| **Operating Profit (EBIT)** | **€108,000** | **€187,000** | **€346,000** |
| **Operating Margin** | **61.7%** | **61.9%** | **66.5%** |

#### Year 2 (July 2027 – June 2028)

| Category | Conservative | Base Case | Optimistic |
|----------|-------------|-----------|------------|
| Total Revenue | €400,000 | €800,000 | €1,500,000 |
| Total COGS | €50,000 | €100,000 | €180,000 |
| Gross Profit | €350,000 | €700,000 | €1,320,000 |
| Total OpEx | €150,000 | €250,000 | €400,000 |
| **Operating Profit** | **€200,000** | **€450,000** | **€920,000** |

### Break-Even Analysis

| Metric | Value |
|--------|-------|
| Fixed monthly costs (pre-revenue) | €3,000–€4,000 |
| Variable cost per customer | €85–€130 |
| Revenue per customer | €999 (base) |
| Contribution margin per customer | €870–€915 |
| **Break-even: monthly customers needed** | **4–5 customers/month** |
| **Break-even: time to reach** | **Month 2–3 after launch** |

The low break-even point is a key strength of this business model. With just 4–5 customers per month, the business covers its costs. Everything above that is profit.

### Cash Flow Considerations

- **Pre-launch investment:** €26,000–€47,000 (development + initial marketing)
- **Revenue starts:** Month 1 of launch (Q3 2026)
- **Cash flow positive:** Expected within 2–3 months of launch
- **No external funding required:** The business is designed to be self-funded from the founder's savings and early revenue

### Initial Investment Breakdown

| Category | Conservative | Full Budget |
|----------|-------------|-------------|
| Development costs (tools, services) | €5,000 | €10,000 |
| Domain expert consultation | €3,000 | €6,000 |
| Marketing assets & design | €3,000 | €6,000 |
| Initial advertising budget | €5,000 | €10,000 |
| Legal setup & compliance review | €3,000 | €5,000 |
| Contingency (20%) | €4,000 | €7,000 |
| Buffer (3 months operating) | €3,000 | €3,000 |
| **Total** | **€26,000** | **€47,000** |

---

## 10. Risk Mitigation

### Business Risks

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| **Low customer adoption** | Medium | High | Free audit lead magnet reduces friction; money-back guarantee builds confidence; aggressive partnership strategy expands reach |
| **Regulatory deadline extension** | Low | Critical | Monitor political signals; build post-deadline value proposition (ongoing compliance monitoring); diversify product beyond Wtp |
| **Competitor launches similar product** | Medium | Medium | First-mover advantage; build partnership moats; focus on depth and quality over features; strong brand and customer relationships |
| **Product liability (incorrect compliance advice)** | Low | High | Clear disclaimers that tool provides guidance, not legal advice; professional liability insurance; regular compliance audits by domain expert |
| **Technical failures at scale** | Low | Medium | Serverless architecture scales automatically; monitoring and alerting; load testing before peak periods |
| **Customer acquisition cost too high** | Medium | Medium | Diversify channels; optimize conversion funnel; leverage partnerships (lower CAC); content marketing (long-term CAC reduction) |

### Regulatory Risks

| Risk | Mitigation |
|------|------------|
| Wtp rules change during our operating period | Modular architecture allows rapid updates; domain expert monitors regulatory changes; automated compliance rule updates |
| Regulatory body questions our product's accuracy | Proactive engagement with pension industry bodies; clear positioning as guidance tool, not legal advice; transparent methodology |
| Data privacy concerns (GDPR) | Privacy by design; data minimization; clear privacy policy; no unnecessary data collection; Supabase EU hosting |

### Financial Risks

| Risk | Mitigation |
|------|------------|
| Cash flow timing (slow early months) | Low fixed costs; founder self-funds initial period; pre-launch marketing builds pipeline before launch |
| Price pressure from competitors | Value-based pricing anchored to consultant alternative (€999 vs. €10,000+); upsells provide additional margin |
| Concentration risk (few large customers) | Diversified customer base (many small customers, not few large ones); no single customer represents >2% of revenue |

---

## 11. Success Metrics

### Product-Market Fit Indicators

| Metric | Target | Measurement |
|--------|--------|-------------|
| Free audit completion rate | >70% | Analytics |
| Audit-to-purchase conversion | >10% | CRM tracking |
| Customer NPS | >50 | Post-completion survey |
| Time to value (first assessment) | <30 minutes | Product analytics |
| Customer effort score | <3 (out of 7) | Survey |

### Growth Metrics

| Metric | Month 3 | Month 6 | Month 12 | Month 18 |
|--------|---------|---------|----------|----------|
| Monthly new customers | 5 | 15 | 35 | 80+ |
| Cumulative customers | 15 | 65 | 210 | 500+ |
| Monthly revenue | €5K | €18K | €42K | €96K+ |
| Cumulative revenue | €18K | €78K | €252K | €800K+ |

### Operational Metrics

| Metric | Target |
|--------|--------|
| Gross margin | >85% |
| CAC (blended) | <€180 |
| LTV:CAC ratio | >7x |
| Support tickets per customer | <3 |
| Average resolution time | <24 hours |
| Platform uptime | >99.5% |

### Milestone-Based Goals

| Milestone | Target Date | Success Criteria |
|-----------|-------------|-----------------|
| MVP launch | May 2026 | Core assessment engine working, 5 beta customers |
| Public launch | July 2026 | Marketing live, first paying customers |
| Product-market fit | September 2026 | >10% audit-to-purchase conversion, NPS >40 |
| Traction | December 2026 | 50+ customers, 3+ active partnerships |
| Scale | June 2027 | 200+ customers, €250K+ revenue, team growing |
| Peak | December 2027 | 500+ customers, €800K+ revenue |
| Transition | June 2028 | Post-deadline product pivot planned |

---

## 12. Conclusion

Wtp Navigator addresses a clear, time-bound market need with a capital-efficient, high-margin business model. The combination of regulatory urgency, an underserved market segment, and a 10x price advantage over alternatives creates a compelling business opportunity.

The key success factors are:
1. **Execution speed:** Launching in Q3 2026 captures the optimal market window
2. **Product quality:** Compliance accuracy builds trust and drives word-of-mouth
3. **Partnership leverage:** Accountants and payroll bureaus multiply reach without proportional cost
4. **Urgency capture:** Marketing and product must be ready for the deadline-driven surge in H2 2027

With a modest initial investment of €26,000–€47,000, the business targets €2–3M in cumulative revenue over the 18-month opportunity window, with 85%+ gross margins and rapid time to profitability.

---

## 13. Cross-References

- **Product strategy:** See [PRODUCT-STRATEGY.md](./PRODUCT-STRATEGY.md)
- **Technical architecture:** See [TECHNICAL-ARCHITECTURE.md](./TECHNICAL-ARCHITECTURE.md)
- **Implementation roadmap:** See [IMPLEMENTATION-ROADMAP.md](./IMPLEMENTATION-ROADMAP.md)
- **Go-to-market strategy:** See [GO-TO-MARKET-STRATEGY.md](./GO-TO-MARKET-STRATEGY.md)
- **Market research:** See [MARKET-RESEARCH.md](./MARKET-RESEARCH.md)
- **Customer personas:** See [CUSTOMER-PERSONAS.md](./CUSTOMER-PERSONAS.md)
- **Competitive analysis:** See [COMPETITIVE-ANALYSIS.md](./COMPETITIVE-ANALYSIS.md)
