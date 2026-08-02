import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { listReminders, createReminder, completeReminder, deleteReminder } from '../services/reminderService.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const reminders = await listReminders({
      date: req.query.date || undefined,
      projectId: req.query.projectId ? Number(req.query.projectId) : undefined,
      upcoming: req.query.upcoming === 'true',
      includeCompleted: req.query.includeCompleted === 'true',
    });
    res.json({ reminders });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load reminders' });
  }
});

router.post('/', async (req, res) => {
  try {
    const result = await createReminder(req.body, req.user.sub);
    if (result.error) return res.status(400).json({ error: result.error });
    res.status(201).json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create reminder' });
  }
});

router.patch('/:id/complete', async (req, res) => {
  try {
    const result = await completeReminder(Number(req.params.id), req.user.sub);
    if (result.error) return res.status(400).json({ error: result.error });
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to complete reminder' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await deleteReminder(Number(req.params.id));
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete reminder' });
  }
});

export default router;
