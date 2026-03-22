/**
 * Notes & Annotations - Add, list, and update notes on assessments
 */

import { randomUUID } from 'crypto';

export interface AssessmentNote {
  id: string;
  assessmentId: string;
  userId: string;
  content: string;
  section: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const notes: Map<string, AssessmentNote> = new Map();

export function resetNoteStore() {
  notes.clear();
}

export async function addNote(
  assessmentId: string,
  userId: string,
  content: string,
  section: string | null = null
): Promise<AssessmentNote> {
  if (!content.trim()) throw new Error('Note content is required');

  const note: AssessmentNote = {
    id: randomUUID(),
    assessmentId,
    userId,
    content: content.trim(),
    section,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  notes.set(note.id, note);
  return note;
}

export async function listNotes(assessmentId: string): Promise<AssessmentNote[]> {
  return Array.from(notes.values())
    .filter((n) => n.assessmentId === assessmentId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function updateNote(
  noteId: string,
  userId: string,
  content: string
): Promise<AssessmentNote> {
  const note = notes.get(noteId);
  if (!note) throw new Error('Note not found');
  if (note.userId !== userId) throw new Error('Not authorized');
  if (!content.trim()) throw new Error('Note content is required');

  note.content = content.trim();
  note.updatedAt = new Date();
  return note;
}

export async function deleteNote(noteId: string, userId: string): Promise<void> {
  const note = notes.get(noteId);
  if (!note) throw new Error('Note not found');
  if (note.userId !== userId) throw new Error('Not authorized');

  notes.delete(noteId);
}
