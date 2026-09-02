import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  listTransactions,
  createTransaction,
  getFinanceSummary,
  getTransactionMeta,
  updateTransaction,
  voidTransaction,
  getTransactionById,
} from '../services/transactionService.js';

const router = Router();
router.use(authMiddleware);

router.get('/meta', (_req, res) => {
  res.json(getTransactionMeta());
});

router.get('/summary', async (req, res) => {
  try {
    const result = await getFinanceSummary(
      req.query.month || null,
      req.query.projectId ? Number(req.query.projectId) : null,
      req.user.sub,
    );
    if (result.error) return res.status(result.status || 403).json({ error: result.error });
    res.json({ summary: result });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load summary' });
  }
});

router.get('/', async (req, res) => {
  try {
    const transactions = await listTransactions({
      type: req.query.type || undefined,
      ledgerType: req.query.ledgerType || undefined,
      month: req.query.month || undefined,
      date: req.query.date || undefined,
      projectId: req.query.projectId ? Number(req.query.projectId) : undefined,
    }, req.user.sub);
    res.json({ transactions });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to list transactions' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const tx = await getTransactionById(Number(req.params.id));
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });
    const { assertTransactionAccess } = await import('../services/transactionService.js');
    const access = await assertTransactionAccess(tx, req.user.sub, 'view');
    if (access.error) return res.status(access.status).json({ error: access.error });
    res.json({ transaction: tx });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load transaction' });
  }
});

router.post('/', async (req, res) => {
  try {
    const result = await createTransaction(req.body, req.user.sub);
    if (result.errors) return res.status(400).json({ error: result.errors.join(' ') });
    if (result.error) return res.status(result.status || 403).json({ error: result.error });
    res.status(201).json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const result = await updateTransaction(Number(req.params.id), req.body, req.user.sub);
    if (result.errors) return res.status(400).json({ error: result.errors.join(' ') });
    if (result.error) return res.status(result.status || 403).json({ error: result.error });
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

router.post('/:id/void', async (req, res) => {
  try {
    const result = await voidTransaction(Number(req.params.id), req.user.sub);
    if (result.error) return res.status(result.status || 403).json({ error: result.error });
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to void transaction' });
  }
});

export default router;
