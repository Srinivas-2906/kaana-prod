import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  countUnreadNotifications,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/notificationService.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const unreadOnly = req.query.unread === '1';
    const notifications = await listNotifications(req.user.sub, {
      limit: req.query.limit,
      unreadOnly,
    });
    res.json({ notifications });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load notifications' });
  }
});

router.get('/unread-count', async (req, res) => {
  try {
    const count = await countUnreadNotifications(req.user.sub);
    res.json({ count });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load notification count' });
  }
});

router.post('/:id/read', async (req, res) => {
  try {
    const ok = await markNotificationRead(req.user.sub, Number(req.params.id));
    if (!ok) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to mark notification read' });
  }
});

router.post('/read-all', async (req, res) => {
  try {
    await markAllNotificationsRead(req.user.sub);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to mark all read' });
  }
});

export default router;
