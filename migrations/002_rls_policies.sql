-- ============================================================
-- Wtp Navigator — Row-Level Security Policies
-- Migration 002: RLS policies for multi-tenant data isolation
-- ============================================================

-- Helper: extract organization_id from JWT claims
CREATE OR REPLACE FUNCTION auth.organization_id()
RETURNS UUID AS $$
  SELECT (auth.jwt() -> 'app_metadata' ->> 'organization_id')::UUID;
$$ LANGUAGE sql STABLE;

-- ─── Enable RLS on all tenant-scoped tables ────────────────

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE pension_setups ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE migration_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE migration_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ─── Organizations ─────────────────────────────────────────

CREATE POLICY "users can view own organization"
    ON organizations FOR SELECT
    USING (id = auth.organization_id());

CREATE POLICY "owners can update own organization"
    ON organizations FOR UPDATE
    USING (id = auth.organization_id())
    WITH CHECK (id = auth.organization_id());

-- ─── Users ─────────────────────────────────────────────────

CREATE POLICY "users can view members of own organization"
    ON users FOR SELECT
    USING (organization_id = auth.organization_id());

CREATE POLICY "users can insert into own organization"
    ON users FOR INSERT
    WITH CHECK (organization_id = auth.organization_id());

CREATE POLICY "users can update own profile"
    ON users FOR UPDATE
    USING (id = auth.uid() AND organization_id = auth.organization_id())
    WITH CHECK (organization_id = auth.organization_id());

CREATE POLICY "admins can delete users in own organization"
    ON users FOR DELETE
    USING (organization_id = auth.organization_id());

-- ─── Companies ─────────────────────────────────────────────

CREATE POLICY "tenant_isolation" ON companies
    FOR ALL
    USING (organization_id = auth.organization_id())
    WITH CHECK (organization_id = auth.organization_id());

-- ─── Pension Setups ────────────────────────────────────────

CREATE POLICY "tenant_isolation" ON pension_setups
    FOR ALL
    USING (organization_id = auth.organization_id())
    WITH CHECK (organization_id = auth.organization_id());

-- ─── Assessments ───────────────────────────────────────────

CREATE POLICY "tenant_isolation" ON assessments
    FOR ALL
    USING (organization_id = auth.organization_id())
    WITH CHECK (organization_id = auth.organization_id());

-- ─── Responses (scoped via assessment join) ────────────────

CREATE POLICY "users can manage responses for own assessments"
    ON responses FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM assessments a
            WHERE a.id = responses.assessment_id
            AND a.organization_id = auth.organization_id()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM assessments a
            WHERE a.id = responses.assessment_id
            AND a.organization_id = auth.organization_id()
        )
    );

-- ─── Assessment Results (scoped via assessment join) ───────

CREATE POLICY "users can manage results for own assessments"
    ON assessment_results FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM assessments a
            WHERE a.id = assessment_results.assessment_id
            AND a.organization_id = auth.organization_id()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM assessments a
            WHERE a.id = assessment_results.assessment_id
            AND a.organization_id = auth.organization_id()
        )
    );

-- ─── Compliance Checks ────────────────────────────────────

CREATE POLICY "tenant_isolation" ON compliance_checks
    FOR ALL
    USING (organization_id = auth.organization_id())
    WITH CHECK (organization_id = auth.organization_id());

-- ─── Migration Plans ──────────────────────────────────────

CREATE POLICY "tenant_isolation" ON migration_plans
    FOR ALL
    USING (organization_id = auth.organization_id())
    WITH CHECK (organization_id = auth.organization_id());

-- ─── Migration Tasks ──────────────────────────────────────

CREATE POLICY "tenant_isolation" ON migration_tasks
    FOR ALL
    USING (organization_id = auth.organization_id())
    WITH CHECK (organization_id = auth.organization_id());

-- ─── Payments ──────────────────────────────────────────────

CREATE POLICY "users can view own payments"
    ON payments FOR SELECT
    USING (organization_id = auth.organization_id());

CREATE POLICY "system can insert payments"
    ON payments FOR INSERT
    WITH CHECK (organization_id = auth.organization_id());

-- ─── Licenses ──────────────────────────────────────────────

CREATE POLICY "users can view own licenses"
    ON licenses FOR SELECT
    USING (organization_id = auth.organization_id());

CREATE POLICY "system can insert licenses"
    ON licenses FOR INSERT
    WITH CHECK (organization_id = auth.organization_id());

-- ─── Audit Logs (read-only for tenants) ────────────────────

CREATE POLICY "users can view own audit logs"
    ON audit_logs FOR SELECT
    USING (organization_id = auth.organization_id());

CREATE POLICY "system can insert audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (organization_id = auth.organization_id());
