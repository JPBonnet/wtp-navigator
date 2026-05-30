# Assumptions & Validation Log

**Document version:** 1.0
**Last updated:** 30 May 2026
**Status:** Active — reviewed against external evidence
**Owner:** Product & Strategy

---

## Purpose

This document captures the **core assumptions** behind Wtp Navigator, tracks whether each
one still holds, and records the evidence used to validate (or correct) it. It is the
canonical reference for "is the idea still relevant?" — every other strategy and product
document should be consistent with the conclusions here.

Each assumption is rated:

- ✅ **Validated** — evidence supports the assumption as written.
- 🟡 **Validated with nuance** — directionally correct, but the original framing was
  imprecise or has changed and the dependent documents have been corrected.
- 🔴 **Invalidated / corrected** — the original assumption was wrong or fabricated and has
  been removed or replaced across the documentation.

All sources are listed in [SOURCES.md](./SOURCES.md). This review reflects the public
record as of **May 2026**.

---

## 1. Regulatory driver

### A1 — "The Wtp forces every covered employer to act, with a hard deadline." ✅

The Wet toekomst pensioenen (Wtp) entered into force on **1 July 2023** and requires
existing occupational pension arrangements to move to a flat-premium defined-contribution
basis. The compliance obligation and the deadline are real and externally verifiable.

### A2 — "The deadline is 1 January 2028." 🟡 (now correct, but the story changed)

When the earliest project notes were written, the statutory implementation deadline was
**1 January 2027**. That deadline has since been **extended by one year to 1 January 2028**:
the Tweede Kamer adopted the extension on 20 May 2025 and the Eerste Kamer confirmed it on
**2 December 2025** (wetsvoorstel 36.578).

Two consequences the documents must reflect:

1. **The headline "1 January 2028" is now accurate** — so no change to the deadline number,
   but the framing "deadline was always 2028" is wrong; it is the *extended* deadline.
2. **The individual transition dates have been moved into an AMvB** (Algemene Maatregel van
   Bestuur / general administrative order). This lets the government shift the dates again
   without primary legislation. **A further extension is therefore materially easier than
   before** — this is now a first-order commercial risk (see A9) rather than a tail risk.

### A3 — "There are meaningful intermediate milestones before 2028." 🟡 (dates corrected)

The original docs listed milestones such as "1 Jan 2025 labour-condition agreements" and
"1 Jan 2027 begin transition." Those are **stale**. For the segment Wtp Navigator actually
targets — employers with a scheme at an **insurer or PPI** — the relevant calendar is:

| Date | Milestone (insured-scheme employers) |
|---|---|
| **~1 July 2026** | Recommended **start** of the adjustment process (the labour-conditions track typically takes many months). This is *imminent* as of this review. |
| **1 October 2027** | Deadline to submit the signed offer + transition plan (*transitieplan*) to the insurer / PPI. |
| **1 January 2028** | All schemes must operate under the new framework. |

This is genuinely good for timing: the **SMB insured-scheme wave is starting now** (mid-2026)
and runs hard into late 2027.

---

## 2. The problem and the product's domain model

### A4 — "Invaren (converting accrued rights) is a core task customers need help with." 🔴 Corrected

This was a **domain error** and it propagated through several documents. For the target
segment — employers with an **insured** scheme (verzekeraar/PPI) — *invaren of accrued
rights is not applicable*; collective conversion of existing capital is a pension-**fund**
mechanism. Insured accrued benefits generally stay where they are.

The actual decisions an insured-scheme employer faces are:

- Move future accrual to a **flat (age-independent) premium** (*vlakke premie*).
- Choose between **eerbiedigende werking** (keep existing employees on the current
  age-progressive premium scale, *staffel*) **vs.** moving everyone to the flat premium with
  **compensation** (*compensatie*) for disadvantaged (typically older) employees. Industry
  expectation is that the large majority (~80–85%) of insured-scheme employers choose
  eerbiedigende werking.
- Amend the **pensioenovereenkomst**, obtain **employee consent** (instemming), run
  **OR/PVT** consultation, produce a **transitieplan**, and execute employee communication.

**Action taken:** "invaren" has been removed as a core customer task across the docs and
replaced with the flat-premium / eerbiedigende-werking / compensation decision model. This
is the single most important correctness fix in this review.

### A5 — "Target customers lack expertise and find traditional advice expensive." ✅

Supported. SMBs with insured schemes typically have no in-house pension specialist; the
process is widely described as complex and multi-month, and advisory engagements are a
material cost for a 20–100-person firm.

---

## 3. Market size

### A6 — "There is a sizeable, time-boxed SMB market." 🟡 (re-based on better data)

The original sizing ("~30,000–50,000 insured arrangements," "1,000–5,000 serviceable") was
roughly the right order of magnitude but under-sourced. Better, citeable figures now anchor
the model:

- Insurers and PPIs administer pension schemes for **~1.5 million employees** across
  **~65,000 companies**.
- There are **~50,000 insured schemes that must be adapted** for the Wtp.

