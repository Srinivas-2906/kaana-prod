import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { listDecisions, createDecision, updateDecisionStatus } from '../services/decisionService.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const decisions = await listDecisions({
      projectId: req.query.projectId ? Number(req.query.projectId) : undefined,
      status: req.query.status || undefined,
      date: req.query.date || undefined,
    });
    res.json({ decisions });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load decisions' });
  }
});

router.post('/', async (req, res) => {
  try {
    const result = await createDecision(req.body, req.user.sub);
    if (result.error) return res.status(400).json({ error: result.error });
    res.status(201).json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create decision' });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const result = await updateDecisionStatus(Number(req.params.id), req.body.status, req.user.sub);
    if (result.error) return res.status(400).json({ error: result.error });
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update decision' });
  }
});

export default router;
