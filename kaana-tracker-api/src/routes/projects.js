import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  listProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from '../services/projectService.js';

const router = Router();

router.use(authMiddleware);

router.get('/', async (_req, res) => {
  try {
    const projects = await listProjects();
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

router.get('/:id', async (req, res) => {
  try {
    const project = await getProjectById(Number(req.params.id));
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load project' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const project = await updateProject(Number(req.params.id), {
      name: req.body?.name,
      description: req.body?.description,
      color: req.body?.color,
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await deleteProject(Number(req.params.id));
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;
