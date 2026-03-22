/**
 * Collaboration Phase Tests - Teams, Assessments, Sharing, Actions, Notes, Templates, History
 */

import { createMockUser } from './setup';

// ─── Teams ───────────────────────────────────────────────────────────

import {
  createTeam,
  listTeams,
  addMember,
  removeMember,
  getTeamMembers,
  resetTeamStore,
} from '@/lib/teams/management';

describe('Team Management', () => {
  const user = createMockUser();
  const user2 = createMockUser({ id: 'user_test_002', email: 'piet@example.nl' });

  beforeEach(() => resetTeamStore());

  test('create team and list teams', async () => {
    const team = await createTeam('WTP Advisory', user.organizationId as string, user.id as string);
    expect(team.name).toBe('WTP Advisory');
    expect(team.organizationId).toBe(user.organizationId);

    const teams = await listTeams(user.organizationId as string);
    expect(teams).toHaveLength(1);
    expect(teams[0].id).toBe(team.id);
  });

  test('add and remove team members', async () => {
    const team = await createTeam('Test Team', user.organizationId as string, user.id as string);

    // Creator is auto-added as lead
    const members = await getTeamMembers(team.id);
    expect(members).toHaveLength(1);
    expect(members[0].role).toBe('lead');

    // Add second member
    await addMember(team.id, user2.id as string);
    const updated = await getTeamMembers(team.id);
    expect(updated).toHaveLength(2);

    // Remove second member
    await removeMember(team.id, user2.id as string);
    const final = await getTeamMembers(team.id);
    expect(final).toHaveLength(1);
  });

  test('cannot add duplicate member', async () => {
    const team = await createTeam('Dup Test', user.organizationId as string, user.id as string);
    await expect(addMember(team.id, user.id as string)).rejects.toThrow('already a member');
  });

  test('cannot add to nonexistent team', async () => {
    await expect(addMember('fake_id', user.id as string)).rejects.toThrow('Team not found');
  });
});

// ─── Multiple Assessments ────────────────────────────────────────────

import {
  createAssessment,
  listAssessments,
  archiveAssessment,
  resetAssessmentStore,
} from '@/lib/assessment/multiple';

describe('Multiple Assessments', () => {
  const user = createMockUser();

  beforeEach(() => resetAssessmentStore());

  test('create and list assessments', async () => {
    await createAssessment(user.id as string, user.organizationId as string, 'setup_1', 'Q1 Assessment');
    await createAssessment(user.id as string, user.organizationId as string, 'setup_2', 'Q2 Assessment');

    const list = await listAssessments(user.id as string);
    expect(list).toHaveLength(2);
  });

  test('archive assessment hides from default list', async () => {
    const a = await createAssessment(user.id as string, user.organizationId as string, 'setup_1', 'Old Assessment');
    await archiveAssessment(a.id, user.id as string);

    const active = await listAssessments(user.id as string);
    expect(active).toHaveLength(0);

    const all = await listAssessments(user.id as string, true);
    expect(all).toHaveLength(1);
    expect(all[0].status).toBe('archived');
  });
});

// ─── Comparison Mode ─────────────────────────────────────────────────

import { compareAssessments } from '@/lib/assessment/compare';

describe('Assessment Comparison', () => {
  test('detects improvement between assessments', () => {
    const result = compareAssessments(
      {
        id: 'a1',
        overallScore: 60,
        gaps: [
          { name: 'communication', category: 'comms', severity: 'high' },
          { name: 'contributions', category: 'finance', severity: 'medium' },
        ],
        completedAt: new Date('2026-01-01'),
      },
      {
        id: 'a2',
        overallScore: 78,
        gaps: [{ name: 'contributions', category: 'finance', severity: 'low' }],
        completedAt: new Date('2026-03-01'),
      }
    );

    expect(result.trend).toBe('improving');
    expect(result.scoreDiff).toBe(18);
    expect(result.gapsResolved).toContain('communication');
    expect(result.persistentGaps).toContain('contributions');
    expect(result.newGaps).toHaveLength(0);
  });

  test('detects decline between assessments', () => {
    const result = compareAssessments(
      { id: 'a1', overallScore: 80, gaps: [], completedAt: new Date('2026-01-01') },
      {
        id: 'a2',
        overallScore: 65,
        gaps: [{ name: 'new_issue', category: 'risk', severity: 'high' }],
        completedAt: new Date('2026-03-01'),
      }
    );

    expect(result.trend).toBe('declining');
    expect(result.newGaps).toContain('new_issue');
  });
});

// ─── Save & Share Reports ────────────────────────────────────────────

import {
  generateShareLink,
  getSharedReport,
  revokeShare,
  resetShareStore,
} from '@/lib/sharing/reports';

describe('Save & Share Reports', () => {
  const user = createMockUser();

  beforeEach(() => resetShareStore());

  test('generate and access share link', async () => {
    const share = await generateShareLink('assess_1', user.id as string);
    expect(share.token).toBeTruthy();
    expect(share.token.length).toBe(64);

    const retrieved = await getSharedReport(share.token);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.assessmentId).toBe('assess_1');
  });

  test('revoked share link returns null', async () => {
    const share = await generateShareLink('assess_1', user.id as string);
    await revokeShare(share.id, user.id as string);

    const retrieved = await getSharedReport(share.token);
    expect(retrieved).toBeNull();
  });

  test('expired share link returns null', async () => {
    const share = await generateShareLink('assess_1', user.id as string, -1); // expired
    const retrieved = await getSharedReport(share.token);
    expect(retrieved).toBeNull();
  });
});

