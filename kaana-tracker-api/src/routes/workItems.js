import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { listWorkItems, getWorkStats } from '../services/workItemService.js';

const router = Router();

router.use(authMiddleware);

router.get('/stats', async (_req, res) => {
  try {
    const stats = await getWorkStats();
    res.json({ stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

router.get('/', async (req, res) => {
  try {
    const items = await listWorkItems({
      projectId: req.query.projectId ? Number(req.query.projectId) : undefined,
      itemType: req.query.itemType || undefined,
      excludeDone: req.query.excludeDone === 'true',
      createdBy: req.query.mine === 'true' ? req.user.sub : undefined,
    });
    res.json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list work items' });
  }
});

export default router;
