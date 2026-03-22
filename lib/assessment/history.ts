/**
 * Assessment History - Version tracking and historical comparison
 */

import { randomUUID } from 'crypto';

export interface AssessmentVersion {
  id: string;
  assessmentId: string;
  version: number;
  overallScore: number;
  gaps: Array<{ name?: string; category: string; severity: string }>;
  snapshot: Record<string, unknown>;
  createdAt: Date;
}

const versions: Map<string, AssessmentVersion[]> = new Map();

export function resetHistoryStore() {
  versions.clear();
}

export async function recordVersion(
  assessmentId: string,
  overallScore: number,
  gaps: AssessmentVersion['gaps'],
  snapshot: Record<string, unknown> = {}
): Promise<AssessmentVersion> {
  const existing = versions.get(assessmentId) || [];
  const nextVersion = existing.length + 1;

  const version: AssessmentVersion = {
    id: randomUUID(),
    assessmentId,
    version: nextVersion,
    overallScore,
    gaps,
    snapshot,
    createdAt: new Date(),
  };

  existing.push(version);
  versions.set(assessmentId, existing);
  return version;
}

export async function getHistory(assessmentId: string): Promise<AssessmentVersion[]> {
  return (versions.get(assessmentId) || []).sort(
    (a, b) => a.version - b.version
  );
}

export async function getVersion(
  assessmentId: string,
  version: number
): Promise<AssessmentVersion | null> {
  const all = versions.get(assessmentId) || [];
  return all.find((v) => v.version === version) || null;
}

export async function compareVersions(
  assessmentId: string,
  v1: number,
  v2: number
): Promise<{
  versionA: AssessmentVersion;
  versionB: AssessmentVersion;
  scoreDiff: number;
  gapsAdded: string[];
  gapsRemoved: string[];
} | null> {
  const a = await getVersion(assessmentId, v1);
  const b = await getVersion(assessmentId, v2);
  if (!a || !b) return null;

  const gapNamesA = new Set(a.gaps.map((g) => g.name || g.category));
  const gapNamesB = new Set(b.gaps.map((g) => g.name || g.category));

  return {
    versionA: a,
    versionB: b,
    scoreDiff: b.overallScore - a.overallScore,
    gapsAdded: Array.from(gapNamesB).filter((g) => !gapNamesA.has(g)),
    gapsRemoved: Array.from(gapNamesA).filter((g) => !gapNamesB.has(g)),
  };
}
