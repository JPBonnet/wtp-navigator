/**
 * Admin User Management Tests
 */
import { listUsers, updateUser, deleteUser, getUser, seedUsers, resetUserStore, AdminUser } from '@/lib/admin/users';

const testUsers: AdminUser[] = [
  { id: 'u1', email: 'jan@example.nl', organizationId: 'org1', role: 'owner', status: 'active', verified: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'u2', email: 'piet@example.nl', organizationId: 'org1', role: 'advisor', status: 'active', verified: true, created_at: '2026-01-02T00:00:00Z', updated_at: '2026-01-02T00:00:00Z' },
  { id: 'u3', email: 'maria@example.nl', organizationId: 'org2', role: 'viewer', status: 'unverified', verified: false, created_at: '2026-01-03T00:00:00Z', updated_at: '2026-01-03T00:00:00Z' },
  { id: 'u4', email: 'banned@example.nl', organizationId: 'org2', role: 'viewer', status: 'banned', verified: true, created_at: '2026-01-04T00:00:00Z', updated_at: '2026-01-04T00:00:00Z' },
];

beforeEach(() => {
  seedUsers([...testUsers.map(u => ({ ...u }))]);
});

afterEach(() => resetUserStore());

describe('Admin User Management', () => {
  test('lists users with pagination and search', async () => {
    const result = await listUsers({ page: 1, limit: 2 });
    expect(result.users).toHaveLength(2);
    expect(result.total).toBe(4);
    expect(result.page).toBe(1);

    const searched = await listUsers({ search: 'jan' });
    expect(searched.users).toHaveLength(1);
    expect(searched.users[0].email).toBe('jan@example.nl');

    const filtered = await listUsers({ status: 'banned' });
    expect(filtered.users).toHaveLength(1);
    expect(filtered.users[0].id).toBe('u4');
  });

  test('bans and unbans a user', async () => {
    const banned = await updateUser('u1', { status: 'banned' });
    expect(banned).not.toBeNull();
    expect(banned!.status).toBe('banned');

    const unbanned = await updateUser('u1', { status: 'active' });
    expect(unbanned!.status).toBe('active');
  });

  test('verifies a user and updates status', async () => {
    const verified = await updateUser('u3', { verified: true });
    expect(verified).not.toBeNull();
    expect(verified!.verified).toBe(true);
    expect(verified!.status).toBe('active');
  });

  test('deletes a user', async () => {
    const deleted = await deleteUser('u2');
    expect(deleted).toBe(true);

    const notFound = await getUser('u2');
    expect(notFound).toBeNull();

    const result = await listUsers();
    expect(result.total).toBe(3);

    // Deleting nonexistent returns false
    expect(await deleteUser('nonexistent')).toBe(false);
  });
});
