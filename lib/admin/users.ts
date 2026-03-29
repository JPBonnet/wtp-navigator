/**
 * Admin User Management
 * CRUD operations for admin user management with search, ban/unban, verify
 */

import { db } from '@/lib/db';

export interface AdminUser {
  id: string;
  email: string;
  organizationId: string;
  role: string;
  status: 'active' | 'banned' | 'unverified';
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

const userStore: AdminUser[] = [];

export function resetUserStore() {
  userStore.length = 0;
}

export function seedUsers(users: AdminUser[]) {
  userStore.length = 0;
  userStore.push(...users);
}

export async function listUsers(params: UserListParams = {}): Promise<{ users: AdminUser[]; total: number; page: number; limit: number }> {
  const { page = 1, limit = 20, search, status } = params;

  let filtered = [...userStore];

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(u => u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q));
  }

  if (status) {
    filtered = filtered.filter(u => u.status === status);
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const users = filtered.slice(start, start + limit);

  return { users, total, page, limit };
}

export async function updateUser(id: string, updates: { status?: 'active' | 'banned'; verified?: boolean }): Promise<AdminUser | null> {
  const user = userStore.find(u => u.id === id);
  if (!user) return null;

  if (updates.status !== undefined) user.status = updates.status;
  if (updates.verified !== undefined) {
    user.verified = updates.verified;
    if (updates.verified && user.status === 'unverified') user.status = 'active';
  }
  user.updated_at = new Date().toISOString();

  return { ...user };
}

export async function deleteUser(id: string): Promise<boolean> {
  const idx = userStore.findIndex(u => u.id === id);
  if (idx === -1) return false;
  userStore.splice(idx, 1);
  return true;
}

export async function getUser(id: string): Promise<AdminUser | null> {
  return userStore.find(u => u.id === id) || null;
}
