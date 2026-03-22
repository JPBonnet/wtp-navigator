-- ============================================================
-- Wtp Navigator — Admin Dashboard Schema
-- Migration 003: Admin tables, tickets, enhanced audit logs
-- ============================================================

-- Admin users table (extends users with admin-specific fields)
ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'banned', 'unverified'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS banned_reason TEXT;

-- Support tickets
CREATE TABLE tickets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject         TEXT NOT NULL,
    description     TEXT NOT NULL,
    contact_email   TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'open'
                    CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority        TEXT NOT NULL DEFAULT 'medium'
                    CHECK (priority IN ('low', 'medium', 'high')),
    assigned_to     UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_created ON tickets(created_at DESC);

-- Ticket comments
CREATE TABLE ticket_comments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id       UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    author_id       UUID NOT NULL REFERENCES users(id),
    body            TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ticket_comments_ticket ON ticket_comments(ticket_id);

-- Enhanced audit_logs (add more fields if not already present)
-- audit_logs already exists in 001, add action category
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'admin'
    CHECK (category IN ('admin', 'user', 'system', 'payment'));

-- System errors tracking
CREATE TABLE system_errors (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message         TEXT NOT NULL,
    stack           TEXT,
    endpoint        TEXT,
    status_code     INTEGER,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_system_errors_created ON system_errors(created_at DESC);

-- ─── RLS Policies for Admin Tables ──────────────────────────

ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_errors ENABLE ROW LEVEL SECURITY;

-- Only admins/owners can manage tickets
CREATE POLICY tickets_admin_all ON tickets
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('owner', 'admin')
        )
    );

CREATE POLICY ticket_comments_admin_all ON ticket_comments
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('owner', 'admin')
        )
    );

-- System errors: read-only for admins
CREATE POLICY system_errors_admin_read ON system_errors
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('owner', 'admin')
        )
    );

-- Audit logs: ensure admins can read all (existing policy may be org-scoped)
CREATE POLICY audit_logs_admin_read ON audit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('owner', 'admin')
        )
    );

-- Updated_at triggers
CREATE TRIGGER trg_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
