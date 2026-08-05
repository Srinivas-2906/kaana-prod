import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  listProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from '../services/projectService.js';
import { listMembers, addMember, removeMember, listUsers } from '../services/membershipService.js';
import { assertProjectAccess, canEdit, canManageMembers } from '../services/authorizationService.js';
import { mountProjectInviteRoutes } from './invites.js';

const router = Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const projects = await listProjects(req.user.sub);
    res.json({ projects });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list projects' });
  }
});

router.post('/', async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim();
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const project = await createProject(
      { name, description: req.body?.description, color: req.body?.color },
      req.user.sub,
    );
    res.status(201).json({ project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

router.get('/meta/users', async (req, res) => {
  try {
    const access = await assertProjectAccess(Number(req.query.projectId), req.user.sub, 'manage');
    if (access.error) return res.status(403).json({ error: access.error });
    res.json({ users: await listUsers() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list users' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const projectId = Number(req.params.id);
    const access = await assertProjectAccess(projectId, req.user.sub, 'view');
    if (access.error) return res.status(access.status).json({ error: access.error });

    const project = await getProjectById(projectId, req.user.sub);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({
      project: {
        ...project,
        my_role: access.role,
        can_edit: canEdit(access.role),
        can_manage: canManageMembers(access.role),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load project' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const projectId = Number(req.params.id);
    const access = await assertProjectAccess(projectId, req.user.sub, 'edit');
    if (access.error) return res.status(access.status).json({ error: access.error });

    const project = await updateProject(projectId, {
      name: req.body?.name,
      description: req.body?.description,
      color: req.body?.color,
    }, req.user.sub);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const projectId = Number(req.params.id);
    const access = await assertProjectAccess(projectId, req.user.sub, 'manage');
    if (access.error || access.role !== 'owner') {
      return res.status(403).json({ error: 'Only the project owner can delete this project' });
    }
    await deleteProject(projectId);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

router.get('/:id/members', async (req, res) => {
  try {
    const projectId = Number(req.params.id);
    const access = await assertProjectAccess(projectId, req.user.sub, 'view');
    if (access.error) return res.status(access.status).json({ error: access.error });
    res.json(await listMembers(projectId));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load members' });
  }
});

router.post('/:id/members', async (req, res) => {
  try {
    const projectId = Number(req.params.id);
    const access = await assertProjectAccess(projectId, req.user.sub, 'manage');
    if (access.error) return res.status(access.status).json({ error: access.error });

    const { userId, role } = req.body || {};
    const result = await addMember(projectId, Number(userId), role || 'contributor', req.user.sub);
    if (result.error) return res.status(400).json({ error: result.error });
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

router.delete('/:id/members/:userId', async (req, res) => {
  try {
    const projectId = Number(req.params.id);
    const access = await assertProjectAccess(projectId, req.user.sub, 'manage');
    if (access.error) return res.status(access.status).json({ error: access.error });

    const result = await removeMember(projectId, Number(req.params.userId), req.user.sub);
    if (result.error) return res.status(400).json({ error: result.error });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

mountProjectInviteRoutes(router);

export default router;
