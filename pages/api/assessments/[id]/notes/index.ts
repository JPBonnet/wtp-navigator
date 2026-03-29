import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/lib/api/middleware';
import { addNote, listNotes } from '@/lib/notes/manager';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireAuth(req, res);
  if (!user) return;
  const assessmentId = req.query.id as string;

  if (req.method === 'POST') {
    const { content, section } = req.body;
    if (!content) return res.status(400).json({ error: 'content is required' });
    const note = await addNote(assessmentId, user.id, content, section);
    return res.status(201).json(note);
  }

  if (req.method === 'GET') {
    const notes = await listNotes(assessmentId);
    return res.status(200).json(notes);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
