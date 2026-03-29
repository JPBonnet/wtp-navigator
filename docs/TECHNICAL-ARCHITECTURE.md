# Wtp Navigator — Technical Architecture

> Pension migration SaaS platform for guiding companies through the Dutch Wet toekomst pensioenen (Wtp) transition.

---

## 1. System Architecture Overview

Wtp Navigator is a **multi-tenant SaaS platform** designed to help pension advisors, employers, and pension providers navigate the mandatory transition to the new Dutch pension system under the Wet toekomst pensioenen (Wtp). The platform assesses current pension setups, verifies compliance, generates migration plans, and provides audit-ready reporting.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CDN (Vercel Edge Network)                    │
│                     Static assets, ISR pages, caching               │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                      Next.js Application (Vercel)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────────┐ │
│  │  React UI    │  │  API Routes  │  │  Server Actions / RSC     │ │
│  │  (App Router)│  │  /api/v1/*   │  │  (data fetching, mutations│ │
│  └──────┬───────┘  └──────┬───────┘  └─────────────┬─────────────┘ │
│         │                 │                         │               │
│  ┌──────▼─────────────────▼─────────────────────────▼─────────────┐ │
│  │                   Service Layer (TypeScript)                    │ │
│  │  ┌─────────────┐ ┌────────────┐ ┌──────────┐ ┌─────────────┐  │ │
│  │  │ Assessment  │ │ Compliance │ │Migration │ │  ETL /      │  │ │
│  │  │ Engine      │ │ Verifier   │ │ Planner  │ │  Import     │  │ │
│  │  └──────┬──────┘ └─────┬──────┘ └────┬─────┘ └──────┬──────┘  │ │
│  │         │               │             │              │         │ │
│  │  ┌──────▼───────────────▼─────────────▼──────────────▼──────┐  │ │
│  │  │              Data Access Layer (Supabase Client)          │  │ │
│  │  └──────────────────────────┬───────────────────────────────┘  │ │
│  └─────────────────────────────┼─────────────────────────────────┘ │
└────────────────────────────────┼───────────────────────────────────┘
                                 │
          ┌──────────────────────▼──────────────────────┐
          │            Supabase Platform                 │
          │  ┌──────────┐ ┌──────┐ ┌─────────────────┐  │
          │  │PostgreSQL│ │ Auth │ │ Realtime / Edge  │  │
          │  │  (RLS)   │ │(JWT) │ │   Functions      │  │
          │  └──────────┘ └──────┘ └─────────────────┘  │
          │  ┌──────────┐ ┌──────────────────────────┐  │
          │  │ Storage  │ │  pg_cron (scheduled jobs) │  │
          │  └──────────┘ └──────────────────────────┘  │
          └─────────────────────────────────────────────┘
                                 │
          ┌──────────────────────▼──────────────────────┐
          │          External Integrations               │
          │  ┌─────────┐ ┌─────────┐ ┌──────────────┐  │
          │  │HR / HRM │ │Payroll  │ │Pension       │  │
          │  │Systems   │ │Providers│ │Providers API │  │
          │  └─────────┘ └─────────┘ └──────────────┘  │
          └─────────────────────────────────────────────┘
```

### Multi-Tenancy Model

Each tenant (advisory firm or employer) is isolated at the database level via **Row-Level Security (RLS)** policies. Every table includes an `organization_id` column, and all queries are scoped through Supabase RLS using the authenticated user's JWT claims.

```
┌─────────────────────────────────────────────┐
│              Request Flow                    │
│                                              │
│  User ──► JWT (org claim) ──► RLS Policy     │
│                                  │           │
│                          ┌───────▼────────┐  │
│                          │ SELECT * FROM   │  │
│                          │ companies       │  │
│                          │ WHERE org_id =  │  │
│                          │ auth.org_id()   │  │
│                          └────────────────┘  │
└─────────────────────────────────────────────┘
```

---

## 2. Tech Stack

| Layer            | Technology                    | Rationale                                            |
| ---------------- | ----------------------------- | ---------------------------------------------------- |
| Frontend         | Next.js 14+ (App Router)      | SSR/ISR, React Server Components, excellent DX       |
| Language         | TypeScript (strict mode)      | Type safety across full stack                        |
| Database         | Supabase (PostgreSQL 15)      | RLS, realtime, auth, storage — all-in-one            |
| Auth             | Supabase Auth + SAML/SSO      | Enterprise SSO, JWT-based, MFA support               |
| Hosting          | Vercel                        | Edge network, preview deploys, native Next.js support|
| Styling          | Tailwind CSS + shadcn/ui      | Consistent design system, accessible components      |
| State            | Zustand + React Query         | Lightweight client state, server cache management    |
| Validation       | Zod                           | Runtime validation matching TypeScript types          |
| Testing          | Vitest + Playwright           | Unit and E2E testing                                 |
| CI/CD            | GitHub Actions + Vercel       | Automated checks, preview deploys per PR             |

---

## 3. Core Modules

### 3.1 Pension System Assessment Engine

Analyzes a company's current pension arrangement and produces a structured profile for compliance checking and migration planning.

```
Input: Company pension data (scheme type, provider, contributions, participants)
  │
  ▼
┌──────────────────────────────┐
│  1. Data Normalization       │  Standardize input from various formats
├──────────────────────────────┤
│  2. Scheme Classification    │  DB/DC/CDC, excedent, early retirement
├──────────────────────────────┤
│  3. Gap Analysis             │  Compare current vs. Wtp requirements
├──────────────────────────────┤
│  4. Risk Scoring             │  Quantify transition complexity (1-10)
├──────────────────────────────┤
│  5. Report Generation        │  PDF/JSON assessment output
└──────────────────────────────┘
  │
  ▼
Output: AssessmentResult { gaps[], riskScore, recommendations[] }
```

Key domain logic lives in `src/modules/assessment/`. The engine is stateless — it receives a `PensionSetup` object and returns an `AssessmentResult`. This makes it testable and composable with other modules.

### 3.2 Compliance Verification Module

Validates pension configurations against Wtp requirements. Regulation rules are encoded as versioned rule sets, allowing the system to track regulatory changes over time.

```typescript
// src/modules/compliance/types.ts
interface ComplianceRule {
  id: string;
  version: string;              // e.g., "wtp-2024.1"
  category: "contribution" | "investment" | "communication" | "transition";
  evaluate: (setup: PensionSetup) => ComplianceResult;
}

interface ComplianceResult {
  ruleId: string;
  status: "pass" | "fail" | "warning";
  message: string;
  remediation?: string;
  references: LegalReference[];  // links to specific Wtp articles
}
```

Rules are stored in `src/modules/compliance/rules/` as individual modules, registered in a central `RuleRegistry`. New regulations are added by shipping a new rule module without modifying existing ones (Open/Closed principle).

### 3.3 Migration Planning Module

Generates step-by-step implementation plans with timelines, dependencies, and responsible parties based on assessment results and compliance gaps.

A migration plan consists of **phases**: Preparation, Design, Implementation, Communication, and Go-Live. Each phase contains **tasks** with dependencies modeled as a directed acyclic graph (DAG). The scheduler computes the critical path and surfaces deadline risks.

### 3.4 Data Import / Transformation (ETL)

Handles ingestion of pension data from external sources — CSV uploads, Excel files, and API integrations with HR/payroll systems.

```
┌────────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐
│  Extract   │───►│  Validate  │───►│ Transform  │───►│   Load     │
│            │    │  (Zod)     │    │ (normalize)│    │ (Supabase) │
└────────────┘    └────────────┘    └────────────┘    └────────────┘
      │                 │                 │                  │
      ▼                 ▼                 ▼                  ▼
  Raw upload      Validation        Canonical schema    Persisted rows
  (Storage)       errors log        mapping             + audit trail
```

ETL jobs run as **Supabase Edge Functions** for isolation and scalability. Large file imports are processed via chunked uploads with progress tracking through Supabase Realtime subscriptions.

---

## 4. Database Design

### Entity Relationship Diagram

```
organizations ─────┐
    │               │
    │ 1:N           │ 1:N
    ▼               ▼
companies      org_members
    │               │
    │ 1:N           │
    ▼               │
pension_setups      │
    │               │
    ├─ 1:N ──► compliance_checks
    │               │
    ├─ 1:N ──► assessments
    │               │
    └─ 1:N ──► migration_plans
                    │
                    └─ 1:N ──► migration_tasks

audit_logs (append-only, references all entities)
```

### Schema DDL

```sql
-- Core multi-tenancy
CREATE TABLE organizations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    slug            TEXT UNIQUE NOT NULL,
    subscription    TEXT NOT NULL DEFAULT 'trial'
                    CHECK (subscription IN ('trial','starter','professional','enterprise')),
    settings        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE org_members (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role            TEXT NOT NULL DEFAULT 'member'
                    CHECK (role IN ('owner','admin','advisor','viewer')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (organization_id, user_id)
);

-- Company & pension data
CREATE TABLE companies (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    kvk_number      TEXT,                -- Dutch Chamber of Commerce number
    sector          TEXT,
    employee_count  INTEGER,
    contact_email   TEXT,
    metadata        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_companies_org ON companies(organization_id);

CREATE TABLE pension_setups (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    scheme_type     TEXT NOT NULL
                    CHECK (scheme_type IN ('defined_benefit','defined_contribution','cdc','hybrid')),
    provider_name   TEXT NOT NULL,
    provider_type   TEXT NOT NULL
                    CHECK (provider_type IN ('pension_fund','insurer','ppi')),
    contribution_employer NUMERIC(5,2),   -- percentage
    contribution_employee NUMERIC(5,2),
    participant_count     INTEGER,
    effective_date  DATE,
    raw_data        JSONB NOT NULL DEFAULT '{}',
    status          TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','assessed','migrating','completed')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pension_setups_company ON pension_setups(company_id);
CREATE INDEX idx_pension_setups_org ON pension_setups(organization_id);

-- Compliance tracking
CREATE TABLE compliance_checks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pension_setup_id UUID NOT NULL REFERENCES pension_setups(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    rule_version    TEXT NOT NULL,         -- e.g., "wtp-2024.1"
    results         JSONB NOT NULL,        -- array of ComplianceResult
    overall_status  TEXT NOT NULL
                    CHECK (overall_status IN ('compliant','non_compliant','partial')),
    checked_by      UUID REFERENCES auth.users(id),
    checked_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_compliance_pension ON compliance_checks(pension_setup_id);

-- Assessment results
CREATE TABLE assessments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pension_setup_id UUID NOT NULL REFERENCES pension_setups(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    risk_score      INTEGER NOT NULL CHECK (risk_score BETWEEN 1 AND 10),
    gaps            JSONB NOT NULL DEFAULT '[]',
    recommendations JSONB NOT NULL DEFAULT '[]',
    report_url      TEXT,                  -- Supabase Storage path
    created_by      UUID REFERENCES auth.users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Migration planning
CREATE TABLE migration_plans (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pension_setup_id UUID NOT NULL REFERENCES pension_setups(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    target_date     DATE NOT NULL,
    status          TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','active','paused','completed','cancelled')),
    created_by      UUID REFERENCES auth.users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE migration_tasks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id         UUID NOT NULL REFERENCES migration_plans(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    phase           TEXT NOT NULL
                    CHECK (phase IN ('preparation','design','implementation','communication','go_live')),
    title           TEXT NOT NULL,
    description     TEXT,
    depends_on      UUID[] DEFAULT '{}',   -- task IDs this depends on
    assigned_to     UUID REFERENCES auth.users(id),
    due_date        DATE,
    status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','in_progress','blocked','completed','skipped')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_migration_tasks_plan ON migration_tasks(plan_id);

-- Immutable audit log
CREATE TABLE audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    actor_id        UUID REFERENCES auth.users(id),
    action          TEXT NOT NULL,          -- e.g., "assessment.created"
    entity_type     TEXT NOT NULL,          -- e.g., "pension_setup"
    entity_id       UUID NOT NULL,
    changes         JSONB,                  -- { before: {}, after: {} }
    ip_address      INET,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_org_time ON audit_logs(organization_id, created_at DESC);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);

-- Row-Level Security policies (applied to all tenant-scoped tables)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE pension_setups ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE migration_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE migration_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Example RLS policy (repeated pattern for all tables)
CREATE POLICY "tenant_isolation" ON companies
    FOR ALL
    USING (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::UUID)
    WITH CHECK (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::UUID);
```

---

## 5. API Architecture

### RESTful API Routes

All API endpoints are implemented as Next.js Route Handlers under `src/app/api/v1/`. Authentication is enforced via middleware that validates the Supabase JWT and injects the user/organization context.

| Method | Endpoint                                      | Description                          |
| ------ | --------------------------------------------- | ------------------------------------ |
| GET    | `/api/v1/companies`                           | List companies for current org       |
| POST   | `/api/v1/companies`                           | Create a new company                 |
| GET    | `/api/v1/companies/:id`                       | Get company details                  |
| PUT    | `/api/v1/companies/:id`                       | Update company                       |
| POST   | `/api/v1/companies/:id/pension-setups`        | Add pension setup to company         |
| GET    | `/api/v1/pension-setups/:id`                  | Get pension setup details            |
| POST   | `/api/v1/pension-setups/:id/assess`           | Run assessment engine                |
| GET    | `/api/v1/pension-setups/:id/assessments`      | List assessments for a setup         |
| POST   | `/api/v1/pension-setups/:id/compliance-check` | Run compliance verification          |
| POST   | `/api/v1/pension-setups/:id/migration-plan`   | Generate migration plan              |
| GET    | `/api/v1/migration-plans/:id`                 | Get plan with tasks                  |
| PATCH  | `/api/v1/migration-tasks/:id`                 | Update task status                   |
| POST   | `/api/v1/import/upload`                       | Upload CSV/Excel for ETL processing  |
| GET    | `/api/v1/import/:jobId/status`                | Check import job progress            |
| GET    | `/api/v1/audit-logs`                          | Query audit logs (paginated)         |

### Request / Response Examples

```http
POST /api/v1/pension-setups/abc-123/assess
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "options": {
    "includeProjections": true,
    "ruleVersion": "wtp-2025.1"
  }
}
```

```json
// 200 OK
{
  "id": "assess-789",
  "pensionSetupId": "abc-123",
  "riskScore": 7,
  "gaps": [
    {
      "category": "contribution",
      "description": "Employer contribution exceeds flat-rate maximum under solidarity scheme",
      "severity": "high",
      "reference": "Wtp Art. 150.3"
    }
  ],
  "recommendations": [
    {
      "action": "Restructure contribution tiers to flat-rate model",
      "priority": "critical",
      "estimatedEffort": "4-6 weeks"
    }
  ],
  "createdAt": "2026-03-22T10:30:00Z"
}
```

### Webhook Integrations

External systems receive event notifications via webhooks. Organizations configure webhook endpoints in settings, and events are dispatched asynchronously via a Supabase Edge Function queue.

```
Event types:
  assessment.completed
  compliance_check.completed
  migration_plan.created
  migration_task.status_changed
  import.completed
  import.failed
```

Each webhook payload includes an HMAC-SHA256 signature header (`X-Wtp-Signature`) for verification.

---

## 6. Security & Compliance

### Security Model

```
┌─────────────────────────────────────────────────────────┐
│                    Security Layers                       │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ L1: Network — Vercel WAF, TLS 1.3, DDoS          │  │
│  │     protection, rate limiting                     │  │
│  ├───────────────────────────────────────────────────┤  │
│  │ L2: Authentication — Supabase Auth, JWT,          │  │
│  │     MFA, SAML SSO for enterprise tenants          │  │
│  ├───────────────────────────────────────────────────┤  │
│  │ L3: Authorization — RBAC (owner/admin/advisor/    │  │
│  │     viewer), org-scoped permissions               │  │
│  ├───────────────────────────────────────────────────┤  │
│  │ L4: Data Isolation — PostgreSQL RLS on every      │  │
│  │     table, organization_id enforced at DB level   │  │
│  ├───────────────────────────────────────────────────┤  │
│  │ L5: Audit — Immutable audit_logs table,           │  │
│  │     all mutations logged with actor + timestamp   │  │
│  ├───────────────────────────────────────────────────┤  │
│  │ L6: Encryption — AES-256 at rest (Supabase),      │  │
│  │     TLS in transit, sensitive fields encrypted     │  │
│  │     at application level (pgcrypto)               │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### GDPR & Data Protection

- **Data minimization**: Only pension-relevant data is collected. PII fields are explicitly tagged in the schema and can be exported/deleted per GDPR data subject requests.
- **Right to erasure**: A cascade-delete from `companies` propagates through all related records. Audit logs retain anonymized entries (actor replaced with a hash) to preserve compliance trails.
- **Data Processing Agreements**: The platform enforces DPA acceptance during onboarding. Supabase acts as data processor; the organization is the data controller.
- **Data residency**: Supabase project deployed in `eu-central-1` (Frankfurt) to comply with Dutch/EU data residency requirements.
- **Retention policies**: `pg_cron` jobs automatically archive records older than the configured retention period (default: 7 years for pension records per Dutch pension law).

### Pension Law Compliance

- Rule versions are immutable once published — compliance checks reference the exact rule version used.
- Historical compliance results are preserved for regulatory audits.
- All report generation includes a digital timestamp and the rule version applied.

---

## 7. Integration Points

```
┌─────────────────────┐
│   Wtp Navigator     │
│                     │
│  Inbound:           │         Outbound:
│  ┌───────────────┐  │         ┌───────────────────────┐
│  │ CSV/Excel     │◄─┼─────── │ HR Systems (AFAS,     │
│  │ Upload        │  │         │ Visma, SAP SuccessF.) │
│  ├───────────────┤  │         ├───────────────────────┤
│  │ REST API      │◄─┼─────── │ Payroll (ADP, Loket,  │
│  │ (data push)   │  │         │ AFAS)                 │
│  ├───────────────┤  │         ├───────────────────────┤
│  │ SFTP pickup   │◄─┼─────── │ Pension Providers     │
│  │ (scheduled)   │  │         │ (APG, PGGM, Achmea)  │
│  └───────────────┘  │         └───────────────────────┘
│                     │
│  Outbound:          │
│  ┌───────────────┐  │
│  │ Webhooks      │──┼──────► External systems
│  ├───────────────┤  │
│  │ PDF Reports   │──┼──────► Email / Storage
│  ├───────────────┤  │
│  │ API export    │──┼──────► BI / reporting tools
│  └───────────────┘  │
└─────────────────────┘
```

### Integration Authentication

All inbound API integrations authenticate via **API keys** scoped to the organization. Keys are hashed (SHA-256) before storage and support expiration dates. Outbound integrations use OAuth 2.0 where supported by the external system, with encrypted credential storage.

---

## 8. Scalability & Performance

### Caching Strategy

| Layer          | Mechanism                   | TTL        | Invalidation              |
| -------------- | --------------------------- | ---------- | ------------------------- |
| CDN            | Vercel Edge Cache / ISR     | 60s–3600s  | On-demand revalidation    |
| API            | React Query (client)        | 30s–300s   | Mutation-triggered        |
| Database       | PostgreSQL query cache      | Automatic  | Write-through             |
| Compliance     | Rule evaluation memoization | Per-request| New rule version deployed |

### Performance Targets

| Metric                    | Target        |
| ------------------------- | ------------- |
| Page load (P75)           | < 1.5s        |
| API response (P95)        | < 500ms       |
| Assessment engine (P95)   | < 3s          |
| ETL import (1000 rows)    | < 30s         |
| Concurrent tenants        | 500+          |

### Database Scaling

- **Connection pooling**: Supabase PgBouncer in transaction mode.
- **Read replicas**: Enabled for reporting queries and audit log searches.
- **Partitioning**: `audit_logs` partitioned by month for query performance and archival.
- **Indexing**: Composite indexes on high-cardinality filter combinations (org + status, org + date range).

---

## 9. Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         GitHub                                  │
│  main ──► production    preview branches ──► preview deploys    │
└───────────────┬─────────────────────────────┬───────────────────┘
                │                             │
        ┌───────▼───────┐             ┌───────▼───────┐
        │  GitHub       │             │  GitHub       │
        │  Actions CI   │             │  Actions CI   │
        │  (lint, test, │             │  (lint, test) │
        │   type-check) │             │               │
        └───────┬───────┘             └───────┬───────┘
                │                             │
        ┌───────▼───────┐             ┌───────▼───────┐
        │  Vercel       │             │  Vercel       │
        │  Production   │             │  Preview      │
        │  (wtp.app)    │             │  (*.vercel)   │
        └───────┬───────┘             └───────────────┘
                │
        ┌───────▼────────────────────────────────┐
        │  Supabase (eu-central-1)               │
        │  Production project                    │
        │  ┌──────────┐ ┌────────┐ ┌──────────┐ │
        │  │  DB +     │ │  Auth  │ │  Edge    │ │
        │  │  RLS      │ │        │ │  Funcs   │ │
        │  └──────────┘ └────────┘ └──────────┘ │
        └────────────────────────────────────────┘
```

### Environment Strategy

| Environment | Database          | Purpose                             |
| ----------- | ----------------- | ----------------------------------- |
| Local       | Supabase CLI (local) | Developer workstation              |
| Preview     | Supabase branch DB   | Per-PR preview environments        |
| Staging     | Supabase staging     | Pre-production validation          |
| Production  | Supabase production  | Live platform (eu-central-1)       |

### CI/CD Pipeline

1. **Push to branch** → GitHub Actions: lint (`eslint`), type-check (`tsc --noEmit`), unit tests (`vitest`), E2E tests (`playwright`)
2. **PR created** → Vercel preview deploy + Supabase branch database
3. **Merge to main** → Vercel production deploy + Supabase migration apply
4. **Post-deploy** → Smoke tests against production, alerting via Vercel monitoring

### Monitoring & Observability

- **Application**: Vercel Analytics (Web Vitals), Vercel Speed Insights
- **Errors**: Sentry integration for error tracking and performance monitoring
- **Database**: Supabase Dashboard metrics, custom `pg_stat_statements` monitoring
- **Uptime**: External health check on `/api/v1/health` endpoint
- **Alerts**: PagerDuty integration for P1 incidents (API error rate > 1%, P95 latency > 2s)
