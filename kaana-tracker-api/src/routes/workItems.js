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
import { assertProjectAccess, listAccessibleProjectIds } from '../services/authorizationService.js';

const router = Router();
router.use(authMiddleware);

async function accessForProject(projectId, userId, level = 'view') {
  if (!projectId) return { error: 'Project is required', status: 400, role: null };
  return assertProjectAccess(projectId, userId, level);
}

async function accessForWorkItem(workItemId, userId, level = 'view') {
  const item = await getWorkItemById(workItemId);
  if (!item) return { error: 'Not found', status: 404, role: null, item: null };
  if (!item.cluster_id) return { error: 'Forbidden', status: 403, role: null, item };
  const access = await assertProjectAccess(item.cluster_id, userId, level);
  return { ...access, item };
}

router.get('/stats', async (req, res) => {
  try {
    res.json({ stats: await getWorkStats() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

router.get('/', async (req, res) => {
  try {
    const projectId = req.query.projectId ? Number(req.query.projectId) : undefined;
    if (projectId) {
      const access = await accessForProject(projectId, req.user.sub, 'view');
      if (access.error) return res.status(access.status).json({ error: access.error });
    }

    const accessibleProjectIds = projectId
      ? undefined
      : await listAccessibleProjectIds(req.user.sub);

    const items = await listWorkItems({
      projectId,
      accessibleProjectIds,
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
    const projectId = Number(req.body?.cluster_id);
    const access = await accessForProject(projectId, req.user.sub, 'edit');
    if (access.error) return res.status(access.status).json({ error: access.error });

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
    const access = await accessForWorkItem(Number(req.params.id), req.user.sub, 'view');
    if (access.error) return res.status(access.status).json({ error: access.error });
    const links = await getLinksForEntity('work_item', access.item.id);
    res.json({ item: access.item, links });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load work item' });
  }
});

router.get('/:id/links', async (req, res) => {
  try {
    const access = await accessForWorkItem(Number(req.params.id), req.user.sub, 'view');
    if (access.error) return res.status(access.status).json({ error: access.error });
    const links = await getLinksForEntity('work_item', access.item.id);
    res.json({ links });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load links' });
  }
});

router.post('/:id/promote-story', async (req, res) => {
  try {
    const access = await accessForWorkItem(Number(req.params.id), req.user.sub, 'edit');
    if (access.error) return res.status(access.status).json({ error: access.error });
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
    const access = await accessForWorkItem(Number(req.params.id), req.user.sub, 'edit');
    if (access.error) return res.status(access.status).json({ error: access.error });
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
    const access = await accessForWorkItem(Number(req.params.id), req.user.sub, 'edit');
    if (access.error) return res.status(access.status).json({ error: access.error });
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
    const access = await accessForWorkItem(Number(req.params.id), req.user.sub, 'edit');
    if (access.error) return res.status(access.status).json({ error: access.error });
    await deleteWorkItem(Number(req.params.id), req.user.sub);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete work item' });
  }
});

export default router;
