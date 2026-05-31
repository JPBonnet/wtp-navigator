# Wtp Navigator — Pension Transition SaaS for Dutch SMBs

**A Wtp orientation, decision-support and document-prep platform for SMB employers with an
insured pension scheme — and the advisers who serve them.**

> **Documentation reviewed & revalidated: 30 May 2026.** Market, regulatory and competitive
> assumptions were checked against external sources. See
> **[ASSUMPTIONS-VALIDATION.md](docs/ASSUMPTIONS-VALIDATION.md)** for what held, what changed,
> and what was corrected, and **[SOURCES.md](docs/SOURCES.md)** for citations.

## 📚 Documentation

**Start here**
- **[Assumptions & Validation](docs/ASSUMPTIONS-VALIDATION.md)** — the idea, every core
  assumption, and whether it still holds (read this first).
- **[Requirements & Specification](docs/REQUIREMENTS.md)** — canonical functional &
  non-functional requirements and the (corrected) domain model.
- **[Sources & References](docs/SOURCES.md)** — external citations for all factual claims.

**Strategy & market**
- **[Product Strategy](docs/PRODUCT-STRATEGY.md)** — problem, solution, revenue model.
- **[Market Research](docs/MARKET-RESEARCH.md)** — market sizing, timing, pain points.
- **[Competitive Analysis](docs/COMPETITIVE-ANALYSIS.md)** — the real competitive landscape.
- **[Customer Personas](docs/CUSTOMER-PERSONAS.md)** — Jan, Sanne, Pieter.
- **[Business Plan](docs/BUSINESS-PLAN.md)** — financials and scenarios.
- **[Go-to-Market Strategy](docs/GO-TO-MARKET-STRATEGY.md)** — launch and acquisition.

**Build**
- **[Technical Architecture](docs/TECHNICAL-ARCHITECTURE.md)** — system design & tech stack.
- **[Implementation Roadmap](docs/IMPLEMENTATION-ROADMAP.md)** — phases and timeline.
- **[Comprehensive Features Plan](docs/COMPREHENSIVE-FEATURES-PLAN.md)** — feature backlog.
- **[Test Coverage Plan](docs/TEST-COVERAGE-PLAN.md)** · **[TDD Test Plan](TDD-TEST-PLAN.md)**

## 🎯 Quick facts (validated May 2026)

- **The idea:** help a Dutch SMB with an **insured** pension scheme orient, decide and prepare
  for the Wtp transition — then hand off cleanly to a Wft-licensed adviser. It augments and
  routes to regulated advice; it does **not** replace it.
- **Regulatory driver:** the Wet toekomst pensioenen (Wtp, in force since 1 Jul 2023) requires
  schemes to move to a flat-premium DC basis. The implementation deadline was **extended from
  1 Jan 2027 to 1 Jan 2028** (Eerste Kamer, 2 Dec 2025) and the dates now sit in an AMvB
  (so they can move again).
- **Insured-scheme calendar:** recommended start **~1 Jul 2026** · transition plan to
  insurer/PPI by **1 Oct 2027** · live by **1 Jan 2028**.
- **Market:** insurers/PPIs run schemes for **~1.5M employees at ~65,000 companies**, with
  **~50,000 insured schemes to adapt** — the large majority SMBs.
- **The real decision** (not "invaren"): **eerbiedigende werking** (keep existing employees on
  the age-progressive premium) **vs. flat premium + compensation**.
- **Pricing:** €999 one-time self-serve tier + free orientation/triage tier; optional Wft
  expert-review and partner (B2B2B) paths.

## ⚠️ Open risks to clear before spend

- **Advice requirement:** insured-scheme transitions effectively require a **Wft adviser** —
  position as triage/augmentation + handoff, not consultant replacement (see A9).
- **Name collision:** **Pensioennavigator.nl** is a live, directly-adjacent product — clear
  the brand before investing in it (see A10).
- **Deadline can move again:** transition dates live in an AMvB; monitor (see A2).

## 📋 Status

- ✅ Strategy, market, competitive and persona docs in place
- ✅ Assumptions revalidated against external sources (30 May 2026)
- ✅ Formal Requirements & Specification added
- ✅ Backend modules implemented with test suite (see `lib/`, `pages/api/`)
- ⏳ Repositioning (adviser-augmentation / B2B2B) to be reflected in UX and GTM

---

**Repository:** https://github.com/JPBonnet/wtp-navigator
**Owner:** Jean-Pierre Bonnet
