/**
 * Action Items - Track remediation tasks from assessments
 */

import { randomUUID } from 'crypto';

export interface ActionItem {
  id: string;
  assessmentId: string;
  userId: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: Date | null;
  completedAt: Date | null;
  createdAt: Date;
}

const actionItems: Map<string, ActionItem> = new Map();

export function resetActionStore() {
  actionItems.clear();
}

export async function createActionItem(
  assessmentId: string,
  userId: string,
  title: string,
  description: string,
  priority: ActionItem['priority'] = 'medium',
  dueDate: Date | null = null
): Promise<ActionItem> {
  if (!title.trim()) throw new Error('Title is required');

  const item: ActionItem = {
    id: randomUUID(),
    assessmentId,
    userId,
    title: title.trim(),
    description,
    priority,
    status: 'pending',
    dueDate,
    completedAt: null,
    createdAt: new Date(),
  };

  actionItems.set(item.id, item);
  return item;
}

export async function markComplete(
  itemId: string,
  userId: string
): Promise<ActionItem> {
  const item = actionItems.get(itemId);
  if (!item) throw new Error('Action item not found');
  if (item.userId !== userId) throw new Error('Not authorized');

  item.status = 'completed';
  item.completedAt = new Date();
  return item;
}

export async function listPending(userId: string): Promise<ActionItem[]> {
  return Array.from(actionItems.values())
    .filter((i) => i.userId === userId && i.status !== 'completed')
    .sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
}

export async function getActionItem(id: string): Promise<ActionItem | null> {
  return actionItems.get(id) || null;
}
