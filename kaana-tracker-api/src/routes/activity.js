import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { listActivity, getEntityStateAt, listEntityVersions } from '../services/activityService.js';
import { assertProjectAccess, listAccessibleProjectIds } from '../services/authorizationService.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const projectId = req.query.projectId ? Number(req.query.projectId) : undefined;
    if (projectId) {
      const access = await assertProjectAccess(projectId, req.user.sub, 'view');
      if (access.error) return res.status(access.status).json({ error: access.error });
    }

    const accessibleProjectIds = projectId ? undefined : await listAccessibleProjectIds(req.user.sub);
    const events = await listActivity({
      projectId,
      accessibleProjectIds,
      entityType: req.query.entityType || undefined,
      entityId: req.query.entityId ? Number(req.query.entityId) : undefined,
      date: req.query.date || undefined,
      dateFrom: req.query.from || undefined,
      dateTo: req.query.to || undefined,
      eventType: req.query.eventType || undefined,
      limit: req.query.limit ? Number(req.query.limit) : 50,
    });
    res.json({ events });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load activity' });
  }
});

router.get('/state', async (req, res) => {
  try {
    const { entityType, entityId, asOf } = req.query;
    if (!entityType || !entityId || !asOf) {
      return res.status(400).json({ error: 'entityType, entityId, asOf required' });
    }
    const state = await getEntityStateAt(entityType, Number(entityId), asOf);
    res.json({ state, asOf });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to reconstruct state' });
  }
});

router.get('/versions', async (req, res) => {
  try {
    const { entityType, entityId, limit } = req.query;
    if (!entityType || !entityId) {
      return res.status(400).json({ error: 'entityType and entityId required' });
    }
    const versions = await listEntityVersions(String(entityType), Number(entityId), limit ? Number(limit) : 100);
    res.json({ versions });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load history' });
  }
});

export default router;