The **vast majority of these employers are SMBs**, which makes the target segment larger and
better-evidenced than the original docs claimed. The constraint on the opportunity is not
the size of the pool — it is **reachability and the advice requirement** (A8), not headcount.

**Action taken:** TAM/SAM tables across the docs now use the 65,000-companies / 50,000-schemes
anchor with sources.

---

## 4. Competition

### A7 — "DoNotPay is a competitor in the Dutch pension market." 🔴 Invalidated / removed

This is **factually wrong** and has been deleted everywhere it appeared. DoNotPay is a US
consumer legal chatbot with **no Dutch pension product**; in 2024–2025 it was sanctioned by
the US FTC (a finalized order, $193,000, Feb 2025) for deceptive "AI lawyer" claims. Citing
it as a credible €200–500 Dutch Wtp competitor undermined the credibility of the analysis.

**Action taken:** replaced with the *real* competitive set (A8).

### A8 — The real competitive / channel landscape 🟡 (rewritten)

The honest landscape for an insured-scheme SMB is:

1. **Wft-licensed pension advisers** (the *default and often de-facto required* route).
   Ranges from large advisory/actuarial firms (Aon, Mercer, WTW, Montae & Partners,
   Sprenkels) to thousands of local **Adfiz**-affiliated advisers. Insurers typically expect
   the labour-conditions track to be run with a licensed adviser.
2. **Insurers' / PPIs' own employer guidance and tooling** (a.s.r., Nationale-Nederlanden,
   Zwitserleven, Centraal Beheer/Achmea, etc.).
3. **Specialised Wtp software/platforms — including a near-namesake, `Pensioennavigator.nl`**,
   which already offers premium/pension/compensation modelling, transition plans, agreements
   and choice guidance. This is both a **direct competitor and a brand-collision risk** for a
   product called "Wtp Navigator." Also: `pensioentransitieplan.nl` and similar.
4. **Free, authoritative resources**: `werkenaanonspensioen.nl` (a joint initiative of
   VNO-NCW, MKB-Nederland, Verbond van Verzekeraars, Adfiz, the Pensioenfederatie and the
   Ministry of SZW) and **Adfiz/Verbond template texts for the transitieplan** — these erode
   the "we generate the documents for you" value proposition.
5. **Accountants / payroll bureaus** (existing trusted relationship; usually refer out).

---

## 5. Business-model assumptions that now need care

### A9 — "A €999 self-service SaaS can replace the consultant." 🔴 Needs repositioning

This is the **most consequential assumption** and it does **not** survive contact with the
regulatory reality. The insured-scheme transition involves **regulated financial advice**
(Wft) and an insurer-required signed offer; in practice employers are expected to involve a
**Wft-licensed adviser**, and the *evenwichtige belangenafweging* / compensation decisions
carry liability. A pure self-service tool cannot lawfully *be* that advice.

Viable repositionings (carried into the strategy + requirements docs):

- **Triage & orientation + document accelerator** that produces a structured, decision-ready
  starting point and then **routes to a Wft adviser** for the regulated step (the existing
  "Expert Review add-on" effectively becomes a core part of the path, not an upsell).
- **B2B2B tooling for advisers and accountants** — sell the engine to the people who are
  *required* to be in the loop, rather than trying to disintermediate them.

The €999 self-serve price point can remain for the orientation/triage product, but the
revenue model and go-to-market must stop assuming full consultant replacement.

### A10 — "Brand: 'Wtp Navigator'." 🟡 Risk flagged

`Pensioennavigator.nl` is a live, directly-adjacent product. The name overlap is a real
trademark / SEO / confusion risk and should be cleared before any spend on brand.

### A11 — Internal financial projections are inconsistent across docs. 🟡 Flagged

The three planning docs disagree on Year-1 cumulative customers (≈165 vs. ≈210 vs. ≈370/550)
and Year-1 revenue (≈€252k vs. ≈€550k). These are different scenarios under the same labels.
Pending a single bottom-up rebuild, treat the **headline as a scenario range** — "**€0.2–3M
over the commercial window**" — and read the per-doc tables as conservative/base/optimistic
variants, not as competing point forecasts. See each doc's "Scenario basis" note.

---

## 6. Net conclusion

**The idea is still relevant** — arguably *more* timely than when first written, because the
SMB insured-scheme wave begins ~now (mid-2026) and runs to the 1 Jan 2028 deadline. But the
original framing carried three material defects that have now been corrected:

1. Wrong domain model (**invaren** → flat premium / eerbiedigende werking / compensation).
2. A **fabricated competitor** (DoNotPay) masking the real, advice-centric landscape
   (including a near-namesake competitor, Pensioennavigator).
3. An over-strong "replace the adviser" thesis that ignores the **Wft advice requirement**.

The defensible version of the opportunity is a **Wtp orientation / triage and document-prep
platform for SMB employers and their advisers**, priced for self-serve, that *channels into*
(rather than pretends to replace) regulated advice — sold into the mid-2026→2027 window.