// ─── Action Items ────────────────────────────────────────────────────

import {
  createActionItem,
  markComplete,
  listPending,
  resetActionStore,
} from '@/lib/actions/tracker';

describe('Action Items', () => {
  const user = createMockUser();

  beforeEach(() => resetActionStore());

  test('create and list pending action items', async () => {
    await createActionItem('assess_1', user.id as string, 'Update comms', 'Send member letters', 'high');
    await createActionItem('assess_1', user.id as string, 'Fix contributions', 'Restructure rates', 'critical');

    const pending = await listPending(user.id as string);
    expect(pending).toHaveLength(2);
    expect(pending[0].priority).toBe('critical'); // sorted by priority
  });

  test('mark action item complete', async () => {
    const item = await createActionItem('assess_1', user.id as string, 'Review gaps', 'Check all gaps');
    const completed = await markComplete(item.id, user.id as string);
    expect(completed.status).toBe('completed');
    expect(completed.completedAt).not.toBeNull();

    const pending = await listPending(user.id as string);
    expect(pending).toHaveLength(0);
  });

  test('cannot complete item owned by another user', async () => {
    const item = await createActionItem('assess_1', user.id as string, 'My task', 'desc');
    await expect(markComplete(item.id, 'other_user')).rejects.toThrow('Not authorized');
  });
});

// ─── Notes & Annotations ────────────────────────────────────────────

import {
  addNote,
  listNotes,
  updateNote,
  resetNoteStore,
} from '@/lib/notes/manager';

describe('Notes & Annotations', () => {
  const user = createMockUser();

  beforeEach(() => resetNoteStore());

  test('add and list notes', async () => {
    await addNote('assess_1', user.id as string, 'Check employer contribution rates', 'finance');
    await addNote('assess_1', user.id as string, 'Follow up on member comms');

    const notes = await listNotes('assess_1');
    expect(notes).toHaveLength(2);
  });

  test('update note content', async () => {
    const note = await addNote('assess_1', user.id as string, 'Original content');
    const updated = await updateNote(note.id, user.id as string, 'Updated content');
    expect(updated.content).toBe('Updated content');
    expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(note.createdAt.getTime());
  });

  test('cannot update note owned by another user', async () => {
    const note = await addNote('assess_1', user.id as string, 'My note');
    await expect(updateNote(note.id, 'other_user', 'Hack')).rejects.toThrow('Not authorized');
  });
});

// ─── Document Templates ─────────────────────────────────────────────

import {
  listTemplates,
  downloadTemplate,
  createCustomTemplate,
  resetTemplateStore,
} from '@/lib/templates/manager';

describe('Document Templates', () => {
  const user = createMockUser();

  beforeEach(() => resetTemplateStore());

  test('list system templates and download', async () => {
    const templates = await listTemplates(user.organizationId as string);
    expect(templates.length).toBeGreaterThanOrEqual(2);

    const download = await downloadTemplate('tpl_member_letter');
    expect(download).not.toBeNull();
    expect(download!.content).toContain('Wet toekomst pensioenen');
  });

  test('create custom template and list', async () => {
    const custom = await createCustomTemplate(
      'Our Process',
      'Internal transition process',
      'custom',
      '# Step 1\n# Step 2',
      user.id as string,
      user.organizationId as string
    );
    expect(custom.isSystem).toBe(false);

    const templates = await listTemplates(user.organizationId as string);
    const found = templates.find((t) => t.id === custom.id);
    expect(found).toBeDefined();
  });
});

// ─── Assessment History ──────────────────────────────────────────────

import {
  recordVersion,
  getHistory,
  compareVersions,
  resetHistoryStore,
} from '@/lib/assessment/history';

describe('Assessment History', () => {
  beforeEach(() => resetHistoryStore());

  test('record and retrieve version history', async () => {
    await recordVersion('assess_1', 60, [{ category: 'comms', severity: 'high' }]);
    await recordVersion('assess_1', 75, [{ category: 'comms', severity: 'low' }]);

    const history = await getHistory('assess_1');
    expect(history).toHaveLength(2);
    expect(history[0].version).toBe(1);
    expect(history[1].version).toBe(2);
  });

  test('compare two versions', async () => {
    await recordVersion('assess_1', 60, [
      { name: 'gap_a', category: 'a', severity: 'high' },
      { name: 'gap_b', category: 'b', severity: 'medium' },
    ]);
    await recordVersion('assess_1', 80, [
      { name: 'gap_b', category: 'b', severity: 'low' },
    ]);

    const comparison = await compareVersions('assess_1', 1, 2);
    expect(comparison).not.toBeNull();
    expect(comparison!.scoreDiff).toBe(20);
    expect(comparison!.gapsRemoved).toContain('gap_a');
    expect(comparison!.gapsAdded).toHaveLength(0);
  });
});
