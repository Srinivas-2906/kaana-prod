import { Router } from 'express';
import {
  loginUser,
  loginWithGoogle,
  getUserById,
  registerUser,
  updateUserProfile,
  formatUserForApi,
  completeOnboarding,
  updateOnboardingProgress,
} from '../services/authService.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body || {};
    const result = await registerUser(email, password, name);
    if (result.error) return res.status(400).json({ error: result.error });
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body || {};
    const result = await loginWithGoogle(credential);
    if (result.error) return res.status(401).json({ error: result.error });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Google sign-in failed' });
  }
});

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
      user: formatUserForApi(user, req.user.authProvider || 'jwt'),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

router.patch('/me', authMiddleware, async (req, res) => {
  try {
    const result = await updateUserProfile(req.user.sub, req.body || {});
    if (result.error) return res.status(result.status || 400).json({ error: result.error });
    res.json({
      user: formatUserForApi(result, req.user.authProvider || 'jwt'),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.patch('/onboarding', authMiddleware, async (req, res) => {
  try {
    const result = await updateOnboardingProgress(req.user.sub, req.body || {});
    if (result.error) return res.status(result.status || 400).json({ error: result.error });
    res.json({
      user: formatUserForApi(result, req.user.authProvider || 'jwt'),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update onboarding progress' });
  }
});

router.post('/onboarding/complete', authMiddleware, async (req, res) => {
  try {
    const user = await completeOnboarding(req.user.sub);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
      user: formatUserForApi(user, req.user.authProvider || 'jwt'),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to complete onboarding' });
  }
});

export default router;
