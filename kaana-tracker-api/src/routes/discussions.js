import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { listDiscussions, addDiscussion } from '../services/discussionService.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const discussions = await listDiscussions(
      req.query.entityType || null,
      req.query.entityId ? Number(req.query.entityId) : null,
      Number(req.query.limit) || 50,
    );
    res.json({ discussions });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load discussions' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { entityType, entityId, content } = req.body || {};
    const result = await addDiscussion(entityType, entityId ?? null, content, req.user.sub);
    if (result.error) return res.status(400).json({ error: result.error });
    res.status(201).json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to post discussion' });
  }
});

export default router;
