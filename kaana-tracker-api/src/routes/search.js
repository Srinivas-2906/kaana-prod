import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { globalSearch } from '../services/searchService.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    if (q.length < 2 && !/^[A-Za-z0-9]+-\d+$/.test(q)) {
      return res.json({ results: [] });
    }
    const result = await globalSearch(req.user.sub, q, {
      limit: req.query.limit,
      kind: req.query.kind || null,
      status: req.query.status || null,
      labelId: req.query.labelId || null,
      projectId: req.query.projectId || null,
    });
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
