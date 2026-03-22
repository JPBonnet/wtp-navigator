-- ============================================================
-- Wtp Navigator — Initial Database Schema
-- Migration 001: Core tables for multi-tenant pension platform
-- ============================================================

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

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           TEXT UNIQUE NOT NULL,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role            TEXT NOT NULL DEFAULT 'member'
                    CHECK (role IN ('owner','admin','advisor','viewer')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);

-- Company & pension data
CREATE TABLE companies (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    kvk_number      TEXT,
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
    contribution_employer NUMERIC(5,2),
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

-- Assessments
CREATE TABLE assessments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pension_setup_id UUID NOT NULL REFERENCES pension_setups(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    risk_score      INTEGER NOT NULL CHECK (risk_score BETWEEN 1 AND 10),
    gaps            JSONB NOT NULL DEFAULT '[]',
    recommendations JSONB NOT NULL DEFAULT '[]',
    status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','in_progress','completed')),
    report_url      TEXT,
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_assessments_org ON assessments(organization_id);
CREATE INDEX idx_assessments_pension ON assessments(pension_setup_id);

-- Questionnaire responses
CREATE TABLE responses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id   UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    question_id     TEXT NOT NULL,
    value           TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_responses_assessment ON responses(assessment_id);
CREATE UNIQUE INDEX idx_responses_unique ON responses(assessment_id, question_id);

-- Assessment results (computed analysis)
CREATE TABLE assessment_results (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id   UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    pension_setup_id UUID NOT NULL REFERENCES pension_setups(id) ON DELETE CASCADE,
    overall_score   INTEGER NOT NULL,
    status          TEXT NOT NULL CHECK (status IN ('PARTIAL','COMPLETE')),
    gaps            JSONB NOT NULL DEFAULT '[]',
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_results_assessment ON assessment_results(assessment_id);

-- Compliance tracking
CREATE TABLE compliance_checks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pension_setup_id UUID NOT NULL REFERENCES pension_setups(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    rule_version    TEXT NOT NULL,
    results         JSONB NOT NULL,
    overall_status  TEXT NOT NULL
                    CHECK (overall_status IN ('compliant','non_compliant','partial')),
    checked_by      UUID REFERENCES users(id),
    checked_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_compliance_pension ON compliance_checks(pension_setup_id);

-- Migration planning
CREATE TABLE migration_plans (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pension_setup_id UUID NOT NULL REFERENCES pension_setups(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    target_date     DATE NOT NULL,
    status          TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','active','paused','completed','cancelled')),
    created_by      UUID REFERENCES users(id),
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
    depends_on      UUID[] DEFAULT '{}',
    assigned_to     UUID REFERENCES users(id),
    due_date        DATE,
    status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','in_progress','blocked','completed','skipped')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_migration_tasks_plan ON migration_tasks(plan_id);

-- Payments
CREATE TABLE payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    stripe_session_id TEXT UNIQUE,
    amount_cents    INTEGER NOT NULL,
    status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','completed','failed','refunded')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_org ON payments(organization_id);

-- Licenses
CREATE TABLE licenses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_licenses_user ON licenses(user_id);
CREATE INDEX idx_licenses_org ON licenses(organization_id);

-- Immutable audit log
CREATE TABLE audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    actor_id        UUID REFERENCES users(id),
    action          TEXT NOT NULL,
    entity_type     TEXT NOT NULL,
    entity_id       UUID NOT NULL,
    changes         JSONB,
    ip_address      INET,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_org_time ON audit_logs(organization_id, created_at DESC);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_pension_setups_updated_at BEFORE UPDATE ON pension_setups FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_migration_plans_updated_at BEFORE UPDATE ON migration_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_migration_tasks_updated_at BEFORE UPDATE ON migration_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
