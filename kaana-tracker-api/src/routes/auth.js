import { Router } from 'express';
import { loginUser, getUserById } from '../services/authService.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const result = await loginUser(email, password);
    if (result.error) return res.status(401).json({ error: result.error });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await getUserById(req.user.sub);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        authProvider: req.user.authProvider || 'legacy',
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

export default router;
