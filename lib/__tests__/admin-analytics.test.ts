/**
 * Admin Assessment Analytics Tests
 */
import { getOverview, getScoreDistribution, getCompletionRates, seedAssessments, resetAnalyticsStore } from '@/lib/admin/analytics';

beforeEach(() => {
  seedAssessments([
    { id: 'a1', score: 85, status: 'completed', organizationId: 'org1', createdBy: 'u1', created_at: '2026-01-15T00:00:00Z' },
    { id: 'a2', score: 45, status: 'completed', organizationId: 'org1', createdBy: 'u2', created_at: '2026-01-20T00:00:00Z' },
    { id: 'a3', score: 72, status: 'completed', organizationId: 'org2', createdBy: 'u3', created_at: '2026-02-10T00:00:00Z' },
    { id: 'a4', score: 0, status: 'pending', organizationId: 'org2', createdBy: 'u3', created_at: '2026-02-15T00:00:00Z' },
    { id: 'a5', score: 0, status: 'in_progress', organizationId: 'org1', createdBy: 'u1', created_at: '2026-02-20T00:00:00Z' },
  ]);
});

afterEach(() => resetAnalyticsStore());

describe('Assessment Analytics', () => {
  test('returns overview stats', async () => {
    const overview = await getOverview();
    expect(overview.totalAssessments).toBe(5);
    expect(overview.completedAssessments).toBe(3);
    expect(overview.averageScore).toBe(67); // (85+45+72)/3 = 67.3 rounded
    expect(overview.totalUsers).toBe(3);
    expect(overview.totalOrganizations).toBe(2);
  });

  test('returns score distribution', async () => {
    const dist = await getScoreDistribution();
    expect(dist).toHaveLength(5);
    expect(dist.find(d => d.range === '81-100')!.count).toBe(1); // 85
    expect(dist.find(d => d.range === '41-60')!.count).toBe(1); // 45
    expect(dist.find(d => d.range === '61-80')!.count).toBe(1); // 72
    expect(dist.find(d => d.range === '0-20')!.count).toBe(0);
  });

  test('returns completion rates by month', async () => {
    const rates = await getCompletionRates();
    expect(rates).toHaveLength(2); // Jan and Feb

    const jan = rates.find(r => r.period === '2026-01')!;
    expect(jan.started).toBe(2);
    expect(jan.completed).toBe(2);
    expect(jan.rate).toBe(100);

    const feb = rates.find(r => r.period === '2026-02')!;
    expect(feb.started).toBe(3);
    expect(feb.completed).toBe(1);
    expect(feb.rate).toBe(33);
  });
});
