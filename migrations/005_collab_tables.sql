-- Migration 005: Collaboration tables
-- Teams, shared reports, action items, assessment notes

-- ─── Teams ───────────────────────────────────────────────────────────
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_teams_org ON teams(organization_id);

-- ─── Team Members ────────────────────────────────────────────────────
CREATE TABLE team_members (
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('lead', 'member')),
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (team_id, user_id)
);

CREATE INDEX idx_team_members_user ON team_members(user_id);

-- ─── Shared Reports ─────────────────────────────────────────────────
CREATE TABLE shared_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES users(id),
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ,
  revoked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_shared_reports_token ON shared_reports(token);
CREATE INDEX idx_shared_reports_user ON shared_reports(shared_by);

-- ─── Action Items ────────────────────────────────────────────────────
CREATE TABLE action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_action_items_user ON action_items(user_id);
CREATE INDEX idx_action_items_assessment ON action_items(assessment_id);

-- ─── Assessment Notes ────────────────────────────────────────────────
CREATE TABLE assessment_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  section TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_assessment_notes_assessment ON assessment_notes(assessment_id);

-- ─── RLS Policies ────────────────────────────────────────────────────
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY teams_org_isolation ON teams
  USING (organization_id = auth.organization_id());

CREATE POLICY team_members_via_team ON team_members
  USING (team_id IN (SELECT id FROM teams WHERE organization_id = auth.organization_id()));

CREATE POLICY shared_reports_owner ON shared_reports
  USING (shared_by = auth.uid());

CREATE POLICY action_items_owner ON action_items
  USING (user_id = auth.uid());

CREATE POLICY assessment_notes_org ON assessment_notes
  USING (assessment_id IN (
    SELECT id FROM assessments WHERE organization_id = auth.organization_id()
  ));
