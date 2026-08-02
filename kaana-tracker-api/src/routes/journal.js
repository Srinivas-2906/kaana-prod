import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { listJournalEntries, createJournalEntry, updateJournalEntry, deleteJournalEntry } from '../services/journalService.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const entries = await listJournalEntries({
      date: req.query.date || undefined,
      projectId: req.query.projectId ? Number(req.query.projectId) : undefined,
    });
    res.json({ entries });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load journal' });
  }
});

router.post('/', async (req, res) => {
  try {
    const result = await createJournalEntry(req.body, req.user.sub);
    if (result.error) return res.status(400).json({ error: result.error });
    res.status(201).json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create journal entry' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const result = await updateJournalEntry(Number(req.params.id), req.body, req.user.sub);
    if (result.error) return res.status(400).json({ error: result.error });
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update journal entry' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await deleteJournalEntry(Number(req.params.id), req.user.sub);
    if (result.error) return res.status(400).json({ error: result.error });
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete journal entry' });
  }
});

export default router;
