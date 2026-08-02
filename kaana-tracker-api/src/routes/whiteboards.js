import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  listWhiteboards, getWhiteboardById, createWhiteboard,
  getNotes, createNote, updateNote, deleteNote,
} from '../services/whiteboardService.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (_req, res) => {
  try {
    res.json({ whiteboards: await listWhiteboards() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to list whiteboards' });
  }
});

router.post('/', async (req, res) => {
  try {
    if (!req.body?.title?.trim()) return res.status(400).json({ error: 'Title required' });
    const whiteboard = await createWhiteboard(req.body, req.user.sub);
    res.status(201).json({ whiteboard });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create whiteboard' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const whiteboard = await getWhiteboardById(Number(req.params.id));
    if (!whiteboard) return res.status(404).json({ error: 'Not found' });
    const notes = await getNotes(whiteboard.id);
    res.json({ whiteboard, notes });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load whiteboard' });
  }
});

router.get('/:id/notes', async (req, res) => {
  try {
    res.json({ notes: await getNotes(Number(req.params.id)) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load notes' });
  }
});

router.post('/:id/notes', async (req, res) => {
  try {
    const note = await createNote(Number(req.params.id), req.body, req.user.sub);
    res.status(201).json({ note });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

router.patch('/notes/:noteId', async (req, res) => {
  try {
    const note = await updateNote(Number(req.params.noteId), req.body);
    if (!note) return res.status(404).json({ error: 'Not found' });
    res.json({ note });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

router.delete('/notes/:noteId', async (req, res) => {
  try {
    await deleteNote(Number(req.params.noteId));
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

export default router;
