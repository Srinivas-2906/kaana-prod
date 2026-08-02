import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { listTransactions, createTransaction, getFinanceSummary } from '../services/transactionService.js';
import { CATEGORIES, PAYMENT_METHODS, PAID_BY_OPTIONS } from '../constants.js';

const router = Router();
router.use(authMiddleware);

router.get('/meta', (_req, res) => {
  res.json({ categories: CATEGORIES, paymentMethods: PAYMENT_METHODS, paidByOptions: PAID_BY_OPTIONS });
});

router.get('/summary', async (req, res) => {
  try {
    res.json({
      summary: await getFinanceSummary(
        req.query.month || null,
        req.query.projectId ? Number(req.query.projectId) : null,
      ),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load summary' });
  }
});

router.get('/', async (req, res) => {
  try {
    const transactions = await listTransactions({
      type: req.query.type || undefined,
      month: req.query.month || undefined,
      date: req.query.date || undefined,
      projectId: req.query.projectId ? Number(req.query.projectId) : undefined,
    });
    res.json({ transactions });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to list transactions' });
  }
});

router.post('/', async (req, res) => {
  try {
    const result = await createTransaction(req.body, req.user.sub);
    if (result.errors) return res.status(400).json({ error: result.errors.join(' ') });
    res.status(201).json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

export default router;
