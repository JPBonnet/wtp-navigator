/**
 * System Health & Error Tracking Tests
 */
import { getHealthStatus, getRecentErrors, recordError, resetHealthStore } from '@/lib/monitoring/health';

beforeEach(() => resetHealthStore());

describe('System Health', () => {
  test('returns healthy status with service checks', async () => {
    const health = await getHealthStatus();
    expect(health.status).toBe('healthy');
    expect(health.uptime).toBeGreaterThanOrEqual(0);
    expect(health.services).toHaveLength(4);
    expect(health.services.every(s => s.status === 'up')).toBe(true);
    expect(health.timestamp).toBeDefined();
  });

  test('tracks and retrieves recent errors', async () => {
    recordError({ message: 'Database timeout', endpoint: '/api/assessments', statusCode: 500 });
    recordError({ message: 'Stripe webhook failed', endpoint: '/api/stripe/webhook', statusCode: 502 });
    recordError({ message: 'Validation error', endpoint: '/api/contact', statusCode: 400 });

    const errors = await getRecentErrors();
    expect(errors).toHaveLength(3);
    // Most recent first
    expect(errors[0].message).toBe('Validation error');
    expect(errors[0].endpoint).toBe('/api/contact');
    expect(errors[0].statusCode).toBe(400);

    // Limit works
    const limited = await getRecentErrors(2);
    expect(limited).toHaveLength(2);
  });
});
