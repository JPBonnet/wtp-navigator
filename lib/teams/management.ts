/**
 * Team Management - Create, list, and manage team membership
 */

import { randomUUID } from 'crypto';

export interface Team {
  id: string;
  name: string;
  organizationId: string;
  createdBy: string;
  createdAt: Date;
}

export interface TeamMember {
  teamId: string;
  userId: string;
  role: 'lead' | 'member';
  addedAt: Date;
}

// In-memory store
const teams: Map<string, Team> = new Map();
const members: Map<string, TeamMember[]> = new Map();

export function resetTeamStore() {
  teams.clear();
  members.clear();
}

export async function createTeam(
  name: string,
  organizationId: string,
  createdBy: string
): Promise<Team> {
  if (!name || name.trim().length === 0) {
    throw new Error('Team name is required');
  }

  const team: Team = {
    id: randomUUID(),
    name: name.trim(),
    organizationId,
    createdBy,
    createdAt: new Date(),
  };

  teams.set(team.id, team);
  members.set(team.id, [
    { teamId: team.id, userId: createdBy, role: 'lead', addedAt: new Date() },
  ]);

  return team;
}

export async function listTeams(organizationId: string): Promise<Team[]> {
  return Array.from(teams.values()).filter(
    (t) => t.organizationId === organizationId
  );
}

export async function getTeam(teamId: string): Promise<Team | null> {
  return teams.get(teamId) || null;
}

export async function addMember(
  teamId: string,
  userId: string,
  role: 'lead' | 'member' = 'member'
): Promise<TeamMember> {
  const team = teams.get(teamId);
  if (!team) throw new Error('Team not found');

  const teamMembers = members.get(teamId) || [];
  const existing = teamMembers.find((m) => m.userId === userId);
  if (existing) throw new Error('User is already a member');

  const member: TeamMember = {
    teamId,
    userId,
    role,
    addedAt: new Date(),
  };

  teamMembers.push(member);
  members.set(teamId, teamMembers);
  return member;
}

export async function removeMember(
  teamId: string,
  userId: string
): Promise<void> {
  const team = teams.get(teamId);
  if (!team) throw new Error('Team not found');

  const teamMembers = members.get(teamId) || [];
  const idx = teamMembers.findIndex((m) => m.userId === userId);
  if (idx === -1) throw new Error('User is not a member');

  teamMembers.splice(idx, 1);
  members.set(teamId, teamMembers);
}

export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  return members.get(teamId) || [];
}
