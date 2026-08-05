import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  acceptInvite,
  createInvite,
  getInvitePreview,
  listInvites,
  revokeInvite,
} from '../services/inviteService.js';

const router = Router();

router.get('/:token', async (req, res) => {
  try {
    const result = await getInvitePreview(req.params.token);
    if (result.error) return res.status(404).json({ error: result.error });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load invite' });
  }
});

router.post('/:token/accept', authMiddleware, async (req, res) => {
  try {
    const result = await acceptInvite(req.params.token, req.user.sub);
    if (result.error) return res.status(400).json({ error: result.error });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to accept invite' });
  }
});

export default router;

export function mountProjectInviteRoutes(projectsRouter) {
  projectsRouter.post('/:id/invites', async (req, res) => {
    try {
      const { role, expiresInDays, maxUses } = req.body || {};
      const result = await createInvite(
        Number(req.params.id),
        role,
        req.user.sub,
        { expiresInDays, maxUses },
      );
      if (result.error) return res.status(403).json({ error: result.error });
      res.status(201).json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create invite' });
    }
  });

  projectsRouter.get('/:id/invites', async (req, res) => {
    try {
      const result = await listInvites(Number(req.params.id), req.user.sub);
      if (result.error) return res.status(403).json({ error: result.error });
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to list invites' });
    }
  });

  projectsRouter.delete('/:id/invites/:inviteId', async (req, res) => {
    try {
      const result = await revokeInvite(
        Number(req.params.id),
        Number(req.params.inviteId),
        req.user.sub,
      );
      if (result.error) return res.status(400).json({ error: result.error });
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to revoke invite' });
    }
  });
}
