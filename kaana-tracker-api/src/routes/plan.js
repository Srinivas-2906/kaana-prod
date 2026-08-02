import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  buildCalendarMap, getDayAgenda, getDaybookSummary, getDayMetaMap, getCalendarGlimpses, getIdeaPool,
  scheduleWhiteboardNote, promoteNoteToWork,
} from '../services/planService.js';

const router = Router();
router.use(authMiddleware);

router.get('/calendar', async (req, res) => {
  try {
    const { from, to, projectId, itemType } = req.query;
    if (!from || !to) return res.status(400).json({ error: 'from and to required' });
    const map = await buildCalendarMap(
      from, to,
      projectId ? Number(projectId) : null,
      itemType || '',
    );
    res.json({ map });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load calendar' });
  }
});

router.get('/agenda', async (req, res) => {
  try {
    const { date, projectId, itemType } = req.query;
    if (!date) return res.status(400).json({ error: 'date required' });
    const agenda = await getDayAgenda(
      date,
      projectId ? Number(projectId) : null,
      itemType || '',
    );
    res.json({ agenda });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load agenda' });
  }
});

router.get('/glimpses', async (req, res) => {
  try {
    const { from, to, projectId, itemType } = req.query;
    if (!from || !to) return res.status(400).json({ error: 'from and to required' });
    const data = await getCalendarGlimpses(
      from, to,
      projectId ? Number(projectId) : null,
      itemType || '',
    );
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load calendar glimpses' });
  }
});

router.get('/day-meta', async (req, res) => {
  try {
    const { from, to, projectId } = req.query;
    if (!from || !to) return res.status(400).json({ error: 'from and to required' });
    const meta = await getDayMetaMap(from, to, projectId ? Number(projectId) : null);
    res.json({ meta });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load day meta' });
  }
});

router.get('/daybook', async (req, res) => {
  try {
    const { date, projectId } = req.query;
    if (!date) return res.status(400).json({ error: 'date required' });
    const summary = await getDaybookSummary(date, projectId ? Number(projectId) : null);
    res.json({ summary });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load daybook' });
  }
});

router.get('/idea-pool', async (req, res) => {
  try {
    const notes = await getIdeaPool(Number(req.query.limit) || 12);
    res.json({ notes });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load idea pool' });
  }
});

router.post('/schedule-note', async (req, res) => {
  try {
    const { noteId, date } = req.body || {};
    if (!noteId) return res.status(400).json({ error: 'noteId required' });
    const note = await scheduleWhiteboardNote(Number(noteId), date || null);
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json({ note });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to schedule note' });
  }
});

router.post('/promote-note', async (req, res) => {
  try {
    const { noteId, ...options } = req.body || {};
    if (!noteId) return res.status(400).json({ error: 'noteId required' });
    const result = await promoteNoteToWork(Number(noteId), req.user.sub, options);
    if (result.error) return res.status(400).json({ error: result.error });
    if (result.errors) return res.status(400).json({ error: result.errors.join(' ') });
    res.status(201).json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to promote note' });
  }
});

export default router;
