import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  listWorkItems,
  getWorkItemById,
  createWorkItem,
  updateWorkItem,
  updateWorkItemStatus,
  deleteWorkItem,
  getWorkStats,
  promoteIdeaToStory,
} from '../services/workItemService.js';
import { getLinksForEntity } from '../services/entityLinkService.js';

const router = Router();
router.use(authMiddleware);

router.get('/stats', async (_req, res) => {
  try {
    res.json({ stats: await getWorkStats() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

router.get('/', async (req, res) => {
  try {
    const items = await listWorkItems({
      projectId: req.query.projectId ? Number(req.query.projectId) : undefined,
      itemType: req.query.itemType || undefined,
      parentId: req.query.parentId ? Number(req.query.parentId) : undefined,
      ideaStage: req.query.ideaStage || undefined,
      status: req.query.status || undefined,
      excludeDone: req.query.excludeDone === 'true',
      ownerId: req.query.mine === 'true' ? req.user.sub : undefined,
      dateFrom: req.query.from || undefined,
      dateTo: req.query.to || undefined,
      date: req.query.date || undefined,
    });
    res.json({ items });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to list work items' });
  }
});

router.post('/', async (req, res) => {
  try {
    const result = await createWorkItem(req.body, req.user.sub);
    if (result.errors) return res.status(400).json({ error: result.errors.join(' ') });
    res.status(201).json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create work item' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await getWorkItemById(Number(req.params.id));
    if (!item) return res.status(404).json({ error: 'Not found' });
    const links = await getLinksForEntity('work_item', item.id);
    res.json({ item, links });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load work item' });
  }
});

router.get('/:id/links', async (req, res) => {
  try {
    const links = await getLinksForEntity('work_item', Number(req.params.id));
    res.json({ links });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load links' });
  }
});

router.post('/:id/promote-story', async (req, res) => {
  try {
    const result = await promoteIdeaToStory(Number(req.params.id), req.user.sub, req.body);
    if (result.error) return res.status(400).json({ error: result.error });
    if (result.errors) return res.status(400).json({ error: result.errors.join(' ') });
    res.status(201).json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to promote idea' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const result = await updateWorkItem(Number(req.params.id), req.body, req.user.sub);
    if (result.errors) return res.status(400).json({ error: result.errors.join(' ') });
    if (result.error) return res.status(404).json({ error: result.error });
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update work item' });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const result = await updateWorkItemStatus(Number(req.params.id), req.body.status, req.user.sub);
    if (result.error) return res.status(400).json({ error: result.error });
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await deleteWorkItem(Number(req.params.id), req.user.sub);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete work item' });
  }
});

export default router;
