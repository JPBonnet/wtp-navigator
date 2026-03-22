/**
 * Collaboration Comprehensive Tests - Extended coverage for teams,
 * assessments, sharing, actions, notes, templates, and history
 */

import { createMockUser } from './setup';
import { createTeam, listTeams, addMember, removeMember, getTeamMembers, resetTeamStore } from '@/lib/teams/management';
import { createAssessment, listAssessments, archiveAssessment, resetAssessmentStore } from '@/lib/assessment/multiple';
import { generateShareLink, getSharedReport, revokeShare, listSharedReports, resetShareStore } from '@/lib/sharing/reports';
import { createActionItem, markComplete, listPending, resetActionStore } from '@/lib/actions/tracker';
import { addNote, listNotes, updateNote, deleteNote, resetNoteStore } from '@/lib/notes/manager';
import { listTemplates, createCustomTemplate, getTemplate, resetTemplateStore } from '@/lib/templates/manager';
import { recordVersion, getHistory, compareVersions, resetHistoryStore } from '@/lib/assessment/history';

const user = createMockUser();
const user2 = createMockUser({ id: 'user_test_002', email: 'piet@example.nl' });

describe('Collaboration Comprehensive', () => {
  test('team role update - member promoted to lead', async () => {
    resetTeamStore();
    const team = await createTeam('Advisory Team', user.organizationId as string, user.id as string);

    await addMember(team.id, user2.id as string, 'member');
    const members = await getTeamMembers(team.id);
    const member = members.find(m => m.userId === user2.id);
    expect(member!.role).toBe('member');

    // Add as lead (re-add with different role requires remove first)
    await removeMember(team.id, user2.id as string);
    await addMember(team.id, user2.id as string, 'lead');
    const updated = await getTeamMembers(team.id);
    const promoted = updated.find(m => m.userId === user2.id);
    expect(promoted!.role).toBe('lead');
  });

  test('assessment archive excludes from default list, includes with flag', async () => {
    resetAssessmentStore();
    const a1 = await createAssessment(user.id as string, user.organizationId as string, 'setup_1', 'Active Assessment');
    const a2 = await createAssessment(user.id as string, user.organizationId as string, 'setup_2', 'Old Assessment');

    await archiveAssessment(a2.id, user.id as string);

    const active = await listAssessments(user.id as string);
    expect(active).toHaveLength(1);
    expect(active[0].title).toBe('Active Assessment');

    const all = await listAssessments(user.id as string, true);
    expect(all).toHaveLength(2);
  });

  test('share link expiry - expired link returns null', async () => {
    resetShareStore();
    const share = await generateShareLink('assess_1', user.id as string, -1);
    const retrieved = await getSharedReport(share.token);
    expect(retrieved).toBeNull();

    // Valid link works
    const valid = await generateShareLink('assess_2', user.id as string, 72);
    const result = await getSharedReport(valid.token);
    expect(result).not.toBeNull();
    expect(result!.assessmentId).toBe('assess_2');
  });

  test('action item bulk operations - create multiple, complete in order', async () => {
    resetActionStore();
    const items = await Promise.all([
      createActionItem('assess_1', user.id as string, 'Task A', 'Low priority', 'low'),
      createActionItem('assess_1', user.id as string, 'Task B', 'Critical task', 'critical'),
      createActionItem('assess_1', user.id as string, 'Task C', 'High priority', 'high'),
    ]);

    const pending = await listPending(user.id as string);
    expect(pending).toHaveLength(3);
    expect(pending[0].priority).toBe('critical');
    expect(pending[1].priority).toBe('high');
    expect(pending[2].priority).toBe('low');

    await markComplete(items[1].id, user.id as string);
    const remaining = await listPending(user.id as string);
    expect(remaining).toHaveLength(2);
    expect(remaining.find(i => i.priority === 'critical')).toBeUndefined();
  });

  test('note conflict - only owner can update or delete', async () => {
    resetNoteStore();
    const note = await addNote('assess_1', user.id as string, 'My private note', 'finance');

    await expect(updateNote(note.id, user2.id as string, 'Hacked')).rejects.toThrow('Not authorized');
    await expect(deleteNote(note.id, user2.id as string)).rejects.toThrow('Not authorized');

    const updated = await updateNote(note.id, user.id as string, 'Updated safely');
    expect(updated.content).toBe('Updated safely');
  });

  test('template cloning - create custom from system template pattern', async () => {
    resetTemplateStore();
    const systemTemplates = await listTemplates(user.organizationId as string);
    const systemTpl = systemTemplates.find(t => t.isSystem)!;

    const custom = await createCustomTemplate(
      'Custom ' + systemTpl.name,
      'Based on system template',
      'custom',
      systemTpl.content || '# Custom content',
      user.id as string,
      user.organizationId as string
    );
    expect(custom.isSystem).toBe(false);
    expect(custom.name).toContain('Custom');

    const allTemplates = await listTemplates(user.organizationId as string);
    expect(allTemplates.length).toBeGreaterThan(systemTemplates.length);
  });

  test('version rollback comparison - detects gaps added and removed', async () => {
    resetHistoryStore();
    await recordVersion('assess_1', 80, [
      { name: 'gap_a', category: 'comms', severity: 'high' },
      { name: 'gap_b', category: 'finance', severity: 'medium' },
    ]);
    await recordVersion('assess_1', 70, [
      { name: 'gap_b', category: 'finance', severity: 'high' },
      { name: 'gap_c', category: 'risk', severity: 'critical' },
    ]);
    await recordVersion('assess_1', 85, [
      { name: 'gap_b', category: 'finance', severity: 'low' },
    ]);

    const history = await getHistory('assess_1');
    expect(history).toHaveLength(3);

    const comparison = await compareVersions('assess_1', 1, 3);
    expect(comparison).not.toBeNull();
    expect(comparison!.scoreDiff).toBe(5);
    expect(comparison!.gapsRemoved).toContain('gap_a');
    expect(comparison!.gapsAdded).toHaveLength(0);
  });

  test('team deletion - remove all members leaves empty team', async () => {
    resetTeamStore();
    const team = await createTeam('Temp Team', user.organizationId as string, user.id as string);
    await addMember(team.id, user2.id as string);

    await removeMember(team.id, user2.id as string);
    await removeMember(team.id, user.id as string);

    const members = await getTeamMembers(team.id);
    expect(members).toHaveLength(0);

    // Team still exists in list
    const teams = await listTeams(user.organizationId as string);
    expect(teams).toHaveLength(1);
  });
});
