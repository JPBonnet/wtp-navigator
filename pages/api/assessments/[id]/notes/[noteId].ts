import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/lib/api/middleware';
import { updateNote, deleteNote } from '@/lib/notes/manager';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireAuth(req, res);
  if (!user) return;
  const noteId = req.query.noteId as string;

  if (req.method === 'PATCH') {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'content is required' });
    try {
      const note = await updateNote(noteId, user.id, content);
      return res.status(200).json(note);
    } catch (e: any) {
      return res.status(404).json({ error: e.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await deleteNote(noteId, user.id);
      return res.status(204).end();
    } catch (e: any) {
      return res.status(404).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
