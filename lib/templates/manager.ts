/**
 * Document Templates - List, download, and create custom templates
 */

import { randomUUID } from 'crypto';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'communication' | 'compliance' | 'transition' | 'custom';
  content: string;
  isSystem: boolean;
  createdBy: string | null;
  organizationId: string | null;
  createdAt: Date;
}

const templates: Map<string, Template> = new Map();

// Seed system templates
const systemTemplates: Template[] = [
  {
    id: 'tpl_member_letter',
    name: 'Member Communication Letter',
    description: 'Template for notifying pension scheme members about WTP transition',
    category: 'communication',
    content: 'Dear [Member],\n\nWe are writing to inform you about upcoming changes to your pension scheme under the Wet toekomst pensioenen (WTP)...\n\n[Organization Name]',
    isSystem: true,
    createdBy: null,
    organizationId: null,
    createdAt: new Date('2026-01-01'),
  },
  {
    id: 'tpl_transition_plan',
    name: 'Transition Plan Document',
    description: 'Structured template for WTP transition planning',
    category: 'transition',
    content: '# WTP Transition Plan\n\n## 1. Current Scheme Analysis\n## 2. Target Scheme Design\n## 3. Timeline\n## 4. Risk Assessment\n## 5. Communication Plan',
    isSystem: true,
    createdBy: null,
    organizationId: null,
    createdAt: new Date('2026-01-01'),
  },
];

export function resetTemplateStore() {
  templates.clear();
  for (const t of systemTemplates) {
    templates.set(t.id, { ...t });
  }
}

// Initialize
resetTemplateStore();

export async function listTemplates(
  organizationId: string | null = null
): Promise<Template[]> {
  return Array.from(templates.values()).filter(
    (t) => t.isSystem || t.organizationId === organizationId
  );
}

export async function getTemplate(id: string): Promise<Template | null> {
  return templates.get(id) || null;
}

export async function downloadTemplate(id: string): Promise<{ name: string; content: string } | null> {
  const template = templates.get(id);
  if (!template) return null;
  return { name: template.name, content: template.content };
}

export async function createCustomTemplate(
  name: string,
  description: string,
  category: Template['category'],
  content: string,
  createdBy: string,
  organizationId: string
): Promise<Template> {
  if (!name.trim()) throw new Error('Template name is required');
  if (!content.trim()) throw new Error('Template content is required');

  const template: Template = {
    id: randomUUID(),
    name: name.trim(),
    description,
    category,
    content,
    isSystem: false,
    createdBy,
    organizationId,
    createdAt: new Date(),
  };

  templates.set(template.id, template);
  return template;
}
