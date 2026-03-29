/**
 * Save & Share Reports - Generate share links, access shared reports, revoke access
 */

import { randomUUID, randomBytes } from 'crypto';

export interface SharedReport {
  id: string;
  assessmentId: string;
  sharedBy: string;
  token: string;
  expiresAt: Date | null;
  revoked: boolean;
  createdAt: Date;
}

const sharedReports: Map<string, SharedReport> = new Map();
const tokenIndex: Map<string, string> = new Map(); // token -> id

export function resetShareStore() {
  sharedReports.clear();
  tokenIndex.clear();
}

export async function generateShareLink(
  assessmentId: string,
  sharedBy: string,
  expiresInHours: number | null = 72
): Promise<SharedReport> {
  const token = randomBytes(32).toString('hex');
  const report: SharedReport = {
    id: randomUUID(),
    assessmentId,
    sharedBy,
    token,
    expiresAt: expiresInHours
      ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000)
      : null,
    revoked: false,
    createdAt: new Date(),
  };

  sharedReports.set(report.id, report);
  tokenIndex.set(token, report.id);
  return report;
}

export async function getSharedReport(
  token: string
): Promise<SharedReport | null> {
  const id = tokenIndex.get(token);
  if (!id) return null;

  const report = sharedReports.get(id);
  if (!report) return null;
  if (report.revoked) return null;
  if (report.expiresAt && report.expiresAt < new Date()) return null;

  return report;
}

export async function revokeShare(
  reportId: string,
  userId: string
): Promise<void> {
  const report = sharedReports.get(reportId);
  if (!report) throw new Error('Shared report not found');
  if (report.sharedBy !== userId) throw new Error('Not authorized');

  report.revoked = true;
}

export async function listSharedReports(
  userId: string
): Promise<SharedReport[]> {
  return Array.from(sharedReports.values()).filter(
    (r) => r.sharedBy === userId && !r.revoked
  );
}
